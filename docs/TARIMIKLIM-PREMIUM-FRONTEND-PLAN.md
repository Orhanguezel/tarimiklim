# TarımİKlim Premium Frontend — Uygulama Planı

**Hazırlayan:** Claude Code (Mimar/Stratejist)
**Tarih:** 2026-04-17
**Kaynak mockup:** [tarimiklim-premium.html](../tarimiklim-premium.html)
**Hedef dizin:** [frontend/](../frontend/)
**Durum:** Plan — uygulama başlamadı

---

## 0. Bağlam ve Kısıtlar

TarımİKlim, ekosistemin **Katman 4 (Veri & AI)** servisidir. Bereketfide, VistaSeed, Ziraat Haber, Sera SaaS ve Hal Fiyatları modülleri `/widget/*` ve `/api/v1/weather/*` üzerinden veri çeker. **Bu çalışma yeni bir ana sayfa (landing + canlı panel) ekler; mevcut servisleri bozmaz.**

### Değişmeyen (dokunulmaz)

- `frontend/src/app/widget/bereketfide/page.tsx` — Bereketfide sidebar widget, canlı
- `frontend/src/app/widget/vistaseed/page.tsx` — VistaSeed sidebar widget, canlı
- `frontend/src/app/widget/layout.tsx` — boş layout (iframe embed için şart)
- `frontend/src/components/widget/WeatherWidget.tsx` — ortak widget gövdesi
- `frontend/src/lib/api.ts` — backend API istemcisi
- Backend: hiç dokunulmayacak (bu sprint sadece frontend)

### Dönüşecek (yeniden yazılacak)

- `frontend/src/app/[locale]/page.tsx` — basit dashboard → premium landing + dashboard hibrid
- `frontend/src/app/[locale]/layout.tsx` — font yükleme ve tema tokens
- `frontend/src/styles/globals.css` — tamamen yeni tasarım sistemi tokens

### Yeni eklenecek

- Editoryal tasarım sistemi (Fraunces + Inter Tight + JetBrains Mono)
- Marka renk paleti (paper/pine/terra/wheat/moss)
- Bölüm başına 1 React server component + gerekli client island
- next-intl mesaj dosyaları (i18n): **mevcut yol** `frontend/public/locales/tr.json` ve `en.json` — dosyalar var, sadece yeni anahtarlar eklenecek ([request.ts](../frontend/src/i18n/request.ts) `public/locales/` okur)

---

## 1. Kaynak Mockup — Bölüm Envanteri

[tarimiklim-premium.html](../tarimiklim-premium.html) dosyası 1947 satır; aşağıdaki 11 bölümü içerir:

