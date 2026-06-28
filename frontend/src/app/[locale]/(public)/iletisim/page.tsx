import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/sections/ContactForm";
import AmbientBackground from "@/components/ui/AmbientBackground";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getPageMetadata } from "@/lib/seo";
import { getPublicAppName } from "@/lib/public-brand";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const app = getPublicAppName();
  return getPageMetadata("iletisim", {
    locale,
    pathname: "/iletisim",
    title: `${app} · İletişim`,
    description: `${app} ekibiyle iletişime geçin; soru, öneri ve destek taleplerinizi gönderin.`,
  });
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "public.contact" });

  return (
    <main className="relative min-h-screen overflow-hidden pt-24 pb-20">
      <AmbientBackground />
      
      <div className="container relative z-10 mx-auto px-4">
        <ScrollReveal>
          <div className="max-w-6xl mx-auto">
            {/* Header Bölümü */}
            <header className="mb-16 text-center max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-6 tracking-tight">
                {t("titlePrefix")} <span className="text-brand">{t("titleHighlight")}</span> {t("titleSuffix")}
              </h1>
              <p className="text-lg sm:text-xl text-muted leading-relaxed">
                {t("lead")}
              </p>
            </header>

            {/* İletişim Formu ve Bilgiler */}
            <ContactForm />
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}
