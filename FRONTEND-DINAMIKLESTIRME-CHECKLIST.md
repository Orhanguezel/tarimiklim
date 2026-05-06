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

- [ ] `design_tokens` tabanlı runtime token apply (TarMinGO yaklaşımı).
- [ ] Light/dark mode toggle + kalıcılık.
- [ ] Admin panelde token düzenleme sonrası public cache revalidate.
- [ ] `design-tokens.css` sabitlerinin fallback moduna çekilmesi.

## Faz D — Auth ve Uyarı Talebi

- [ ] Frontend login/register sayfaları.
- [ ] Auth session/token yönetimi (shared-backend ile uyumlu).
- [ ] Üye için “don uyarısı talebi oluştur” UI (`/me/alert-rules`).
- [ ] Telegram chat-id bağlama akışı (`/me/telegram-chat-id`).

## Faz E — Refactor ve Ortak Paketler

- [ ] TarMinGO’dan alınan parçaları ortaklaştırma (duplikasyon temizliği).
- [ ] Widget/brand ayrımı netleştirme.
- [ ] Dokümantasyon + test checklist güncellemesi.
