# CLAUDE.md — Hava Durumu ve Don Uyarisi Servisi

## Proje Ozeti

Ekosistem Katman 4 (Veri & AI) altinda cevresel veri servisi. Bolgesel hava tahmini, don riski uyarisi ve sulama optimizasyonu saglar. Bagimsiz uygulama degil, diger modullere veri saglayan **servis katmani**.

**Durum:** Fikir ve kapsam asamasi (Faz 5, Ay 9-12)
**Katman:** Katman 4 — Veri ve Akilli Sistemler

---

## Teknik Mimari

### Stack

```
Backend:       Fastify v5 + Drizzle ORM + MySQL
Veri Kaynagi:  OpenWeatherMap API (veya MGM acik veri)
Cache:         Redis (hava verisi cache — 30dk TTL)
Kuyruk:        BullMQ (zamanlanmis tahmin guncelleme)
Bildirim:      Telegram Bot API + Push (APNs/FCM)
Zaman Serisi:  TimescaleDB (uzun vadeli iklim verisi)
Runtime:       Bun
```

### Dizin Yapisi

```
hava-durumu-don-uyarisi/
├── CLAUDE.md                  # Bu dosya
├── EKOSISTEM-PLAN.md          # Entegrasyon plani
├── README.md                  # Genel bakis
│
├── backend/
│   ├── src/
│   │   ├── app.ts             # Fastify setup
│   │   ├── index.ts           # Server entry
│   │   ├── core/
│   │   │   └── env.ts         # Ortam degiskenleri
│   │   │
│   │   ├── modules/
│   │   │   ├── weather/                 # Ana hava durumu modulu
│   │   │   │   ├── router.ts            # Route tanimlari
│   │   │   │   ├── controller.ts        # HTTP handler
│   │   │   │   ├── repository.ts        # DB sorgulari (cache, log)
│   │   │   │   ├── service.ts           # Hava API entegrasyonu + is mantigi
│   │   │   │   ├── schema.ts            # DB tablo tanimlari
│   │   │   │   ├── validation.ts        # Zod semalari
│   │   │   │   └── helpers/
│   │   │   │       ├── weather-api.ts   # OpenWeatherMap client
│   │   │   │       ├── frost-rules.ts   # Don riski hesaplama kurallari
│   │   │   │       └── cache.ts         # Redis cache helper
│   │   │   │
│   │   │   ├── alerts/                  # Uyari ve bildirim modulu
│   │   │   │   ├── router.ts
│   │   │   │   ├── controller.ts
│   │   │   │   ├── repository.ts
│   │   │   │   ├── service.ts           # Uyari kurallari + bildirim gonderme
│   │   │   │   ├── schema.ts
│   │   │   │   ├── validation.ts
│   │   │   │   └── helpers/
│   │   │   │       ├── telegram.ts      # Telegram bildirim
│   │   │   │       └── push.ts          # Push notification (APNs/FCM)
│   │   │   │
│   │   │   ├── locations/               # Konum yonetimi
│   │   │   │   ├── router.ts
│   │   │   │   ├── controller.ts
│   │   │   │   ├── repository.ts
│   │   │   │   ├── schema.ts
│   │   │   │   └── validation.ts
│   │   │   │
│   │   │   └── analytics/               # Iklim analiz (gelecek)
│   │   │       ├── router.ts
│   │   │       ├── controller.ts
│   │   │       ├── repository.ts
│   │   │       └── schema.ts
│   │   │
│   │   ├── jobs/                        # Zamanlanmis isler
│   │   │   ├── fetch-forecast.ts        # Her 30dk hava tahmini cek
│   │   │   ├── check-frost-risk.ts      # Her saat don riski kontrol
│   │   │   └── daily-summary.ts         # Gunluk ozet rapor
│   │   │
│   │   ├── db/
│   │   │   ├── schema.ts                # Drizzle tablo tanimlari
│   │   │   ├── mysql-connection.ts      # Baglanti konfigurasyonu
│   │   │   └── seed/
│   │   │       ├── index.ts             # SQL runner (--no-drop destekli)
│   │   │       └── sql/                 # Tum CREATE TABLE ve INSERT buraya
│   │   │           ├── 001_auth_schema.sql
│   │   │           ├── 002_auth_seed.sql
│   │   │           ├── 010_site_settings_schema.sql
│   │   │           ├── 020_theme_config_schema.sql
│   │   │           ├── 030_audit_schema.sql
│   │   │           ├── 100_weather_locations_schema.sql
│   │   │           ├── 110_weather_forecasts_schema.sql
│   │   │           ├── 120_weather_alerts_schema.sql
│   │   │           ├── 130_weather_alert_rules_schema.sql
│   │   │           └── 200_weather_locations_seed.sql
│   │   │
│   │   └── routes.ts                    # Tum route'lari register et
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .env.example
│
├── widget/                              # Embed edilebilir hava widget'i
│   ├── src/
│   │   ├── WeatherWidget.tsx            # React component
│   │   ├── FrostAlert.tsx               # Don uyari banner'i
│   │   └── styles.css
│   ├── package.json
│   └── tsconfig.json
│
└── docs/
    └── api-spec.md                      # API dokumantasyonu
```

