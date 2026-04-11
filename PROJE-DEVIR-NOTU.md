# Hava Durumu & Don Uyarisi — Proje Devir Notu

**Hazirlayan:** Orhan  
**Son Guncelleme:** 2026-04-05  
**Devreden:** Orhan → Nutuya  
**Proje Durumu:** İskelet hazır — canlı veri akışı için kritik eksikler var

---

## Projenin Amacı

Türkiye'deki çiftçiler için **7 günlük hava tahmini, don riski uyarısı ve sulama planlama** servisi.

Ekosistem içinde **Katman 4 (Veri & AI)** altında çalışır. **Bağımsız uygulama değil** — sera yönetimi, açık tarla, verim tahmini, ziraat haber gibi diğer modüllere widget verisi sağlayan **servis katmanı**.

> Sahte/seed veri burada anlamsız. Canlı OpenWeatherMap/Open-Meteo verisi sürekli çekilmeli, DB'de cache'lenmeli ve widget endpoint'leri her zaman güncel veri dönmelidir.

---

## Ekosistem ile İlişkisi

```
Bu servis ──→ Ziraat Haber Portali  (sidebar hava widget)
         ──→ Sera SaaS              (don uyarısı, havalandırma kararı)
         ──→ Açık Tarla             (sulama planlaması)
         ──→ Verim Tahmini          (iklim verisi → AI girdisi)
         ──→ Hastalık Uyarı         (yüksek nem → mantar/bakteri riski)
         ──→ Hal Fiyatları          (don → fiyat etkisi korelasyonu)
```

---

## Teknik Stack

| Katman | Teknoloji | Port |
|--------|-----------|------|
| Backend | Fastify v5 + Drizzle ORM + MySQL | 8088 |
| Frontend | Next.js 16 + next-intl (tr/en) | 3088 |
| Admin Panel | Next.js 16 + Zustand + Sonner | 3048 |
| iOS | Swift 6 + SwiftUI + MVVM | — |
| Android | Kotlin + Jetpack Compose + Hilt | — |
| Cache | Redis (kayıtlı değil — eksik) | 6379 |
| DB | MySQL / MariaDB | 3306 |
| İş Kuyruğu | BullMQ (yazılmadı — eksik) | — |

---

## Mevcut Durum — Modül Bazlı

| Modül | Durum | Notlar |
|-------|-------|--------|
| HTTP endpoint'ler (5 public + admin) | ✅ Tam | Çalışıyor |
| DB schema + CRUD | ✅ Tam | Okuma/yazma çalışıyor |
| Don riski algoritması | ✅ Tam | 4 faktörlü, profesyonel |
| Tarla mikroiklim düzeltmesi | ✅ Tam | Radyatif soğuma hesabı |
| OpenWeatherMap entegrasyonu | 🟡 Kısmi | Kod hazır, API key .env'de boş |
| Open-Meteo fallback | ✅ Çalışıyor | OWM key yokken devreye giriyor |
| MySQL cache | 🟡 Kısmi | Var ama TTL kodu kullanılmıyor |
| Redis cache | ✅ Tam | Plugin + `getForecast` Redis TTL önbelleği |
| Telegram bildirimi | 🟡 Kısmi | Don uyarısı `weather_alert_rules` + Telegram; push yok |
| Push notification (Firebase) | ❌ Eksik | Env var tanımlı, kod yok |
| Zamanlanmış job'lar (BullMQ) | ✅ Tam | `src/jobs/` + Redis kuyruk |
| Alert rules DB'den okuma | ✅ Tam | `checkAndSendFrostAlerts` kuralları kullanıyor |
| Frontend / Admin Panel | ✅ Tam (MVP) | Public + Admin: sidebar, konum CRUD, uyarı listesi, kurallar, manuel don kontrolü |
| Mobile (iOS/Android) | 🔲 Bekliyor | AGENTS.md hazır |

---

## Yapılacaklar — Öncelik Sırasıyla

### P0 — Canlı Veri Akışı (Widget İçin Şart)

- [x] **`jobs/` klasörü — BullMQ zamanlanmış görevler** (`backend/src/jobs/`, `index.ts` → `startScheduledJobs`)
  - [x] `fetch-forecast.ts` — Her 30 dk aktif konumlar için tahmin çek, DB'ye yaz
  - [x] `check-frost-risk.ts` — Her saat don kontrolü + bildirim
  - [x] `daily-summary.ts` — 06:00 Europe/Istanbul günlük özet (şimdilik log)
  - [x] `register.ts` — Worker + tekrarlayan kuyruk işleri

- [x] **Redis plugin + tahmin önbelleği**
  - [x] `app.ts` → `@agro/shared-backend/plugins/redis`
  - [x] `getForecast` Redis GET/SETEX (`WEATHER_CACHE_TTL_SECONDS`, varsayılan 1800 sn); önce Redis, sonra MySQL, sonra API
  - [x] `bootstrap-env.ts` — `REDIS_URL` boşsa varsayılanı `process.env`'e yazar (plugin ile uyum)

- [ ] **OWM API key al ve `.env`'e yaz**
  - `openweathermap.org` → ücretsiz plan → günde 1000 istek yeterli
  - `.env`'de `OPENWEATHERMAP_API_KEY=` satırını doldur
  - Open-Meteo fallback kalabilir ama OWM öncelikli olmalı

### P1 — Bildirim Sistemi Tamamlama

- [x] **Alert rules DB'den oku** (`checkAndSendFrostAlerts` — `weather_alert_rules`, eşik + kanal birleşimi; kural yoksa varsayılan 30 + telegram)

