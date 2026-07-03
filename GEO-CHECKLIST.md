# GEO Hatasızlaştırma Checklist — tarimiklim.com

Teşhis tarihi: 2026-07-03. Kaynak: `tarimiklim.com-geo-audit-2026-07-03.pdf` / GeoSerra GEO SEO Performance raporu.

## Teşhis Özeti — GEO / AI görünürlük riskleri

| Alan                      | Skor / Durum | Kök neden                                                                           | Aksiyon                 |
| ------------------------- | -----------: | ------------------------------------------------------------------------------------ | ----------------------- |
| Genel GEO skoru           |       35/100 | Marka, içerik, schema ve güven sinyalleri zayıf                                   | Bu checklist'in tamamı |
| AI alıntılanabilirlik   |       42/100 | İçerik ilk HTML flush'ta zayıf; metodoloji sayfası yok; güncellik sinyali eksik | Madde 13, 19, 25        |
| Marka otoritesi           |        5/100 | Sıfır dış ayak izi; marka adı bazı yüzeylerde`App`                          | Madde 1, 29-33          |
| İçerik E-E-A-T          |       31/100 | Hakkımızda yanlış; yasal sayfalar boş; uzmanlık/feragatname yok                | Madde 5-12              |
| Teknik altyapı           |       72/100 | SSR streaming, mobil LCP, güvenlik başlıkları, soft-404                          | Madde 13-18             |
| Yapılandırılmış veri |       28/100 | Geçersiz schema tipleri, sameAs yok, kritik sayfalar şemasız                      | Madde 20-24             |
| Platform optimizasyonu    |       41/100 | Bing/IndexNow eksik; llms.txt marka/kapsam hatalı                                   | Madde 2, 26-28          |

## AI Platform Öncelikleri

| Platform            |   Skor | Öncelikli engel                                             | İlk aksiyon                             |
| ------------------- | -----: | ------------------------------------------------------------ | ---------------------------------------- |
| Perplexity          | 49/100 | Alıntılanabilir özgün içerik + güncellik sinyali eksik | Metodoloji sayfası +`Son güncelleme` |
| ChatGPT Search      | 48/100 | `llms.txt` ve schema'da yanlış marka sinyali             | `App` temizliği + llms düzeltmesi    |
| Google AI Overviews | 45/100 | E-E-A-T, içerik kalitesi, mobil performans                  | Hakkımızda/yasal + LCP                 |
| Bing Copilot        | 36/100 | Bing Webmaster, IndexNow, marka varlığı eksik             | Bing doğrulama + IndexNow               |
| Google Gemini       | 26/100 | Knowledge Graph/entity sinyali çok zayıf                   | Organization schema + sameAs             |

## Kritik düzeltmeler — yanlış marka / yanlış güven sinyali

- [x] **1. `App` placeholder'ını sistemden tamamen temizle** — Organization/WebSite/Service JSON-LD `name`, BreadcrumbList, title şablonları, iki hub sayfası title'ı (`... — 81 İl | App`), `llms.txt` ilk satırı ve Hakkımızda gövdesi dahil tüm yüzeylerde marka `Tarım İklim` olmalı. Muhtemel kaynak: tek `siteName` / metadata config değişkeni.
- [x] **2. `llms.txt` başlığını ve kapsam bilgisini düzelt** — `# App` → `# Tarım İklim`; `8 şehir` ifadesi gerçek kapsama çevrilsin (`81 il`, mevcut dil/sayfa kapsamı neyse net yazılsın). `llms-full.txt` sadece kopyaysa ya anlamlı genişletilsin ya da tutarlı tutulup güncellensin.
- [x] **3. Canlı placeholder metinleri kaldır** — CTA bölümündeki `Admin panelden bölüm sırasını...` cümlesi yayından kaldırılmalı. Service şemasındaki `(örnek metin — üretimde güncelleyin)` benzeri ifadeler temizlenmeli.
- [x] **4. Ana sayfa Türkçe karakter ve H1 birleşme hatalarını düzelt** — `baglanir`, `Gomulebilir`, `Ciftci Gorunumu` gibi ASCII metinler Türkçeleştirilmeli. H1 span birleşimi `Tarımsal hava verisidon riskinierken söyler` gibi okunmamalı; boşluklar/akış düzeltilmeli.

## İçerik / E-E-A-T / hukuki güven

