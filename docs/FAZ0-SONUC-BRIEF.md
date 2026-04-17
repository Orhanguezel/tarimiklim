# FAZ 0 Sonuç ve Codex Briefi

**Çalışma branch'i:** `feature/premium-landing`
**Tarih:** 2026-04-17
**Hazırlayan:** Claude Code

Bu doküman [TARIMIKLIM-PREMIUM-FRONTEND-PLAN.md](TARIMIKLIM-PREMIUM-FRONTEND-PLAN.md) FAZ 0 çıktılarını içerir ve FAZ 1'e başlayacak Codex için hazır brief'tir.

---

## 1. Mevcut Frontend Durumu

### Çalışan
- Next.js 16 · next-intl v4 · Tailwind v4 · React 19
- `/tr` ve `/en` rotaları aktif ([src/i18n/routing.ts](../frontend/src/i18n/routing.ts))
- `/widget/bereketfide`, `/widget/vistaseed` canlıda — **dokunulmayacak**
- Mevcut dashboard bileşenleri: `WeatherDashboard`, `ForecastCard`, `HourlyForecastTable`, `FrostAlertBanner`, `LocationSelector`

### Plandan farklı gerçekler
- **i18n dosya yolu:** `frontend/public/locales/tr.json` ve `en.json` — plan `messages/` demişti, yanlış. `i18n/request.ts` `public/locales/` kullanıyor. Plan güncellenecek.
- **Paket scope:** `@agro/shared-config`, `@agro/shared-types` (CLAUDE.md'de `@eco/*` örneği var; bu projede `@agro/*`). Codex'e hatırlatma.
- **API istemcisi:** axios (`lib/api.ts`); `withCredentials: true` → CORS için bilinçli seçim.

---

## 2. Backend Endpoint Envanteri (Frontend Tüketici Haritası)

Backend: `tarimiklim.com/api/v1` · Lokal: `http://localhost:8088/api/v1`

| Endpoint | Method | Query | Dönüş (özet) | Landing bölümü |
|----------|--------|-------|--------------|----------------|
| `/weather` | GET | `lat, lon, days(1-7)` | `{ location, forecasts[] }` | — |
| `/weather/current` | GET | `lat, lon` | `{ temp, feelsLike, humidity, windSpeed, condition, icon }` | **HeroWeatherCard** |
| `/weather/hourly` | GET | `lat, lon, slots(4-40)` | `{ hourly: HourlySlot[], fromCache? }` | `/panel` sayfası |
| `/weather/frost-risk` | GET | `location` VEYA `lat+lon` | `{ location, frostRisk, forecasts[] }` | **CityRiskGrid** |
| `/weather/rain-forecast` | GET | `location` VEYA `lat+lon`, `days(1-7, def 3)` | `{ location, rainForecast[] }` | Ekosistem API section statik örneği |
| `/weather/widget-data` | GET | `location` (slug) | `{ location, current, forecast[3] }` | **Ticker**, Widget rotaları |
| `/locations` | GET | `active, limit` | `Location[]` | CityRiskGrid filtre kaynağı |
| `/locations/:slug` | GET | — | `Location` | — |

### Seeded lokasyon slug'ları (8 şehir)
`antalya · izmir · ankara · istanbul · bursa · adana · konya · samsun`
Dosya: [200_weather_locations_seed.sql](../backend/src/db/seed/sql/200_weather_locations_seed.sql:1)

### Eksik endpoint'ler (bu sprintte yok, planda statik gösterilecek)
- `/analytics/summary` — StatsStrip için (şimdilik sabit sayılar)
- `/alerts/subscribe` — Final CTA için (şimdilik mock modal)

---

## 3. API Tip Envanteri ve Öneriler

### Var olan tipler — [frontend/src/lib/api.ts](../frontend/src/lib/api.ts:21)
```ts
export type HourlySlot = {
  dt: number; timeRangeLabel: string; weekdayShort: string;
  temp: number; feelsLike: number; humidity: number;
  windSpeedKmh: number; windDeg: number; windDir: string;
  precipitationMm: number; precipitationLabel: string;
  condition: string; icon: string; cloudCover: number;
  frostScore: number; frostLabel: string; frostShort: string;
  sprayOk: boolean;
  tempStress: 'none' | 'heat' | 'cold'; tempStressLabel: string;
};
```

### Eksik — Codex oluşturacak ([frontend/src/types/weather.ts](../frontend/src/types/weather.ts))

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
  windSpeed: number;      // m/s (widget'ta öyle gösteriliyor)
  condition: string;
  icon: string;
}

