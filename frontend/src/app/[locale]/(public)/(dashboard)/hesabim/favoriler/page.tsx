export const dynamic = "force-dynamic";

import { getTranslations, setRequestLocale } from "next-intl/server";
import { FavoritesList } from "@/components/dashboard/favorites/FavoritesList";

type Props = { params: Promise<{ locale: string }> };

export default async function FavorilerPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "dashboard.nav" });

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-page-title">
        {t("favorites")}
      </h1>
      <FavoritesList locale={locale} />
    </div>
  );
}