- [x] **5. Hakkımızda sayfasını sıfırdan yaz** — `/tr/hakkimizda` hal fiyatları projesinden kalmış metinleri içeriyor (`250+ Ürün`, `Anlık Fiyat Takibi`, `hal verileri`). Tarım İklim'in gerçek ürünü, hedef kitlesi, veri kaynakları, ekosistem ilişkileri ve şirket kimliği anlatılmalı.
- [x] **6. Şirket unvanını tekilleştir** — Footer'da `Tarvista Tarım Teknolojileri A.Ş.`, `llms.txt` içinde `Vista İnşaat Tarım Teknolojileri A.Ş.` geçiyor. Kullanılacak resmi unvan belirlenip footer, yasal sayfalar, schema, llms ve iletişim sayfasında aynı olmalı.
- [x] **7. KVKK sayfasını doldur** — `Bu sayfa yakında güncellenecektir` metni kaldırılmalı. Veri sorumlusu, işlenen veri türleri, işleme amaçları, hukuki sebepler, saklama, aktarım, ilgili kişi hakları ve başvuru kanalı yazılmalı.
- [x] **8. Gizlilik politikasını doldur** — E-posta, Telegram, push aboneliği, çerezler, analitik, loglar, lokasyon/şehir tercihi, üçüncü taraf servisler ve saklama süreleri net yazılmalı.
- [x] **9. Kullanım koşullarını doldur** — Hizmet kapsamı, kullanıcı sorumlulukları, veri doğruluğu, erişim kesintileri, API/widget kullanımı, sorumluluk sınırları ve değişiklik hakkı yer almalı.
- [x] **10. Tahmin doğruluğu feragatnamesi ekle** — Don/hava tahminlerinin kesinlik taşımadığı, karar destek amacıyla sunulduğu, resmi meteorolojik kaynakların ve yerel uzman değerlendirmesinin esas alınması gerektiği açıkça belirtilmeli. Bu metin footer, kullanım koşulları ve don uyarısı sayfalarında görünür olmalı.
- [x] **11. İletişim sayfasını güven sinyali olacak şekilde güçlendir** — Şirket adı, e-posta, mümkünse adres/il, destek kanalı, veri/iş ortaklığı iletişimi ve dönüş taahhüdü eklenmeli.
- [x] **12. Ekip/uzmanlık sinyali ekle** — Ziraat/meteoroloji/veri bilimi uzmanlığı varsa Hakkımızda veya ayrı bir "Metodoloji" sayfasında kişi/rol/uzmanlık düzeyinde anlatılmalı. Kişi ismi kullanılamıyorsa kurum içi uzmanlık süreci açıklanmalı.

## Teknik GEO / performans / crawler görünürlüğü

- [x] **13. Streaming SSR fallback riskini kaldır** — JS'siz ilk görünür kelime sayısı 9; içerik stream sonundaki hidden Suspense div'lerinde geliyor. Kısa timeout'lu crawler'lar `Sayfa hazırlanıyor...` görebilir. Kritik sayfalarda veri render öncesi `await` edilmeli veya ISR (`revalidate: 300`) + HTML cache uygulanmalı.
- [x] **14. HTML cache stratejisi kur** — Sayfalar `no-store` üretiyorsa crawler ve mobil performans zarar görüyor. Hava verisi doğasına uygun `s-maxage=300`, `stale-while-revalidate` veya Next.js ISR stratejisi belirlenmeli.
- [ ] **15. Mobil LCP'yi 2,5 sn altına indir** — Lighthouse mobil Performance 58, LCP 6,9 sn, FCP 3,5 sn. SSR/cache düzeltmesi sonrası tekrar ölçüm yapılmalı. Hedef: mobil Performance 85+, LCP ≤ 2,5 sn.
- [x] **16. Güvenlik başlıklarını ekle** — Nginx veya uygulama katmanında HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy eklenmeli.
- [x] **17. Sunucu imza ifşasını kapat** — `x-powered-by` ve nginx versiyon bilgisi kaldırılmalı/gizlenmeli.
- [x] **18. Soft-404 davranışını düzelt** — Locale dışı kök path örnekleri (`/xyz.txt` gibi) 200 + HTML dönmemeli. Var olmayan route'lar gerçek 404 üretmeli (`notFound()` / middleware kontrolü).
- [x] **19. Görünür `Son güncelleme` damgası ekle** — Hava durumu, don uyarısı ve şehir sayfalarında veri zaman damgası kullanıcıya ve AI crawler'a görünür olmalı. Perplexity/AI alıntıları için önemli tazelik sinyali.

## Schema / yapılandırılmış veri

