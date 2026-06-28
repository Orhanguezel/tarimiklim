export const dynamic = "force-dynamic";

import { getTranslations, setRequestLocale } from "next-intl/server";
import { NotificationList } from "@/components/dashboard/notifications/NotificationList";
import { PushPermissionCard } from "@/components/dashboard/notifications/PushPermissionCard";

type Props = { params: Promise<{ locale: string }> };

export default async function BildirimlerPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "dashboard.nav" });

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-page-title">{t("notifications")}</h1>
      <PushPermissionCard />
      <NotificationList />
    </div>
  );
}
