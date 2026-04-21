# Şirket Kurulum Planı — GWD Teknoloji Ltd. Şti.

**Hazırlanma:** 2026-04-18
**Hedef:** Eşin adına tek ortaklı Ltd. şirket kurulumu — Tarvista ekosisteminin yazılım hizmetleri için
**Süre:** 3-4 hafta (kuruluştan ilk havaleye kadar)

---

## 1. Özet

Bu Ltd. şirketin **iki hedefi** var:

1. **Gelir kanalı** — Tarvista A.Ş. ekosisteminin (tarimiklim, bereketfide, vistaseeds ve 20+ site) yazılım geliştirme ve operasyon hizmetlerini aylık hizmet bedeli karşılığı sağlayacak B2B yazılım şirketi. Ayrıca kendi markası altında IoT/elektronik/bağımsız SaaS ürünleri satışı.
2. **Aile birleşimi desteği** — eşin Türkiye'de kendi geliri + şirketi olması, Almanya'ya vize/oturum başvurularında finansal bağımsızlık ve dönüş bağı kanıtı olarak kullanılacak

**Şirket sahibi:** Eş, tek ortak (%100 pay sahibi + müdür)
**Yapı:** Tek ortaklı Limited Şirket (Türk TTK 573)
**Konum:** Bursa / Gemlik
**Faaliyet:** Yazılım geliştirme, bilgisayar danışmanlığı, veri işleme, reklam, elektronik ürün satışı

### Tarvista Hakkında

Tarvista A.Ş. küçük bir startup değil, kurumsal yapıya sahip:
- ~%10 Türkiye tohum/fide pazar payı
- ~200 mühendis kadrosu
- **Bereketfide** ve **VistaSeeds** Tarvista'nın alt markaları (ayrı şirketler değil, aynı çatı altında — web siteleri canlıda)
- Çekirdek iş tohum/fide ticareti; dijital ekosistem onlar için müşteri edinim + marka kanalı
- Dijital gelirlerde gözü yok — bu sebeple %100 dijital gelirin Ltd.'ye bırakılması (aşağıdaki revenue matrix) onlar için problem değil

Bu ölçek müzakerelerde hatırlanmalı — Tarvista'nın hukuk departmanı var, sözleşmeler kurumsal standartta olmalı.

---

## 2. Şirket İsmi

### Alternatifler

**Karar (2026-04-18):** **GWD Teknoloji Ltd. Şti.**

**Sebepleri:**
- GWD = Guezel Web Design — Orhan'ın mevcut marka kimliği, tarimiklim commit'lerinde zaten kullanılıyor ("GWD kredisi" vb.)
- Sürekliliği koruyor — 10+ yıllık marka altyapısı Ltd.'ye taşınır
- "Güzel" soyadı hem eşte hem Orhan'da — muvazaa argümanına karşı "aile işi" doğal savunma
- Marka tescil başvurusu kolay (TURKPATENT, başka "GWD Teknoloji" muhtemelen yok)
- Yurtdışı müşteri için de uluslararası görünüm (İngilizce harf dizgisi)

**Resmi uzun ad (avukat + müşavir netleştirecek):**
- `GWD Teknoloji Bilişim Limited Şirketi` veya
- `GWD Teknoloji Yazılım ve Bilişim Limited Şirketi`

---

## 3. Şirket Yapısı