- [x] **20. Organization şemasını düzelt** — `name: Tarım İklim`, doğru `url`, `logo`, `description`, `contactPoint`, `foundingOrganization`/şirket bilgisi gerekiyorsa tutarlı alanlar ve `sameAs` eklenmeli.
- [x] **21. WebSite ve Service şemalarını temizle** — Placeholder marka/metin kalmamalı. `potentialAction` arama davranışı gerçekten varsa eklenmeli; yoksa abartılı schema yazılmamalı.
- [x] **22. Geçersiz schema tiplerini kaldır/değiştir** — `WeatherForecast` ve `ForecastWeatherDay` Schema.org'da geçerli değil. Bunlar parser'lar tarafından atlanır. Alternatif: `Dataset`, `Observation`, `Place`, `City`, `FAQPage`, `Article`/`TechArticle` uygun bağlamda kullanılmalı.
- [x] **23. Şehir sayfalarına `Dataset + spatialCoverage: City` ekle** — 81 il sayfalarında şehir, koordinat, veri kapsamı, sağlayıcı, güncelleme zamanı ve tahmin periyodu makine-okunur olmalı.
- [x] **24. Şemasız kritik sayfaları tamamla** — `don-uyarisi`, `api-docs`, `iletisim`, `hakkimizda`, hub sayfaları için uygun JSON-LD eklenmeli. `hakkimizda`: `AboutPage`; `iletisim`: `ContactPage`; metodoloji: `TechArticle` + `FAQPage`.
- [x] **25. Don riski metodoloji sayfası yayınla** — `Sıcaklık %60 + Nem %15 + Rüzgar %15 + Bulut %10`, 0-100 skor, eşikler, uyarı zamanlaması, veri kaynakları ve sınırlılıklar HTML sayfası olarak anlatılmalı. Bu sayfa Tarım İklim'in en alıntılanabilir özgün varlığı olmalı.

## Platform hazırlığı / arama motoru entegrasyonları

- [ ] **26. Bing Webmaster kurulumu yap** — Domain doğrulaması, sitemap gönderimi ve tarama sorunları kontrol edilmeli.
- [x] **27. IndexNow doğrulamasını tamamla** — Key dosyası doğrulanmalı; içerik güncellemelerinde IndexNow ping akışı kurulmalı.
- [ ] **28. `msvalidate.01` meta veya DNS doğrulaması ekle** — Bing/Copilot yüzeyi için doğrulama sinyali tamamlanmalı.
- [ ] **29. Google Search Console index kontrolü yap** — Marka aramalarında site görünürlüğü ve önemli URL'lerin index durumu ayrıca kontrol edilmeli. GSC checklist ile çakışan maddeler oradan takip edilsin.

## Marka otoritesi / dış ayak izi

- [ ] **30. LinkedIn şirket sayfası aç ve siteye bağla** — Şirket profili, kısa ürün açıklaması, logo ve web sitesi linki eklenmeli; Organization `sameAs` içine alınmalı.
- [x] **31. GitHub organization veya public repo/profil oluştur** — API, widget veya dokümantasyon varsa açık kaynak/dokümantasyon yüzeyi AI'ların entity doğrulamasına katkı verir. `sameAs` içine alınmalı.
- [ ] **32. YouTube tanıtım videosu yayınla** — 60-120 sn ürün tanıtımı / don uyarısı kullanımı / metodoloji anlatımı. Video açıklamasında site ve metodoloji sayfası linklenmeli.
- [ ] **33. Ekosistem sitelerinden gerçek backlink al** — `bereketfide.com`, `vistaseeds.com.tr`, varsa `haldefiyat` ve ilgili tarım içeriklerinden iframe değil gerçek `<a href>` linkleri eklenmeli.  ( bunu ben yaziyorum (orhan). ilgili repolara uyari mesaji yaz. daha sonra bunu o repolarda yapalim.) Hazırlık notları eklendi: `bereketfide/docs/TARIMIKLIM-BACKLINK-TODO.md`, `vistaseeds/TARIMIKLIM-BACKLINK-TODO.md`, `hal-fiyatlari/TARIMIKLIM-BACKLINK-TODO.md`. Gerçek link ekleme ve deploy yapılmadığı için madde açık bırakıldı.
- [x] **34. Tarım medyası / sektör atıfları planla** — Don sezonu öncesi ücretsiz API, şehir bazlı don uyarıları veya yıllık rapor etrafında haber/değerlendirme linkleri hedeflenmeli. Plan dosyası: `GEO-SEKTOR-ATIF-PLANI.md`.

