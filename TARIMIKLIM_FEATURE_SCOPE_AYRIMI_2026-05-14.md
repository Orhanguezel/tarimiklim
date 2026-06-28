# Tarimiklim Feature Scope Ayrimi

Tarih: 2026-05-14

Hedef: `projects/tarimiklim` icindeki buyuk degisiklikleri tek parca commit
haline getirmeden, local/canli klasor standardini bozmadan ayirmak.

## Genel Durum

- Branch: `main`
- Staged alan: bos
- Build kontrolleri daha once gecti:
  - `backend`: `bun run build`
  - `frontend`: `bun run build`
  - `admin_panel`: `bun run build`
- Canli path standardi kontrol edildi:
  `/var/www/tarim-dijital-ekosistem/projects/tarimiklim`
- `/uploads` standardi korunacak; nginx alias
  `projects/tarimiklim/backend/uploads` uzerinden devam edecek.

## Scope 0 — Yapi, Deploy ve Temizlik

Once ayri kapatilacak dusuk riskli kapsam:

- `CLAUDE.md`
- `README.md`
- `AGENTS.md`
- `ALERT-SYSTEM-PLAN.md`
- `FRONTEND-DINAMIKLESTIRME-CHECKLIST.md`
- `WIDGET-BRAND-STRATEGY.md`
- `docs/DEPLOY-PREMIUM.md`
- `docs/MONETIZATION-STRATEGY.md`
- `docs/PROJE-DEVIR-NOTU.md`
- `docs/TARIMIKLIM-PREMIUM-FRONTEND-PLAN.md`
- `deploy/nginx-tarimiklim.conf`
- `deploy/server-package.json`
- `admin_panel/ecosystem.config.cjs`
- `frontend/next.config.ts`
- `backend/.env.example`
- `frontend/.env.example`
- `mobile/app/README.md`
- `mobile/app/src/lib/api.ts`
- `mobile/app/src/lib/storage.ts`
- `admin_panel/bun.lock` silinmesi
- `frontend/next-env.d.sync-conflict-20260405-111542-6E32S2R.ts` silinmesi
- `docs/esim-icin-kurulum-todo.md` -> root `esim-icin-kurulum-todo.md`
- `docs/sirket-kurulum-plani.md` -> root `sirket-kurulum-plani.md`

Kontrol:

- [x] Eski path izi olmayacak: `/var/www/releases`, `/var/www/current`,
  `/var/www/data`, `/root/tarimiklim`.
- [x] Deploy dosyalari canli monorepo path'ini kullanacak.
- [x] Env example dosyalari local deger tasiyorsa acikca example kalacak; canli
  `.env` dosyalari repo ile ezilmeyecek.
- [x] `admin_panel/ecosystem.config.cjs` eski `/var/www/tarimiklim` yerine
  `/var/www/tarim-dijital-ekosistem/projects/tarimiklim` kullaniyor.
- [x] `deploy/nginx-tarimiklim.conf` `/uploads/` alias'ini
  `backend/uploads` altinda tutuyor.
- [x] `admin_panel/bun.lock` ve
  `frontend/next-env.d.sync-conflict-20260405-111542-6E32S2R.ts` silinmis
  durumda.
- [x] Scope 0 dosya seti commit'e hazir; henuz commit atilmadi.

## Scope 1 — Alert, Push ve Telegram

Ayri feature kapsam:

- `admin_panel/src/app/(main)/admin/(admin)/notifications/send/page.tsx`
- `admin_panel/src/app/(main)/admin/(admin)/tarimiklim/alert-subscriptions/_components/alert-subscriptions-client.tsx`
- `admin_panel/src/integrations/shared/telegram.ts`
- `backend/src/db/seed/sql/125_user_push_tokens_schema.sql`
- `backend/src/db/seed/sql/126_push_campaigns_schema.sql`
- `backend/src/db/seed/sql/140_telegram_schema.sql`
- `backend/src/modules/alerts/controller.ts`
- `backend/src/modules/alerts/fcm.ts`
- `backend/src/modules/alerts/push-delivery.integration.ts`
- `backend/src/modules/alerts/repository.ts`
- `backend/src/modules/alerts/router.ts`
- `backend/src/modules/alerts/schema.ts`
- `backend/src/modules/alerts/service.ts`
- `backend/src/modules/alerts/validation.ts`
- `backend/src/modules/telegramBot/`
- `frontend/src/lib/alerts-client.ts`
- `frontend/src/lib/firebase-push.ts`
- `mobile/app/app/(tabs)/alerts.tsx`
- `mobile/app/src/lib/notifications.ts`

Kontrol:

- [x] Backend build daha once gecti: `projects/tarimiklim/backend`
  `bun run build`.
- [x] Admin build daha once gecti: `projects/tarimiklim/admin_panel`
  `bun run build`.
- [x] Mobil TypeScript kontrolu gecti:
  `projects/tarimiklim/mobile/app` icinde `bun run lint`.
