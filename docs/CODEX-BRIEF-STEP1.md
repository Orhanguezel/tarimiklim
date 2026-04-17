# Codex Brief — Adım 1 (FAZ 1 temizlik + FAZ 2 statik bölümler)

**Branch:** `feature/premium-landing`
**Atayan:** Claude Code
**Hedef teslim:** 1 oturum · tek PR · atomic commit'ler

> **Öncelikli keşif:** FAZ 1'in büyük kısmı zaten yapılmış — `design-tokens.css`, `globals.css` (1143 satır premium stil), `next/font` yüklemesi, `@agro/shared-config` theme bağlantısı, `premiumThemeVars` hepsi hazır. Seni iki küçük FAZ 1 kalıntısı + tüm FAZ 2 (statik bölüm component'leri) bekliyor.

> **Claude tarafından tamamlandı (2026-04-17):** Görev C.1, C.2, C.3 bitti. Detay aşağıda §C başlığı altında.
>
> - ✅ `src/types/weather.ts` oluşturuldu (`HourlySlot` dahil tüm tipler)
> - ✅ `src/lib/api.ts` tüm fonksiyonlar typed return ile güçlendirildi (`HourlySlot` re-export korundu → geriye uyum)
> - ✅ `src/components/widget/WeatherWidget.tsx` yerel `WidgetData` kaldırıldı, `WidgetDataResponse` kullanıyor
> - ✅ `WeatherDashboard.tsx`'teki tip cast'i double-cast'le güncellendi (tsc temiz)
> - ✅ `bun run lint` (tsc --noEmit) sıfır hata
>
> **Senin başlangıç noktan:** doğrudan **Görev 2 — FAZ 2 Statik Bölümler** (§D). §C geç, okumaya bile gerek yok (referans için duruyor).

---

## A. Referans Dosyalar (OKU, DEĞİŞTİRME)

| Dosya | Ne için |
|-------|---------|
| [tarimiklim-premium.html](../tarimiklim-premium.html) | Markup + class isimleri için tek kaynak |
| [frontend/src/styles/globals.css](../frontend/src/styles/globals.css) | Tüm CSS class'ları ZATEN hazır — yeni CSS yazma |
| [frontend/src/styles/design-tokens.css](../frontend/src/styles/design-tokens.css) | Renk/spacing tokenları |
| [frontend/src/app/[locale]/layout.tsx](../frontend/src/app/[locale]/layout.tsx) | Font + theme bağlantısı (ÇALIŞIYOR) |
| [frontend/src/lib/api.ts](../frontend/src/lib/api.ts) | API fonksiyonları (tip güçlendireceksin) |
| [frontend/src/components/widget/WeatherWidget.tsx](../frontend/src/components/widget/WeatherWidget.tsx) | Yerel `WidgetData` silip shared tip import edeceksin |
| [frontend/public/locales/tr.json](../frontend/public/locales/tr.json) | Yeni anahtarları BURAYA ekle (yeni dosya açma) |
| [frontend/public/locales/en.json](../frontend/public/locales/en.json) | İngilizce karşılıklar |

## B. Dokunulmaz

- `/widget/bereketfide` ve `/widget/vistaseed` sayfaları — ekosistem projeleri canlıda kullanıyor
- `frontend/src/app/widget/**` tüm dosyalar
- `backend/` — bu sprintte backend'e dokunulmuyor
- `globals.css` mevcut kurallar — yeni class ekleme ihtiyacı doğarsa DURR ve Claude'a sor

---

## C. Görev 1 — FAZ 1 Temizlik (30 dk)

### C.1 · Yeni dosya: `frontend/src/types/weather.ts`

Aşağıdaki tipleri birebir oluştur:

