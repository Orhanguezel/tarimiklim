"use client";

import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { getAuthHeader } from "@/lib/auth-client";
import { API_URL } from "@/lib/site-settings";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? "";

function hasValidVapidKeyShape() {
  // Firebase Web Push public VAPID keys are URL-safe base64 P-256 keys and are
  // typically 87 chars. Shorter values are usually server keys or copied from
  // the wrong Firebase console field.
  return /^[A-Za-z0-9_-]{80,120}$/.test(vapidKey);
}

export function firebaseWebPushConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.messagingSenderId &&
      firebaseConfig.appId &&
      vapidKey,
  );
}

function getDeviceId() {
  const key = "tarimiklim_web_push_device_id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  window.localStorage.setItem(key, id);
  return id;
}

export async function registerFirebasePushToken() {
  if (typeof window === "undefined") return { ok: false as const, reason: "server" };
  if (!firebaseWebPushConfigured()) return { ok: false as const, reason: "missing_config" };
  if (!hasValidVapidKeyShape()) return { ok: false as const, reason: "invalid_vapid_key" };
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    return { ok: false as const, reason: "unsupported" };
  }

  const supported = await isSupported().catch(() => false);
  if (!supported) return { ok: false as const, reason: "unsupported" };

  const permission =
    Notification.permission === "granted"
      ? "granted"
      : await Notification.requestPermission().catch(() => "denied");
  if (permission !== "granted") return { ok: false as const, reason: "permission_denied" };

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  const registration = await navigator.serviceWorker
    .register("/firebase-messaging-sw.js", { scope: "/" })
    .catch(() => null);
  if (!registration) return { ok: false as const, reason: "sw_failed" };

  const messaging = getMessaging(app);
  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  }).catch((error) => {
    console.error("[firebase-push] getToken failed", error);
    return "";
  });

  if (!token) return { ok: false as const, reason: "token_empty" };

  const res = await fetch(`${API_URL}/me/push-tokens`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    credentials: "include",
    body: JSON.stringify({
      token,
      provider: "fcm",
      platform: "web",
      device_id: getDeviceId(),
    }),
  }).catch(() => null);

  if (!res?.ok) return { ok: false as const, reason: "backend_failed" };
  return { ok: true as const, token };
}
