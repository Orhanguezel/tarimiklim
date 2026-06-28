export const dynamic = "force-dynamic";

import { getTranslations, setRequestLocale } from "next-intl/server";
import { ChangePasswordForm } from "@/components/dashboard/security/ChangePasswordForm";

type Props = { params: Promise<{ locale: string }> };

export default async function GuvenlikPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "dashboard.nav" });

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-page-title">{t("security")}</h1>
      <ChangePasswordForm />
    </div>
  );
}
