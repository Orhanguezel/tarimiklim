import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/sections/ContactForm";
import AmbientBackground from "@/components/ui/AmbientBackground";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getPageMetadata } from "@/lib/seo";
import { getPublicAppName, getPublicSiteUrl } from "@/lib/public-brand";

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
  const app = getPublicAppName();
  const site = getPublicSiteUrl();
  const contactLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `${app} İletişim`,
    url: `${site}/${locale}/iletisim`,
    about: {
      '@type': 'Organization',
      name: 'Tarvista Tarım Teknolojileri A.Ş.',
      email: 'destek@tarimiklim.com',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Antalya',
        addressCountry: 'TR',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'destek@tarimiklim.com',
        availableLanguage: ['tr', 'en'],
      },
    },
  };

  return (
    <main className="relative min-h-screen overflow-hidden pt-24 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactLd) }}
      />
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

            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <aside className="rounded-2xl border border-line bg-surface-strong p-6 shadow-card">
                <h2 className="mb-4 text-2xl font-bold text-foreground">Destek ve iş ortaklığı</h2>
                <div className="space-y-4 text-sm leading-relaxed text-muted">
                  <p>{app}, Tarvista Tarım Teknolojileri A.Ş. tarafından geliştirilmektedir.</p>
                  <p>
                    Don uyarısı, hava verisi, widget/API kullanımı, veri ortaklığı ve destek talepleri için bize yazabilirsiniz.
                  </p>
                  <dl className="space-y-3">
                    <div>
                      <dt className="font-bold text-foreground">E-posta</dt>
                      <dd><a className="text-brand underline" href="mailto:destek@tarimiklim.com">destek@tarimiklim.com</a></dd>
                    </div>
                    <div>
                      <dt className="font-bold text-foreground">Merkez</dt>
                      <dd>Antalya · Türkiye</dd>
                    </div>
                    <div>
                      <dt className="font-bold text-foreground">Dönüş</dt>
                      <dd>Destek talepleri iş günlerinde incelenir; kritik servis konuları önceliklendirilir.</dd>
                    </div>
                  </dl>
                </div>
              </aside>
              <ContactForm />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}
