import admin from 'firebase-admin';
import { env } from '@/core/env.js';

function parseTokens(): string[] {
  return String(env.FCM_DEVICE_TOKENS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function firebaseConfigured(): boolean {
  return Boolean(
    env.FIREBASE_PROJECT_ID?.trim() &&
      env.FIREBASE_CLIENT_EMAIL?.trim() &&
      env.FIREBASE_PRIVATE_KEY?.trim(),
  );
}

function ensureFirebaseApp(): void {
  if (admin.apps.length > 0) return;
  const privateKey = String(env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, '\n');
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID!.trim(),
      privateKey,
      clientEmail: env.FIREBASE_CLIENT_EMAIL!.trim(),
    }),
  });
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
