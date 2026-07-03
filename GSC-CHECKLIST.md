# GSC Hatasızlaştırma Checklist — tarimiklim.com

Teşhis tarihi: 2026-07-03. Kaynak: GSC API (`sc-domain:tarimiklim.com`) + canlı site örneklemesi + `ekosistem-sosyal-medya/backend/scripts/tarimiklim-seo-diagnostic.ts`.

## Teşhis Özeti — GSC "dizine eklenmedi" sebepleri

| GSC sebebi | Adet | Kök neden | Aksiyon |
|---|---|---|---|
| Keşfedildi, dizine eklenmedi | 356 | Yeni domain + 500 programatik şehir sayfası kalite/crawl kuyruğunda | İçerik + iç link (madde 4, 8) |
| Tarandı, dizine eklenmedi | 64 | Aynı — kalite değerlendirmesi | Aynı |
| Doğru canonical'lı alternatif sayfa | 22 | `?lat=&lon=` parametreli sayfalar doğru canonical veriyor | Yok — tasarlandığı gibi |
| Yönlendirmeli sayfa | 14 | Locale'siz eski URL'ler **307 geçici** dönüyor | Madde 1 |
| Bulunamadı (404) | 4 | Örnekler GSC UI'dan alınmalı (API listelemiyor) | Madde 5 |
| Robots.txt engelledi | 2 | `/widget/*`: Disallow + noindex çelişkisi — Google noindex'i göremiyor | Madde 2 |
| Canonical'sız kopya | 1 | Muhtemelen parametre varyantı | Düşük öncelik |
| Google farklı canonical seçti (`/tr`→`/`) | 1 | Kök eskiden içerik servis etmiş; `/` → `/tr` 308 artık doğru | Bekle — kendiliğinden düzelir |

Not: Sitemap 500 URL / "0 indexed" sayacı gecikmeli; URL inspection örnekleminde 60 sayfa dizinde göründü. Panik yok.

## Kod düzeltmeleri

- [ ] **1. 307 → 308 kalıcı redirect** — `frontend/src/proxy.ts`: sadece kök `/` 308; locale'siz diğer path'ler (`/hakkimizda`, `/don-uyarisi/x`) next-intl'in 307'sine düşüyor. Locale'siz path'leri de 308 ile `/tr/...`'ye yönlendir. "Yönlendirmeli sayfa: 14"ü eritir.
- [ ] **2. robots.txt widget çelişkisi** — `frontend/src/app/robots.ts`: `Disallow: /widget/` kaldır; sayfalarda `noindex` zaten var, Google görebilsin. `/giris` ve `/kayit` da Disallow yerine noindex'e geçmeli (şu an `/giris` SERP'te pos=2 ile görünüyor — robots engeli indexlemeyi önlemez).
- [ ] **3. sitemap lastModified** — `frontend/src/app/sitemap.ts`: `lastModified: now` her istekte 500 URL'ye "şimdi değişti" diyor → Google lastmod'u yok sayar. Gerçek güncelleme zamanı yoksa lastmod'u kaldır.
- [ ] **4. Ana sayfadan şehir linkleri** — Ana sayfada şehir sayfalarına 0 iç link var (hub 81/81 ✓, şehir→komşu 9 ✓). "Popüler şehirler" bölümü ekle: 20-30 büyük il × `hava-durumu`/`don-uyarisi`. 356'lık yığın için en etkili hamle.

## GSC UI (manuel)

- [ ] **5. 404 raporu** — 4 URL'yi aç; kasıtlı silinmişse dokunma, değilse redirect ekle.
- [ ] **6. Doğrulama başlat** — kod düzeltmeleri deploy edildikten sonra redirect + robots satırlarında "Düzeltmeyi Doğrula".
- [ ] **7. Öncelikli indexleme isteği** — 5-10 önemli şehir sayfası için URL denetimi → "Dizine eklenmesini iste" (`_tarimiklim-resubmit-index.ts` scripti var; quota ~10-12/gün).

## İçerik / Otorite (356+64'ü asıl çözecek olan)

- [ ] **8. Şehir sayfası farklılaştırma** — 81 il × 3 varyant × 2 dil ≈ aynı şablon = "thin/doorway" sinyali. Her ile özel tarımsal içerik (başlıca ürünler, don takvimi, ekim penceresi). En büyük 10-15 tarım ilinden başla.
- [ ] **9. EN içerik kalitesi** — `/en/*` sayfaları gösterim alıyor (iyi); içerik gerçekten İngilizce ve tam mı doğrula.
- [ ] **10. Ekosistem içi backlink** — bereketfide, vistaseeds, haldefiyat'tan tarimiklim şehir sayfalarına gerçek `<a href>` linkleri (iframe widget değil). Yeni domain'in en hızlı otorite kaynağı.

## Yan bulgular

- GTM container (GTM-KWL249BT) tamamen boş (0 tag) — GA4 doğrudan gtag ile veri alıyor; GTM bilerek boşsa sorun değil.
- Audit log şema uyumsuzluğu (is_bot kolonları) 2026-07-03'te düzeltildi — `backend/src/db/seed/sql/031_audit_quality_columns_apply.sql`.

## Beklenti

1-4 deploy edilse bile "Keşfedildi" yığını haftalar içinde erir — bu Google tarafında kuyruk, hata değil. Yeni domain'de 28 günde 12 gösterim normal; asıl kaldıraç içerik farklılaştırma + iç/dış link.