### Hukuki Yapı
- **Tür:** Limited Şirket
- **Ortak sayısı:** 1 (tek ortaklı — TTK 573 gereği 2012'den beri mümkün)
- **Ortak:** Eş — %100 pay
- **Müdür:** Eş (tek müdür, imza yetkilisi)
- **Sermaye:** ₺50.000 taahhüt (fiili ödeme 24 ay içinde, ilk başta ödeme şart değil, kademeli yatırılabilir)

### NACE Kodları

| Kod | Faaliyet | Amaç |
|-----|----------|------|
| **62.01.01** | Bilgisayar programlama faaliyetleri | ANA — SaaS geliştirme, ekosistem yazılım |
| 62.02 | Bilgisayar danışmanlığı | Müşteri danışmanlığı |
| 63.11 | Veri işleme, barındırma | API marketplace, widget hosting |
| 73.11 | Reklam hizmeti | Widget lisans, sponsored notification |
| 46.52 | Elektronik ve telekomünikasyon ekipmanları toptan | IoT istasyonu toptan satış (kooperatif paketleri) |
| 47.91.13 | İnternet üzerinden elektronik/telekom perakende | Online sensör satışı |
| 47.41.02 | Bilgisayar, yazılım perakende | Kendi bağımsız SaaS ürün satışı |
| 26.51 | Ölçme, kontrol, test ekipmanları imalatı | IoT cihaz üretim/montaj (ileride) |

**Not:** Tarım ürünleri (tohum, fide) NACE kodları bu şirkette **değil** — onlar Tarvista'nın alt markaları (Bereketfide, VistaSeeds) üzerinden satılmaya devam edecek.

---

## 4. Gelir Paylaşımı ve Akışı

### Revenue Share Matrisi (%100 / %0 clean split)

| Gelir tipi | Kim tahsil eder | Pay |
|-----------|-----------------|-----|
| Yazılım / SaaS abonelik / API / widget / reklam / **platform komisyonu** | Tarvista veya Ltd. (sub-merchant) | **%100 Ltd.** |
| Tarım ürünü (tohum, fide) — Tarvista/Bereketfide/VistaSeeds | Tarvista (ana merchant) | **%100 Tarvista** |
| Ltd.'nin kendi kanalından IoT/elektronik/bağımsız SaaS | Ltd. | **%100 Ltd.** |
| Ltd.'nin ürünü Tarvista site'sinde satılırsa | Tarvista tahsil, Ltd.'ye aktarır | **%100 Ltd.** |

**İki taraf iki alan. Paylaşma yok.** Müzakere basit — herkes kendi kategorisini %100 alır.

### Para Akışı (Faz 1 — Iyzico Sub-Merchant)

```
Müşteri (çiftçi, kooperatif, B2B firma) → kart ödemesi
                        │
                        ▼
        Tarvista Iyzico (Marketplace paketi, ana merchant)
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
   Ürün satışı (tohum, fide)     Yazılım/abonelik/reklam/
   %100 Tarvista IBAN            platform komisyonu
                                 %100 GWD Teknoloji IBAN
                                 (ALT ÜYE İŞYERİ / sub-merchant)
                                       │
                                       ▼
                            Eşin bireysel hesabı
                                       │
                                       ▼
                          Orhan (aile içi transfer)
```

### Neden B2B Pass-Through Değil, Sub-Merchant?

Önce "Faz 1 B2B havale, Faz 2 sub-merchant" düşünmüştük. Ama **%100/%0 split** kararlaştığı için B2B pass-through muhasebe açısından sorunlu:

**Problem:** Tarvista defterinde her ay şu akış görünür:
- Gelir: Yazılım satışından ₺X (müşteriden)
- Gider: Ltd.'ye hizmet bedeli ₺X (aynı miktar)
- Kâr: ₺0

Vergi denetçisi bakınca "niye Tarvista aracı, hiç komisyon almıyor?" diye soru işareti koyabilir. Pass-through vergi optimizasyonu gibi görünür.

**Çözüm:** Sub-merchant modeli baştan → her taraf kendi satışını kendi tahsil eder. Ltd.'nin yazılım satışı = Ltd.'ye doğrudan, Tarvista'nın ürün satışı = Tarvista'ya doğrudan. Muhasebe + vergi tartışmasız.

### Sub-Merchant Başvuru Süreci

- Tarvista Iyzico "Marketplace/Platform" paketine geçer (Tarvista tarafı karar)
- Ltd. kurulur kurulmaz (vergi levhası + banka hesabı + IBAN alındığında) Tarvista'nın Iyzico'sunda alt üye işyeri olarak eklenir
- Onay süresi ~2 hafta
- Teknik entegrasyon: site kodunda her ödeme kalemi için sub-merchant ID belirtilir, Iyzico otomatik yönlendirir
- Faz 1'in 4. haftasında aktif olabilir

---

## 5. Aşamalı Kuruluş Timeline

### Aşama 1 — Hazırlık (Hafta 0)
- Eş: e-Devlet'ten 4A SGK dökümü, nüfus kaydı, ikametgah, vukuatlı nüfus kaydı
- Eş: Gemlik veya Bursa merkezde mali müşavir + Bursa Barosu üyesi şirketler hukuku avukatı seç
- Orhan: Şirket ismi kararı
- Orhan: Mali müşavir ile online tanışma toplantısı (zoom)

### Aşama 2 — Kuruluş (Hafta 1-2)
- Ticaret odası kaydı (eşin adına)
- Ana sözleşme taslağı — NACE kodlarıyla
- E-imza başvurusu (eşin adına)
- İşyeri adresi ayarı (ev adresi veya sanal ofis)
- Ticaret sicili tescil → vergi dairesi → vergi levhası
- KEP (Kayıtlı Elektronik Posta) hesabı aç

**Maliyet:** ~₺10-12k

### Aşama 3 — Banka + Altyapı (Hafta 2-3)
- Ticari banka hesabı (Ziraat veya İş Bankası)
- Online bankacılık + ticari kart
- Muhasebe yazılımı (Logo, Luca, Mikro — müşavir seçer)
- İlk sermaye yatırımı (opsiyonel, %25'i)

### Aşama 4 — Sözleşmeler (Hafta 3-4)
Avukat ile:
- **Tarvista ↔ GWD Teknoloji** Yazılım Hizmet Sözleşmesi
  - Hizmet kapsamı, aylık bedel formülü, ödeme takvimi, fikri mülkiyet, fesih, rekabet yasağı
- **Revenue Share Protokolü**
  - Site bazında gelir kategorileri ve paylaşım oranları
- **(Opsiyonel) Orhan ↔ GWD Teknoloji** Yüklenici Geliştirici Sözleşmesi
  - Muvazaa koruması
- Tarvista tarafı imza
- Noter onayı (opsiyonel — icra takip hakkı verir)

**Maliyet:** ~₺5-10k avukat tek seferlik

### Aşama 5 — İlk Operasyon (Hafta 4+)
- GWD Teknoloji → Tarvista'ya ilk hizmet faturası (geçmiş ay için)
- Tarvista havalesi
- İlk KDV beyanı (ay sonu)
- Bağ-Kur durumu netleşir (SSK aktifse çakışma beyanı, değilse yeni Bağ-Kur)
- Billing kod canlıya (Orhan tarafı, Tarvista site'lerine)

### Aşama 6 — Süreklilik (Aylık)
- KDV beyanı (ayın 26'sı)
- Geçici vergi beyanı (3 ayda bir)
- Yıllık kurumlar vergisi (Nisan)
- Marka tescil başvurusu (TURKPATENT, sonradan, ~₺3-4k)

---

## 6. Bütçe Özeti

| Kalem | Bir Seferlik | Aylık |
|-------|--------------|-------|
| Ltd. kuruluş (sicil + noter + müşavir başlangıç) | ₺10-12k | — |
| Avukat sözleşme paketi | ₺5-10k | — |
| Marka tescil (TURKPATENT, sonradan) | ₺3-4k | — |
| Mali müşavir | — | ₺3-4k |
| Bağ-Kur (SSK çakışmazsa) | — | ₺4-5k |
| Muhasebe yazılımı | — | ₺500-1k |
| Sermaye taahhüt (24 ay içinde ödeme) | ₺50k | — |
| **Hafta 4 sonunda nakit ihtiyacı** | **~₺20-25k** | **~₺8-10k** |

**Sermaye notu:** ₺50k taahhüt edilir ama tek seferde yatırılması zorunlu değil. İlk ayda %25 (₺12.500), kalanı 24 ay içinde kademeli yatırılabilir.

---

## 7. Almanya Aile Birleşimi Bağlantısı

Bu Ltd., eşin Almanya'ya taşınma sürecinde şu noktalarda destekler:

1. **Finansal bağımsızlık kanıtı** — "Almanya'ya yük olmayacak" argümanı için aylık gelir kaydı
2. **Türkiye'ye dönüş bağı** — turist vize başvurusunda "geri dönecek" hikayesini güçlendirir (Türkiye'de ticari faaliyeti var)
3. **Evlilik sahiciliği** — eş + koca aynı ekosistemde çalışıyor, evlilik sahtecilik şüphesini azaltır
4. **Orhan'ın dosyası** — Ltd. üzerinden aile geliri dolaylı yoldan Orhan'ın Almanya'daki finansal gücünü destekler

**Stratejik öneri:** Vize başvurusu şirket kurulur kurulmaz değil, **6-9 ay düzenli gelir akışı** olduktan sonra yapılırsa dosya çok daha güçlü olur. Banka hesabında düzenli girdilerin görünmesi vize memurunun gözünde somut kanıt.

---

## 8. Orhan'ın Paralel Yapabilecekleri (Almanya'dan)

### Bu hafta:
- Şirket ismi kararı (GWD Teknoloji Bilişim veya başka)
- Eş ile mali müşavir online tanışma toplantısı
- Sosyal medya hesapları hazırlık (LinkedIn GWD Teknoloji sayfası, Twitter vb.) — şirket kurulunca hemen açılabilsin

### Paralel teknik işler (Orhan tarafı):
- `docs/billing-implementation-plan.md` — Tarvista site'lerine entegrasyon planı
- `docs/MONETIZATION-STRATEGY.md` revizyonu — Tarvista P&L + GWD Teknoloji P&L ayrı tutulacak
- Kod repo'larında **yeni GitHub organization** — "gwd-teknoloji" gibi, ileride kod transferleri buraya yapılır (ama Tarvista'nın site kodları Tarvista repo'sunda kalacak, GWD Teknoloji'ın ayrı ticari ürünleri olursa oraya)

---

## 9. Riskler ve Dikkat Edilecekler

### Muvazaa riski (Türk Borçlar Kanunu 19)
- Orhan'ın Türkiye'de alacaklıları Ltd.'nin aslında Orhan'ın işi olduğunu iddia edebilir, iptal davası açabilir (5 yıl geriye)
- **Azaltma:**
  - Eş gerçekten yazılımcı ve kod üretiyor (bu fiilen doğru)
  - Kurumsal yazışmalar eşin e-postasından
  - Mali müşavir + avukat sadece eşle muhatap
  - Banka hesabı + Iyzico + Ltd. hesapları eşin adına
  - Orhan "yüklenici geliştirici" olarak sözleşmeli — bağımsız ilişki görünümü

### Borç durumu
- Orhan'ın ₺100k borcu Ltd. kurulumundan **önce** veya **paralel** temizlenmesi ideal
- Temizlemeden Ltd. açılması operasyonel risk değil, ama vize dosyasında soru işareti oluşturabilir

### Aile birleşimi timing
- Acele başvuru yerine 6-9 ay şirket gelir akışı beklemek stratejik
- Almanya'daki Orhan'ın statüsü (iltica sonucu) vize türünü belirler — göç avukatı ile konuşulmalı

---

## 10. Sonraki Adımlar

**Önce karar:**
- [ ] Şirket ismi seçimi (Orhan onayı)

**Sonra paralel:**
- [ ] Eş → mali müşavir + avukat araştırması başlat
- [ ] Orhan → `billing-implementation-plan.md` yazmaya başla
- [ ] Orhan → `esim-icin-kurulum-todo.md` eşe ilet (ayrı dosya)

**3-4 hafta sonra hedef:**
- Ltd. kurulmuş
- Banka hesabı açık
- Sözleşmeler imzalı
- İlk Tarvista havalesi Ltd. hesabına geldi
- Billing yazılımı canlıda

---

## Ekler

- `docs/esim-icin-kurulum-todo.md` — Eş için adım adım aksiyon listesi
- `docs/MONETIZATION-STRATEGY.md` — Gelir stratejisi (revize edilecek)
- `docs/iot-ingestion-plan.md` — Donanım entegrasyonu planı (dondurulmuş, tetikleyici bekliyor)
- `docs/billing-implementation-plan.md` — **Yazılacak** (sonraki iş)
