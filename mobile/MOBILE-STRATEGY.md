# TarımİKlim Mobil — Strateji ve Yol Haritası

**Hazırlayan:** Claude Code · **Tarih:** 2026-04-17
**Bağlı doküman:** [docs/MONETIZATION-STRATEGY.md](../docs/MONETIZATION-STRATEGY.md)

---

## 0. Özet

TarımİKlim mobil uygulaması, ekosistemin **freemium + premium SaaS** modelinin ana gelir kanallarından biri olacak. İlk 12 ay hedefi **500 premium abone × ₺135/ay = ₺65k/ay MRR**.

**Teknoloji kararı: Expo (React Native) + TypeScript.**
- Tek kod tabanı → iOS + Android tek ekip, solo founder için kritik
- Next.js web ile aynı `@agro/shared-types` tipleri kullanılır — backend değişikliği her iki taraftan eş zamanlı
- EAS Build → CI/CD olmadan cloud derleme
- Expo Push → Firebase FCM + APNs proxy, backend sade

Native Swift/Kotlin AGENTS.md'leri **deprecate** edildi (bkz. bölüm 11) — yıl 2+'de 1M+ kullanıcı veya performans gerektiren sahne doğduğunda migration opsiyonu açık.

---

## 1. Teknoloji Tercih Analizi

| Kriter | Expo (React Native) | Native (Swift + Kotlin) | Flutter |
|--------|---------------------|-------------------------|---------|
| Tek kod | ✅ | ❌ 2 ekip | ✅ |
| Ekosistem uyumu | ✅ React/TS zaten stack | ⚠️ ayrı tipler | ⚠️ Dart |
| MVP hızı | ✅ 4-6 hafta | ❌ 3-4 ay | ⚠️ 6-8 hafta |
| Push bildirim | ✅ Expo Push managed | ⚠️ ayrı APNs+FCM setup | ⚠️ ayrı setup |
| Offline/AsyncStorage | ✅ | ✅ | ✅ |
| OTA güncelleme | ✅ EAS Update | ❌ yok | ✅ |
| Harita | ✅ react-native-maps | ✅ MapKit + Google Maps | ⚠️ plugin |
| Kamera/sensor (ileride hastalık tespit) | ✅ expo-camera | ✅ native | ✅ |
| Bundle size | ~40MB | ~8MB iOS / 10MB Android | ~20MB |
| Store onayı | Standart | Standart | Standart |

**Karar: Expo.** Nedeni solo founder, ekosistem TS uyumu, MVP hızı. 1M+ kullanıcı veya 60fps animation ihtiyacı gelirse native migration.

---

## 2. Hedef Kullanıcı Profilleri

### P1. Orta Ölçek Çiftçi (10-100 dönüm)
- Yaş 35-55, iPhone veya orta segment Android
- Günde 3-5 kez hava/don kontrolü
- Sezonluk kritik anlarda yoğun (ilkbahar don, yaz sulama)
- **Ödeme açılımı:** ₺135/ay premium, aylık taahhüt

### P2. Kooperatif Başkanı
- Kooperatif adına 100-500 üyenin hava verisini takip eder
- **Ödeme açılımı:** Kooperatif paketi ₺50/ay × üye (min 100 üye)

### P3. Genç Dijital Çiftçi (Gen Y/Z)
- 25-35 yaş, mobile-first, sosyal medya aktif
- Premium özelliklere açık, iOS/Android eşit
- **Ödeme açılımı:** Yıllık $29.99 (peşin ödeme avantajı)

### P4. Kurumsal Saha Personeli
- Zirai ilaç firması temsilcisi, tarımsal yayım uzmanı, enstitü saha
- Günlük 20+ lokasyon hava durumu sorgusu
- **Ödeme açılımı:** Enterprise white-label (ayrı model, SaaS plan kurumsal)

---

## 3. MVP Özellik Listesi (4-6 hafta)