```ts
export interface WeatherLocation {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  timezone?: string;
  isActive?: boolean;
}

export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;     // m/s — backend öyle döner
  condition: string;
  icon: string;
}

export interface ForecastDay {
  date: string;
  forecastDate?: string;
  tempMin: number;
  tempMax: number;
  humidity?: number;
  windSpeed?: number;
  precipitation?: number;
  condition: string;
  icon?: string;
  frostRisk: number;     // 0-100
}

export interface WidgetDataResponse {
  location: WeatherLocation;
  current: CurrentWeather;
  forecast: ForecastDay[];
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface FrostRiskResponse {
  location: WeatherLocation;
  frostRisk: number;
  riskLevel: RiskLevel;
  forecasts: ForecastDay[];
}

export interface ForecastResponse {
  location: WeatherLocation;
  forecasts: ForecastDay[];
}

export interface RainForecastResponse {
  location: WeatherLocation;
  rainForecast: Array<{ date: string; precipitation: number; condition: string }>;
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

### C.2 · Güncelle: `frontend/src/lib/api.ts`

Fonksiyonlara return type ekle:

```ts
import type {
  CurrentWeather,
  FrostRiskResponse,
  WidgetDataResponse,
  ForecastResponse,
  WeatherLocation,
} from '@/types/weather';

export async function fetchWeather(lat: number, lon: number, days = 7): Promise<ForecastResponse> { ... }
export async function fetchCurrentWeather(lat: number, lon: number): Promise<CurrentWeather> { ... }
export async function fetchFrostRisk(location: string): Promise<FrostRiskResponse> { ... }
export async function fetchWidgetData(location: string): Promise<WidgetDataResponse> { ... }
export async function fetchLocations(): Promise<WeatherLocation[]> { ... }
```

Fonksiyon gövdeleri **aynı kalır**. Mevcut `HourlySlot` tipi `lib/api.ts`'ten çıkar, `types/weather.ts`'e taşı.

### C.3 · Temizle: `frontend/src/components/widget/WeatherWidget.tsx`

Satır 61-79 arası `interface WidgetData` tanımını sil. Yerine:

```ts
import type { WidgetDataResponse } from '@/types/weather';
// ...
const [data, setData] = useState<WidgetDataResponse | null>(null);
```

Bileşen davranışı değişmez.

### C.4 · Commit

```
refactor(frontend): merkezi weather tipleri + widget tip tekrarını kaldır
```

---

## D. Görev 2 — FAZ 2 Statik Bölümler (3-4 saat)

Her bölüm `frontend/src/components/sections/<Name>.tsx` altında **tek dosya, ≤200 satır**. **Sunucu component (default)** — `'use client'` sadece etkileşim gerektirenlerde.

### Kurallar

1. Mevcut CSS class'larını birebir kullan (`.alert-bar`, `.site-nav`, `.hero-grid`, `.pillars-grid` vb. zaten `globals.css`'te tanımlı).
2. Metinler **i18n'den** gelecek — `useTranslations('alertBar')` · `useTranslations('hero')` · ...
3. Hard-code renk/font YASAK. CSS class + custom property.
4. Yeni CSS class ihtiyacı → `globals.css` sonuna **CSS Modül bloğu** olarak ekle (tek satırda `/* sections/HeroSection.tsx ek */` yorumla). Mümkünse ekleme.
5. SVG'ler inline (mockup'taki pillar-icon, button ok, nav-cta arrow).

### D.1 · `sections/AlertBar.tsx` (server)

HTML ref: `tarimiklim-premium.html:1271-1284`.

İçerik:
- Sol: `.pulse-dot` + `alertBar.status` çevirisi
- Sağ: 3 mono metrik — `alertBar.metric.accuracy / latency / coverage`

```tsx
import { useTranslations } from 'next-intl';