---

## API Endpointleri

### Public Endpointler

```
GET  /api/v1/weather
     ?lat=36.89&lon=30.68&days=7
     → 7 gunluk hava tahmini

GET  /api/v1/weather/current
     ?lat=36.89&lon=30.68
     → Anlik hava durumu

GET  /api/v1/weather/frost-risk
     ?location=antalya
     ?lat=36.89&lon=30.68
     → Don riski skoru (0-100) + uyari seviyesi

GET  /api/v1/weather/rain-forecast
     ?location=antalya&days=3
     → Yagis tahmini (sulama planlamasi icin)

GET  /api/v1/weather/widget-data
     ?location=antalya
     → Widget icin hafif veri (embed)
```

### Admin Endpointler

```
GET    /api/v1/admin/weather/locations       # Takip edilen konumlar
POST   /api/v1/admin/weather/locations       # Konum ekle
DELETE /api/v1/admin/weather/locations/:id    # Konum sil

GET    /api/v1/admin/weather/alerts           # Gonderilen uyarilar log
GET    /api/v1/admin/weather/alerts/rules     # Uyari kurallari
POST   /api/v1/admin/weather/alerts/rules     # Kural ekle/guncelle

GET    /api/v1/admin/weather/analytics        # Iklim istatistikleri
```

### Diger Moduller Icin Internal API

```
# Sera SaaS ve Acik Tarla icin
GET  /api/v1/internal/weather/forecast
     ?lat=...&lon=...&hours=48
     → Saatlik detayli tahmin (sicaklik, nem, ruzgar)

# Verim Tahmini Motoru icin
GET  /api/v1/internal/weather/historical
     ?location=...&from=2025-01-01&to=2025-12-31
     → Gecmis iklim verisi (AI modeli girdisi)

# Hastalik Erken Uyari icin
GET  /api/v1/internal/weather/humidity-risk
     ?location=...&days=5
     → Yuksek nem donemi tahmini (hastalik riski)
```

---

## Veritabani Semalari

### weather_locations (Takip edilen konumlar)

```sql
CREATE TABLE weather_locations (
  id          VARCHAR(36) PRIMARY KEY,          -- UUID
  name        VARCHAR(255) NOT NULL,            -- "Antalya Merkez"
  slug        VARCHAR(255) UNIQUE NOT NULL,     -- "antalya-merkez"
  latitude    DECIMAL(10, 7) NOT NULL,          -- 36.8968946
  longitude   DECIMAL(10, 7) NOT NULL,          -- 30.7133233
  city        VARCHAR(100),                     -- "Antalya"
  district    VARCHAR(100),                     -- "Muratpasa"
  region      VARCHAR(100),                     -- "Akdeniz"
  timezone    VARCHAR(50) DEFAULT 'Europe/Istanbul',
  is_active   TINYINT DEFAULT 1,
  created_at  DATETIME DEFAULT NOW(),
  updated_at  DATETIME DEFAULT NOW() ON UPDATE NOW(),
  INDEX idx_active (is_active),
  INDEX idx_city (city),
  INDEX idx_coords (latitude, longitude)
);
```

