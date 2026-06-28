# Tarımİklim Frontend Dinamikleştirme Çeklistesi

Bu dosya, frontend’in markadan bağımsız ve admin tarafından yönetilebilir hale gelmesi için takip listesi.

## Faz A — Marka ve Konfig

- [x] `site-defaults.json` + `public-brand.ts` ile env/json fallback katmanı.
- [ ] DB seed ile marka/SEO varsayılanları (`seo_defaults`, `seo_pages_*`, `site_logo` vb.).
- [ ] Öncelik zinciri standardı: `env > DB site_settings > json > fallback`.
- [ ] Bu yardımcıların ortak pakete taşınma planı (kod tekrarı yok).

## Faz B — Dinamik SEO

- [x] `fetchPageSeo(pageKey, locale)` helper.
- [x] `home` ve `don-uyarisi` sayfalarında `generateMetadata` DB SEO entegrasyonu.
- [x] Kalan public sayfalara SEO helper uygulaması (`[locale]/layout` dahil).
- [ ] Admin panelde SEO anahtarları için operasyon rehberi.

## Faz C — Dinamik Tema ve Dark/Light

- [x] `design_tokens` tabanlı runtime token apply (TarMinGO yaklaşımı).
- [x] Light/dark mode toggle + kalıcılık.
- [x] Admin panelde token düzenleme sonrası public cache revalidate.
- [x] `design-tokens.css` sabitlerinin fallback moduna çekilmesi.

## Faz D — Auth ve Uyarı Talebi

- [x] Frontend login/register sayfaları.
- [x] Auth session/token yönetimi (shared-backend ile uyumlu).
- [x] Üye için “don uyarısı talebi oluştur” UI (`/me/alert-rules`).
- [x] Telegram chat-id bağlama akışı (`/me/telegram-chat-id`).

## Faz E — Refactor ve Ortak Paketler

- [x] TarMinGO’dan alınan parçaları ortaklaştırma (duplikasyon temizliği) — `@agro/shared-frontend` eklendi.
- [x] Widget/brand ayrımı netleştirme (bkz: `WIDGET-BRAND-STRATEGY.md`).
- [ ] Dokümantasyon + test checklist güncellemesi.

## Geçici Not (2026-05-06)

- BereketFide widget entegrasyon dosyaları geçici olarak mevcut davranışta bırakılacak.
- Bu repo içinde kırılma riski yaratmadan ilerlenecek; BereketFide tarafı adapte edilince ilgili uyarı/not o repoya taşınacak.
- Sonrasında burada kalan geçici istisna temizlenecek.
