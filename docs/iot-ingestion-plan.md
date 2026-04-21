# IoT Ingestion Plan — Tarimiklim

**Durum:** Hazir (implementasyon bekliyor)
**Tetikleyici:** Bu plan sadece **tetikleyici kosullardan biri** gerceklestiginde implemente edilir. Bkz. Bolum 10.
**Mimar:** Orhan Guzel
**Hazirlanma:** 2026-04-18

---

## 1. Amac

Tarimiklim bugun sadece **tuketici** servis (OpenWeatherMap + Open-Meteo + MGM -> API). Bu plan, servise **uretici** tarafini ekler: sahadaki IoT istasyonlarindan gelen gercek olcum verisini kabul eden, dogrulayan, saklayan ve mevcut `frost-risk` / `rain-forecast` endpoint'lerini zenginlestiren bir ingestion katmani tanimlar.

### Neden

- Public API'lerin cozunurlugu **9 km grid** — ilce seviyesi. Parsel seviyesinde don/sulama karari icin yetmiyor.
- Don algoritmasinin 4 faktoru (sicaklik, nem, ruzgar, bulut) parsel bazinda ground truth olmadan re-train edilemez.
- Sera SaaS, Acik Tarla, Hastalik Erken Uyari modulleri ileride bu veriyi tuketecek.

### Neden simdi degil