### Ücretsiz (Free tier)
- [x] Ana ekran: canlı hava (temp, condition, nem, rüzgâr)
- [x] 7 günlük tahmin kartı
- [x] 1 lokasyon (konum izni veya arama)
- [x] Bugün saatlik kısa seri (24 saat)
- [x] Don riski skoru bugün için
- [x] Telegram kanal bilgilendirme
- [x] Onboarding + konum izni akışı
- [x] TR + EN dil

### Premium (Başlangıç — ₺135/ay) — Paywall gösterimi MVP'de, Iyzico ay 3'te
- [ ] 5 parsel/lokasyon
- [ ] 14 günlük tahmin
- [ ] Saatlik 120 saat (5 gün)
- [ ] Push bildirim (don/yağış/ilaçlama uygunluk)
- [ ] Geçmiş 30 gün hava/don arşivi
- [ ] SMS/WhatsApp uyarı (ücretli ek paket)

### Profesyonel (₺599/ay) — FAZ 2
- [ ] Sınırsız parsel
- [ ] Tarla sınırı çizme (Polygon üzerinde hava)
- [ ] Sulama takvimi + ETo hesabı
- [ ] IoT istasyonu canlı bağlama (FAZ 3)
- [ ] Raporlama (PDF çıktı)
- [ ] Kooperatif üye paneli (başkan için)

---

## 4. Ekran Mimarisi (Expo Router)

```
mobile/app/
├── app/
│   ├── _layout.tsx              Root Stack + Drawer
│   ├── (tabs)/
│   │   ├── _layout.tsx          Bottom tabs
│   │   ├── index.tsx            Home — hava kartı + 7g + uyarı
│   │   ├── hourly.tsx           Saatlik tablo
│   │   ├── alerts.tsx           Uyarı listesi + abonelik
│   │   └── settings.tsx         Ayarlar + plan + konum
│   ├── location/
│   │   └── search.tsx           Modal: arama + 81 il + Nominatim
│   ├── paywall.tsx              Premium paywall modal
│   ├── auth/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   └── onboarding/
│       └── index.tsx            İlk açılış (3 slide + konum izni)
├── src/
│   ├── lib/
│   │   ├── api.ts               API client (axios benzeri)
│   │   ├── storage.ts           AsyncStorage wrapper
│   │   ├── location.ts          expo-location + reverse geocode
│   │   └── notifications.ts     Expo Push + token registration
│   ├── components/
│   │   ├── WeatherCard.tsx
│   │   ├── ForecastRow.tsx
│   │   ├── FrostBadge.tsx
│   │   ├── PaywallSheet.tsx
│   │   └── LocationSearch.tsx
│   ├── hooks/
│   │   ├── useWeather.ts
│   │   ├── useLocation.ts
│   │   └── useSubscription.ts
│   ├── theme/
│   │   └── tokens.ts            paper/pine/terra palet (web ile eş)
│   └── types/
│       └── weather.ts           @agro/shared-types ile sync
```

**Routing:** Expo Router (file-based, Next.js benzeri). Deep linking: `tarimiklim://location/search`, `tarimiklim://paywall`.

---

## 5. API Entegrasyonu

Backend zaten hazır (`https://tarimiklim.com/api/v1`). Mobil client:

```ts
// src/lib/api.ts
const API_URL = 'https://tarimiklim.com/api/v1';

export const api = {
  weather: (lat: number, lon: number) =>
    fetch(`${API_URL}/weather?lat=${lat}&lon=${lon}&days=7`),
  current: (lat, lon) => fetch(`${API_URL}/weather/current?lat=${lat}&lon=${lon}`),
  hourly: (lat, lon, slots = 40) =>
    fetch(`${API_URL}/weather/hourly?lat=${lat}&lon=${lon}&slots=${slots}`),
  frostRisk: (lat, lon) => fetch(`${API_URL}/weather/frost-risk?lat=${lat}&lon=${lon}`),
  locations: () => fetch(`${API_URL}/locations?active=true&limit=100`),
};
```

