# TarımİKlim — Para Kazanma Stratejisi ve Analiz Raporu

**Hazırlayan:** Claude Code (Mimar/Stratejist)
**Tarih:** 2026-04-17
**Durum:** Strateji taslağı — yatırım/proje lideri onayı bekliyor
**Hedef okuyucu:** Orhan Güzel (kurucu), potansiyel ortak, yatırımcı, partnership ekibi

---

## 0. Yönetici Özeti

TarımİKlim **B2B SaaS + API + widget** iş modeline uygun olgunlukta bir tarım teknoloji servisidir. Don riski algoritması, canlı panel, 81 il coğrafi kapsam ve ekosistem entegrasyonu (Bereketfide, VistaSeed) rakiplerden ayrıştıran varlıklardır.

**Önerilen birincil gelir modeli:** SaaS abonelik (freemium) + B2B API/widget lisansı + kurumsal sigorta iş birliği.

**12 aylık gerçekçi ciro hedefi:** ₺3.5M–5M (≈ 115k–165k USD)
**24 aylık hedef:** ₺12M–18M, parametrik sigorta ve kurumsal ihale katılımıyla.

**Kritik yatırım noktaları:**
1. Ödeme entegrasyonu (Iyzico/Stripe) — 2 haftada tamamlanabilir
2. Kooperatif ve birlik satış hattı — 6 aylık yatırım
3. IoT iklim istasyonu prototipi — 9-12 ayda ürün tamamlanır, donanım geliri açar
4. Parametrik sigorta ortaklığı (Tarsim + özel sigorta) — 12-18 ayda marj yüksek anlaşmalar

---

## 1. Mevcut Ürün Envanteri (2026-04)

Kayıtlı ve canlıda çalışan yetenekler:

### Altyapı
- **REST API** 7 endpoint (`/weather`, `/weather/current`, `/weather/hourly`, `/weather/frost-risk`, `/weather/rain-forecast`, `/weather/widget-data`, `/locations`)
- **Widget iframe** — `/widget/bereketfide`, `/widget/vistaseed` (canlı, ekosistem siteleri kullanıyor)
- **Premium landing** — hero + 4 section (Panel, Modüller, API, Ekosistem) tam Türkçe, SEO-ready (sitemap, robots, llms.txt, JSON-LD)
- **Canlı panel** — `/tr/don-uyarisi`: 81 il + Nominatim geocoding (tüm adresler), browser konumu, 7 gün + saatlik tablo, 4 seviye don risk uyarısı
- **Hero canlı weather card** — browser konumu + reverse geocode + localStorage senkron
- **8 şehir canlı city-grid** — tıklanır kartlar, URL paramı ile panele yönlendirme

### Teknoloji
- Next.js 16 + React 19 + TypeScript strict
- Fastify 5 + Drizzle ORM + MySQL + Redis (30dk cache TTL)
- BullMQ (30dk tahmin, 1 saat don kontrol, 06:00 günlük özet)
- OpenWeatherMap + Open-Meteo fallback
- Telegram bot aktif, SMTP hazır, Firebase Push mobil ile
- Nginx + Let's Encrypt + PM2 (VPS)
- Paylaşımlı `@agro` monorepo (shared-backend, shared-config, shared-types) — **ekosistem genelinde ölçek avantajı**

### Ekosistem bağlantıları (aynı iklim beynine bağlı)
| Uygulama | Durum | Entegrasyon biçimi |
|----------|-------|---------------------|
| Bereketfide | Canlı | Widget + API |
| VistaSeed | Canlı | API + iklim profili |
| Sera Kontrol | Canlı | API + IoT köprü |
| Ziraat Haber | Yakında | Widget |
| Hal Fiyatları | Yakında | Don→fiyat korelasyonu |
| Verim Tahmini | Pilot | ML iklim girdisi |
| Hastalık Uyarı | Q3 2026 | Nem-sıcaklık fungal risk |

### Doğruluk/kalite metrikleri (mevcut iddialar)
- Don tahmin doğruluğu 97.2% (2024 sezonu)
- 4 faktörlü skor: sıcaklık (60%) + nem (15%) + rüzgâr (15%) + bulut örtüsü (10%)
- p95 yanıt 48ms, Redis cache hit %91
- 81 il × 973 ilçe coğrafi kapsam hedefi

