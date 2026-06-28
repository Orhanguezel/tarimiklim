export const dynamic = "force-dynamic";

import { getTranslations, setRequestLocale } from "next-intl/server";
import { TicketList } from "@/components/dashboard/support/TicketList";
import { NewTicketForm } from "@/components/dashboard/support/NewTicketForm";

type Props = { params: Promise<{ locale: string }> };

export default async function DestekPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "dashboard.nav" });

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-page-title">{t("support")}</h1>
      <NewTicketForm />
      <TicketList locale={locale} />
    </div>
  );
}
