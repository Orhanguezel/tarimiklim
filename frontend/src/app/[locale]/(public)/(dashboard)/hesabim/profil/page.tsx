export const dynamic = "force-dynamic";

import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProfileForm } from "@/components/dashboard/profile/ProfileForm";
import { AvatarUpload } from "@/components/dashboard/profile/AvatarUpload";

type Props = { params: Promise<{ locale: string }> };

export default async function ProfilPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "dashboard.nav" });

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-page-title">{t("profile")}</h1>
      <AvatarUpload />
      <ProfileForm />
    </div>
  );
}
