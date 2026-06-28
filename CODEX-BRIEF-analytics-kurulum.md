# CODEX BRIEF — Tarım İklim (tarimiklim.com) Analytics Tag Kurulumu

> Hedef: GA4'teki **"Web sitenizde veri toplama etkin değil"** + Tag Assistant'ta **GTM-KWL249BT "bulunamadı"** sorunlarını gidermek.
> Kapsam: `projects/tarimiklim/frontend`. Analiz (2026-06-27, Claude kodla doğruladı): frontend'de **hiç GA4/GTM tag'i render edilmiyor** → site hiç veri yollamıyor (GA4 verisi 0).

## Durum (doğrulandı)
- **GA4** property 543365465, measurement **G-K9SZKB9897** (account 'GZL Teknoloji', stream 15161430398).
- **GTM** container **GTM-KWL249BT** (account 6363148720 / container 256737860) okunuyor AMA **0 tag (boş)** + sitede yüklü değil (Tag Assistant "bulunamadı").
- **GSC** sc-domain:tarimiklim.com — orhanguzell siteOwner ✓.
- Backend: shared-backend siteSettings hazır (`getGtmContainerId()` / `getGa4MeasurementId()` — `packages/shared-backend/modules/siteSettings/service.ts`). Frontend SSR'de `fetchSetting(key, locale)` ile okunur.
- ekosistem-sosyal panelinde tarimiklim tenant'ı tanımlı (GA4/GSC/GTM bağlı) — sadece **site tag'i eksik**.

## Karar: gtag (GA4) DOĞRUDAN render et (GTM değil — şimdilik)
GTM container **boş** ve içine GA4 tag eklemek **write-scope OAuth consent** ister (henüz yok). Bu yüzden en hızlı doğru çözüm: **GA4'ü gtag ile doğrudan** yüklemek → veri hemen akar. (GTM'e geçiş ileride, container'a GA4 tag eklenip write token alınınca.)

## TEK İŞ — Frontend: GA4 gtag render
**Dosya:** `projects/tarimiklim/frontend/src/app/[locale]/layout.tsx` (RootLayout — `fetchSetting` + `Promise.all` pattern'i zaten var, satır ~26/69).

**Yöntem:** `@next/third-parties` (Next 16 uyumlu, kurulu değil → kur):
```bash
cd projects/tarimiklim/frontend && bun add @next/third-parties
```

Adımlar:
1. SSR'de ID'leri çek (mevcut `fetchSetting` ile):
   ```ts
   const gtmRow = await fetchSetting('gtm_container_id', locale, { revalidate: 3600 });
   const ga4Row = await fetchSetting('ga4_measurement_id', locale, { revalidate: 3600 });
   const gtmId = typeof gtmRow?.value === 'string' ? gtmRow.value.trim() : '';
   const ga4Id = typeof ga4Row?.value === 'string' ? ga4Row.value.trim() : '';
   ```
2. `<body>` içinde, `{children}` öncesinde koşullu render (ÇİFT SAYIM YASAK):
   ```tsx
   import { GoogleTagManager, GoogleAnalytics } from '@next/third-parties/google';
   // GTM container DOLU olduğunda GTM tercih; şu an boş → GA4 gtag aktif yol.
   {gtmId ? <GoogleTagManager gtmId={gtmId} /> : ga4Id ? <GoogleAnalytics gaId={ga4Id} /> : null}
   ```
   - ⚠️ ID'ler kodda SABİT olmasın — site_settings'ten gelsin.
   - GTM + ayrı gtag aynı anda render ETME.

## site_settings (tarimiklim DB) — DEĞERLER YAZILMALI
tarimiklim backend DB'sinde site_settings'e (locale='*' global) eklenmeli:
- `ga4_measurement_id = G-K9SZKB9897`
- `gtm_container_id = GTM-KWL249BT` (GTM'e geçilince kullanılır; şimdilik boş bırakılabilir ki gtag yolu aktif olsun — VEYA değeri yaz ama GTM container'a GA4 tag eklenene kadar gtmId'yi render etme. Net karar: **şimdilik gtm_container_id'yi BOŞ tut → gtag aktif olsun.**)
- Admin panel > Site Ayarları > Analytics alanlarından ya da seed.

## Doğrulama (teslim öncesi)
1. `cd projects/tarimiklim/frontend && bun run build` + type-check temiz.
2. `@next/third-parties` package.json'da.
3. ID'ler site_settings'ten (hardcode yok).
4. (Deploy sonrası, Claude) GA4 DebugView/Realtime: `page_view` **tek hit**; "veri toplama etkin değil" uyarısı kalkar; ekosistem panelinde tarimiklim GA4 verisi akar.

## Sonraki (opsiyonel, ileride) — GTM'e geçiş
- GTM-KWL249BT container'ı boş. GTM'e geçilecekse: (a) write-scope GTM token (OAuth consent: tagmanager.edit.containers + publish), (b) container'a GA4 "Google Tag" (G-K9SZKB9897, All Pages) eklenir (ekosistem `gtm-ga4-setup.ts` kalıbı), (c) site_settings.gtm_container_id doldurulur → layout GTM'i render eder, gtag kaldırılır (çift sayım olmasın).

## Deploy
- Codex: kod + build/type-check yeşil, branch'e push, deploy ETME.
- Claude: diff review + tarimiklim deploy (`projects/tarimiklim/deploy/`) + canlı GA4 doğrulama.