export interface ForecastDay {
  date: string;           // YYYY-MM-DD
  forecastDate?: string;  // backend alternatif alan
  tempMin: number;
  tempMax: number;
  humidity?: number;
  windSpeed?: number;
  precipitation?: number;
  condition: string;
  icon?: string;
  frostRisk: number;      // 0-100
}

export interface WidgetDataResponse {
  location: WeatherLocation;
  current: CurrentWeather;
  forecast: ForecastDay[];
}

export interface FrostRiskResponse {
  location: WeatherLocation;
  frostRisk: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
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

export type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };
```

**Kural:** `lib/api.ts` içindeki fonksiyonlar bu tiplerle güçlendirilecek. `WeatherWidget.tsx`'teki yerel `WidgetData` tanımı silinip `WidgetDataResponse` import edilecek (kod tekrarı kuralı — CLAUDE.md).

---

## 4. i18n Anahtar İskeleti (public/locales/*.json)

**Mevcut ağaç** — [tr.json](../frontend/public/locales/tr.json):
```
meta.{title,description}
home.{title,description,preview.*,dashboard.*,hourly.*}
weather.{forecast,current,frostRisk,rain,humidity,wind,uvIndex,temp,tempMin,tempMax,frostAlert}
```

**Yeni eklenecek ağaç** (Codex FAZ 2+3 boyunca dolduracak):

```
alertBar.status
alertBar.metric.accuracy
alertBar.metric.latency
alertBar.metric.coverage

nav.panel
nav.modules
nav.api
nav.ecosystem
nav.cta

hero.eyebrow
hero.title.lead
hero.title.accent
hero.title.tail
hero.subtitle
hero.ctaPrimary
hero.ctaSecondary
hero.stats.queries.num
hero.stats.queries.label
hero.stats.accuracy.num
hero.stats.accuracy.label
hero.stats.latency.num
hero.stats.latency.label
hero.card.loc
hero.card.locSub
hero.card.live
hero.card.cond
hero.card.humidity
hero.card.wind
hero.card.tempMin
hero.badge.label
hero.badge.title
hero.badge.desc

ticker.a11yLabel

dashboard.sectionLabel
dashboard.title
dashboard.lead
dashboard.tab.all
dashboard.tab.critical
dashboard.tab.alert
dashboard.tab.warn
dashboard.tab.ok
dashboard.risk.acil
dashboard.risk.yuksek
dashboard.risk.orta
dashboard.risk.dusuk

pillars.sectionLabel
pillars.title.lead
pillars.title.accent
pillars.lead
pillars.frost.num
pillars.frost.title
pillars.frost.desc
pillars.frost.feat.interval
pillars.frost.feat.window
pillars.frost.feat.channels
pillars.frost.feat.accuracy
pillars.forecast.num
pillars.forecast.title
pillars.forecast.desc
pillars.forecast.feat.sources
pillars.forecast.feat.resolution
pillars.forecast.feat.refresh
pillars.forecast.feat.params
pillars.irrigation.num
pillars.irrigation.title
pillars.irrigation.desc
pillars.irrigation.feat.methods
pillars.irrigation.feat.templates
pillars.irrigation.feat.savings
pillars.irrigation.feat.integration

architecture.sectionLabel
architecture.title.lead
architecture.title.accent
architecture.lead
architecture.layer1.title
architecture.layer1.desc
architecture.layer2.title
architecture.layer2.desc
architecture.layer3.title
architecture.layer3.desc
architecture.layer4.title
architecture.layer4.desc
architecture.layer4.you
architecture.layer5.title
architecture.layer5.desc

