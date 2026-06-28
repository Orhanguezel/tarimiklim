export const dynamic = "force-dynamic";

import { getTranslations, setRequestLocale } from "next-intl/server";
import { AlertsList } from "@/components/dashboard/alerts/AlertsList";

type Props = { params: Promise<{ locale: string }> };

export default async function UyarilarPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "dashboard.nav" });

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-headline">
        <h1 className="dashboard-page-title">
          {t("alerts")}
        </h1>
      </div>
      <AlertsList locale={locale} />
    </div>
  );
}