**Auth (FAZ 2):** JWT Bearer + AsyncStorage token. Mevcut `@agro/shared-backend/modules/auth` endpoint'leri kullanılacak.

---

## 6. Bildirim Sistemi

### İlk MVP: Telegram bilgilendirme
- Kayıt sonrası kullanıcıya Telegram kanalı `@tarimiklim` önerisi
- Ücretsiz, tüm kullanıcılara ulaşır

### FAZ 1 sonu: Expo Push Notifications
- `expo-notifications` + backend entegrasyon
- Kullanıcı token kaydı → backend DB (`user_push_tokens` tablosu)
- Don skoru > 60 → kritik bildirim (ücretsiz de dahil, değer önerisi)
- Günlük 06:00 özet bildirim (premium)
- Ücretli: Özel eşik tanımlama, çoklu lokasyon bildirimi, sessiz saatler

### Backend tarafı
`shared-backend/modules/notifications` zaten var. Expo Push tokenleri için küçük ek gerekir:
```sql
CREATE TABLE user_push_tokens (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  expo_token VARCHAR(255) UNIQUE NOT NULL,
  platform ENUM('ios','android') NOT NULL,
  created_at DATETIME DEFAULT NOW()
);
```

---

## 7. Monetization — Mobil Özel

### In-App Subscription (iOS + Android)
- App Store + Google Play abonelik sistemleri
- Store kesinti: **%30 ilk yıl, %15 sonraki yıl** (Apple/Google small business program)
- Ya da **Iyzico üzerinden web'den** satış → iOS/Android'de "paywall göster + web'e yönlendir" → kesinti %0, ama Apple ciddiyetle yasaklar (reader rule hariç)

**Strateji:** Hybrid model.
- iOS: In-App Purchase ZORUNLU (Apple Guideline 3.1.1). ₺135/ay tutarı 3.99 USD tier'ına oturur. **%30 kesinti kabul.**
- Android: Google Play Billing **tercihli** ama harici ödeme izni daha esnek. **Iyzico ile %30 vs %0 karşılaştırma, kullanıcıya seçim sun.**
- Web: Iyzico birincil (kesintisiz).

### Plan Fiyatlandırma
| Plan | Aylık | Yıllık (%25 indirim) | Web üzerinden | App Store/Play |
|------|-------|----------------------|---------------|-----------------|
| Çiftçi (Free) | ₺0 | ₺0 | ✅ | ✅ |
| Başlangıç | ₺135 | ₺1.215/yıl | ₺135 → Iyzico | 4.99 USD → Apple/Google |
| Profesyonel | ₺599 | ₺5.390/yıl | ₺599 → Iyzico | 19.99 USD |

### Store Optimization (ASO)
- **İsim:** "TarımİKlim — Don Uyarı & Hava"
- **Anahtar kelimeler:** hava durumu, don uyarı, tarım, çiftçi, sulama, parsel, sera, zirai
- **Görseller:** 6 screen (onboarding, home, hourly, alerts, map, settings) × iOS + Android
- **Video:** 30 saniye demo (ücretli → freemium dönüşüm aracı)
- **İlk launch:** Türkiye odak, sonra Orta Asya + Balkanlar (TR dili)

### CAC (Müşteri Edinim Maliyeti)
- Hedef CAC: **₺200** (1.5 aylık premium gelire eşit)
- Kanallar:
  - Meta Ads (FB + Instagram) — tarım ilgi alanları hedefleme: CAC ~₺180
  - Google Ads (arama) — "don uyarı", "hava durumu antalya" — CAC ~₺250
  - Organik (SEO + store ASO) — CAC ~₺0
  - Influencer (tarım YouTuber 3 kişi) — CAC ~₺100 (tek sefer ücret / gelen kullanıcı)

---

## 8. Ürün Yol Haritası