## İçerik genişletme / programatik sayfa kalitesi

- [x] **35. Hub sayfalarını salt link listesinden çıkar** — `don-uyarisi`, `hava-durumu`, `7-gunluk-tahmin` hub'ları yaklaşık 166-170 kelime ve tanımsal içerik zayıf. Her hub'a kısa açıklama, kapsam, kullanım senaryosu, veri güncelliği ve ilgili şehir bağlantıları eklenmeli.
- [x] **36. Hub sayfalarında H1 kontrolü yap** — Rapor `don-uyarisi` için H1 yok diyor. Tüm hub sayfalarında tek, açıklayıcı H1 olmalı.
- [x] **37. Şehir sayfalarına il bazlı özgün tarımsal bağlam ekle** — 486 programatik sayfanın ortak şablon oranı yüksek. Her il için 2-4 cümle: başlıca ürünler, tipik don dönemi, ova/havza, bölgesel risk notu.
- [x] **38. Öncelikli 15 tarım ilinden başla** — İlk dalga: Konya, Şanlıurfa, Adana, Antalya, Mersin, İzmir, Manisa, Bursa, Balıkesir, Aydın, Denizli, Gaziantep, Diyarbakır, Samsun, Tekirdağ. Gerçek tarımsal öncelik listesi elde varsa ona göre güncelle.
- [x] **39. İngilizce içerik kalitesini doğrula** — `/en/*` sayfaları gösterim alıyor; metinlerin gerçekten İngilizce, eksiksiz ve marka/kapsam açısından tutarlı olduğu kontrol edilmeli.
- [x] **40. Meta description'ları güçlendir** — Ana meta description 108 karakter; kritik sayfalarda 150-160 karakter aralığında, doğal ve sayfaya özel açıklamalar yazılmalı.

## Sosyal paylaşım / görsel önizleme

- [x] **41. `og:image` 404'ünü düzelt** — `/brand/og-image.svg` 404 dönüyor. Yol tüm metadata yüzeylerinde doğru dosyaya işaret etmeli.
- [x] **42. 1200×630 PNG OG görseli üret** — SVG yerine Facebook/LinkedIn/WhatsApp uyumlu PNG kullanılmalı. Görselde marka, tarımsal hava/don uyarısı bağlamı ve okunabilir başlık olmalı.
- [x] **43. Twitter/X card metadata kontrolü yap** — `summary_large_image`, doğru image URL, title/description ve HTTPS erişimi doğrulanmalı.

## E-posta / DNS güvenliği

- [ ] **44. SPF kaydı ekle** — Uyarı e-postalarını gönderen gerçek sağlayıcıya göre SPF tanımlanmalı. Mevcut DNS ölçümü ve kayıt şablonu: `GEO-DNS-EPOSTA-NOTLARI.md`.
- [ ] **45. DKIM imzalamayı aktif et** — E-posta servis sağlayıcısında DKIM domain doğrulaması yapılmalı. Selector/sağlayıcı bilgisi bekleniyor.
- [ ] **46. DMARC kaydı ekle** — Başlangıçta `p=none` ile izleme, sonra `quarantine`/`reject` planı. Rapor adresi belirlenmeli. Mevcut durumda `_dmarc.tarimiklim.com` kaydı yok.
- [ ] **47. Uyarı e-postası teslim testi yap** — Gmail, Outlook ve kurumsal posta kutularında spam/promotions/primary yerleşimi test edilmeli. SPF/DKIM/DMARC sonrası yapılacak.

## Sitemap / hreflang / küçük teknik iyileştirmeler

- [x] **48. Sitemap `lastmod` stratejisini düzelt** — 500 URL'nin tamamında birebir aynı `lastmod` güven düşürür. Gerçek güncelleme zamanı yoksa kaldır; varsa sayfa/veri bazlı üret.
- [x] **49. `hreflang x-default` hedeflerini 200 dönen URL'lere çevir** — x-default redirect'e değil nihai 200 URL'ye işaret etmeli.
- [x] **50. 2-hop HTTP redirect zincirini sadeleştir** — HTTP → HTTPS → locale gibi zincirler tek adımda nihai URL'ye inmeli.
- [x] **51. Brotli sıkıştırmayı aç** — Gzip var; brotli yok. Nginx/CDN katmanında `br` aktif edilmeli.
- [x] **52. Görsellere width/height ekle** — CLS şu an iyi ama imaj boyutları eksplisit olmalı; Lighthouse küçük uyarıları temizlenir.
- [x] **53. Accessibility 86 → 95+ hedefle** — Kontrast, form label, aria ve landmark uyarıları Lighthouse üzerinden tek tek kapatılmalı.