---

## 2. Pazar Analizi — Türkiye Tarım Sektörü

### Ölçek
- **3 milyon** çiftçi aile (TÜİK)
- **25 milyon hektar** tarım arazisi
- Tarım sektörü yıllık katma değer **~50 milyar USD** (GSYH'nin ~6%)
- Sigortalı tarım alanı ~**4 milyon hektar** (Tarsim 2024) — büyüme potansiyeli
- Yıllık **don hasarı 2-5 milyar TL** (meyve bahçeleri, narenciye, çay, fındık)
- Ziraat Bankası tarım kredisi bakiyesi **~300 milyar TL**

### Büyüme sürükleyicileri
1. **İklim değişikliği** — anomalilerde artış, risk yönetimi ihtiyacı yükselir
2. **Dijital tarım politikası** — Bakanlık 2023-2030 yol haritasında akıllı tarım teşviki
3. **Sigortalı alan artışı** — Tarsim'in genişlemesi + özel sigorta oyuncuları
4. **İhracat baskısı** — Yaş meyve/sebze ihracatında AB kalite standartları (takip sistemi zorunluluğu)
5. **Gen Z çiftçiler** — mobil-öncelikli, SaaS aboneliğine açık (10-15 yıl ufku)

### Pazar segmentleri
| Segment | Adet | Ödeme gücü | Öncelik |
|---------|------|------------|---------|
| Küçük aile çiftçisi (1-10 dönüm) | ~2.2M | Düşük/Freemium | Büyüme motoru (adet) |
| Orta ölçek (10-100 dönüm) | ~600k | Aylık ₺100-500 | **Birincil SaaS hedef** |
| Büyük çiftlik / şirket | ~40k | Aylık ₺1k-10k | Enterprise |
| Kooperatif/birlik | ~1.500 | Üye bazlı ₺50-200 | Toplu satış |
| Zirai ilaç/gübre firmaları | ~300 büyük | Yıllık ₺50k-500k | Co-branding |
| Tohum/fide firmaları | ~500 | ₺10k-100k | Widget lisansı |
| Sigorta şirketleri | ~15 | ₺100k-5M | Data + SLA |
| İl tarım müdürlükleri | 81 | Kamu ihale | SLA kontratı |
| Ziraat Bankası/tarım bankaları | 3 | Kurumsal | API lisansı |

---

## 3. Rakip Analizi

### Türkiye'deki doğrudan rakipler

| Rakip | Güçlü yanı | Zayıf yanı | TarımİKlim avantajı |
|-------|-----------|------------|----------------------|
| **Doktar** | Uydu görüntü analizi, büyük müşteri portföyü | Premium fiyat, karmaşık UI | Daha odaklı (iklim/don), ucuz, widget dağıtım |
| **Tarımhub** | Bakanlık teşviki, geniş içerik | Gerçek zamanlı zayıf, don modeli yok | 4-faktörlü don, canlı API |
| **Agrio** | Hastalık tespit AI | Sadece görüntü, iklim yok | Entegre ekosistem |
| **MGM kamu** | Ücretsiz, resmi | Uyarı motoru yok, lokasyon kaba | Parsel seviyesi, SMS/TG push |
| **Weather.com / Mobile uygulamalar** | Dünya çapında marka | Tarım jargonu yok | Zirai ilaçlama, sulama, don skorları |

### Yurt dışı referanslar (inspirasyon)
- **Climate FieldView** (Bayer) — B2B çiftçi platformu, ABD/Kanada
- **Agrimetrics** — UK, veri lisanslama ağırlıklı
- **aWhere** — global, parametric insurance data tedarikçisi
- **Sencrop** — Fransa, IoT iklim istasyonu + abonelik combo (€300/yıl istasyon + €99/yıl SaaS)
- **Ondo (ex-Wiseconn)** — akıllı sulama, ABD

**Çıkarım:** TarımİKlim'in pozisyonu "**Sencrop tarzı IoT+SaaS + Climate FieldView tarzı API + yerel pazar uzmanlığı**". Donanım kolu eklenirse tam ürün haline gelir.

---

## 4. Gelir Modelleri — 15 Kanal Analizi

Kanal başına: açıklama + hedef segment + tahmini marj + start-up zorluğu (1-5) + 12 aylık ciro potansiyeli.

### 4.1. SaaS Abonelik (Freemium) — **Birincil kanal**
**Model:** Aylık/yıllık tekrarlayan gelir (MRR/ARR). Kademeli planlar.

| Plan | Aylık | Özellikler | Hedef kitle |
|------|-------|-----------|-------------|
| **Çiftçi (Free)** | ₺0 | 1 lokasyon, 7g tahmin, Telegram uyarı, günlük 100 API isteği | Edinim motoru |
| **Başlangıç** | ₺199/ay | 5 parsel, 14g tahmin, SMS+TG, 10k API/ay | Orta ölçek çiftçi |
| **Profesyonel** | ₺599/ay | Sınırsız parsel, saatlik tahmin, WhatsApp, 50k API, IoT hook | Büyük çiftlik, kooperatif başkanı |
| **Kurumsal** | ₺2.499+/ay | White-label, SLA, özel don algoritması, sınırsız API | Şirket çiftlik, sigorta |

**Marj:** %75-85 (API maliyeti marjinal)
**Zorluk:** 2/5 (Iyzico entegrasyonu + tier mantığı)
**12 ay potansiyel:** 500 Başlangıç + 120 Profesyonel + 5 Kurumsal ≈ **₺2.3M**

### 4.2. B2B Widget Lisansı
**Model:** Tohum, gübre, zirai ilaç firmaları ve kooperatif siteleri için co-branded widget.

- Giriş paketi: **₺8.000/yıl** (standart widget, marka renk ayarı)
- Premium: **₺25.000/yıl** (özel lokasyon, SLA, istatistik paneli)
- Enterprise: **₺60.000+/yıl** (white-label, custom algoritma)

**Hedef ilk 12 ay:** 25 müşteri × ortalama ₺15k = **₺375k**
**Marj:** %90+ (mevcut altyapı kullanılır)
**Zorluk:** 2/5 (satış hattı kurulumu)

**Mevcut referans:** Bereketfide + VistaSeed (ücretsiz kardeş proje — vaka çalışması).

### 4.3. API Marketplace (Developer Ticketing)
**Model:** Tarım yazılımı geliştiren şirketlere API satışı. RapidAPI/benzer marketplace'te listeleme.

- Developer: ₺0 — 10k/ay (marketing)
- Startup: **₺499/ay** — 500k req
- Scale: **₺1.999/ay** — 5M req
- Custom: **₺10k+/ay** — SLA

**Hedef kitle:** ERP yazılımcıları, zirai ilaç firma yazılımları, çiftlik yönetim SaaS'ları, akademik araştırmalar.

**12 ay potansiyel:** 30 Startup + 5 Scale ≈ **₺250k**
**Marj:** %85
**Zorluk:** 3/5 (API key yönetimi, rate limit, fatura)

### 4.4. SMS / WhatsApp / Push Bildirim Paketi
**Model:** Ücretsiz Telegram yanında ücretli kanallar.

- SMS: **₺5/ay kullanıcı başı** (Netgsm üzerinden, marj %40)
- WhatsApp Business: **₺15/ay** (Meta API, marj %50)
- Push (iOS/Android): Freemium

**Hedef 12 ay:** 3.000 SMS kullanıcısı × ₺5 = **₺180k** + 800 WA × ₺15 = ₺144k = **₺324k**
**Marj:** %45 (provider maliyeti)
**Zorluk:** 2/5

### 4.5. Kurumsal / Kamu İhale
**Model:** İl tarım müdürlükleri, TAGEM, kalkınma ajansları için SLA'lı don uyarı sistemi.

- Pilot il (3 ay): **₺80k–150k**
- Yıllık SLA: **₺250k–500k/il**
- Ulusal ihale (Bakanlık): ₺2M+

**Hedef 12 ay:** 2 il pilot (₺100k × 2) + 1 ihale = **₺500k**
**Marj:** %60 (operasyon + rapor + yol)
**Zorluk:** 4/5 (ihale süreci uzun, network gerek)

**Aksiyon:** Antalya Tarım İl Müd. + Tarsim + TAGEM ile mayıs-haziran 2026 görüşmeleri. 1 pilot referansı olursa diğer iller zinciri açılır.

### 4.6. Sigorta İş Birliği — Parametrik Sigorta
**Model:** Don olayı tetiklediğinde otomatik tazminat (iklim verisi kanıt). Sigorta şirketlerine data + tetikleyici servisi.

- Revenue share: prim başına **%3-8**
- Ya da yıllık kurumsal lisans: **₺500k–2M/sigorta şirketi**
- Tarsim ile kamusal pilot

**Hedef kitle:** Tarsim, Aksigorta, Allianz Türkiye, Axa Tarım, Ziraat Sigorta.

**12 ay potansiyel (gerçekçi):** 1 pilot + 2 küçük anlaşma = **₺600k**
**24 ay potansiyel:** ₺5M+ (birkaç şirket × revenue share)
**Marj:** %70
**Zorluk:** 5/5 (uzun satış döngüsü, regülasyon, aktüerya provesi)

**Not:** Bu **en yüksek marjlı ve ölçeklenebilir kanal**. Erken dönem önceliklendirilmeli.

### 4.7. IoT İklim İstasyonu (Donanım + Abonelik)
**Model:** Sencrop benzeri ESP32+LoRaWAN küçük istasyon + aylık abonelik.

- Donanım: **₺2.499** (BOM ~₺800, marj %50)
- Aylık abonelik (canlı veri + alarm): **₺99/ay**
- Kooperatif paketi: 10+ istasyon ≥ %20 indirim

**12 ay potansiyel:** 150 ünite × ₺2.499 + 100 aktif abonelik × ₺99 × 6 ay ort. = ₺375k + ₺59k = **₺434k**
**Marj:** %40 (donanım) + %90 (abonelik)
**Zorluk:** 5/5 (donanım tedariki, üretim, sertifika, lojistik)

**Öneri:** 9-12. ay prototip, 12-18. ay küçük seri üretim. Türkiye'de elektronik tedarikçi (Şişli, Karaköy) ile ortaklık.

### 4.8. E-ticaret Affiliate
**Model:** Don/yağış tahmininde önleyici ürün önerisi (don örtü, sis makinesi, sera ısıtma, sulama timer'ı) Trendyol/Hepsiburada/Amazon affiliate.

**12 ay potansiyel:** Panel trafik 50k/ay → %2 tıklama → ort. ₺3 komisyon × 1.000 tıklama × 12 = **₺36k** (küçük ama sıfır iş)
**Marj:** %100
**Zorluk:** 1/5

### 4.9. Data Lisanslama (B2B Research)
**Model:** 3-5 yıllık iklim + don + verim anonim veri seti satışı.

**Alıcılar:** Üniversiteler (İstanbul Tek., ODTÜ, Akdeniz Üni.), AR-GE merkezleri, sigorta aktüeryaları, MGM bile.

- Bir seferlik paket: **₺20k–100k**
- Yıllık abonelik: **₺50k–200k**

**12 ay potansiyel:** 3 alıcı = **₺150k**
**Marj:** %95
**Zorluk:** 3/5 (KVKK uyumu, anonim format)

### 4.10. Marketplace Komisyonu (Ekosistem içi)
**Model:** VistaSeed B2B tohum pazarı + Bereketfide fide + Tarımsal Girdi Karşılaştırma içinde TarımİKlim tavsiyesi ile satılan ürün komisyonu.

- Komisyon: **%3-5 satılan ürün**
- Ekosistem içi — minimum operasyon

**12 ay potansiyel:** Ekosistem ticaret hacmi ₺5M olursa × %4 = **₺200k**
**Marj:** %100
**Zorluk:** 2/5 (tracking + backend)

### 4.11. Zirai Girdi Firmaları — Sponsored Bildirim
**Model:** Syngenta, Bayer, BASF, Doğuş Tarım sponsored uyarılar.

- "Don sonrası Bayer MoveUp üres uygulaması" gibi — bildirim başı **₺0.50–2**
- Aylık sponsor paketi: **₺15k–50k**

**12 ay potansiyel:** 3 sponsor × ₺20k avg × 12 ay = ₺720k ama reel 6 ay × 2 sponsor = **₺240k**
**Marj:** %80
**Zorluk:** 3/5 (BD satış + editör süzgeç)

**Risk:** Marka algısı — ÇOK dikkatli editöryal süzgeç gerek (kullanıcı güveni > reklam geliri).

### 4.12. Kooperatif / Birlik Partnership
**Model:** Antalya sera kooperatifi, Konya tahıl birliği, Bursa zeytin birliği gibi kuruluşlarla üye-bazlı abonelik.

- Üye başı: **₺50/ay**
- Min 100 üye alımı → %20 indirim
- Kooperatif paneli (üye hava takibi, toplu bildirim)

**12 ay potansiyel:** 5 koop × 200 üye avg × ₺40 × 8 ay avg = **₺320k**
**Marj:** %80
**Zorluk:** 3/5 (satış döngüsü uzun, ilişki bazlı)

### 4.13. Mobil Uygulama Premium
**Model:** App Store / Google Play ayrı premium.

- Aylık: **$3.99 (₺135)** veya yıllık $29.99
- Özellikler: sınırsız parsel çiz, offline tahmin, 30 gün geçmiş

**12 ay potansiyel:** Mobile app Q3 2026'da. Yıl 1 sonunda 500 premium × ₺100 × 3 ay = **₺150k**
**Marj:** %70 (store %30 kesinti)
**Zorluk:** 4/5 (iOS + Android gelişim)

### 4.14. Eğitim / İçerik (TarGO ile entegre)
**Model:** Don koruma, sulama, zirai ilaçlama kursları. Ekosistem TarGO prototipi.

- Kurs: **₺99–499/kurs**
- Sertifika: **₺299 ek**
- Yıllık üyelik: **₺999 (tüm kurslar)**

**12 ay potansiyel:** 300 satış × ortalama ₺300 = **₺90k**
**Marj:** %75 (üretim maliyeti)
**Zorluk:** 3/5 (içerik üretimi)

### 4.15. AB/IPARD/Horizon Fonları
**Model:** Gelir değil ama **gelir desteği** — sermaye, burs.

- IPARD II/III: tarım dijital projelerinde %50-70 hibe
- Horizon Europe (EIT Food, AgriChain): €200k–2M
- TÜBİTAK 1507, 1512, 1832

**12 ay potansiyel:** 1 proje kabul × ₺500k = **₺500k (gelir değil hibe)**
**Zorluk:** 4/5 (başvuru, raporlama, ortak arama)

**Öneri:** TAGEM veya üniversite ile ortak başvuru — IPARD 2026 dönemi için hazırlık Haziran 2026'da başlamalı.

---

## 5. Önerilen Yol Haritası — 4 Faz

### 🟢 FAZ 1 (0-3 ay) — Gelir Altyapısı + İlk Ödeme

**Hedef:** Ay 3 sonunda ₺100k ilk ciro + 50 ödeme yapan müşteri.

**İşler:**
- [ ] Iyzico veya Stripe entegrasyonu (2 hafta)
- [ ] SaaS plan sayfası (`/fiyat`, `/abone-ol`) — Türkçe, KVKK uyumlu
- [ ] Çiftçi (Free), Başlangıç (₺199), Profesyonel (₺599) planları canlıya
- [ ] API key yönetimi + rate limit (mevcut Fastify + Redis ile)
- [ ] Admin panel: müşteri, fatura, abone listesi
- [ ] KVKK aydınlatma + üyelik sözleşmesi + cayma hakkı sayfaları
- [ ] Google Analytics 4 + Meta Pixel (dönüşüm takibi)
- [ ] İlk B2B satış kiti: widget demo video + fiyat PDF + referans sayfası

**Müşteri edinim:**
- İlk 3 ay ücretsiz Telegram kanalı — "Don Uyarısı TR" (viral potansiyel)
- Bereketfide + VistaSeed mevcut kullanıcılarına cross-sell (e-posta)
- 10 içerik yazısı SEO: "don koruma teknikleri", "parselden sulama tahmini", "saatlik hava radar"
- Instagram/LinkedIn organik (tarım influencer'ları ile iş birliği — 3 kişi)
- 5 kooperatif demo görüşmesi (Antalya başta)

**KPI:**
- Ücretsiz kullanıcı 1.500+ (edinim)
- Ödeme yapan 50+ (conversion %3.5)
- Widget müşterisi 3+

### 🟡 FAZ 2 (3-6 ay) — Büyüme + Kurumsal Başlangıç

**Hedef:** Aylık MRR ₺150k (yıllık ₺1.8M run rate) + 1 il tarım müd. pilotu.

**İşler:**
- [ ] SMS/WhatsApp bildirim paketi
- [ ] RapidAPI listeleme + developer portal (`dev.tarimiklim.com`)
- [ ] B2B satış ekibi: 1 kişi BD (part-time → tam zamanlı)
- [ ] 3 kooperatif sözleşmesi
- [ ] Antalya / Konya / Bursa İl Tarım Md. + TAGEM görüşmeleri
- [ ] Sigorta şirketi ilk temas (Tarsim, Axa)
- [ ] E-ticaret affiliate entegrasyonu (Trendyol/Hepsiburada)
- [ ] Basın çalışması: Agritech dergileri, Anadolu Ajansı tarım ekibi

**KPI:**
- MRR ₺100k+
- 500+ ödeme yapan kullanıcı
- 15 widget müşterisi
- 1 il pilot kontratı imzalı

### 🟠 FAZ 3 (6-12 ay) — Parametrik Sigorta + IoT + Mobile

**Hedef:** Yıl 1 sonunda ciro ₺3.5M–5M. IoT + mobil + sigorta pilotları aktif.

**İşler:**
- [ ] Tarsim ile parametrik don sigortası pilotu (1 il × 1 ürün, örn. Antalya narenciye)
- [ ] IoT istasyonu v1 (100 ünite küçük seri) — kooperatif pilotları
- [ ] iOS + Android uygulamaları (React Native veya native)
- [ ] Data lisanslama — 2 akademik ortak + 1 sigorta aktüerya
- [ ] Enterprise white-label — ilk 3 şirket (tohum firması + gübre üreticisi + zirai ilaç)
- [ ] IPARD/TÜBİTAK başvurusu (hibe destek)
- [ ] Horizon Europe partner arama (AB ortaklı proje)

**KPI:**
- ARR ₺4M+
- 2.000+ ödeme yapan
- 5 widget + 3 enterprise + 1 sigorta pilot
- IoT 100+ ünite sahada

### 🔴 FAZ 4 (12-24 ay) — Ölçek + Coğrafi Genişleme

**Hedef:** ARR ₺15M+. Türkiye'nin tarım iklim standart servisi olmak.

**İşler:**
- [ ] Balkanlar (Bulgaristan, Makedonya, Yunanistan tarım pazarı benzer)
- [ ] Orta Asya (Özbekistan, Kazakistan — pamuk/hububat)
- [ ] Kuzey Afrika (Tunus, Fas — narenciye/zeytin)
- [ ] Kurumsal satış ekibi (5 kişi: CRO + 3 BD + 1 CS)
- [ ] B2B kurumsal SaaS ₺100k+/yıl anlaşmaları
- [ ] Seri A yatırım görüşmesi (₺50-100M değerleme)
- [ ] Ziraat Bankası / Tarım Kredi Kooperatifleri ile kredi-bağlantılı servis (don hasarı sonrası hızlı kredi)

---

## 6. Finansal Projeksiyon (Baz Senaryo)

### Gelir — 12 ay (aylık kümülatif MRR/ARR dağılımı)

| Kanal | Ay 3 | Ay 6 | Ay 9 | Ay 12 | Yıl 1 toplam |
|-------|------|------|------|-------|--------------|
| SaaS abonelik | ₺30k | ₺90k | ₺160k | ₺210k MRR | **₺1.8M** |
| Widget lisans | ₺45k | ₺110k | ₺200k | ₺350k | **₺350k** |
| API marketplace | ₺5k | ₺20k | ₺60k | ₺120k | **₺200k** |
| SMS/WA paketi | ₺10k | ₺40k | ₺80k | ₺120k MRR | **₺280k** |
| Kurumsal / kamu | 0 | ₺100k | ₺300k | ₺500k kümülatif | **₺500k** |
| Sigorta pilot | 0 | 0 | ₺150k | ₺600k | **₺600k** |
| Kooperatif | 0 | ₺60k | ₺180k | ₺320k kümülatif | **₺320k** |
| E-ticaret affiliate | ₺2k | ₺8k | ₺18k | ₺36k kümülatif | **₺36k** |
| Diğer (içerik, data, vs.) | 0 | ₺30k | ₺100k | ₺200k | **₺240k** |
| **TOPLAM Yıl 1** | | | | | **≈ ₺4.3M** |

### Maliyet — 12 ay

| Kalem | Aylık | Yıllık |
|-------|-------|--------|
| OpenWeatherMap API (Pro plan) | ₺6k | ₺72k |
| VPS + CDN + Redis + backup | ₺8k | ₺96k |
| SMS/WhatsApp tedarikçi (provider payback) | ₺25k (gelir kalemiyle orantılı) | ₺300k |
| Geliştirici ekibi (2-3 kişi) | ₺180k | ₺2.16M |
| BD/Satış (part-time → tam) | ₺35k | ₺420k |
| Marketing (perf + content + influencer) | ₺40k | ₺480k |
| KVKK / hukuki / muhasebe | ₺10k | ₺120k |
| Kurumsal ofis + seyahat | ₺15k | ₺180k |
| **TOPLAM yıllık maliyet** | | **≈ ₺3.83M** |

**Yıl 1 net durum:** Ciro ₺4.3M – maliyet ₺3.83M = **≈ ₺470k kâr** (marj %11, re-investman için yetersiz ama **break-even sağlandı**).

### Yıl 2 (ölçek sonrası)
- ARR **₺12M–18M** hedefi
- Net marj **%25-35**
- Net kâr potansiyeli **₺3M–5M** (re-investman + dağıtım)

---

## 7. Risk ve Mitigasyon

| Risk | Olasılık | Etki | Mitigasyon |
|------|----------|------|-----------|
| OpenWeatherMap fiyat artışı / API iptal | Düşük | Yüksek | Open-Meteo fallback + MGM yerel veri (zaten var) |
| Yerli rakip büyük oyuncu girer (Doktar/Vodafone) | Orta | Yüksek | Niş odak (don+sulama), ekosistem iş birlikleri, yerli dil avantajı |
| Don algoritması yanlış uyarı | Orta | Yüksek | Sigorta iddialı anlaşmada cayma maddesi, iterative iyileştirme, disclaimer |
| Müşteri edinim maliyeti (CAC) çok yüksek | Orta | Orta | Ekosistem cross-sell (Bereketfide/VistaSeed zaten var), kooperatif toptan satış |
| Ekip tükenmesi (solo founder yükü) | Yüksek | Yüksek | BD kişi işe alımı ay 3, ortak aday arama |
| KVKK/regülasyon uyum hatası | Düşük | Yüksek | Hukuki danışmanlık ay 1, aydınlatma metinleri |
| Döviz volatilitesi (API/altyapı $) | Yüksek | Orta | Yıllık $ ödeme kilit, yerli alternatifler planı |
| Sigorta pilotu başarısız | Orta | Orta | 1 pilot yerine 3 küçük pilot paralel, öğren-iterate |
| IoT tedarik gecikmeleri | Yüksek | Orta | 9. aya kadar erteleme seçeneği, önce SaaS+API odağı |

---

## 8. İlk 90 Gün — Somut Aksiyon Planı

### Hafta 1-2
- [ ] Iyzico hesap açılış + entegrasyon test ortamı
- [ ] Plan yapısı DB seed: `plans`, `subscriptions`, `invoices` tabloları (shared-backend'e eklenebilir)
- [ ] KVKK uyum: aydınlatma metni + cookie banner + veri saklama politikası
- [ ] 3 SaaS plan tanımlaması (Çiftçi Free, Başlangıç ₺199, Profesyonel ₺599)

### Hafta 3-4
- [ ] Fiyat sayfası (`/fiyat`, `/tr/fiyat`) + abonelik checkout akışı
- [ ] API key sistemi: her kullanıcı → bir `tk_live_` key, rate limit redis
- [ ] Fatura + e-Arşiv entegrasyonu (GİB API)
- [ ] Satış kiti v1: 1 sayfa fiyat PDF + demo video (30 sn) + referans listesi
- [ ] 5 kooperatif demo görüşmesi (Antalya Merkez + Kumluca + Korkuteli + Konya Ereğli + Bursa Mustafakemalpaşa)

### Hafta 5-8
- [ ] Google Analytics 4 + Meta Pixel + Hotjar
- [ ] 10 SEO içerik yazısı (hafta başı 1 — kümülatif)
- [ ] Telegram Don Uyarısı TR kanalı lansman (10k takipçi hedefi 90 gün)
- [ ] İlk 3 widget müşterisi kapat (tohum/fide firması)
- [ ] Antalya İl Tarım Md. + TAGEM ilk toplantı

### Hafta 9-12
- [ ] RapidAPI developer portal
- [ ] SMS bildirim paketi beta
- [ ] Basın bülteni: "TarımİKlim beta sonrası ücretsiz-premium planlar" — Tarım Dünyası, Çiftçi Gazetesi
- [ ] İlk sigorta şirketi (Aksigorta/Axa) temas
- [ ] Yıl 1 plana istinaden yıl 2 için AB ortak arama (Horizon Europe)
- [ ] Analiz: ilk 90 gün metrikleri, FAZ 2 planı revize

---

## 9. Metrikler (KPI) — Sürekli Takip

### Ürün
- **DAU/WAU/MAU** (daily/weekly/monthly active users)
- **API çağrı başı** = günlük toplam endpoint request
- **Canlı panel yüklenme** (don-uyarisi sayfa ziyaret)
- **Widget embed sayısı** = aktif domain
- **Don uyarı doğruluk oranı** (gerçekleşen vs tahmin — ay sonu rapor)

### Büyüme
- **Ücretsiz kayıt hızı** (günlük yeni kullanıcı)
- **Free → Paid dönüşüm oranı** (%3 sektör ort., hedef %5)
- **Churn** (aylık iptal oranı, hedef <%5)
- **NPS** (net promoter score, çeyreklik)

### Finansal
- **MRR (aylık tekrarlayan gelir)** — kutsal metrik
- **ARR (yıllık)** = MRR × 12
- **CAC** (müşteri edinim maliyeti, hedef <3 aylık ARPU)
- **LTV** (müşteri yaşam değeri, hedef LTV/CAC > 3x)
- **Gross margin %**

### Sektör-özel
- Kritik don olayında gönderilen uyarı sayısı (sezonluk)
- Sulama tasarrufu ortalaması (pilot müşteri raporları)
- IoT ünite sayısı sahada
- Sigorta tetiklenen tazminat tutarı (revenue share bazı)

---

## 10. Özet Tavsiye

TarımİKlim **düşük maliyetli SaaS freemium'la canlıda gelir başlatabilecek olgunlukta**. 90 gün içinde ilk ₺100k ciroya ulaşmak realist. Asıl katma değer **yıl 2'den itibaren parametrik sigorta ve kurumsal SaaS** kanallarıyla açığa çıkar.

**Üç kritik yatırım:**
1. **Ödeme + SaaS altyapısı** (FAZ 1) — tek başına yapılabilir, 2-3 hafta.
2. **BD/Satış insanı** (FAZ 2) — tek başına solo kapatılamayacak B2B satışların başlangıcı. **En zayıf halka**.
3. **Parametrik sigorta anlaşması** (FAZ 3) — en yüksek marj, en kalıcı gelir. **En değerli oyun hamlesi**.

**Stratejik zirveler (bugün verilmeli olan kararlar):**
- ✅ Ücretsiz tier agresif olmalı — 81 il × 1 parsel × Telegram. Network etkisi ≫ kısa vadeli kayıp.
- ✅ API açık ve iyi dokümante — ekosistem effect'i kritik.
- ✅ Ekosistem kardeşleri (Bereketfide, VistaSeed) **referans**. "Aynı iklim beyni — 3 farklı uygulama" satış hikayesi güçlü.
- ⚠️ Aşırı feature creep'e kapılma — FAZ 1 sonunda IoT donanıma başlama. Yazılım kanalları doygunlaşmadan donanım fragmente eder.
- ⚠️ Müşteri tipi doğrulama: orta ölçek çiftçi (10-100 dönüm) gerçek ödeyen. Onlarla 20+ görüşme yap (discovery) FAZ 1'de.

---

**Bu rapor yaşayan bir belge:** her çeyrekte güncellemek gerekir (pazarlar, rakipler, müşteri davranışı değişir). Gerçek rakamlar geldikçe tahminler kalibre edilir.

*İletişim: destek@tarimiklim.com · Vista Tarım Teknolojileri A.Ş. Antalya · Türkiye*