- [x] Migration dosyalari idempotent gorunuyor:
  `CREATE TABLE IF NOT EXISTS`, `INSERT IGNORE`, `ON DUPLICATE KEY UPDATE`.
- [x] `site_settings` tablosunda `key + locale` unique index mevcut;
  Telegram ayarlari tekrar seed kosusunda kopyalanmaz.
- [x] Kullanici push token endpointleri `requireAuth` ile bagli:
  `/me/push-tokens`.
- [x] Telegram webhook public route olarak bagli:
  `/telegram/bot-webhook`.
- [x] Push/Telegram canli env degerleri sadece env dosyalarinda kalacak;
  repo icinde secret yazilmadi.
- [x] 401 auth hatalari `me/*` endpointleri icin beklenen davranis olarak
  not edildi.

## Scope 2 — Premium Frontend, Auth ve Dashboard

Ayri feature kapsam:

- `frontend/src/app/[locale]/(public)/`
- `frontend/src/app/[locale]/icon/`
- `frontend/src/app/api/`
- `frontend/src/app/error.tsx`
- `frontend/src/app/firebase-messaging-sw.js/`
- `frontend/src/app/global-error.tsx`
- `frontend/src/app/globals.css`
- `frontend/src/app/icon.tsx`
- `frontend/src/app/layout.tsx`
- `frontend/src/app/llms-full.txt/`
- `frontend/src/app/llms.txt/route.ts`
- `frontend/src/app/loading.tsx`
- `frontend/src/app/manifest.ts`
- `frontend/src/app/not-found.tsx`
- `frontend/src/components/AuthNavButtons.tsx`
- `frontend/src/components/LegalPageContent.tsx`
- `frontend/src/components/SectionScroll.tsx`
- `frontend/src/components/ThemeModeToggle.tsx`
- `frontend/src/components/auth/`
- `frontend/src/components/dashboard/`
- `frontend/src/components/providers/`
- `frontend/src/components/ui/`
- `frontend/src/lib/api-client.ts`
- `frontend/src/lib/auth-client.ts`
- `frontend/src/lib/auth-token.ts`
- `frontend/src/lib/auth.ts`
- `frontend/src/lib/design-tokens-runtime.ts`
- `frontend/src/lib/favorites.ts`
- `frontend/src/lib/hooks/`
- `frontend/src/lib/locale-path.ts`
- `frontend/src/lib/seo.ts`
- `frontend/src/lib/utils.ts`
- `frontend/src/styles/design-tokens.css` silinmesi
- `frontend/src/styles/globals.css` silinmesi
- `frontend/src/styles/panel.css` silinmesi
- `frontend/public/img/premium_login_bg.png`
- `frontend/postcss.config.mjs`
- `frontend/package.json`
- `frontend/public/locales/en.json`
- `frontend/public/locales/tr.json`

Kontrol:

- [x] Frontend build gecti: `projects/tarimiklim/frontend`
  icinde `bun run build`.
- [x] Build sonrasi olusan `.next` artefact'i local temizlik standardi icin
  kaldirildi.
- [x] Login/register route ayrimi kontrol edildi:
  `/[locale]/giris` ve `/[locale]/kayit` asil sayfalar,
  `/[locale]/auth/login` ve `/[locale]/auth/register` legacy redirect.
- [x] Dashboard route'lari build ciktisinda gorundu:
  `/[locale]/hesabim`, `/favoriler`, `/alert-rules`, `/bildirimler`,
  `/uyarilar`, `/profil`, `/guvenlik`, `/destek`.
- [x] Dashboard layout `AuthGuard` ile korunuyor; oturum yoksa
  `/{locale}/giris` adresine yonlendiriyor.
- [x] Auth client public sayfalarda token yokken `/auth/user` probe'u
  atmiyor; gereksiz 401 gurultusunu azaltan davranis korunuyor.
- [x] Root provider yapisi kontrol edildi:
  `AuthSessionProvider`, `ToastProvider`, `FirebasePushProvider`.
- [x] Firebase service worker config degerlerini yalnizca
  `NEXT_PUBLIC_FIREBASE_*` env alanlarindan uretiyor; repo icinde secret yok.
- [x] Profil avatar upload API base hatasi duzeltildi:
  `NEXT_PUBLIC_API_URL` zaten `/api/v1` icerirken tekrar `/api/v1`
  eklenmeyecek.
- [x] Preload uyarilari kritik hata olarak ele alinmadi; 404/400/500
  hatalari ayri scope/runbook ile takip edilecek.

## Scope 3 — Home Sections, Navigation ve Dynamic Layout

Ayri feature kapsam:

