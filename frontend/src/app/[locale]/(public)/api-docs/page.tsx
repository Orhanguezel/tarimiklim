import { getPublicAppName, getPublicSiteUrl } from "@/lib/public-brand";
import { getPageMetadata } from "@/lib/seo";
import { setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };
type Method = "GET" | "POST";

type Endpoint = {
  method: Method;
  path: string;
  description: string;
  example: string;
};

const ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/weather?lat=36.89&lon=30.68&days=7",
    description: "7 günlük tahmin verisini döndürür.",
    example: `curl "$API/weather?lat=36.89&lon=30.68&days=7"`,
  },
  {
    method: "GET",
    path: "/weather/current?lat=36.89&lon=30.68",
    description: "Anlık hava durumu verisini döndürür.",
    example: `curl "$API/weather/current?lat=36.89&lon=30.68"`,
  },
  {
    method: "GET",
    path: "/weather/frost-risk?lat=36.89&lon=30.68",
    description: "Don riski skoru ve risk günlerini döndürür.",
    example: `curl "$API/weather/frost-risk?lat=36.89&lon=30.68"`,
  },
  {
    method: "GET",
    path: "/weather/hourly?lat=36.89&lon=30.68&slots=8",
    description: "3 saatlik slotlarla saatlik yakın tahmin verir.",
    example: `curl "$API/weather/hourly?lat=36.89&lon=30.68&slots=8"`,
  },
  {
    method: "GET",
    path: "/weather/widget-data?location=antalya-merkez",
    description: "Widget için optimize edilmiş hafif payload döndürür.",
    example: `curl "$API/weather/widget-data?location=antalya-merkez"`,
  },
  {
    method: "POST",
    path: "/alerts/subscribe",
    description: "Bildirim aboneliği örnek endpoint’i (entegrasyon katmanı).",
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
  return getPageMetadata("api_docs", {
    locale,
    pathname: "/api-docs",
    title: `${app} · API Dokümantasyonu`,
    description: `${app} hava, don riski ve widget entegrasyon endpointleri.`,
    robots: { index: false },
  });
}

export default async function ApiDocsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const site = getPublicSiteUrl().replace(/\/+$/, "");
  const API = `${site}/api/v1`;

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <section className="mb-10">
        <div className="mb-3 inline-flex rounded-full border border-(--color-brand)/25 bg-(--color-brand)/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-(--color-brand)">
          Developer
        </div>
        <h1 className="font-display text-4xl font-bold text-(--color-foreground)">API Dokümantasyonu</h1>
        <p className="mt-3 max-w-3xl text-sm text-(--color-muted)">
          Tarımİklim servis katmanı REST tabanlıdır ve JSON döndürür. Aşağıdaki örnekler ile canlı tahmin, don
          riski ve widget entegrasyonunu hızlıca test edebilirsiniz.
        </p>
      </section>

      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        <InfoCard label="Base URL" value={API} />
        <InfoCard label="Format" value="JSON (UTF-8)" />
        <InfoCard label="Rate Limit" value="60 istek / dakika (free tier)" />
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
            <p className="mb-3 text-sm text-(--color-muted)">{ep.description}</p>
            <pre className="overflow-x-auto rounded-xl border border-(--color-border) bg-(--color-background) px-4 py-3 font-mono text-xs text-(--color-foreground)">
              {ep.example.replaceAll("$API", API)}
            </pre>
          </article>
        ))}
      </section>

      <section className="mt-10 rounded-2xl border border-(--color-border) bg-(--color-surface) p-6">
        <h2 className="font-display text-2xl font-semibold text-(--color-foreground)">Widget Entegrasyonu</h2>
        <p className="mt-2 text-sm text-(--color-muted)">
          Widget bileşenini iframe ile gömebilirsiniz. Aşağıdaki örnekte canlı endpoint doğrudan bu proje üstünden
          beslenir.
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