### weather_forecasts (Hava tahminleri cache)

```sql
CREATE TABLE weather_forecasts (
  id            VARCHAR(36) PRIMARY KEY,
  location_id   VARCHAR(36) NOT NULL,           -- FK -> weather_locations
  forecast_date DATE NOT NULL,
  hour          TINYINT,                        -- 0-23 (saatlik tahmin icin, null = gunluk)
  temp_min      DECIMAL(5, 2),                  -- Celcius
  temp_max      DECIMAL(5, 2),
  temp_avg      DECIMAL(5, 2),
  humidity      TINYINT,                        -- % 0-100
  wind_speed    DECIMAL(5, 2),                  -- km/h
  wind_direction VARCHAR(10),                   -- "N", "NE", "SW"...
  precipitation DECIMAL(5, 2),                  -- mm
  condition     VARCHAR(50),                    -- "clear", "cloudy", "rain", "snow"
  icon          VARCHAR(20),                    -- Hava durumu icon kodu
  uv_index      TINYINT,
  frost_risk    TINYINT DEFAULT 0,              -- 0-100 skor
  data_source   VARCHAR(50),                    -- "openweathermap", "mgm"
  fetched_at    DATETIME NOT NULL,
  created_at    DATETIME DEFAULT NOW(),
  INDEX idx_location_date (location_id, forecast_date),
  INDEX idx_frost (frost_risk, forecast_date),
  UNIQUE KEY uk_location_date_hour (location_id, forecast_date, hour)
);
```

### weather_alerts (Gonderilen uyarilar)

```sql
CREATE TABLE weather_alerts (
  id            VARCHAR(36) PRIMARY KEY,
  location_id   VARCHAR(36) NOT NULL,
  alert_type    ENUM('frost', 'heavy_rain', 'storm', 'heat', 'humidity') NOT NULL,
  severity      ENUM('info', 'warning', 'critical') NOT NULL,
  title         VARCHAR(255) NOT NULL,
  message       TEXT NOT NULL,
  threshold     VARCHAR(50),                    -- "temp < 2°C", "rain > 50mm"
  actual_value  VARCHAR(50),                    -- "-1.5°C", "65mm"
  forecast_date DATE NOT NULL,
  sent_at       DATETIME,
  channels      JSON,                           -- ["telegram", "push", "email"]
  recipients    INT DEFAULT 0,                  -- Kac kisiye gonderildi
  created_at    DATETIME DEFAULT NOW(),
  INDEX idx_location_type (location_id, alert_type),
  INDEX idx_date (forecast_date),
  INDEX idx_severity (severity)
);
```

### weather_alert_rules (Kullanici uyari tercihleri)

```sql
CREATE TABLE weather_alert_rules (
  id            VARCHAR(36) PRIMARY KEY,
  user_id       VARCHAR(36) NOT NULL,           -- FK -> users
  location_id   VARCHAR(36) NOT NULL,           -- FK -> weather_locations
  alert_type    ENUM('frost', 'heavy_rain', 'storm', 'heat', 'humidity') NOT NULL,
  threshold     DECIMAL(10, 2) NOT NULL,        -- Esik degeri (ornek: 2.0 derece)
  channel       ENUM('telegram', 'push', 'email', 'sms') NOT NULL,
  is_active     TINYINT DEFAULT 1,
  created_at    DATETIME DEFAULT NOW(),
  updated_at    DATETIME DEFAULT NOW() ON UPDATE NOW(),
  INDEX idx_user (user_id),
  INDEX idx_location (location_id),
  INDEX idx_active (is_active)
);
```

### weather_history (TimescaleDB — uzun vadeli)

```sql
-- TimescaleDB hypertable (Faz 5+)
CREATE TABLE weather_history (
  time          TIMESTAMPTZ NOT NULL,
  location_id   VARCHAR(36) NOT NULL,
  temperature   DECIMAL(5, 2),
  humidity      TINYINT,
  precipitation DECIMAL(5, 2),
  wind_speed    DECIMAL(5, 2),
  condition     VARCHAR(50),
  source        VARCHAR(50)                     -- "api_forecast", "iot_sensor"
);

SELECT create_hypertable('weather_history', 'time');
```

