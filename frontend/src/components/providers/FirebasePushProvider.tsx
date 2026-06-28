"use client";

import { useEffect } from "react";
import { useAuthSession } from "@/components/providers/AuthSessionProvider";
import { registerFirebasePushToken } from "@/lib/firebase-push";

export function FirebasePushProvider() {
  const { user } = useAuthSession();

  useEffect(() => {
    if (!user?.id || typeof window === "undefined") return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    let cancelled = false;

    void registerFirebasePushToken().then((result) => {
      if (!cancelled && !result.ok) console.debug("[firebase-push] token sync skipped", result.reason);
    });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return null;
}
