import admin from 'firebase-admin';
import fs from 'node:fs';
import path from 'node:path';
import { env } from '@/core/env.js';

type FirebaseServiceAccount = {
  project_id?: string;
  private_key?: string;
  client_email?: string;
};

function parseTokens(): string[] {
  return String(env.FCM_DEVICE_TOKENS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export type PushProvider = 'fcm' | 'expo';

export type PushTokenTarget = {
  token: string;
  provider: PushProvider;
};

export type PushSendResult = {
  successCount: number;
  invalidTokens: string[];
};

function firebaseConfigured(): boolean {
  if (env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim()) {
    return fs.existsSync(resolveServiceAccountPath(env.FIREBASE_SERVICE_ACCOUNT_PATH));
  }
  return Boolean(
    env.FIREBASE_PROJECT_ID?.trim() &&
      env.FIREBASE_CLIENT_EMAIL?.trim() &&
      env.FIREBASE_PRIVATE_KEY?.trim(),
  );
}

function ensureFirebaseApp(): void {
  if (admin.apps.length > 0) return;
  const serviceAccount = loadServiceAccount();
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: serviceAccount.project_id,
        privateKey: String(serviceAccount.private_key).replace(/\\n/g, '\n'),
        clientEmail: serviceAccount.client_email,
      }),
    });
    return;
  }

  const privateKey = String(env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, '\n');
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID!.trim(),
      privateKey,
      clientEmail: env.FIREBASE_CLIENT_EMAIL!.trim(),
    }),
  });
}

function resolveServiceAccountPath(rawPath: string): string {
  return path.isAbsolute(rawPath) ? rawPath : path.resolve(process.cwd(), rawPath);
}

function loadServiceAccount(): FirebaseServiceAccount | null {
  const rawPath = env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();
  if (!rawPath) return null;
  const filePath = resolveServiceAccountPath(rawPath);
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw) as FirebaseServiceAccount;
}

function isInvalidFcmError(code?: string): boolean {
  return code === 'messaging/invalid-registration-token' || code === 'messaging/registration-token-not-registered';
}

async function sendFcmTokens(title: string, body: string, tokens: string[]): Promise<PushSendResult> {
  if (!tokens.length || !firebaseConfigured()) return { successCount: 0, invalidTokens: [] };
  try {
    ensureFirebaseApp();

    const res = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body },
      android: { priority: 'high' as const },
      apns: { payload: { aps: { sound: 'default' } } },
    });
    const invalidTokens = res.responses
      .map((response, index) => (!response.success && isInvalidFcmError(response.error?.code) ? tokens[index] : null))
      .filter((token): token is string => Boolean(token));
    return { successCount: res.successCount, invalidTokens };
  } catch {
    return { successCount: 0, invalidTokens: [] };
  }
}

function isInvalidExpoError(details?: unknown): boolean {
  if (!details || typeof details !== 'object') return false;
  const error = (details as { error?: unknown }).error;
  return error === 'DeviceNotRegistered' || error === 'InvalidCredentials';
}

async function sendExpoTokens(title: string, body: string, tokens: string[]): Promise<PushSendResult> {
  if (!tokens.length) return { successCount: 0, invalidTokens: [] };
  try {
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        tokens.map((to) => ({
          to,
          title,
          body,
          sound: 'default',
          priority: 'high',
          channelId: 'don-uyari',
        })),
      ),
    });
    if (!res.ok) return { successCount: 0, invalidTokens: [] };
    const payload = (await res.json()) as { data?: Array<{ status?: string; details?: unknown }> };
    const data = Array.isArray(payload.data) ? payload.data : [];
    const invalidTokens: string[] = [];
    let successCount = 0;
    data.forEach((ticket, index) => {
      if (ticket.status === 'ok') successCount += 1;
      const token = tokens[index];
      if (token && isInvalidExpoError(ticket.details)) invalidTokens.push(token);
    });
    return { successCount, invalidTokens };
  } catch {
    return { successCount: 0, invalidTokens: [] };
  }
}

export async function sendPushFrostAlert(title: string, body: string, targets: PushTokenTarget[]): Promise<PushSendResult> {
  const fcmTokens = targets.filter((target) => target.provider === 'fcm').map((target) => target.token);
  const expoTokens = targets.filter((target) => target.provider === 'expo').map((target) => target.token);
  const [fcm, expo] = await Promise.all([
    sendFcmTokens(title, body, fcmTokens),
    sendExpoTokens(title, body, expoTokens),
  ]);
  return {
    successCount: fcm.successCount + expo.successCount,
    invalidTokens: [...fcm.invalidTokens, ...expo.invalidTokens],
  };
}

export async function sendFcmFrostAlert(title: string, body: string): Promise<number> {
  const result = await sendFcmTokens(title, body, parseTokens());
  return result.successCount;
}