### 🟢 Sprint 1 (Hafta 1-2) — Scaffold + Home Screen
- [x] Strateji dokümanı (bu dosya)
- [ ] Expo proje init (bun + TypeScript + Expo Router)
- [ ] `src/lib/api.ts` (weather, current, hourly, frost-risk, locations)
- [ ] `src/lib/storage.ts` (AsyncStorage wrapper)
- [ ] `src/lib/location.ts` (expo-location + Nominatim reverse)
- [ ] Theme tokens (paper/pine/terra) + fontlar (Fraunces + Inter Tight + Mono)
- [ ] Home screen: canlı kart + 7 günlük tahmin + don alert banner

### 🟡 Sprint 2 (Hafta 3-4) — Tabs + Lokasyon
- [ ] Bottom tabs (Home, Hourly, Alerts, Settings)
- [ ] Hourly screen (saatlik tablo, yatay scroll)
- [ ] Location search modal (81 il + Nominatim)
- [ ] Settings screen (konum yönetimi, dil, bildirim tercihleri)
- [ ] Onboarding (3 slide)

### 🟠 Sprint 3 (Hafta 5-6) — Push + Paywall
- [ ] Expo Push entegrasyonu + backend token kayıt endpoint
- [ ] Alerts screen (son 30 gün uyarı geçmişi)
- [ ] Paywall modal (premium özellik tıklandığında)
- [ ] Auth screens (login/signup) — Free kayıt zorunlu
- [ ] i18n (TR + EN) — mevcut `premium.*` namespace benzeri