| # | Bölüm | HTML satır | Etkileşim | Veri kaynağı |
|---|-------|-----------|-----------|---------------|
| 1 | Alert Bar | 1271 | Statik · pulse animasyonu | Statik metin |
| 2 | Navigation | 1286 | Sticky · hover · mobil menü | Statik link |
| 3 | Hero (split) | 1307 | Canlı weather kartı | `GET /api/v1/weather/current` |
| 4 | Ticker strip | 1389 | Sonsuz kaydırma animasyonu | `GET /api/v1/weather/widget-data` (birden çok lokasyon) |
| 5 | Dashboard (city grid) | 1420 | Tab filtresi · risk heatmap | `GET /api/v1/weather/frost-risk` (aktif lokasyonlar) |
| 6 | Pillars (3 modül) | 1509 | Hover · icon | Statik |
| 7 | Architecture (5 katman) | 1566 | "Sen buradasın" vurgusu | Statik |
| 8 | API & Widget | 1645 | Copy button · kod örneği | Statik (ama doğru endpoint'ler) |
| 9 | Big stats strip | 1724 | Statik | Statik (sonra `/api/v1/analytics`) |
| 10 | Ecosystem grid | 1750 | Card hover · "canlı/yakında" rozeti | Statik |
| 11 | Mega type + Final CTA | 1827 | Statik | Statik |
| 12 | Footer (4 sütun + alt satır) | 1849 | Link grid | Statik |

**Tasarım tokenleri (HTML `:root`'dan):**

```css
--paper: #F1EBDD;  --paper-dim: #E8DFCB;  --paper-deep: #DDD1B6;
--ink: #141B14;    --ink-soft: #2B3527;
--pine: #1E3023;   --moss: #3B5A3C;       --sage: #7A8C6A;
--terra: #B8553A;  --terra-deep: #8E3F2C;
--wheat: #C69B3A;  --sky: #5D7A8C;        --danger: #C23B2C;
--display: "Fraunces", Georgia, serif;
--sans: "Inter Tight", -apple-system, sans-serif;
--mono: "JetBrains Mono", monospace;
```

---

## 2. Hedef Mimari

### Dosya yapısı (yeni)

```
frontend/src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx             [~] font + tema tokens
│   │   ├── page.tsx               [≠] landing (bölüm componentleri compose eder)
│   │   ├── panel/
│   │   │   └── page.tsx           [+] tam ekran canlı dashboard (hero'daki card'ın büyüğü)
│   │   ├── api-docs/
│   │   │   └── page.tsx           [+] /documentation redirect (Swagger)
│   │   └── (legal)/
│   │       ├── gizlilik/page.tsx  [+] KVKK
│   │       └── sartlar/page.tsx   [+] ToS
│   ├── widget/                    [=] dokunulmuyor
│   └── layout.tsx                 [=] root layout korunur
├── components/
│   ├── sections/                  [+] landing bölümleri — her biri ≤200 satır
│   │   ├── AlertBar.tsx
│   │   ├── SiteNav.tsx
│   │   ├── HeroSection.tsx
│   │   ├── HeroWeatherCard.tsx    (client island — canlı veri)
│   │   ├── Ticker.tsx             (client island — animasyon)
│   │   ├── DashboardSection.tsx
│   │   ├── CityRiskGrid.tsx       (client island — tab filtre)
│   │   ├── PillarsSection.tsx
│   │   ├── ArchitectureSection.tsx
│   │   ├── ApiWidgetSection.tsx
│   │   ├── CodeBlock.tsx          (client island — copy button)
│   │   ├── StatsStrip.tsx
│   │   ├── EcosystemGrid.tsx
│   │   ├── FinalCta.tsx
│   │   └── SiteFooter.tsx
│   ├── widget/                    [=] dokunulmuyor
│   ├── ForecastCard.tsx           [=] panel sayfasında yeniden kullanılacak
│   ├── HourlyForecastTable.tsx    [=] panel
│   ├── FrostAlertBanner.tsx       [=] panel
│   ├── LocationSelector.tsx       [=] panel
│   └── WeatherDashboard.tsx       [~] panel sayfasına taşınacak
├── lib/
│   ├── api.ts                     [=] var
│   ├── theme.ts                   [~] yeni tokenler
│   ├── weather-jsonld.ts          [=] var
│   └── fetchers/                  [+] SSR fetch'leri burada
│       ├── ticker-data.ts
│       └── city-risk.ts
├── i18n/                          [=]
└── styles/
    ├── globals.css                [≠] yeniden yazılacak
    └── design-tokens.css          [+] renk + tipografi tokens
```

`[=] korunur · [~] değişir · [≠] baştan yazılır · [+] yeni`

### Component kuralları

- Her bölüm `components/sections/` altında **tek dosya, ≤200 satır**
- Renk/font kullanımı **sadece CSS custom property** (hard-code yasak — CLAUDE.md)
- Statik metinler **`messages/tr.json`** altında (i18n zorunlu)
- Animasyonlar: Framer Motion ekleme yerine saf CSS (reduce-motion destekli)
- Client island sadece etkileşim gereken yerde: `HeroWeatherCard`, `Ticker`, `CityRiskGrid`, `CodeBlock`

### Veri akışı

```
SSR (landing):
  page.tsx
   ├─ HeroSection        ← async fetch /weather/current?location=konya
   ├─ Ticker             ← async fetch 8 şehir widget-data
   ├─ DashboardSection   ← async fetch /weather/frost-risk (aktif şehirler)
   └─ [diğer statik]

CSR (dashboard /panel):
  Mevcut WeatherDashboard (lib/api.ts fetch) — değişmez
```

### Performans hedefleri

- LCP ≤ 2.0s (4G)
- Lighthouse mobil ≥ 90 (perf, SEO, a11y, best-practices)
- `next/font` ile Fraunces + Inter Tight + JetBrains Mono self-host
- İlk SSR yanıtı cache'li (Next 16 `revalidate: 1800` — 30dk)

---

## 3. Ekip Rolleri ve Orkestrasyon

CLAUDE.md'deki 4-araçlı iş akışı bu planda aynen uygulanır:

| Araç | Rol | Bu projede ne yapar |
|------|-----|---------------------|
| **Claude Code** (mimar) | Plan, review, root-cause, agent yönetimi | Bu doküman, section API kontratları, code review, blocker çözümü |
| **Codex** (implementer) | Toplu kod yazma | Section component'leri, CSS tokens, i18n mesajları, fetcher util'leri |
| **Antigravity** (UI doğrulayıcı) | Tarayıcıda görsel kontrol | Pixel/layout karşılaştırma, responsive test, a11y denetimi |
| **Copilot** (autocomplete) | Boilerplate + tip önerisi | Tip tanımları, import'lar, JSX prop dolumu (editörde pasif) |

### Claude Code kendi alt ajanları

| Alt ajan | Ne zaman | Neden |
|----------|----------|-------|
| `general-purpose` | Geniş arama/research gerekince | Örn: next-intl v4 migration notları |
| `Explore` | Backend endpoint doğrulaması | Hangi alan adıyla geldiğini teyit et |
| `Plan` | Yeni bölümün implementasyon adımlarını parçalarken | Örn: `CityRiskGrid` tab filtresi state mimarisi |
| `general-purpose` (alt ajan) | TS hata avı + typecheck sonuç okuması | Ana context'i şişirmeden |

### Eşzamanlılık kuralı

- **Aynı dosyaya aynı anda Codex + Antigravity YAZMAZ**
- Codex bir bölüm yazdıktan sonra Antigravity o bölümü aynı branch'te doğrular (oku-only)
- Blocker bulunursa Claude Code tasarlar, Codex uygular
- Her 3 bölümde bir `tsc --noEmit` ve manuel smoke test (Claude Code tetikler)

---

## 4. Görev Çeklisti (aşamalı)

### ■ FAZ 0 — Hazırlık (Claude Code) — TAMAMLANDI 2026-04-17

- [x] **[Claude]** `docs/TARIMIKLIM-PREMIUM-FRONTEND-PLAN.md` (bu dosya) oluştur
- [x] **[Claude]** Mevcut `frontend/src/` yedek branch'i aç: `git checkout -b feature/premium-landing`
- [x] **[Claude]** Backend endpoint envanteri çıkar → [FAZ0-SONUC-BRIEF.md §2](FAZ0-SONUC-BRIEF.md#2-backend-endpoint-envanteri-frontend-tüketici-haritası)
- [x] **[Claude]** next-intl mesaj iskeletini tanımla (mevcut `public/locales/*.json` üzerine eklenecek anahtar listesi) → [FAZ0-SONUC-BRIEF.md §4](FAZ0-SONUC-BRIEF.md#4-i18n-anahtar-iskeleti-publiclocalesjson)
- [x] **[Claude]** `lib/api.ts` mevcut tiplerini oku — eksikler → [FAZ0-SONUC-BRIEF.md §3](FAZ0-SONUC-BRIEF.md#3-api-tip-envanteri-ve-öneriler) (`types/weather.ts` önerisi hazır)

### ■ FAZ 1 — Tasarım Sistemi — BÜYÜK ÖLÇÜDE YAPILMIŞ (önceki sprint)

- [x] **[Codex/önceki]** `src/styles/design-tokens.css` — tüm token'lar mevcut
- [x] **[Codex/önceki]** `src/styles/globals.css` — 1143 satır premium stil sınıfları hazır (alert-bar, site-nav, hero-grid, pillars-grid, layers-grid, api-grid, stats-grid, ecosystem-grid, mega-type, final-cta-card, site-footer, responsive breakpoint'ler, prefers-reduced-motion)
- [x] **[Codex/önceki]** `src/lib/theme.ts` — `premiumThemeVars` + `fetchThemeConfig` hazır
- [x] **[Codex/önceki]** `src/app/[locale]/layout.tsx` — Fraunces + Inter Tight + JetBrains Mono `next/font` ile yüklü, `hava-app-shell` class'ı aktif
- [ ] **[Codex/bekliyor]** `src/types/weather.ts` oluştur → [CODEX-BRIEF-STEP1.md §C.1](CODEX-BRIEF-STEP1.md)
- [ ] **[Codex/bekliyor]** `lib/api.ts` fonksiyonlarına return type ekle → [§C.2](CODEX-BRIEF-STEP1.md)
- [ ] **[Codex/bekliyor]** `WeatherWidget.tsx` yerel `WidgetData` tipini shared type ile değiştir → [§C.3](CODEX-BRIEF-STEP1.md)
- [ ] **[Codex]** `public/brand/` altına logo-mark SVG, favicon, og-image ekle (FAZ 2 içinde)
- [ ] **[Antigravity]** FAZ 2 bittikten sonra görsel doğrulama
- [ ] **[Claude]** Tip temizliği sonrası lint/build doğrulama

### ■ FAZ 2 — Statik Bölümler — TAMAMLANDI

Tüm bölümler önceki sprint tarafından yazılmış, Claude devraldı ve bitirdi.

- [x] `sections/AlertBar.tsx`
- [x] `sections/SiteNav.tsx` + `SiteNavMobile.tsx` — locale-aware, `/don-uyarisi`'ye link
- [x] `sections/PillarsSection.tsx`
- [x] ~~`ArchitectureSection.tsx`~~ — kullanıcı talebiyle kaldırıldı 2026-04-17
- [x] `sections/StatsStrip.tsx`
- [x] `sections/EcosystemGrid.tsx`
- [x] `sections/FinalCta.tsx`
- [x] `sections/SiteFooter.tsx`

### ■ FAZ 3 — Etkileşimli Bölümler — TAMAMLANDI

Codex token'ı bittiğinde Claude Code roller üstlendi.

- [x] **[Claude]** `HeroLiveCard.tsx` — async server component, weather/current + frost-risk paralel fetch, fallback i18n
- [x] **[Claude]** `sections/HeroSection.tsx` — Suspense + HeroCardSkeleton fallback
- [x] **[Claude]** `sections/Ticker.tsx` — statik metrik (canlılaştırma gerekmez, vitrin metin)
- [x] **[Claude]** `sections/DashboardSection.tsx` → `DashboardController.tsx` (canlı 8 şehir frost-risk + current)
- [x] **[Claude]** `sections/ApiWidgetSection.tsx` — CodeCopyButton entegrasyonu
- [x] **[Claude]** `sections/CodeCopyButton.tsx` (client) — clipboard API, 1.5s feedback
- [ ] **[Antigravity]** Offline/500 fallback manual kontrol (deploy sonrası)

### ■ FAZ 4 — Compose + Panel sayfası — TAMAMLANDI

- [x] **[Claude+önceki]** `app/[locale]/page.tsx` — tüm section'ları compose
- [x] **[Claude]** `app/[locale]/don-uyarisi/page.tsx` — WeatherDashboard burada
- [x] **[Claude]** SiteNav "Panel" linki `/{locale}/don-uyarisi`'ye
- [x] **[Claude+önceki]** `public/locales/tr.json` + `en.json` — `premium.*` namespace tam (140+ anahtar)
- [ ] **[Sonra]** Footer `gizlilik` + `sartlar` alt sayfaları (şimdilik anchor `#`)
- [ ] **[Antigravity]** Full sayfa scroll testi (deploy sonrası)

### ■ FAZ 5 — SEO, Performans, A11y — TAMAMLANDI

- [x] **[Claude]** `app/robots.ts` — static robots.txt
- [x] **[Claude]** `app/sitemap.ts` — TR+EN landing + don-uyarisi + widget
- [x] **[Claude]** `app/llms.txt/route.ts` — AI crawler için 70+ satır yapılandırılmış özet
- [x] **[Claude]** `lib/site-jsonld.ts` — Organization + WebSite + Service şemaları
- [x] **[Claude]** `lib/weather-jsonld.ts` (mevcut) — WeatherForecast şeması
- [x] **[Claude]** `page.tsx` → site JSON-LD + weather JSON-LD paralel render
- [x] **[Claude]** layout metadata → OpenGraph image + Twitter card + favicon
- [ ] **[Claude]** `geo-audit` skill deploy sonrası
- [ ] **[Claude]** Lighthouse mobil skor ≥ 90 (deploy sonrası)
- [ ] **[Sonra]** `opengraph-image.tsx` dinamik OG (opsiyonel, SVG statik şimdilik yeterli)

### ■ FAZ 6 — Regresyon ve Yayınlama (Claude denetim)

- [ ] **[Claude]** **Kritik:** `/widget/bereketfide` ve `/widget/vistaseed` hâlâ çalışıyor mu (iframe test)
- [ ] **[Claude]** Backend `/api/v1/weather/*` endpoint'lerinde regresyon yok (frontend'e dokunduk sadece)
- [ ] **[Claude]** `bun run build` hata vermiyor
- [ ] **[Claude]** VPS deploy rehearsal — staging path: `/var/www/tarimiklim-staging/`
- [ ] **[Claude]** Preview URL'de son Antigravity taraması
- [ ] **[Claude]** Ana branch'e merge, `pm2 restart tarimiklim-frontend`
- [ ] **[Claude]** Canlı doğrulama: tarimiklim.com ana sayfa + /panel + /widget/* + API health

---

## 5. API Kontratları (frontend → backend)

Bu sprint backend'e dokunmaz — mevcut endpoint'ler kullanılır:

| Bölüm | Endpoint | Method | Cache |
|-------|----------|--------|-------|
| HeroWeatherCard | `/api/v1/weather/current?location=konya-cumra` | GET | 5dk client |
| Ticker | `/api/v1/weather/widget-data?location=<slug>` × 8 | GET | 30dk SSR |
| CityRiskGrid | `/api/v1/weather/frost-risk?location=<slug>` × aktif | GET | 10dk SSR |
| StatsStrip (faz 7) | `/api/v1/analytics/summary` | GET | 1sa SSR — **şimdilik statik** |

Eksik endpoint tespit edilirse **backend sprint** açılır — bu sprintte değil.

---

## 6. i18n Anahtar İskeleti (public/locales/tr.json · en.json)

```
home.alertBar.status          = "Sistem aktif · don uyarısı canlı"
home.alertBar.metrics         = "97% doğruluk · 48ms yanıt · 81 il"
home.nav.panel                = "Canlı Panel"
home.nav.modules              = "Modüller"
home.nav.api                  = "API"
home.nav.ecosystem            = "Ekosistem"
home.nav.cta                  = "API anahtarı al"
home.hero.eyebrow             = "Katman 4 · Veri & AI"
home.hero.title.line1         = "Toprak veriyle"
home.hero.title.line2         = "konuşur."
home.hero.subtitle            = "..."
home.hero.ctaPrimary          = "Panele git"
home.hero.ctaSecondary        = "API'yi dene"
home.hero.stats.queries       = "Tahmin sorgusu"
home.hero.stats.accuracy      = "Don tahmin doğruluğu"
home.hero.stats.latency       = "Medyan yanıt süresi"
home.pillars.title            = "Üç servis. Bir altyapı."
home.pillars.frost.title      = "Don riski, dört faktörlü."
home.pillars.forecast.title   = "7 gün hava, saat çözünürlükte."
home.pillars.irrigation.title = "Sulama planı, evapotranspirasyonla."
home.architecture.title       = "Ekosistemin dördüncü katmanı."
home.architecture.layer4.you  = "SEN BURADASIN"
home.api.title                = "Üç satırda ilk tahmininizi çekin."
home.ecosystem.title          = "TarımİKlim'i kim kullanıyor?"
home.finalCta.title           = "Panel bir dakikada."
footer.tag                    = "Çiftçinin gecesini bilen, sabahına hazırlayan servis."
footer.col.product            = "Ürün"
footer.col.developer          = "Geliştirici"
footer.col.ecosystem          = "Ekosistem"
footer.col.company            = "Şirket"
```

Tam liste (140+ anahtar) Faz 4'te doldurulacak.

---

## 7. Kabul Kriterleri (her faz sonunda)

- `tsc --noEmit` sıfır hata
- `bun run build` başarılı, bundle `app/[locale]` altı ≤ 180 KB JS (gzip)
- Lighthouse mobil: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95
- Mockup ile görsel fark: Antigravity raporunda bölüm başına ≤ 3 küçük sapma
- Mevcut widget'lar regresyonsuz (manuel iframe testi)
- `/tr` ve `/en` arasında kaçak string yok
- Hiçbir dosya 200 satırı aşmıyor (CLAUDE.md kuralı)
- Hard-code renk/metin yok (CLAUDE.md kuralı)

---

## 8. Risk ve Önlem

| Risk | Olasılık | Önlem |
|------|----------|-------|
| Widget rotaları değişiklikten etkilenir | Düşük | Widget dosyalarına dokunulmaz; ayrı layout | 
| next-intl v4 breaking change | Orta | Faz 0'da kontrol, gerekirse `lib/i18n-shim.ts` |
| Fraunces + Inter Tight + Mono = 3 font = CLS | Orta | `next/font` self-host + `display: swap` + subset |
| Ticker animasyonu mobilde FPS düşer | Düşük | `prefers-reduced-motion` + CSS `will-change` |
| HeroWeatherCard backend timeout'ta boş gösterir | Orta | SSR cache + client'ta stale-while-revalidate fallback |
| Ecosystem bölümü gerçekleşmemiş projeleri "canlı" gösterir | Düşük | Rozet sadece `project.portfolio.json` `status: live` olanlar için |

---

## 9. Sonraki Adım

Claude Code **FAZ 0** maddelerini başlatır: branch açar, endpoint envanterini çıkarır, i18n iskeletini yazar. FAZ 1 için Codex'e brief geçer (`AGENTS.md` + bu planın 1-2 no'lu bölümleri).

Her faz sonunda bu dosyadaki checkbox'lar güncellenir — çalışan görev sayaç.
