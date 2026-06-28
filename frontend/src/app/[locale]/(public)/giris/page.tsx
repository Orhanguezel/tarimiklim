export const dynamic = "force-dynamic";

import { setRequestLocale } from "next-intl/server";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { getPageMetadata } from "@/lib/seo";
import { getPublicAppName } from "@/lib/public-brand";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const app = getPublicAppName();
  return getPageMetadata("giris", {
    locale,
    pathname: "/giris",
    title: `${app} · Giriş`,
    description: `${app} hesabınıza giriş yapın.`,
    robots: { index: false, follow: false },
  });
}

export default async function GirisPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AuthPanel locale={locale} mode="login" />;
}