api.sectionLabel
api.title.lead
api.title.accent
api.lead
api.terminal.filename
api.copy.idle
api.copy.done
api.right.title
api.right.desc
api.endpoints.forecast
api.endpoints.frost
api.endpoints.irrigation
api.endpoints.subscribe
api.endpoints.stations
api.endpoints.widget

stats.activeCities.label
stats.activeCities.desc
stats.accuracy.label
stats.accuracy.desc
stats.latency.label
stats.latency.desc
stats.savings.label
stats.savings.desc

ecosystem.sectionLabel
ecosystem.title.lead
ecosystem.title.accent
ecosystem.lead
ecosystem.cards.bereketfide.{label,name,desc,meta}
ecosystem.cards.vistaseed.{label,name,desc,meta}
ecosystem.cards.seraKontrol.{label,name,desc,meta}
ecosystem.cards.ziraatHaber.{label,name,desc,meta}
ecosystem.cards.halFiyatlari.{label,name,desc,meta}
ecosystem.cards.verimTahmini.{label,name,desc,meta}
ecosystem.cards.hastalikUyari.{label,name,desc,meta}
ecosystem.cards.openPlatform.{label,name,desc,meta}
ecosystem.badge.live
ecosystem.badge.wip

megaType.lead
megaType.accent

finalCta.title.lead
finalCta.title.accent
finalCta.desc
finalCta.btnPrimary
finalCta.btnSecondary

