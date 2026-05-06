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

export async function sendFcmFrostAlert(title: string, body: string): Promise<number> {
  const tokens = parseTokens();
  if (!tokens.length || !firebaseConfigured()) return 0;
  ensureFirebaseApp();

  const res = await admin.messaging().sendEachForMulticast({
    tokens,
    notification: { title, body },
    android: { priority: 'high' as const },
    apns: { payload: { aps: { sound: 'default' } } },
  });
  return res.successCount;
}