### 🔴 Sprint 4 (Hafta 7-8) — Build + Store
- [ ] Icon + splash (backend uploads'tan fetch + AppIcon generate)
- [ ] EAS Build config (iOS + Android)
- [ ] TestFlight beta (30 kullanıcı)
- [ ] Google Play internal test
- [ ] Store listing + screenshots + ASO
- [ ] Privacy policy + KVKK sayfaları (web ile eş)

### 🟣 FAZ 2 (Ay 3-6) — Monetizasyon
- [ ] In-App Purchase (iOS StoreKit + Android Billing)
- [ ] Iyzico web paywall (Android yönlendirme)
- [ ] SMS/WhatsApp bildirim satın alma
- [ ] Kooperatif paneli (başkan rolü)

### 🟤 FAZ 3 (Ay 6-12) — IoT + Parsel
- [ ] Polygon tarla çizme (react-native-maps)
- [ ] IoT istasyonu pairing (BLE ile ESP32)
- [ ] Canlı IoT verisi görüntüleme
- [ ] Sulama takvimi ekranı

---

## 9. Teknik Gereksinimler ve Maliyet

### Geliştirme
- **Geliştirici:** 1 kişi full-time (Orhan veya 1 ek) × 8 hafta = ₺120k maliyet
- **Tasarım:** 40 saat UX/UI (Figma) ≈ ₺15k (dışarıdan veya öğren)
- **Test:** 1 iOS + 1 Android cihaz (cihaz alımı veya BrowserStack ₺500/ay)

### Apple Developer Program
- **$99/yıl** (zorunlu)
- Kurum hesap ise $299/yıl (DUNS numarası gerek)

### Google Play Console
- **$25 tek sefer** (ömür boyu)

### EAS Build
- Ücretsiz tier: 30 build/ay — MVP için yeter
- Production: **$29/ay** (unlimited build + priority)

### Expo Push
- **Ücretsiz** (unlimited notification)

### Store Yıllık toplam zorunlu maliyet
- Apple ($99) + Play ($25 tek sefer) + EAS ($29×12) ≈ **₺15k/yıl**

---

## 10. Başarı Metrikleri

### Ürün
- **MAU (monthly active users):** Ay 1 → 1.500, Ay 6 → 15.000, Ay 12 → 40.000
- **Store rating:** ≥ 4.3 / 5 (ilk 100 yorum için kritik)
- **Crash-free sessions:** > %99.5
- **Push open rate:** > %30 (sektör ort. %7; don uyarısı gibi aciliyet içeren yüksek)
- **Session length:** > 45 sn (kısa ama sık — bu ürün doğru)

### Büyüme
- **Downloads:** İlk 3 ay 5.000+ · İlk 12 ay 50.000+
- **Free → Premium conversion:** ≥ %4
- **Day 1 retention:** > %60
- **Day 30 retention:** > %25
- **Churn (aylık iptal):** < %5

### Finansal
- **ARPU (premium):** ₺135 (aylık) veya ₺100 (yıllık/12 düşülürse)
- **LTV:** ortalama 10 ay × ₺135 = **₺1.350**
- **LTV/CAC hedefi:** > 4x (yani CAC max ₺340)
- **Gross margin:** > %75 (backend maliyeti düşük)

---

## 11. Eski Native Planlar — DEPRECATED

`mobile/ios/AGENTS.md` ve `mobile/android/AGENTS.md` (Swift 6 / Kotlin 2) **planlar deprecate edildi.** Expo yolu tercih sebepleri §1'de.

**Geri dönüş koşulları (native'e migration tetikleyicileri):**
1. MAU > 1M ve performans sorunu başlarsa
2. Apple Watch / widgetExtension / CarPlay özel entegrasyon
3. Native-only API kullanımı (CoreML özel tarım modeli, ARKit saha ölçüm)

Bu koşullar yıl 3+'ta ortaya çıkabilir. O zamana kadar Expo tabanlı hızlı iterasyon.

---

## 12. Gerekli Backend Değişiklikleri

| Değişiklik | Öncelik | Ne zaman |
|------------|---------|----------|
| `user_push_tokens` tablosu + CRUD endpoint | Yüksek | Sprint 3 |
| `/api/v1/me` endpoint (JWT'li kullanıcı profili) | Yüksek | Sprint 3 |
| `/api/v1/subscriptions/verify` (receipt validation) | Orta | FAZ 2 |
| Expo Push sender (shared-backend/modules/notifications içine) | Yüksek | Sprint 3 |
| Revenue event log tablosu | Orta | FAZ 2 |

---

## 13. Risk ve Mitigasyon

| Risk | Olasılık | Etki | Mitigasyon |
|------|----------|------|-----------|
| App Store red (politika) | Orta | Yüksek | Beta aşamasında reviewer guideline kontrol, privacy manifest hazır |
| Google Play spam filter | Düşük | Yüksek | Açıklama metni jenerik değil, screenshot kalite yüksek |
| Expo Push servis kesintisi | Düşük | Orta | FCM direct fallback code path (advanced) |
| Store kesinti çok yüksek | Yüksek | Orta | Web üzerinden ödeme yönlendirme (Android'de legal) |
| Kullanıcı konum izin reddi | Yüksek | Düşük | Arama kutusu ana + konum izni opsiyonel |
| Düşük Day 30 retention | Orta | Yüksek | Push bildirim kalitesi, gerçekten değerli uyarı |
| Rakip (Doktar mobil) | Orta | Orta | Ücretsiz tier cömert, marka sadakati |

---

## 14. İlk 30 Gün Aksiyon Planı

### Hafta 1
- Expo proje scaffold (`npx create-expo-app`)
- Repo yapısı (yukarıda §4)
- API client yaz, test et (canlı tarimiklim.com API)

### Hafta 2
- Home screen + 7g forecast
- Theme + fontlar
- Konum izni akışı

### Hafta 3
- Tabs + saatlik + location search modal
- Onboarding 3 slide
- Settings ekranı

### Hafta 4
- Auth (Free kayıt zorunlu değil, ama opsiyonel login)
- Push token registration + backend endpoint
- i18n (TR + EN)
- Android/iOS simulator test

---

**Sonraki adım:** Sprint 1 teknik uygulaması. Bu dokümanın sonuna commit ile proje scaffold başlayacak.