footer.brand.tagLead
footer.brand.tagAccent
footer.brand.desc
footer.brand.company
footer.brand.location
footer.col.product.title
footer.col.product.items.panel
footer.col.product.items.frost
footer.col.product.items.irrigation
footer.col.product.items.forecast
footer.col.product.items.alerts
footer.col.product.items.widgets
footer.col.developer.title
footer.col.developer.items.api
footer.col.developer.items.sdk
footer.col.developer.items.widget
footer.col.developer.items.webhooks
footer.col.developer.items.status
footer.col.developer.items.changelog
footer.col.ecosystem.title
footer.col.ecosystem.items.{bereketfide,vistaseed,seraKontrol,ziraatHaber,halFiyatlari,verimTahmini}
footer.col.company.title
footer.col.company.items.about
footer.col.company.items.blog
footer.col.company.items.career
footer.col.company.items.press
footer.col.company.items.privacy
footer.col.company.items.kvkk
footer.bottom.copyright
footer.bottom.links.privacy
footer.bottom.links.terms
footer.bottom.links.cookies
footer.bottom.links.security
```

**Toplam:** ~160 anahtar. Türkçe değerler mockup'tan birebir, İngilizce değerler Codex tarafından çevrilecek.

---

## 5. Codex için FAZ 1 Brief

### Görev
[TARIMIKLIM-PREMIUM-FRONTEND-PLAN.md](TARIMIKLIM-PREMIUM-FRONTEND-PLAN.md) FAZ 1 — Tasarım Sistemi altındaki 6 madde.

### Referans dosyalar
- Mockup: [tarimiklim-premium.html](../tarimiklim-premium.html)
- Design tokens: Plan dosyası bölüm 1 sonu (CSS `:root` listesi)
- Bu brief: [FAZ0-SONUC-BRIEF.md](FAZ0-SONUC-BRIEF.md)
- Kurallar: [../../CLAUDE.md](../../CLAUDE.md) (ekosistem) + [../CLAUDE.md](../CLAUDE.md) (proje)

### Yapılacak
1. **[frontend/src/styles/design-tokens.css](../frontend/src/styles/design-tokens.css)** — Tüm renk + tipografi CSS custom property'leri (HTML `:root`'tan birebir).
2. **[frontend/src/styles/globals.css](../frontend/src/styles/globals.css)** — Yeniden yazım:
   - `@import './design-tokens.css';`
   - Paper background + `body::before` / `body::after` grain layer'ları
   - Base typography reset (Fraunces + Inter Tight + Mono)
   - `html { scroll-behavior: smooth; }`
   - `prefers-reduced-motion` respect
   - Eski global class'lar siliniyor (projeye özel dashboard CSS'i varsa koru)
3. **[frontend/src/lib/theme.ts](../frontend/src/lib/theme.ts)** — Renk token export'u + Tailwind extend köprüsü.
4. **[frontend/src/app/[locale]/layout.tsx](../frontend/src/app/[locale]/layout.tsx)** — `next/font`'tan self-host:
   - Fraunces (300,400,500; italic) → `--font-display`
   - Inter Tight (300,400,500,600,700) → `--font-sans`
   - JetBrains Mono (400,500,600) → `--font-mono`
   - `<html lang={locale} data-brand="tarimiklim">` root
5. **[frontend/src/types/weather.ts](../frontend/src/types/weather.ts)** — Bu dokümanın bölüm 3'teki tiplerin tamamını export et.
6. **[frontend/src/lib/api.ts](../frontend/src/lib/api.ts)** — Fonksiyonlara return tipi ekle:
   - `fetchCurrentWeather` → `Promise<CurrentWeather>`
   - `fetchFrostRisk` → `Promise<FrostRiskResponse>`
   - `fetchWidgetData` → `Promise<WidgetDataResponse>`
   - `fetchWeather` → `Promise<ForecastResponse>`
   - `fetchLocations` → `Promise<WeatherLocation[]>`
7. **[frontend/src/components/widget/WeatherWidget.tsx](../frontend/src/components/widget/WeatherWidget.tsx)** — Yerel `WidgetData` interface'ini sil, `WidgetDataResponse`'u import et. Widget davranışını bozma.
8. **[frontend/public/brand/](../frontend/public/brand/)** — logo-mark.svg (HTML'deki `.logo-mark` pseudo element'lerinden SVG), favicon.ico, og-image.png (1200x630) ekle.

### Kısıtlar (önemli)
- **Hard-code yasak.** Renk/font/metin CSS custom property veya i18n'den.
- **Dosya 200 satırı geçmez.** `globals.css` uzun olacak — `design-tokens.css` + `globals.css` + `prose.css` gibi parçala.
- **`@agro/shared-config` zaten tsconfig path'inde** — gereksiz local token duplike etme; önce paylaşılan tokenleri oku, yoksa lokal ekle.
- **Test:** `bun run lint` (yani `tsc --noEmit`) sıfır hata; `bun run build` başarılı.
- **Regresyon:** `/widget/bereketfide` ve `/widget/vistaseed` sayfaları önceki gibi render etmeli.

### Commit kuralı
Her FAZ 1 adımı ayrı commit:
- `feat(frontend): premium tasarım tokenleri + font yüklemesi`
- `feat(frontend): paylaşılan weather tiplerini ekle`
- `refactor(frontend): widget lokal tipini shared-type ile değiştir`

### Teslim kriteri
- [ ] `tsc --noEmit` sıfır hata
- [ ] `bun run build` başarılı
- [ ] `/tr` sayfası yeni paper background ile yükleniyor
- [ ] Network tab'de 3 font self-host olarak yüklenmiş (no CDN)
- [ ] `/widget/bereketfide?location=antalya` hâlâ çalışıyor (manuel iframe testi)

---

## 6. Antigravity için Doğrulama Brief

FAZ 1 tamamlanınca Antigravity çalıştırılacak:

- URL: `http://localhost:3088/tr`
- Karşılaştırma hedefi: [tarimiklim-premium.html](../tarimiklim-premium.html) (yerel dosya, file://)
- Kontrol listesi:
  - [ ] Paper rengi (`#F1EBDD`) eşleşiyor
  - [ ] Font yükleme sonrası CLS yok
  - [ ] Grain overlay görünür ama metni bozmuyor
  - [ ] 360px / 768px / 1440px viewport'larda düzen kırılmıyor
  - [ ] Lighthouse: a11y ≥ 95 (henüz içerik yok ama temel doğru olmalı)
- Blocker bulunca [blocker-log.md](blocker-log.md) dosyasına yaz, Claude'u etiketle.

---

## 7. Sonraki Adım

Claude Code:
1. Plan dosyasında i18n path düzeltmesi yap (messages → public/locales)
2. Bu brief'i Codex'e ver
3. FAZ 1 bittikten sonra kod review + regresyon testi