export function AlertBar() {
  const t = useTranslations('alertBar');
  return (
    <div className="alert-bar">
      <div className="alert-bar-inner container-wide">
        <div className="alert-left">
          <span className="pulse-dot" aria-hidden />
          <span>{t('status')}</span>
        </div>
        <div className="alert-right">
          <span>{t('metric.accuracy')}</span>
          <span>{t('metric.latency')}</span>
          <span>{t('metric.coverage')}</span>
        </div>
      </div>
    </div>
  );
}
```

### D.2 · `sections/SiteNav.tsx` (client — mobil toggle için)

HTML ref: `1286-1305`. Sticky + backdrop blur (mevcut `.site-nav`).

İçerik:
- Marka: `<Link>` `.brand-word` + `.brand-mark`
- Desktop menü: 4 link — `nav.panel` (→ `/{locale}/panel`), `nav.modules` (#modules), `nav.api` (#api), `nav.ecosystem` (#ecosystem)
- Sağda CTA: `nav.cta`
- Mobil hamburger: `aria-expanded` state, küçük `useState`

### D.3 · `sections/PillarsSection.tsx` (server)

HTML ref: `1509-1563`. 3 `.pillar-card` kart:

- **frost**: `pillars.frost.{num,title,desc,feat.{interval,window,channels,accuracy}}`
- **forecast**: `pillars.forecast.{num,title,desc,feat.{sources,resolution,refresh,params}}`
- **irrigation**: `pillars.irrigation.{num,title,desc,feat.{methods,templates,savings,integration}}`

SVG ikonlar HTML'den birebir. `<em>` etiketlerini içe i18n'den geçir (next-intl `rich` API):

```tsx
t.rich('frost.title', { em: (chunks) => <em>{chunks}</em> })
```

TR kaynağında: `"title": "Don riski, <em>dört faktörlü.</em>"`

### D.4 · `sections/ArchitectureSection.tsx` (server)

HTML ref: `1566-1642`. 5 katman (`.layer-card`); katman 4 `.is-active`. `architecture.layer4.you = "SEN BURADASIN"` highlight tag.

### D.5 · `sections/StatsStrip.tsx` (server)

HTML ref: `1724-1747`. Şimdilik statik metinler — i18n anahtarlarından (`stats.activeCities.{label,desc}`, `stats.accuracy.*`, `stats.latency.*`, `stats.savings.*`). Sayılar **markuplı**: mesaj içinde `<span class="stat-number"><em>97.2</em><sup>%</sup></span>` — `rich` kullan veya JSX'te statik.

### D.6 · `sections/EcosystemGrid.tsx` (server)

HTML ref: `1750-1824`. 8 `.eco-card` kart. Her kart:
- `.eco-label`, `.eco-name`, `.eco-copy`, `.eco-meta`
- `.status-badge.live` veya `.status-badge.wip` veya `.status-badge.open`

Kart data'sı: component içinde const array, anahtarlar i18n'den:

```ts
const cards = [
  { key: 'bereketfide', status: 'live' },
  { key: 'vistaseed', status: 'live' },
  { key: 'seraKontrol', status: 'live' },
  { key: 'ziraatHaber', status: 'wip' },
  { key: 'halFiyatlari', status: 'wip' },
  { key: 'verimTahmini', status: 'wip' },
  { key: 'hastalikUyari', status: 'wip' },
  { key: 'openPlatform', status: 'open' },
] as const;
```

### D.7 · `sections/FinalCta.tsx` (server)

HTML ref: `1827-1846`. `.mega-type` + `.final-cta-card` (2 sütun grid: başlık sol, CTA sağ).

### D.8 · `sections/SiteFooter.tsx` (server)

HTML ref: `1849-1921`. `.footer-card` + `.footer-grid` (5 sütun: brand + 4 link sütunu) + `.footer-bottom`.

### D.9 · Compose: `app/[locale]/page.tsx`

Mevcut basit dashboard'u REPLACE et. Sadece landing bölümlerini compose:

```tsx
import { AlertBar } from '@/components/sections/AlertBar';
import { SiteNav } from '@/components/sections/SiteNav';
// ... diğerleri
import { buildWeatherForecastJsonLd } from '@/lib/weather-jsonld';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const jsonLd = await buildWeatherForecastJsonLd();

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <AlertBar />
      <SiteNav locale={locale} />
      {/* FAZ 3'te eklenecek: HeroSection, Ticker, DashboardSection */}
      <PillarsSection />
      <ArchitectureSection />
      {/* FAZ 3: ApiWidgetSection */}
      <StatsStrip />
      <EcosystemGrid />
      <FinalCta />
      <SiteFooter />
    </>
  );
}
```

`generateMetadata` aynen kalır (title, description, OG). Eski `WeatherDashboard` bileşenini `app/[locale]/panel/page.tsx`'e taşı (yeni sayfa):

```tsx
// app/[locale]/panel/page.tsx
import { WeatherDashboard } from '@/components/WeatherDashboard';
export default function PanelPage() {
  return (
    <main className="container-wide container-section">
      <WeatherDashboard />
    </main>
  );
}
```

### D.10 · i18n anahtarları — `public/locales/tr.json` + `en.json`

[FAZ0-SONUC-BRIEF.md §4](FAZ0-SONUC-BRIEF.md#4-i18n-anahtar-iskeleti-publiclocalesjson) listesinden **statik bölümlere ait olanları** TR dolu, EN çevirili ekle:

- `alertBar.*`, `nav.*`, `pillars.*`, `architecture.*`, `stats.*`, `ecosystem.*`, `megaType.*`, `finalCta.*`, `footer.*`

**Hero (hero.*), ticker.*, dashboard.*, api.* FAZ 3'te** — şimdilik boş bırak, o faz Codex'in bir sonraki görevi.

**TR kaynak değerler:** Birebir [tarimiklim-premium.html](../tarimiklim-premium.html)'deki Türkçe metinleri kullan. `<em>...</em>` tag'lerini mesaj içinde TUT (next-intl `rich` işler).

**EN değerler:** Doğrudan çeviri. "Don riski" → "Frost risk", "dört faktörlü" → "four-factor" vb.

### D.11 · Commit dizisi

```
feat(frontend): AlertBar + SiteNav statik bölümleri
feat(frontend): Pillars + Architecture bölümleri + ikonlar
feat(frontend): StatsStrip + EcosystemGrid + FinalCta + Footer
feat(frontend): landing compose + /panel sayfasına dashboard taşıma
chore(frontend): statik bölümler i18n anahtarları (tr + en)
```

---

## E. Kabul Kriterleri

Görev bitince aşağıdakilerin **tamamı** geçmeli:

- [ ] `cd frontend && bun run lint` (yani `tsc --noEmit`) sıfır hata
- [ ] `cd frontend && bun run build` başarılı
- [ ] `cd frontend && bun run dev` → `/tr` açılıyor; bölümler mockup sırasıyla render
- [ ] `/tr/panel` açılıyor; eski dashboard burada
- [ ] `/widget/bereketfide?location=antalya` hâlâ çalışıyor (iframe regression testi)
- [ ] Her component dosyası ≤200 satır
- [ ] `grep -rn "#F1EBDD\|#1E3023\|#B8553A" frontend/src/components/sections/` **sıfır sonuç** (hard-code renk yok)
- [ ] `/tr` ve `/en` arasında switch yaptığında hiç Türkçe metin kaçağı yok (statik bölümlerde)

## F. Kapsam Dışı (YAPMA)

- Hero canlı weather card (FAZ 3)
- Ticker (FAZ 3)
- CityRiskGrid (FAZ 3)
- API kod bloğu (FAZ 3)
- Backend dokunuşu
- Yeni next.js route (panel hariç)
- Tailwind config değişikliği
- SEO/JSON-LD değişikliği (mevcut korunur)

## G. Takıldığın Yerler

- Class ismi `globals.css`'te yok → DUR, Claude'a sor (`docs/blocker-log.md` aç)
- i18n mesajında `<em>` nasıl işlenir → next-intl `t.rich` API docs; örnek yukarıda D.3'te
- "Yeni CSS class ekleyeyim mi" sorusu → önce globals.css'te `grep -i <benzerclass>`; yoksa küçük bir ek blok yaz ve commit mesajına yaz
