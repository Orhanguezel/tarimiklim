"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, RefreshCw } from "lucide-react";
import { registerFirebasePushToken } from "@/lib/firebase-push";

const MESSAGE: Record<string, string> = {
  missing_config: "Firebase web push ayarları eksik.",
  invalid_vapid_key:
    "Firebase Web Push VAPID anahtarı hatalı. Firebase Console > Project settings > Cloud Messaging > Web Push certificates alanındaki public key'i frontend/.env.local içine ekleyin.",
  unsupported: "Bu tarayıcı web push bildirimlerini desteklemiyor.",
  sw_failed:
    "Service worker kaydedilemedi. Sayfayı yenileyip tekrar deneyin; devam ederse tarayıcı Application > Service Workers bölümünden eski worker'ı kaldırın.",
  permission_denied:
    "Bildirim izni kapalı. Adres çubuğundaki site ayarlarından localhost için Bildirimler iznini temizleyip tekrar deneyin.",
  token_empty: "Firebase cihaz tokenı üretilemedi.",
  backend_failed: "Token backend'e kaydedilemedi. Backend açık mı kontrol edin.",
};

export function PushPermissionCard() {
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");

  const permissionMeta = useMemo(() => {
    if (permission === "granted") {
      return { label: "İzin açık", className: "dashboard-badge is-success" };
    }
    if (permission === "denied") {
      return { label: "İzin kapalı", className: "dashboard-badge is-danger" };
    }
    if (permission === "unsupported") {
      return { label: "Desteklenmiyor", className: "dashboard-badge is-danger" };
    }
    return { label: "İzin bekliyor", className: "dashboard-badge is-warning" };
  }, [permission]);

  function refreshPermission() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
  }

  useEffect(() => {
    refreshPermission();
  }, []);

  async function enablePush() {
    setLoading(true);
    setStatus("");
    try {
      const result = await registerFirebasePushToken();
      setStatus(result.ok ? "Push bildirimleri bu tarayıcı için etkinleştirildi." : MESSAGE[result.reason] ?? "Push bildirimi etkinleştirilemedi.");
      refreshPermission();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="dashboard-panel">
      <div className="dashboard-panel-head">
        <div>
          <h2 className="dashboard-panel-title">Push Bildirimleri</h2>
          <p>
            Don uyarıları ve kampanya bildirimleri için bu tarayıcıyı kaydedin.
          </p>
        </div>
      </div>
      <div className="dashboard-panel-body">
        <div className="dashboard-panel-inline-head">
          <span className="dashboard-panel-icon" aria-hidden="true">
            <Bell size={20} />
          </span>
          <div>
            <p className="dashboard-list-title">Bu tarayıcıyı kaydet</p>
            <p className="dashboard-list-note">
              İzin verdikten sonra don riski ve kampanya bildirimleri bu cihaza gönderilir.
            </p>
            <span className={permissionMeta.className}>{permissionMeta.label}</span>
          </div>
        </div>
        {permission === "denied" ? (
          <div className="dashboard-empty">
            <p>
              Tarayıcı bildirim izni engellenmiş. Adres çubuğundaki kilit/site ayarları ikonundan
              Bildirimler iznini “İzin ver” yapın, sayfayı yenileyin ve tekrar deneyin.
            </p>
            <button className="dashboard-outline-button" type="button" onClick={refreshPermission}>
              <RefreshCw size={14} />
              İzni tekrar kontrol et
            </button>
          </div>
        ) : null}
        <button className="dashboard-button" type="button" onClick={enablePush} disabled={loading}>
          {loading ? (
            <>
              <span className="dashboard-button-spinner" aria-hidden="true" />
              Etkinleştiriliyor...
            </>
          ) : (
            permission === "granted" ? "Tokenı Yeniden Kaydet" : "Push'u Etkinleştir"
          )}
        </button>
        {status ? <p className="dashboard-list-note">{status}</p> : null}
      </div>
    </section>
  );
}