---

## Don Riski Hesaplama Kurallari

```typescript
// helpers/frost-rules.ts

interface FrostRiskInput {
  tempMin: number;      // Gece minimum sicaklik (°C)
  humidity: number;     // Nem orani (%)
  windSpeed: number;    // Ruzgar hizi (km/h)
  cloudCover: number;   // Bulut orani (%)
}

// Don riski skoru: 0-100
// 0-20:  Dusuk risk (yesil)
// 21-50: Orta risk (sari)
// 51-80: Yuksek risk (turuncu)
// 81-100: Kritik risk (kirmizi)

function calculateFrostRisk(input: FrostRiskInput): number {
  let score = 0;

  // Sicaklik (en onemli faktor — %60 agirlik)
  if (input.tempMin <= -5) score += 60;
  else if (input.tempMin <= -2) score += 50;
  else if (input.tempMin <= 0) score += 40;
  else if (input.tempMin <= 2) score += 30;
  else if (input.tempMin <= 4) score += 15;
  else score += 0;

  // Nem (yuksek nem + dusuk sicaklik = don riski artar — %15 agirlik)
  if (input.humidity > 80) score += 15;
  else if (input.humidity > 60) score += 10;
  else score += 5;

  // Ruzgar (dusuk ruzgar = radyasyon donu riski — %15 agirlik)
  if (input.windSpeed < 5) score += 15;
  else if (input.windSpeed < 10) score += 10;
  else score += 0;

  // Bulut orani (acik gokyuzu = radyasyon kaybi — %10 agirlik)
  if (input.cloudCover < 20) score += 10;
  else if (input.cloudCover < 50) score += 5;
  else score += 0;

  return Math.min(100, score);
}
```

---

## Bildirim Kurallari

### Uyari Seviyeleri ve Aksiyonlar

| Seviye | Kosul | Bildirim | Kanal |
|--------|-------|----------|-------|
| **info** | Don riski 21-50 | "Yarinki gece hafif don riski var" | Telegram |
| **warning** | Don riski 51-80 | "UYARI: Don riski yuksek, onlem alin" | Telegram + Push |
| **critical** | Don riski 81-100 | "ACIL: Siddetli don bekleniyor!" | Telegram + Push + SMS |

### Bildirim Zamanlama

- Don uyarisi: Aksam 18:00'da ertesi gece icin
- Yagis uyarisi: 6 saat onceden
- Gunluk ozet: Sabah 06:00
- Haftalik rapor: Pazartesi 08:00

### Bildirim Sablonu (Telegram)

```
🥶 DON UYARISI — Antalya Merkez

📅 Tarih: 15 Ocak 2026, Persembe gecesi
🌡️ Beklenen: -2°C (02:00-06:00 arasi)
💧 Nem: %85
🌬️ Ruzgar: 3 km/h (dusuk — radyasyon donu riski yuksek)
⚠️ Risk Skoru: 78/100 (YUKSEK)

🛡️ Onerilen Onlemler:
• Seralarda isitma sistemini kontrol edin
• Acik alandaki hassas bitkileri ortun
• Sulama sisteminizi bosaltin (boru patlamasi riski)

📊 Detay: https://app.agro.com.tr/hava/antalya-merkez
```

---

## Ortam Degiskenleri (.env.example)

```bash
# Server
PORT=8088
NODE_ENV=development
HOST=127.0.0.1

# Database (MySQL)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=app
DB_PASSWORD=app
DB_NAME=weather_service

# TimescaleDB (iklim gecmis verisi)
TIMESCALE_URL=postgresql://app:app@localhost:5432/weather_history

# Redis (cache)
REDIS_URL=redis://localhost:6379

# Hava Durumu API
WEATHER_API_PROVIDER=openweathermap
OPENWEATHERMAP_API_KEY=your-api-key-here
WEATHER_CACHE_TTL=1800                    # 30 dakika (saniye)

# MGM (Meteoroloji Genel Mudurlugu) — alternatif
MGM_API_URL=
MGM_API_KEY=

# Auth (ekosistem ortak)
JWT_SECRET=your-jwt-secret
COOKIE_SECRET=your-cookie-secret

# Bildirimler
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_ALERT_CHANNEL_ID=-100123456789

# Firebase (Push Notification)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# SMTP (Email uyarilari)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=

# Sentry
SENTRY_DSN=

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3004

# Zamanlanmis isler
FORECAST_FETCH_INTERVAL=30               # Dakika
FROST_CHECK_INTERVAL=60                  # Dakika
DAILY_SUMMARY_HOUR=6                     # Saat (UTC+3)
```

