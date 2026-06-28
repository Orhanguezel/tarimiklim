export const dynamic = "force-dynamic";

import { setRequestLocale } from "next-intl/server";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { getPageMetadata } from "@/lib/seo";
import { getPublicAppName } from "@/lib/public-brand";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const app = getPublicAppName();
  return getPageMetadata("kayit", {
    locale,
    pathname: "/kayit",
    title: `${app} · Kayıt`,
    description: `${app} için yeni hesap oluşturun.`,
    robots: { index: false, follow: false },
  });
}

export default async function KayitPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AuthPanel locale={locale} mode="register" />;
}
