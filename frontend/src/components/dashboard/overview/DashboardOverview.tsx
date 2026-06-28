"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthSession } from "@/components/providers/AuthSessionProvider";
import { apiGet } from "@/lib/api-client";
import { getFavorites } from "@/lib/favorites";

type Summary = {
  alertCount: number;
  favoriteCount: number;
  unreadNotifications: number;
  openTickets: number;
};

export function DashboardOverview() {
  const t = useTranslations("dashboard.overview");
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || "tr";
  const accountBase = `/${locale}/hesabim`;
  const { user } = useAuthSession();
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    Promise.all([
      apiGet<{ items: unknown[] }>("/me/alert-rules").then((r) => r.items.length).catch(() => 0),
      Promise.resolve(getFavorites().length),
      apiGet<{ count: number }>("/notifications/unread-count").then((r) => r.count).catch(() => 0),
      apiGet<{ items: { status: string }[] }>("/support/tickets/my")
        .then((r) => r.items.filter((t) => t.status === "open").length)
        .catch(() => 0),
    ]).then(([alertCount, favoriteCount, unreadNotifications, openTickets]) => {
      setSummary({ alertCount, favoriteCount, unreadNotifications, openTickets });
    });
  }, []);

  const greeting = user?.full_name
    ? t("greetingWithUser", { name: user.full_name.split(" ")[0] })
    : t("greeting");

  return (
    <div className="dashboard-overview">
      <header className="dashboard-page-head">
        <h1>
          {greeting}
        </h1>
        <p>
          {t("subtitle")}
        </p>
      </header>

      <div className="dashboard-stats">
        <StatCard
          label={t("activeAlerts")}
          value={summary?.alertCount}
          href={`${accountBase}/alert-rules`}
          icon="🔔"
        />
        <StatCard
          label={t("favoriteProducts")}
          value={summary?.favoriteCount}
          href={`${accountBase}/favoriler`}
          icon="⭐"
        />
        <StatCard
          label={t("unreadNotifications")}
          value={summary?.unreadNotifications}
          href={`${accountBase}/bildirimler`}
          icon="📥"
          highlight={Boolean(summary?.unreadNotifications)}
        />
        <StatCard
          label={t("openTickets")}
          value={summary?.openTickets}
          href={`${accountBase}/destek`}
          icon="🎫"
        />
      </div>

      <section className="dashboard-section">
        <h2>
          {t("quickActions")}
        </h2>
        <div className="dashboard-actions">
          <QuickAction
            href={`${accountBase}/alert-rules`}
            label={t("addAlert")}
            desc={t("addAlertDesc")}
            icon="🔔"
          />
          <QuickAction
            href={`/${locale}/don-uyarisi`}
            label={t("viewForecast")}
            desc={t("viewForecastDesc")}
            icon="📊"
          />
          <QuickAction
            href={`${accountBase}/profil`}
            label={t("profileSettings")}
            desc={t("profileSettingsDesc")}
            icon="⚖️"
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  icon,
  highlight,
}: {
  label: string;
  value: number | undefined;
  href: string;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`dashboard-stat-card${highlight ? " is-highlighted" : ""}`}
    >
      <span className="dashboard-stat-icon">{icon}</span>
      <span className="dashboard-stat-value">
        {value === undefined ? (
          <span className="dashboard-skeleton dashboard-skeleton-value" />
        ) : value}
      </span>
      <span className="dashboard-stat-label">{label}</span>
    </Link>
  );
}

function QuickAction({
  href,
  label,
  desc,
  icon,
}: {
  href: string;
  label: string;
  desc: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="dashboard-action-card"
    >
      <span className="dashboard-action-icon">{icon}</span>
      <div>
        <p className="dashboard-action-title">{label}</p>
        <p className="dashboard-action-desc">{desc}</p>
      </div>
    </Link>
  );
}
