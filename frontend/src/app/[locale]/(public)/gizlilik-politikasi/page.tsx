export const dynamic = "force-dynamic";

import { setRequestLocale } from "next-intl/server";
import { fetchCustomPageBySlug } from "@/lib/api";
import LegalPageContent from "@/components/LegalPageContent";
import { getPageMetadata } from "@/lib/seo";
import { getPublicAppName } from "@/lib/public-brand";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const app = getPublicAppName();
  return getPageMetadata("gizlilik_politikasi", {
    locale,
    pathname: "/gizlilik-politikasi",
    title: `${app} · Gizlilik Politikası`,
    description: `${app} gizlilik politikası ve kişisel verilerin korunmasına ilişkin bilgilendirme.`,
  });
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const page = await fetchCustomPageBySlug("gizlilik-politikasi", locale);

  return <LegalPageContent page={page} fallbackTitle="Gizlilik Politikası" />;
}