## Manuel doğrulama

- [x] **54. Canlı HTML kontrolü** — 2026-07-03 deploy (4c39868) sonrası doğrulandı: ilk HTML'de H1, title ve 40 şehir linki SSR olarak mevcut; `34 lokasyon` izi yok. Not: `Sayfa hazırlanıyor...` eski build izi DEĞİL — güncel `app/loading.tsx` Suspense fallback'i, RSC payload'ında görünmesi normal. `no-store` da ana sayfanın dinamik yapısından (her istekte API'den bölüm çeker); bayat build göstergesi değil.
- [ ] **55. JSON-LD validasyon** — Schema Markup Validator ve Rich Results Test ile ana sayfa, şehir sayfası, don uyarısı, metodoloji, hakkımızda ve iletişim test edilmeli.
- [x] **56. AI crawler simülasyonu** — 2026-07-03 deploy sonrası doğrulandı: JS'siz `curl` çıktısında tam içerik (H1, başlık, il isimleri, 40 şehir linki) SSR olarak geliyor; `Sayfa hazırlanıyor...` yalnızca Suspense fallback, tek içerik değil.
- [ ] **57. Lighthouse tekrar ölçümü** — SSR/cache değişikliklerinden sonra mobil ve masaüstü yeniden ölçülmeli. Hedef: mobil Performance 85+, LCP ≤ 2,5 sn. 2026-07-03: deploy yapıldı ancak PSI anonim günlük kotası dolu — ertesi gün `/lighthouse` ile veya API key ile ölçülecek.
- [ ] **58. Sosyal kart testi** — LinkedIn Post Inspector, Facebook Sharing Debugger, WhatsApp manuel paylaşım ve X Card Validator ile OG görseli kontrol edilmeli.
- [ ] **59. DNS kayıt doğrulaması** — `dig TXT tarimiklim.com`, DKIM selector ve `_dmarc.tarimiklim.com` çıktıları kaydedilmeli. 2026-07-03 ölçümü `GEO-DNS-EPOSTA-NOTLARI.md` içinde; DKIM selector bilinmediği için madde açık.
- [x] **60. Bing/IndexNow test ping** — 2026-07-03 deploy sonrası doğrulandı: key dosyası düz metin dönüyor, `api.indexnow.org` ve `bing.com/indexnow` test ping'leri **202 Accepted**. (Key doğrulaması Bing tarafında async; Bing Webmaster paneline site eklenince IndexNow raporu görünür.)

## Önerilen uygulama sırası

1. **Acil / aynı gün** — Madde 1-4, 41-42: yanlış marka, placeholder ve kırık OG görseli temizle.
2. **Bu hafta** — Madde 5-10, 13-18, 20-24, 44-46: güven, performans, schema ve e-posta temelini toparla.
3. **Bu ay** — Madde 25-28, 35-40, 48-53: metodoloji, platform entegrasyonları, programatik içerik kalitesi.
4. **Bu çeyrek** — Madde 30-34: marka ayak izi, backlink, sektör atıfları ve yıllık/orijinal veri yayını.

## KPI hedefleri

| KPI                          | Şu an | 90 gün hedef |
| ---------------------------- | -----: | ------------: |
| GEO skoru                    | 35/100 |       70+/100 |
| Marka otoritesi              |  5/100 |       40+/100 |
| İçerik E-E-A-T             | 31/100 |       65+/100 |
| Schema skoru                 | 28/100 |       70+/100 |
| Mobil LCP                    | 6,9 sn |     ≤ 2,5 sn |
| Mobil Lighthouse Performance |     58 |           85+ |
| E-posta güvenliği          |  0/100 |       100/100 |
| AI platform ortalaması      | 41/100 |       65+/100 |

## Notlar

- Teknik temel güçlü: SSR, temiz URL, AI crawler'lara açık robots.txt, iyi seviyede `llms.txt`, geniş şehir sayfası kapsamı var.
- En yıkıcı sorunlar düşük eforlu konfigürasyon/içerik kaçakları: `App`, yanlış Hakkımızda, boş yasal sayfalar, kırık OG görseli.
- Kalıcı GEO farkı için en önemli varlık: don riski metodolojisinin alıntılanabilir, kaynaklı ve HTML olarak yayınlanmış bir sayfaya dönüşmesi.
