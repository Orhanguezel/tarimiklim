import { getTranslations, setRequestLocale } from "next-intl/server";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { BellRing, CloudSun, Database, Globe2, LineChart, ShieldCheck } from "lucide-react";
import { fetchCustomPageBySlug } from "@/lib/api";
import { getPageMetadata } from "@/lib/seo";
import { getPublicAppName, getPublicSiteUrl } from "@/lib/public-brand";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const app = getPublicAppName();
  const isEn = locale === 'en';
  return getPageMetadata("hakkimizda", {
    locale,
    pathname: "/hakkimizda",
    title: isEn ? `${app} · About` : `${app} · Hakkımızda`,
    description: isEn
      ? `Learn how ${app} turns agricultural weather and frost-risk data into practical decision support.`
      : `${app} servisinin veri yaklaşımını ve ürün vizyonunu keşfedin.`,
  });
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isEn = locale === 'en';
  const app = getPublicAppName();
  const site = getPublicSiteUrl();
  const t = await getTranslations({ locale, namespace: "public.about" });
  const stats = isEn
    ? [
        { label: "Provinces", value: "81", desc: "Coverage across Türkiye" },
        { label: "Forecast", value: "7 days", desc: "Hourly and daily view" },
        { label: "Risk", value: "4 factors", desc: "Frost-risk scoring model" },
      ]
    : [
        { label: "İl", value: "81", desc: "Türkiye geneli kapsam" },
        { label: "Tahmin", value: "7 gün", desc: "Saatlik ve günlük görünüm" },
        { label: "Risk", value: "4 faktör", desc: "Don riski skorlama modeli" },
      ];
  const values = [
    {
      icon: ShieldCheck,
      title: isEn ? "Decision-support approach" : "Karar destek yaklaşımı",
      desc: isEn
        ? "Tarım İklim presents forecasts as early-warning and preparation signals rather than absolute decisions."
        : "Tarım İklim, hava tahminini kesin karar yerine erken uyarı ve hazırlık sinyali olarak sunar.",
    },
    {
      icon: Database,
      title: isEn ? "Multi-source data path" : "Çok kaynaklı veri hattı",
      desc: isEn
        ? "OpenWeatherMap is used as the primary source, with Open-Meteo available as fallback; data is processed by city and location."
        : "OpenWeatherMap birincil kaynak, Open-Meteo yedek kaynak olarak kullanılır; veriler şehir ve konum bazında işlenir.",
    },
    {
      icon: LineChart,
      title: isEn ? "Agricultural context" : "Tarımsal bağlam",
      desc: isEn
        ? "Temperature, humidity, wind and cloud cover are evaluated together to make agricultural frost risk easier to read."
        : "Sıcaklık, nem, rüzgar ve bulutluluk birlikte değerlendirilerek zirai don riski daha anlaşılır hale getirilir.",
    },
  ];
  const fallbackParagraphs = isEn
    ? [
        `${app} is a decision-support service that provides weather forecasts, agricultural frost-risk scores and alert data for growers, seedling/seed businesses and agricultural digital products.`,
        "Our aim is to make weather data usable in the field: helping growers see overnight frost risk earlier, helping businesses show local weather information to their customers, and helping developers bring the same data into their products through API or widget integration.",
        "The service is built around 81-province coverage, 7-day forecasts, hourly minimum-temperature tracking and a four-factor frost-risk score. Forecasts are not guarantees; official meteorological warnings and local expert assessment should be considered for critical decisions.",
      ]
    : [
        `${app}, üreticiler, fide/tohum işletmeleri ve tarımsal dijital ürünler için hava tahmini, zirai don riski ve uyarı verisi sağlayan bir karar destek servisidir.`,
        "Amacımız, hava verisini sahada kullanılabilir hale getirmek: çiftçinin gece don riskini önceden görmesine, işletmelerin müşterilerine yerel hava bilgisi sunmasına ve geliştiricilerin aynı veriyi API veya widget ile ürünlerine taşımasına yardımcı olmak.",
        "Servis; 81 il kapsamı, 7 günlük tahmin, saatlik minimum sıcaklık takibi ve dört faktörlü don riski skoru üzerine kuruludur. Tahminler kesinlik taşımaz; resmi meteorolojik uyarılar ve yerel uzman değerlendirmesiyle birlikte ele alınmalıdır.",
      ];
  const ctaTitle = isEn ? "Bringing agricultural weather data closer to the field" : "Zirai hava verisini sahaya yaklaştırıyoruz";
  const ctaCopy = isEn
    ? `${app} is the agricultural weather and frost-risk infrastructure developed by Tarvista Tarım Teknolojileri A.Ş. It provides the same reliable data path for ecosystem products, websites and grower panels.`
    : `${app}, Tarvista Tarım Teknolojileri A.Ş. tarafından geliştirilen tarımsal hava ve don riski altyapısıdır. Ekosistem ürünleri, web siteleri ve üretici panelleri için aynı güvenilir veri hattını sağlar.`;
  const aboutLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: isEn ? `About ${app}` : `${app} Hakkında`,
    url: `${site}/${locale}/hakkimizda`,
    inLanguage: locale === 'en' ? 'en-US' : 'tr-TR',
    about: {
      '@type': 'Organization',
      name: 'Tarvista Tarım Teknolojileri A.Ş.',
      url: site,
      email: 'info@vistaseeds.com.tr',
    },
  };

  const page = await fetchCustomPageBySlug("hakkimizda", locale);

  return (
    <div className="mx-auto max-w-350 px-8 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutLd) }} />
      <ScrollReveal>
        <div className="space-y-24">

          {/* Hero */}
          <section className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-bold uppercase tracking-widest mb-6">
              <Globe2 className="h-3 w-3" />
              {t("eyebrow")}
            </div>
            <h1 className="font-display text-4xl sm:text-6xl font-black text-foreground mb-8 tracking-tight leading-[1.1]">
              {page?.title ?? t("title")}
            </h1>
            <p className="text-xl text-muted leading-relaxed max-w-3xl mx-auto">
              {page?.summary ?? t("summary", { app })}
            </p>
          </section>

          {/* Stats */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="p-8 rounded-3xl bg-surface/40 backdrop-blur-md border border-border/50 text-center group hover:border-brand/40 transition-colors"
              >
                <div className="text-4xl font-black text-foreground mb-2 group-hover:text-brand transition-colors">{stat.value}</div>
                <div className="text-sm font-bold text-muted uppercase tracking-wider mb-2">{stat.label}</div>
                <p className="text-xs text-faint">{stat.desc}</p>
              </div>
            ))}
          </section>

          {/* İçerik + Değerler */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="font-display text-3xl font-bold text-foreground">
                {t("visionTitle")}
              </h2>
              <div className="space-y-4 text-muted leading-relaxed text-[15px]">
                {page?.content ? (
                  <div dangerouslySetInnerHTML={{ __html: page.content }} />
                ) : (
                  <>
                    {fallbackParagraphs.map((text) => <p key={text}>{text}</p>)}
                  </>
                )}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-linear-to-r from-brand/20 to-success/20 rounded-[3rem] blur-2xl opacity-30" />
              <div className="relative p-10 rounded-3xl bg-surface/60 border border-border overflow-hidden">
                <CloudSun className="absolute -right-8 -bottom-8 h-48 w-48 text-brand/5 rotate-12" />
                <div className="grid grid-cols-1 gap-6">
                  {values.map((val) => (
                    <div key={val.title} className="flex gap-5">
                      <div className="shrink-0 mt-1">
                        <val.icon className="h-6 w-6 text-brand" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground mb-1">{val.title}</h4>
                        <p className="text-sm text-muted">{val.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="p-12 rounded-[2.5rem] bg-brand/10 border border-brand/25 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--brand-rgb),0.12),transparent)] pointer-events-none" />
            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
              <BellRing className="h-12 w-12 mx-auto text-brand mb-4" />
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
                {ctaTitle}
              </h2>
              <p className="text-lg text-muted leading-relaxed">
                {ctaCopy}
              </p>
              <div className="pt-4">
                <a
                  href={`/${locale}/iletisim`}
                  className="inline-flex h-14 items-center px-8 rounded-xl bg-brand text-brand-fg font-bold hover:brightness-110 transition-all shadow-lg shadow-brand/20"
                >
                  {t("cta")}
                </a>
              </div>
            </div>
          </section>

        </div>
      </ScrollReveal>
    </div>
  );
}