- [x] **Push notification (Firebase)** — `alerts/fcm.ts` + `sendFcmFrostAlert`; `FCM_DEVICE_TOKENS` + service account env
  - `.env`'de `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL` ve token listesi doldurulmalı

### P2 — Frontend / Admin Panel

- [x] **Frontend component'leri** (`hava-durumu-don-uyarisi/frontend/`)
  - [x] `WeatherDashboard.tsx` — 7 günlük tahmin kartları
  - [x] `FrostAlertBanner.tsx` — Don uyarı banner (kırmızı/turuncu)
  - [x] `ForecastCard.tsx` — Tarih, min/max sıcaklık, koşul, don riski
  - [x] `LocationSelector.tsx` — Konum seçici dropdown
  - [x] Ana sayfa (`[locale]/page.tsx`) — `WeatherDashboard` + metadata

- [x] **SEO (ana sayfa)**
  - [x] `generateMetadata` — Open Graph + Twitter
  - [x] JSON-LD `WeatherForecast` (`lib/weather-jsonld.ts`, API’den veri; API yoksa script yok)

- [x] **Admin Panel sayfaları** (`admin_panel/`)
  - [x] Login (`/login`)
  - [x] Dashboard layout (sidebar + header) + özet (`/dashboard`)
  - [x] Lokasyon yönetimi (`/dashboard/locations`) — liste, ekle, düzenle, sil, manuel don kontrolü
  - [x] Uyarılar (`/dashboard/alerts`) — gönderilen uyarı log
  - [x] Uyarı kuralları (`/dashboard/alerts/rules`) — kural ekle/sil; API `GET .../rules?all=true`

**E-posta (don):** `alerts/email-delivery.ts` — `ALERT_EMAIL_TO` + `SMTP_*` doluysa kanal `email` ile gönderilir.

### P3 — Mobile

- [ ] **iOS** — `mobile/ios/AGENTS.md` + `mobile/README.md` (native proje repoda yok)
  - Xcode projesi oluştur
  - `APIClient.swift`, `WeatherViewModel.swift`, `WeatherView.swift`
  - `FrostAlertView.swift`, APNs push notification
  - Lokalizasyon (tr/en)

- [ ] **Android** — `mobile/android/AGENTS.md` yapısına göre
  - Android Studio projesi, Hilt kurulumu
  - `WeatherViewModel.kt`, `WeatherScreen.kt` (Compose)
  - FCM push notification

### P4 — DevOps

- [ ] VPS'te `NODE_ENV=production bun run db:seed:no-drop` (sunucuda bir kez)
- [x] Nginx örnek — `deploy/nginx.example.conf` (SSL: certbot ile `listen 443 ssl` ekleyin)
- [ ] Domain bağla (`hava.agro.com.tr` veya benzeri)
- [x] `GET /api/v1/health` — `registerHealth` (`shared-backend/modules/health`); canlıda 200 doğrula
- [ ] BullMQ job'larının çalıştığını canlıda doğrula

---

## Dosya Sınırları — Kural

```
hava-durumu-don-uyarisi/     ← Bu projeye ait HER dosya buradadır
nutuya/packages/             ← ORTAK kod (shared-backend, shared-types)
```

Projeye özgü modüller: `weather`, `locations`, `alerts`  
Ortak modüller (`packages/shared-backend`'den import edilir): Auth, Storage, Audit, Notifications, Telegram, SiteSettings, EmailTemplates, Newsletter, Contact, CustomPages

---

## Veritabanı Kuralları

- **ALTER TABLE YASAK** — Şema değişikliği SQL dosyasında yapılır, `db:seed` ile uygulanır
- Geliştirme: `bun run db:seed` (DROP + yeniden kur)
- Production taşıma: `NODE_ENV=production bun run db:seed:no-drop`

---

## Projeyi Başlatmak

```bash
# 1. Kök dizinde
cd /path/to/nutuya && bun install && bun run build:shared

# 2. Backend
cd hava-durumu-don-uyarisi/backend
cp .env.example .env  # doldur: DB, JWT, OPENWEATHERMAP_API_KEY
bun run db:seed
bun run dev  # → http://localhost:8088/documentation

# 3. Frontend
cd hava-durumu-don-uyarisi/frontend
cp .env.example .env.local
bun run dev  # → http://localhost:3088

# 4. Admin
cd hava-durumu-don-uyarisi/admin_panel
cp .env.example .env.local
bun run dev  # → http://localhost:3048
```

**Yerel admin:** `admin@hava-durumu.local` / `HavaDurumuDev2026!`

---

## Hızlı Referans — API Endpoint'leri

```
GET /api/v1/weather?lat=36.89&lon=30.68&days=7
GET /api/v1/weather/current?lat=36.89&lon=30.68
GET /api/v1/weather/frost-risk?location=antalya
GET /api/v1/weather/rain-forecast?location=antalya&days=3
GET /api/v1/weather/widget-data?location=antalya

GET    /api/v1/admin/locations
POST   /api/v1/admin/locations
PUT    /api/v1/admin/locations/:id
DELETE /api/v1/admin/locations/:id
GET    /api/v1/admin/alerts
POST   /api/v1/admin/alerts/frost-check/:locationId
GET    /api/v1/admin/alerts/rules
POST   /api/v1/admin/alerts/rules
DELETE /api/v1/admin/alerts/rules/:id
```

---

## Kaynaklar

- **OpenWeatherMap:** openweathermap.org (ücretsiz — günde 1000 istek)
- **Shared Backend Kullanımı:** `nutuya/packages/KULLANIM.md`
- **Geliştirme Standartları:** `nutuya/SKILL-VE-TALIMATLAR.md`
- **Bağlantı:** `nutuya/baglanti-rehberi.md`