Bu plan **hazir bekletilir**, implementasyon tetikleyici olaya bagli. Sebep: bugun IoT verisini tuketecek musteri modul yok (Sera SaaS Faz 3'te planlama asamasinda). Veri ureten sistem kurup tuketen olmadan isletmek, operasyonel yuk + veri cop yigini demek.

---

## 2. Mimari Karar Ozeti

| Karar | Secim | Alternatif | Gerekce |
|-------|-------|------------|---------|
| Transport | HTTPS POST | MQTT | GSM uzerinden 5-10dk frekansli ingestion'da MQTT sticky connection avantaji yok, retry/idempotency HTTPS'te daha temiz |
| Storage | MySQL + native RANGE partitioning | TimescaleDB | CLAUDE.md TimescaleDB'yi "Faz 5+" diye isaretliyor. 1. yilda <50M satir beklenen hacim icin MySQL partition yeterli. Migrate ihtiyaci dogunca o zaman karar verilir |
| Auth | API key + HMAC-SHA256 imzasi + timestamp | JWT, mTLS | Dusuk guc/dusuk flash'li ESP32 icin HMAC en pratik. JWT cihazda imzalamak nispeten agir; mTLS sertifika rotation overhead'i ederli degil |
| Cihaz kimligi | UUID v4 + human-readable slug | MAC, IMEI | MAC'i ESP32 flash'i okumak kolay ama spoofing'e acik. UUID v4 backend'ten verilir, kayit sirasinda cihaza yazilir |
| Rate limit | IP + api_key bazli, 30 req/dakika | Yok | Bir istasyon en fazla dakikada 1 okuma gonderir; 30 burst toleransi retry icin yeter |
| Veri fuzyonu | Weighted average — lokal %70, API %30 (conf bazli) | Sadece lokal, sadece API | Lokal sensor arizalandiginda API fallback saglar. Conf skoru <0.5 olunca agirlik dinamik dusurulur |

**En onemli erken karar:** MySQL native partitioning ile baslanir. Bir yil sonra readings tablosu >30M satira yaklasirsa TimescaleDB migrasyonu yeniden degerlendirilir. `iot_station_readings` tablosu **RANGE BY (YEAR(recorded_at)*100 + MONTH(recorded_at))** — aylik partition.

---

## 3. Sema (Seed SQL Dosyalari)

Tum tablolar **yeni seed SQL dosyalarina** eklenir. `ALTER TABLE` kullanilmaz (CLAUDE.md kurali).

### 3.1 `150_iot_stations_schema.sql`

```sql
CREATE TABLE IF NOT EXISTS iot_stations (
  id              VARCHAR(36) PRIMARY KEY,
  slug            VARCHAR(100) UNIQUE NOT NULL,
  name            VARCHAR(255) NOT NULL,
  owner_user_id   VARCHAR(36),
  location_id     VARCHAR(36),
  latitude        DECIMAL(10, 7) NOT NULL,
  longitude       DECIMAL(10, 7) NOT NULL,
  altitude_m      SMALLINT,
  hardware_model  VARCHAR(100),
  firmware_version VARCHAR(50),
  sim_iccid       VARCHAR(30),
  status          ENUM('active', 'inactive', 'maintenance', 'decommissioned') DEFAULT 'active',
  last_seen_at    DATETIME,
  created_at      DATETIME DEFAULT NOW(),
  updated_at      DATETIME DEFAULT NOW() ON UPDATE NOW(),
  INDEX idx_status (status),
  INDEX idx_owner (owner_user_id),
  INDEX idx_location (location_id),
  INDEX idx_coords (latitude, longitude),
  INDEX idx_last_seen (last_seen_at)
);
```

### 3.2 `160_iot_station_readings_schema.sql`

```sql
CREATE TABLE IF NOT EXISTS iot_station_readings (
  id              BIGINT AUTO_INCREMENT,
  station_id      VARCHAR(36) NOT NULL,
  recorded_at     DATETIME NOT NULL,
  received_at     DATETIME NOT NULL DEFAULT NOW(),
  temperature_c   DECIMAL(5, 2),
  humidity_pct    TINYINT UNSIGNED,
  pressure_hpa    DECIMAL(7, 2),
  wind_speed_kmh  DECIMAL(5, 2),
  wind_dir_deg    SMALLINT UNSIGNED,
  precipitation_mm DECIMAL(5, 2),
  soil_moisture_pct TINYINT UNSIGNED,
  soil_temp_c     DECIMAL(5, 2),
  battery_v       DECIMAL(4, 2),
  signal_rssi     SMALLINT,
  raw_payload     JSON,
  quality_flag    ENUM('ok', 'suspect', 'rejected') DEFAULT 'ok',
  PRIMARY KEY (id, recorded_at),
  INDEX idx_station_time (station_id, recorded_at),
  INDEX idx_quality (quality_flag)
)
PARTITION BY RANGE (YEAR(recorded_at)*100 + MONTH(recorded_at)) (
  PARTITION p202604 VALUES LESS THAN (202605),
  PARTITION p202605 VALUES LESS THAN (202606),
  PARTITION p202606 VALUES LESS THAN (202607),
  PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

**Not:** Partition yonetimi icin aylik BullMQ job eklenir — her ayin 25'inde gelecek ayin partition'ini olusturur, 12+ aylik partition'lari arsiv tablosuna tasir.

### 3.3 `170_iot_station_api_keys_schema.sql`

```sql
CREATE TABLE IF NOT EXISTS iot_station_api_keys (
  id              VARCHAR(36) PRIMARY KEY,
  station_id      VARCHAR(36) NOT NULL,
  key_prefix      VARCHAR(12) UNIQUE NOT NULL,
  hmac_secret_hash VARCHAR(255) NOT NULL,
  scopes          JSON,
  is_active       TINYINT DEFAULT 1,
  last_used_at    DATETIME,
  expires_at      DATETIME,
  created_at      DATETIME DEFAULT NOW(),
  revoked_at      DATETIME,
  INDEX idx_station (station_id),
  INDEX idx_prefix (key_prefix),
  INDEX idx_active (is_active)
);
```

**Guvenlik:** `hmac_secret_hash` -> argon2id. Cihaza gonderilecek gercek secret sadece kayit aninda response'ta donulur, DB'de saklanmaz.

---

## 4. Endpoint Spec

### 4.1 Ingestion — Public (device)

```
POST /api/v1/ingest/readings
Content-Type: application/json
X-Station-Id: 9c4f...
X-Key-Prefix: tik_7h2Kp
X-Timestamp: 1745001600
X-Signature: a83f...  (hex HMAC-SHA256)
```

**Body:**
```json
{
  "recorded_at": "2026-04-18T14:30:00Z",
  "readings": {
    "temperature_c": 18.4,
    "humidity_pct": 62,
    "wind_speed_kmh": 8.2,
    "precipitation_mm": 0.0
  },
  "diagnostics": {
    "battery_v": 3.92,
    "signal_rssi": -74
  }
}
```

**Response 202:** `{ "ok": true, "reading_id": 12345 }`

**Hata policy:**
- 401 imza gecersizse
- 409 duplicate `recorded_at` + `station_id`
- 413 batch >100 reading
- 429 rate limit
- Body dogrulama basarisizsa quality_flag='suspect' ile yazilir, 202 doner (cihaz retry etmesin)

### 4.2 Fusion — Internal (consumer modules)

Mevcut `/api/v1/weather/frost-risk` endpoint'i **degistirilmez**, response semasi **genisletilir**:

```json
{
  "risk_score": 78,
  "severity": "high",
  "source": "fused",
  "sources": {
    "api": { "provider": "openweathermap", "weight": 0.30 },
    "local": { "station_id": "9c4f...", "weight": 0.70, "distance_km": 0.0, "age_minutes": 8 }
  },
  "confidence": 0.94
}
```

Yerel istasyon yoksa `source: "api"`, `confidence: 0.68`. Mevcut tuketiciler (Bereketfide widget, Hal Fiyatlari) ek alanlari yoksayabilir — **geriye donuk uyumlu**.

### 4.3 Admin

```
GET    /api/v1/admin/iot/stations
POST   /api/v1/admin/iot/stations
PATCH  /api/v1/admin/iot/stations/:id
POST   /api/v1/admin/iot/stations/:id/api-keys   -> Secret bir kez doner
DELETE /api/v1/admin/iot/stations/:id/api-keys/:keyId
GET    /api/v1/admin/iot/stations/:id/readings?from=...&to=...
```

---

## 5. HMAC Imzalama Sozlesmesi

```
signingString = X-Timestamp + "\n" + METHOD + "\n" + PATH + "\n" + sha256(body)
signature     = HMAC_SHA256(secret, signingString)
```

**Dogrulama:**
- Timestamp drift <= 120 saniye
- Replay koruma: (station_id, timestamp, sha256(body)) son 5 dakika Redis'te unique
- Secret rotation: eski key `revoked_at` set edilir, 24 saat grace period

---

## 6. Fusion Algoritmasi

```
input:  lat, lon, requested_metric (frost_risk | rain_3d | ...)
output: { value, confidence, source, contributors }

1. 5 km yaricapta aktif istasyon bul (last_seen_at < 30dk, quality_flag='ok')
2. Her istasyon icin temel agirlik:
     w_base = 1 / max(distance_km, 0.1)^2
3. Veri tazeligine gore:
     w_fresh = clamp(1 - age_minutes / 60, 0.1, 1.0)
4. Veri kalitesine gore:
     w_quality = quality_flag == 'ok' ? 1.0 : 0.3
5. Toplam yerel agirlik:
     w_local = sum(w_base_i * w_fresh_i * w_quality_i) for all stations in radius
6. API agirligi:
     w_api = max(0.3, 1 - min(w_local, 1.0))   -- en az %30 API
7. Metric hesaplanir, confidence = w_local_normalized + 0.3
```

**Ozel durumlar:**
- Hic yerel istasyon yoksa -> sadece API, confidence 0.68 (current baseline)
- Lokal vs API arasinda >%30 fark -> quality_flag='suspect' flag edilir, monitoring alert

---

## 7. Cihaz Tarafi Kontrakti (Referans)

Donanim ekibi bu spec'e uymak zorunda — firmware secimi ESP-IDF / ESPHome / MicroPython serbest.

- **Uyanma frekansi:** 10 dakikada bir (deep sleep)
- **Batch:** Tek okuma gonderilir, network hatasinda lokal flash'ta maksimum 144 okuma (24 saat) biriktirilir
- **Zaman senkronu:** Ilk bootta + gunde bir NTP
- **Firmware update:** OTA endpoint `GET /api/v1/iot/firmware/:model/latest` (Faz 2 — ilk implementasyonda yok)
- **Healthcheck:** 6 saatte bir `POST /api/v1/ingest/heartbeat` (bos reading) — sadece diagnostics

---

## 8. BullMQ Jobs (Yeni)

| Job | Cron | Amac |
|-----|------|------|
| `iot:partition-maintenance` | Her ayin 25'i 02:00 | Gelecek ay partition olustur, 13+ ay eski olani arsive tasi |
| `iot:stale-station-alert` | 15 dakikada bir | 1 saattir veri gelmeyen aktif istasyonlari admin'e bildir |
| `iot:quality-audit` | Her gun 03:00 | Son 24 saat readings icinde anomali tespiti (z-score >3), suspect flag at |

---

## 9. Out of Scope (Bu Plan'da Yok)

- Ticari hardware uretimi / PCB tasarimi (ayri dokuman)
- Ecowitt / Davis gibi 3. parti cihaz adapter'lari (gerekirse `iot_station_adapters` modulu ayri plan)
- MQTT transport (gelecek opsiyon, ingestion katmani adapter pattern ile genisletilebilir)
- Mobil kullanici uygulamasina istasyon yonetimi (backend API hazir, UI ayri)
- TimescaleDB migrasyonu (ayri plan — tetikleyici: okuma tablosu >30M satir)

---

## 10. Implementasyon Tetikleyicileri

Bu plan asagidaki olaylardan **en az biri** gerceklesene kadar hayata gecmez:

1. Bereketfide veya VistaSeed musterisi parsel bazli don/sulama uyarisi icin **odeme teklif ederse**
2. **Sera SaaS MVP** kod yazimi baslarsa (sera ici CO2/nem icin API alternatifi yok, sensor zorunlu)
3. Don algoritmasi re-train icin ground truth eksikligi **darbogaz olarak dokumante edilirse** (en az 2 vakada yanlis tahmin musteri sikayetiyle gelirse)
4. `frost-risk` endpoint'i icin mevcut musterilerden (Hal Fiyatlari, Sera SaaS plan) cozunurluk yetersizligi **acik talep** olusursa

Tetikleyici yoksa — plan dondurulur, donanim alinmaz, kod yazilmaz.

---

## 11. Implementasyon Sirasi (Tetikleyici Gerceklestiginde)

Tahmini sure: solo dev icin **5-7 is gunu** (donanim haric).

1. **Gun 1:** Seed SQL dosyalari (150, 160, 170) + `db:seed:fresh` ile lokal dogrulama
2. **Gun 2:** `modules/iot/` iskeleti — router, controller, repository, service, validation (Zod)
3. **Gun 3:** HMAC dogrulama middleware + replay koruma (Redis) + rate limiter
4. **Gun 3:** Ingestion endpoint + admin CRUD endpoint'leri
5. **Gun 4:** Fusion algoritmasi — mevcut `frost-risk` service'e enjekte et, eski response geriye uyumlu
6. **Gun 5:** BullMQ jobs (partition, stale alert, quality audit)
7. **Gun 6:** Admin panel UI — istasyon listesi, API key uretim akisi, reading log viewer
8. **Gun 7:** E2E test — fake cihaz scripti (Bun) ile 100 reading gonder + fusion sonuclari karsilastir
9. **Saha:** Tek prototip istasyon 1 ay pilot, OWM verisi ile karsilastirma raporu

---

## 12. Riskler

| Risk | Olasilik | Etki | Azaltma |
|------|----------|------|---------|
| GSM kapsama alani yetersiz (Turkiye ic bolge) | Orta | Yuksek | Ilk pilot lokasyonu once coverage check ile secilir; gerekirse LoRaWAN adapter eklenir |
| Sensor kalibrasyonu drift | Yuksek | Orta | Quality audit job + yillik kalibrasyon prosedurü |
| HMAC secret cihazdan sizabilir (fiziksel erisim) | Dusuk | Orta | Secret rotation, per-device scope, aninda revoke kabiliyeti |
| Okuma hacmi partition'lari asar | Dusuk | Dusuk | Monthly partition + 12 ay sonra arsive tasiyan job |
| Fusion algoritmasi API vs lokal catisirsa yanlis sonuc | Orta | Yuksek | `quality_flag='suspect'` + monitoring alert + insan review |

---

**Son soz:** Bu plan bir gun gerekir diye yazildi, bugun lazim diye degil. Tetikleyici olmadan tek satir kod yazmayin.