---

## Diger Modullerle Entegrasyon

### Bu Servisin Sagladigi Veriler

| Tuketici Modul | Endpoint | Kullanim |
|----------------|----------|----------|
| **Sera SaaS** | `/internal/weather/forecast` | Havalandirma zamanlama, isitma karari |
| **Acik Tarla** | `/weather/rain-forecast` | Sulama planlamasi, ekim zamani |
| **Verim Tahmini** | `/internal/weather/historical` | AI modeli egitim verisi |
| **Hastalik Uyari** | `/internal/weather/humidity-risk` | Mantar/bakteri riski tahmini |
| **Ziraat Haber** | `/weather/widget-data` | Sidebar hava durumu widget'i |
| **Hal Fiyatlari** | `/weather/frost-risk` | Don -> fiyat etkisi korelasyonu |
| **IoT Sensor** | Cift yonlu | Tahmin vs gercek karsilastirma |

### Bu Servisin Tuketigi Veriler

| Kaynak | Veri | Kullanim |
|--------|------|----------|
| **OpenWeatherMap** | 7 gunluk tahmin, saatlik veri | Ana veri kaynagi |
| **MGM** | Resmi meteoroloji verisi | Dogrulama, yedek |
| **IoT Sensor** | Gercek sicaklik/nem | Tahmin dogrulama |
| **Kullanici DB** | Konum tercihleri, bildirim ayarlari | Kisisellestirilmis uyari |

---

## Gelistirme Komutlari

```bash
# Bagimliliklari yukle
cd hava-durumu-don-uyarisi/backend && bun install

# Gelistirme modu
bun run dev

# Build
bun run build

# Docker ile calistir
docker compose up -d

# DB kurulumu (DROP + CREATE + tum tablolar + seed verisi)
bun run db:seed

# Yeni ortama / production'a tasima (DROP YOK — eksik tablolari ekler)
bun run db:seed:no-drop
```

---

## Kurallar (Bu Projeye Ozel)

### Genel Mimari Kurallari

1. **ALTER TABLE YASAK** — Sema degisikligi SQL dosyasinda yapilir, `db:seed` ile uygulanir.
2. **Proje dosyalari proje klasorunde** — Bu proje icin her sey `hava-durumu-don-uyarisi/` altinda. `packages/`'taki ortak modulleri buraya kopyalama.
3. **Ortak kod tekrar yazilmaz** — `shared-backend`'de olan modulu bu projede yeniden implemente etme.
4. **`.dev-mysql-data/` proje icinde** — Repo kokune veya baska yere koyma. `.gitignore`'da zaten tanimli.

### Veritabani Kurallari

5. **Hava verisi her zaman cache'lenir** — API'ye gereksiz istek atma. Redis TTL: 30dk.
6. **Bildirim spam YASAK** — Ayni uyari ayni kullaniciya 12 saat icinde tekrar gonderilmez.
7. **Koordinat hassasiyeti** — Latitude/longitude 7 ondalik basamak (DECIMAL 10,7).
8. **Zaman dilimi** — Tum tarihler UTC saklanir, gosterimde `Europe/Istanbul` (UTC+3).

### Servis Kurallari

9. **Hata toleransi** — API erisim hatasi durumunda son basan cache dondurulur (stale-while-revalidate).
10. **Rate limit** — OpenWeatherMap Free: 60 istek/dk. Buna uygun cache stratejisi.
11. **Loglama** — Her API istegi, her bildirim, her don uyarisi loglanir (audit).
12. **Birim** — Sicaklik: Celsius, ruzgar: km/h, yagis: mm, nem: %.
