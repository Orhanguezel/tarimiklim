import { getPublicAppName, getPublicSiteUrl } from "@/lib/public-brand";
import { getPageMetadata } from "@/lib/seo";
import { setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };
type Method = "GET" | "POST";

type Endpoint = {
  method: Method;
  path: string;
  description: { tr: string; en: string };
  example: string;
};

const ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/weather?lat=36.89&lon=30.68&days=7",
    description: { tr: "7 günlük tahmin verisini döndürür.", en: "Returns 7-day forecast data." },
    example: `curl "$API/weather?lat=36.89&lon=30.68&days=7"`,
  },
  {
    method: "GET",
    path: "/weather/current?lat=36.89&lon=30.68",
    description: { tr: "Anlık hava durumu verisini döndürür.", en: "Returns current weather data." },
    example: `curl "$API/weather/current?lat=36.89&lon=30.68"`,
  },
  {
    method: "GET",
    path: "/weather/frost-risk?lat=36.89&lon=30.68",
    description: { tr: "Don riski skoru ve risk günlerini döndürür.", en: "Returns the frost-risk score and risk days." },
    example: `curl "$API/weather/frost-risk?lat=36.89&lon=30.68"`,
  },
  {
    method: "GET",
    path: "/weather/hourly?lat=36.89&lon=30.68&slots=8",
    description: { tr: "3 saatlik slotlarla saatlik yakın tahmin verir.", en: "Returns near-term forecasts in 3-hour slots." },
    example: `curl "$API/weather/hourly?lat=36.89&lon=30.68&slots=8"`,
  },
  {
    method: "GET",
    path: "/weather/widget-data?location=antalya-merkez",
    description: { tr: "Widget için optimize edilmiş hafif payload döndürür.", en: "Returns a lightweight payload optimized for widgets." },
    example: `curl "$API/weather/widget-data?location=antalya-merkez"`,
  },
  {
    method: "POST",
    path: "/alerts/subscribe",
    description: { tr: "Bildirim aboneliği örnek endpoint’i (entegrasyon katmanı).", en: "Example notification subscription endpoint for integration flows." },
    example:
      `curl -X POST "$API/alerts/subscribe" \\\n  -H "Content-Type: application/json" \\\n  -d '{"location":"antalya-merkez","channel":"telegram","threshold":65}'`,
  },
];

const METHOD_CLASS: Record<Method, string> = {
  GET: "border-(--color-brand)/25 bg-(--color-brand)/10 text-(--color-brand)",
  POST: "border-(--color-terra)/25 bg-(--color-terra)/10 text-(--color-terra)",
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const app = getPublicAppName();
  const isEn = locale === 'en';
  return getPageMetadata("api_docs", {
    locale,
    pathname: "/api-docs",
    title: isEn ? `${app} · API Documentation` : `${app} · API Dokümantasyonu`,
    description: isEn
      ? `${app} weather, frost-risk and widget integration endpoints.`
      : `${app} hava, don riski ve widget entegrasyon endpointleri.`,
    robots: { index: false },
  });
}

export default async function ApiDocsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isEn = locale === 'en';

  const site = getPublicSiteUrl().replace(/\/+$/, "");
  const API = `${site}/api/v1`;
  const app = getPublicAppName();
  const copy = isEn
    ? {
        title: 'API Documentation',
        lead: 'The Tarım İklim service layer is REST-based and returns JSON. Use the examples below to test live forecasts, frost-risk data and widget integration quickly.',
        format: 'JSON (UTF-8)',
        rate: '60 requests / minute (free tier)',
        widgetTitle: 'Widget Integration',
        widgetLead: 'You can embed the widget component with an iframe. In the example below, the live endpoint is served directly through this project.',
        articleDescription: `${app} weather, frost-risk and widget integration endpoints.`,
      }
    : {
        title: 'API Dokümantasyonu',
        lead: 'Tarımİklim servis katmanı REST tabanlıdır ve JSON döndürür. Aşağıdaki örnekler ile canlı tahmin, don riski ve widget entegrasyonunu hızlıca test edebilirsiniz.',
        format: 'JSON (UTF-8)',
        rate: '60 istek / dakika (free tier)',
        widgetTitle: 'Widget Entegrasyonu',
        widgetLead: 'Widget bileşenini iframe ile gömebilirsiniz. Aşağıdaki örnekte canlı endpoint doğrudan bu proje üstünden beslenir.',
        articleDescription: `${app} hava, don riski ve widget entegrasyon endpointleri.`,
      };
  const docsLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: isEn ? `${app} API Documentation` : `${app} API Dokümantasyonu`,
    description: copy.articleDescription,
    url: `${site}/${locale}/api-docs`,
    inLanguage: locale === 'en' ? 'en-US' : 'tr-TR',
    publisher: { '@type': 'Organization', name: 'Tarvista Tarım Teknolojileri A.Ş.', url: site },
    about: ['weather API', 'frost risk API', 'agricultural weather widget'],
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(docsLd) }} />
      <section className="mb-10">
        <div className="mb-3 inline-flex rounded-full border border-(--color-brand)/25 bg-(--color-brand)/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-(--color-brand)">
          Developer
        </div>
        <h1 className="font-display text-4xl font-bold text-(--color-foreground)">{copy.title}</h1>
        <p className="mt-3 max-w-3xl text-sm text-(--color-muted)">
          {copy.lead}
        </p>
      </section>

      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        <InfoCard label="Base URL" value={API} />
        <InfoCard label="Format" value={copy.format} />
        <InfoCard label="Rate Limit" value={copy.rate} />
      </section>

      <section className="space-y-5">
        {ENDPOINTS.map((ep) => (
          <article key={ep.path} className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span className={`rounded-md border px-2 py-0.5 text-[11px] font-bold tracking-wider ${METHOD_CLASS[ep.method]}`}>
                {ep.method}
              </span>
              <code className="font-mono text-sm text-(--color-foreground)">{ep.path}</code>
            </div>
            <p className="mb-3 text-sm text-(--color-muted)">{isEn ? ep.description.en : ep.description.tr}</p>
            <pre className="overflow-x-auto rounded-xl border border-(--color-border) bg-(--color-background) px-4 py-3 font-mono text-xs text-(--color-foreground)">
              {ep.example.replaceAll("$API", API)}
            </pre>
          </article>
        ))}
      </section>

      <section className="mt-10 rounded-2xl border border-(--color-border) bg-(--color-surface) p-6">
        <h2 className="font-display text-2xl font-semibold text-(--color-foreground)">{copy.widgetTitle}</h2>
        <p className="mt-2 text-sm text-(--color-muted)">
          {copy.widgetLead}
        </p>
        <pre className="mt-4 overflow-x-auto rounded-xl border border-(--color-border) bg-(--color-background) px-4 py-3 font-mono text-xs text-(--color-foreground)">
{`<iframe
  src="${site}/tr/widget/bereketfide"
  width="360"
  height="210"
  style="border:none;border-radius:14px"
  title="Tarımİklim Widget"
/>`}
        </pre>
      </section>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-(--color-muted)">{label}</p>
      <p className="break-all font-mono text-sm text-(--color-foreground)">{value}</p>
    </div>
  );
}
