"use client";

import { useNotifications } from "@/lib/hooks/useNotifications";
import { Skeleton } from "@/components/ui/Skeleton";
import { useLocale, useTranslations } from "next-intl";

export function NotificationList() {
  const locale = useLocale();
  const t = useTranslations("dashboard.notifications");
  const { items, loading, error, unreadCount, markRead, markAllRead } = useNotifications();

  if (loading) {
    return (
      <div className="dashboard-list">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="dashboard-list-skeleton" />)}
      </div>
    );
  }

  if (error) {
    return <p className="dashboard-error">{error}</p>;
  }

  if (items.length === 0) {
    return (
      <div className="dashboard-empty">
        <p>{t("empty")}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-list">
      {unreadCount > 0 && (
        <div className="dashboard-list-toolbar">
          <button
            onClick={markAllRead}
            className="dashboard-link-button"
          >
            {t("markAllRead")}
          </button>
        </div>
      )}

      {items.map((n) => (
        <div
          key={n.id}
          className={`dashboard-list-item${n.is_read ? "" : " is-unread"}`}
        >
          <div className="dashboard-list-content">
            <p className="dashboard-list-title">
              {n.title}
            </p>
            <p className="dashboard-list-meta">{n.message}</p>
            <p className="dashboard-list-note">
              {new Date(n.created_at).toLocaleString(locale)}
            </p>
          </div>
          {!n.is_read && (
            <button
              onClick={() => markRead(n.id)}
              className="dashboard-outline-button"
            >
              {t("markRead")}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