- `admin_panel/src/app/(main)/admin/(admin)/home-layout/_components/home-layout-admin-client.tsx`
- `admin_panel/src/app/(main)/admin/(admin)/site-settings/tabs/brand-media-tab.tsx`
- `admin_panel/src/app/(main)/admin/(admin)/site-settings/tabs/branding-settings-tab.tsx`
- `admin_panel/src/app/(main)/admin/(admin)/site-settings/tabs/seo-settings-tab.tsx`
- `admin_panel/src/config/home-layout-components.ts`
- `backend/src/db/seed/sql/016_seo_seed.sql`
- `backend/src/db/seed/sql/050_home_sections_seed.sql`
- `backend/src/db/seed/sql/060_navigation_seed.sql`
- `backend/src/modules/homeSections/`
- `backend/src/modules/navigation/`
- `frontend/src/app/[locale]/page.tsx`
- `frontend/src/components/sections/ContactForm.tsx`
- `frontend/src/components/sections/DynamicHomeSections.tsx`
- `frontend/src/components/sections/FinalCta.tsx`
- `frontend/src/components/sections/HeroSection.tsx`
- `frontend/src/components/sections/SiteFooter.tsx`
- `frontend/src/components/sections/SiteNav.tsx`
- `frontend/src/components/sections/SiteNavMobile.tsx`
- `frontend/src/lib/home-sections.ts`
- `frontend/src/lib/navigation.ts`
- `frontend/src/lib/page-seo.ts`
- `frontend/src/lib/public-brand.ts`
- `frontend/src/lib/site-settings.ts`

Kontrol:

- [x] Backend build daha once gecti: `projects/tarimiklim/backend`
  `bun run build`.
- [x] Frontend build daha once gecti: `projects/tarimiklim/frontend`
  `bun run build`.
- [x] Admin build daha once gecti: `projects/tarimiklim/admin_panel`
  `bun run build`.
- [x] Seed idempotency kontrol edildi:
  `050_home_sections_seed.sql`, `060_navigation_seed.sql` ve
  `016_seo_seed.sql` dosyalari `CREATE TABLE IF NOT EXISTS`,
  `INSERT IGNORE` veya `ON DUPLICATE KEY UPDATE` kullaniyor.
- [x] Admin home/navigation route'lari `requireAuth` ve `requireAdmin`
  ile korunuyor.
- [x] Public API ayrimi korunuyor: `/home/sections` ve `/navigation`
  public okuma endpointleri olarak bagli.
- [x] Frontend SSR/API fallback kontrol edildi:
  `fetchHomeSections` hata durumunda `[]`, `fetchNavigation` ise
  `EMPTY_NAVIGATION` donduruyor.
- [x] Bilinmeyen dynamic home component key'leri render edilmeden `null`
  donduruluyor; canli sayfayi kirmiyor.
- [x] Scope 3 dosya seti commit'e hazir; henuz commit atilmadi.

## Scope 4 — Weather, Widget ve Shared Public API

Bu kapsam Scope 1/2/3 ile baglantili ama ayri izlenmeli:

- `backend/src/modules/weather/validation.ts`
- `frontend/src/app/widget/bereketfide/page.tsx`
- `frontend/src/app/widget/haldefiyat/page.tsx`
- `frontend/src/app/widget/layout.tsx`
- `frontend/src/app/widget/page.tsx`
- `frontend/src/app/widget/vistaseed/page.tsx`
- `frontend/src/components/HourlyForecastTable.tsx`
- `frontend/src/components/LocationSelector.tsx`
- `frontend/src/components/widget/WeatherWidget.tsx`
- `frontend/src/lib/api.ts`

Kontrol:

- [x] Canli `https://tarimiklim.com/api/v1/weather/hourly?...&slots=1`
  yeniden test edildi; 2026-05-14 14:25 Europe/Berlin itibariyla `200 OK`
  donuyor.
- [x] Local `hourlyQuerySchema` `lat/lon/slots=1` query'sini kabul ediyor.
- [x] Widget rotalari canlida `200 OK` donuyor:
  `/widget`, `/widget/bereketfide`, `/widget/vistaseed`, `/widget/haldefiyat`.
- [x] `weather/widget-data?location=antalya` canli API payload'i donuyor.
- [x] Frontend build ciktisinda widget rotalari gorundu.
- [x] Public API dokumantasyon/default endpoint uyumsuzlugu duzeltildi:
  yanlis `/api/v1/weather/forecast` ifadesi `/api/v1/weather` yapildi.
- [x] Backend ve frontend build kontrolleri tekrar gecti; olusan
  `.next`/`dist` artefactleri temizlendi.

## Capraz Dosyalar

Bu dosyalar birden fazla scope'a dokunuyor; commit sirasinda dikkatli
incelenecek:

- `admin_panel/src/app/(main)/admin/(admin)/notifications/send/page.tsx`
- `frontend/src/app/layout.tsx`
- `frontend/src/app/widget/*`
- `frontend/src/lib/api.ts`
- `frontend/public/locales/en.json`
- `frontend/public/locales/tr.json`
- `backend/src/routes/project.ts`
- `backend/src/routes/shared.ts`

## Uygulama Sirasi

1. Scope 0: yapi/deploy/temizlik.
2. Scope 1: alert/push/telegram.
3. Scope 3: home/navigation.
4. Scope 2: premium frontend/auth/dashboard.
5. Scope 4: weather/widget ve public API.

Her scope sonrasi:

```bash
git status --short
```

Ilgili serviste:

```bash
bun run build
```
