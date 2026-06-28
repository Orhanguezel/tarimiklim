"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import Link from "next/link";
import { useUserAlerts, type UserAlert } from "@/lib/hooks/useUserAlerts";
import { AlertEditModal } from "./AlertEditModal";
import { Skeleton } from "@/components/ui/Skeleton";

interface Props { locale: string }

export function AlertsList({ locale }: Props) {
  const localeCode = useLocale();
  const t = useTranslations("dashboard.alerts");
  const commonT = useTranslations("dashboard.overview");
  const { items, loading, error, remove } = useUserAlerts();
  const [editing, setEditing] = useState<UserAlert | null>(null);

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
        <Link
          href={`/${locale}/uyarilar`}
          className="dashboard-empty-action"
        >
          {commonT("addAlert")}
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-list">
        {items.map((alert) => (
          <div
            key={alert.id}
            className="dashboard-list-item"
          >
            <div className="dashboard-list-content">
              <p className="dashboard-list-title">
                {alert.productName}
              </p>
              <p className="dashboard-list-meta">
                {alert.direction === "above" ? t("above") : t("below")}{" "}
                <span>
                  {parseFloat(alert.thresholdPrice).toLocaleString(localeCode)} ₺
                </span>
                {alert.marketName && ` · ${alert.marketName}`}
              </p>
              <div className="dashboard-list-badges">
                {alert.contactEmail && <ChannelBadge label={t("channelEmail")} />}
                {alert.contactTelegram && <ChannelBadge label={t("channelTelegram")} />}
                {alert.lastTriggered && (
                  <span className="dashboard-list-note">
                    {t("lastTriggered")}: {new Date(alert.lastTriggered).toLocaleDateString(localeCode)}
                  </span>
                )}
              </div>
            </div>

            <div className="dashboard-list-actions">
              <button
                onClick={() => setEditing(alert)}
                className="dashboard-outline-button"
              >
                {t("edit")}
              </button>
              <button
                onClick={() => remove(alert.id)}
                className="dashboard-outline-button is-danger"
              >
                {t("delete")}
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <AlertEditModal
          alert={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function ChannelBadge({ label }: { label: string }) {
  return (
    <span className="dashboard-badge is-success">
      {label}
    </span>
  );
}
