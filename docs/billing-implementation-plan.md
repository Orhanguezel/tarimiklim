# Billing Implementation Plan — Tarimiklim (+ Ekosistem)

**Durum:** Hazir — implementasyon sirketin kurulumuyla paralel
**Tetikleyici:** GWD Teknoloji Ltd. kuruldu + Tarvista ile yazili sozlesme imzalandi
**Mimar:** Orhan Guzel
**Hazirlanma:** 2026-04-18
**Kapsam:** Faz 1 = tarimiklim. Faz 2+ = bereketfide, vistaseed, diger ekosistem

---

## 1. Amac

Tarvista ekosistem sitelerine **SaaS freemium abonelik sistemi** eklemek. Monetization strategy doc'undaki FAZ 1 hedefi (ay 3 sonu ₺100k ciro, 50 odeme yapan musteri) icin **gerekli teknik altyapi**.

### Kapsam
- Plan (tier) yonetimi — Cifci Free / Baslangic / Profesyonel / Kurumsal
- Abonelik yasam dongusu — olusturma, yenileme, upgrade/downgrade, iptal
- Iyzico entegrasyonu — checkout, recurring payment, webhook
- API key sistemi — her abone icin rate-limited key
- Feature gating — endpoint ve ozellik bazli tier kontrolu
- Fatura uretimi — Faz 1 manuel PDF, Faz 2 GIB e-Arsiv
- Kullanim (usage) tracking — rate limit ve analytics
- Admin panel — abone/fatura/plan yonetimi
- Public sayfalar — `/fiyat`, `/abone-ol`, `/profil/abonelik`

### Kapsam disi (bu plan'da yok)
- Referral / affiliate sistemi
- Dinamik fiyatlandirma / A-B testi
- Coupon / indirim kodu (Faz 2)
- Multi-currency (sadece TRY)
- Carrier billing / SMS odeme
- Kripto odeme

---

## 2. Tetikleyici Kosullar

Bu plan **asagidakiler tamamlanmadan implemente edilmez**:

1. **GWD Teknoloji Ltd. resmi olarak kuruldu** (vergi levhasi + banka hesabi + KEP)
2. **Tarvista ↔ GWD Teknoloji Yazilim Hizmet Sozlesmesi imzalandi**
3. **Tarvista Iyzico merchant hesabi aktif** (veya basvuru surecte, onay yaklasiyor)
4. **KVKK aydinlatma metni + uyelik sozlesmesi + cayma hakki sayfalari hazir** (avukat hazirliyor)

Tetikleyici tamamlanmadan kod yazilirsa **canli veri olmadan test edilemez**, zaman kaybi.

---

## 3. Mimari Karar Ozeti

| Karar | Secim | Alternatif | Gerekce |
|-------|-------|------------|---------|
| Kod konumu | `packages/shared-backend/modules/billing/` | tarimiklim'e ozel | CLAUDE.md "2+ projede kullanilacak ise shared" — bereketfide, vistaseed hepsi abonelik satacak |
| Odeme saglayici | Iyzico | PayTR, Stripe Atlas | TR tuccar icin standart, monetization doc karar |
| Abonelik modeli | Iyzico native subscription API | Kendi cron + manual charge | Native API 3D Secure, retry, SCA otomatik. Bakim yukunu dusurur |
| Plan konfigurasyon | DB tablosu (`billing_plans`) | env / kod sabit | Admin panelden plan duzenlenebilir olmali, fiyat/ozellik degisince deploy beklemez |
| Feature gating | Middleware + decorator | Her endpoint'te if-else | Tek yer guncelleme, dekoratif ve aciklanabilir |
| Usage tracking | Redis counter + aylik DB flush | Her istek DB insert | Yuksek frekansli API icin Redis once, maliyet dusuk |
| Fatura | Faz 1 manuel PDF + e-posta; Faz 2 e-Arsiv | Hemen e-Arsiv | Strategy doc "3-4. ayda e-Arsiv gecis" — ilk 50 musteri manuel yeter |
| Rate limit | Redis token bucket | Fastify rate-limit plugin | Tier bazli limit, musterinin anlik kotasi, cache-aware |

### En kritik erken karar

**Iyzico native subscription kullan.** Kendi cron + charge sistemi yazmak 2 hafta is + aylik bakim + ongorulmez basarisizliklar getirir. Native API:
- Recurring payment otomatik
- Kart bilgisi Iyzico'da, PCI-DSS problemi yok
- 3D Secure otomatik
- Retry logic Iyzico'nun elinde
- Webhook ile anlik durum bildirimi

Tarvista merchant hesabinda "Subscription" + "Marketplace" urunleri aktif edilmeli — standart e-ticaret paketinden ayri ozellikler.

### Iyzico Sub-Merchant (Faz 1'de)

Gelir modeli %100 Ltd. / %0 Tarvista (yazilim ve platform gelirleri icin) oldugu icin **B2B pass-through modeli yerine sub-merchant (alt uye isyeri) modeli Faz 1'de** kuruluyor. Sebepler:

- B2B pass-through'da Tarvista defterinde "gelir = gider = 0 kar" akisi vergi denetiminde "niye araci?" sorusu yaratir
- Sub-merchant'ta her taraf kendi satisini kendi tahsil eder — muhasebe temiz
- GWD Teknoloji Ltd. Tarvista'nin Iyzico hesabinda alt uye isyeri olarak kaydedilir
- Mustteri ödemesi anlik split: yazilim/abonelik/reklam → Ltd. IBAN, tarim urun satisi → Tarvista IBAN

Tarvista'nin Iyzico hesabi "Marketplace/Platform" paketine gecer (~2 hafta onay). Teknik entegrasyon: site kodunda her urun/hizmet icin `submerchant_id` belirtilir, Iyzico otomatik yönlendirir.

---

## 4. Sema (Seed SQL Dosyalari)

**Not:** Ayni sema her kullanan projeye (`tarimiklim`, `bereketfide`, `vistaseeds`) kopyalanir. Bereketfide ve VistaSeeds ayri sirketler degil — Tarvista'nin alt markalaridir, ayni ekosistem icinde. `ALTER TABLE` kullanilmaz (CLAUDE.md).

### 4.1 `250_billing_plans_schema.sql`

```sql
CREATE TABLE IF NOT EXISTS billing_plans (
  id              VARCHAR(36) PRIMARY KEY,
  slug            VARCHAR(50) UNIQUE NOT NULL,
  name            VARCHAR(100) NOT NULL,
  description     TEXT,
  price_try       DECIMAL(10, 2) NOT NULL,
  billing_cycle   ENUM('monthly', 'yearly', 'one-time') DEFAULT 'monthly',
  trial_days      TINYINT UNSIGNED DEFAULT 0,
  is_active       TINYINT DEFAULT 1,
  is_custom       TINYINT DEFAULT 0,
  sort_order      TINYINT UNSIGNED DEFAULT 0,
  features        JSON,
  limits          JSON,
  iyzico_product_ref VARCHAR(100),
  created_at      DATETIME DEFAULT NOW(),
  updated_at      DATETIME DEFAULT NOW() ON UPDATE NOW(),
  INDEX idx_active (is_active),
  INDEX idx_slug (slug)
);
```

**`features` JSON ornek:**
```json
{
  "locations_max": 5,
  "forecast_days": 14,
  "hourly_forecast": false,
  "notification_channels": ["telegram", "sms"],
  "api_requests_per_month": 10000,
  "widget_embed": true,
  "iot_hook": false,
  "white_label": false,
  "sla_response_hours": null
}
```

**`limits` JSON ornek:**
```json
{
  "rate_limit_per_minute": 60,
  "rate_limit_per_day": 1000,
  "concurrent_requests": 10,
  "file_upload_mb": 5
}
```

### 4.2 `260_billing_subscriptions_schema.sql`

```sql
CREATE TABLE IF NOT EXISTS billing_subscriptions (
  id              VARCHAR(36) PRIMARY KEY,
  user_id         VARCHAR(36) NOT NULL,
  plan_id         VARCHAR(36) NOT NULL,
  status          ENUM('trial', 'active', 'past_due', 'canceled', 'expired') DEFAULT 'active',
  start_date      DATETIME NOT NULL,
  trial_end_date  DATETIME,
  current_period_start DATETIME NOT NULL,
  current_period_end DATETIME NOT NULL,
  canceled_at     DATETIME,
  cancel_reason   VARCHAR(255),
  iyzico_subscription_ref VARCHAR(100),
  metadata        JSON,
  created_at      DATETIME DEFAULT NOW(),
  updated_at      DATETIME DEFAULT NOW() ON UPDATE NOW(),
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_period_end (current_period_end),
  INDEX idx_iyzico_ref (iyzico_subscription_ref)
);
```

### 4.3 `270_billing_api_keys_schema.sql`

```sql
CREATE TABLE IF NOT EXISTS billing_api_keys (
  id              VARCHAR(36) PRIMARY KEY,
  subscription_id VARCHAR(36) NOT NULL,
  user_id         VARCHAR(36) NOT NULL,
  key_prefix      VARCHAR(16) UNIQUE NOT NULL,
  hashed_secret   VARCHAR(255) NOT NULL,
  name            VARCHAR(100),
  scopes          JSON,
  is_active       TINYINT DEFAULT 1,
  last_used_at    DATETIME,
  expires_at      DATETIME,
  created_at      DATETIME DEFAULT NOW(),
  revoked_at      DATETIME,
  INDEX idx_subscription (subscription_id),
  INDEX idx_user (user_id),
  INDEX idx_prefix (key_prefix),
  INDEX idx_active (is_active)
);
```

**Key format:** `tk_live_` + 32 byte random (base62). Ornek: `tk_live_8h3K2p9XmQwRtYuI7nBv4CxZ5fGjL1aS`.

### 4.4 `280_billing_invoices_schema.sql`

```sql
CREATE TABLE IF NOT EXISTS billing_invoices (
  id              VARCHAR(36) PRIMARY KEY,
  subscription_id VARCHAR(36) NOT NULL,
  user_id         VARCHAR(36) NOT NULL,
  invoice_number  VARCHAR(50) UNIQUE NOT NULL,
  status          ENUM('draft', 'issued', 'paid', 'refunded', 'canceled') DEFAULT 'draft',
  issued_at       DATETIME,
  paid_at         DATETIME,
  due_date        DATETIME,
  subtotal_try    DECIMAL(10, 2) NOT NULL,
  kdv_rate        DECIMAL(5, 2) DEFAULT 20.00,
  kdv_amount_try  DECIMAL(10, 2) NOT NULL,
  total_try       DECIMAL(10, 2) NOT NULL,
  currency        VARCHAR(3) DEFAULT 'TRY',
  payment_method  VARCHAR(50),
  iyzico_payment_ref VARCHAR(100),
  pdf_url         VARCHAR(500),
  earsiv_uuid     VARCHAR(100),
  line_items      JSON,
  billing_address JSON,
  notes           TEXT,
  created_at      DATETIME DEFAULT NOW(),
  updated_at      DATETIME DEFAULT NOW() ON UPDATE NOW(),
  INDEX idx_subscription (subscription_id),
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_number (invoice_number),
  INDEX idx_issued (issued_at)
);
```

### 4.5 `290_billing_usage_events_schema.sql`

```sql
CREATE TABLE IF NOT EXISTS billing_usage_events (
  id              BIGINT AUTO_INCREMENT,
  subscription_id VARCHAR(36) NOT NULL,
  user_id         VARCHAR(36) NOT NULL,
  api_key_id      VARCHAR(36),
  event_type      VARCHAR(50) NOT NULL,
  resource        VARCHAR(100),
  quantity        INT DEFAULT 1,
  metadata        JSON,
  recorded_at     DATETIME NOT NULL,
  PRIMARY KEY (id, recorded_at),
  INDEX idx_subscription_time (subscription_id, recorded_at),
  INDEX idx_event_type (event_type)
)
PARTITION BY RANGE (YEAR(recorded_at)*100 + MONTH(recorded_at)) (
  PARTITION p202604 VALUES LESS THAN (202605),
  PARTITION p202605 VALUES LESS THAN (202606),
  PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

### 4.6 `300_billing_payments_schema.sql`

```sql
CREATE TABLE IF NOT EXISTS billing_payments (
  id              VARCHAR(36) PRIMARY KEY,
  invoice_id      VARCHAR(36),
  subscription_id VARCHAR(36),
  user_id         VARCHAR(36) NOT NULL,
  amount_try      DECIMAL(10, 2) NOT NULL,
  status          ENUM('pending', 'success', 'failed', 'refunded') NOT NULL,
  provider        VARCHAR(50) DEFAULT 'iyzico',
  provider_payment_id VARCHAR(100),
  provider_conversation_id VARCHAR(100),
  card_last_four  VARCHAR(4),
  card_family     VARCHAR(20),
  error_code      VARCHAR(50),
  error_message   TEXT,
  raw_response    JSON,
  created_at      DATETIME DEFAULT NOW(),
  updated_at      DATETIME DEFAULT NOW() ON UPDATE NOW(),
  INDEX idx_invoice (invoice_id),
  INDEX idx_subscription (subscription_id),
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_provider_ref (provider_payment_id)
);
```

### 4.7 `310_billing_plans_seed.sql`

```sql
INSERT INTO billing_plans (id, slug, name, price_try, billing_cycle, trial_days, features, limits, sort_order, is_active) VALUES

-- Ciftci (Free)
(UUID(), 'ciftci-free', 'Ciftci', 0.00, 'monthly', 0,
 '{"locations_max": 1, "forecast_days": 7, "hourly_forecast": false, "notification_channels": ["telegram"], "api_requests_per_month": 3000, "widget_embed": false, "iot_hook": false, "white_label": false}',
 '{"rate_limit_per_minute": 10, "rate_limit_per_day": 100, "concurrent_requests": 3}',
 1, 1),

-- Baslangic ₺199/ay
(UUID(), 'baslangic', 'Baslangic', 199.00, 'monthly', 14,
 '{"locations_max": 5, "forecast_days": 14, "hourly_forecast": false, "notification_channels": ["telegram", "sms"], "api_requests_per_month": 10000, "widget_embed": true, "iot_hook": false, "white_label": false}',
 '{"rate_limit_per_minute": 60, "rate_limit_per_day": 1000, "concurrent_requests": 10}',
 2, 1),

-- Profesyonel ₺599/ay
(UUID(), 'profesyonel', 'Profesyonel', 599.00, 'monthly', 14,
 '{"locations_max": -1, "forecast_days": 14, "hourly_forecast": true, "notification_channels": ["telegram", "sms", "whatsapp"], "api_requests_per_month": 50000, "widget_embed": true, "iot_hook": true, "white_label": false, "sla_response_hours": 24}',
 '{"rate_limit_per_minute": 300, "rate_limit_per_day": 5000, "concurrent_requests": 50}',
 3, 1),

-- Kurumsal (is_custom=1, iletisim form uzerinden)
(UUID(), 'kurumsal', 'Kurumsal', 2499.00, 'monthly', 0,
 '{"locations_max": -1, "forecast_days": 30, "hourly_forecast": true, "notification_channels": ["telegram", "sms", "whatsapp", "email", "custom"], "api_requests_per_month": -1, "widget_embed": true, "iot_hook": true, "white_label": true, "sla_response_hours": 4, "custom_algorithm": true}',
 '{"rate_limit_per_minute": -1, "rate_limit_per_day": -1, "concurrent_requests": -1}',
 4, 1);
```

**Not:** `locations_max: -1` = sinirsiz. `api_requests_per_month: -1` = sinirsiz.

---

## 5. API Endpoints

### 5.1 Public (musteri)

```
GET    /api/v1/billing/plans                       # Aktif planlari listele
GET    /api/v1/billing/plans/:slug                 # Plan detay

POST   /api/v1/billing/subscribe                   # Yeni abonelik baslat
       Body: { plan_slug, billing_address, payment_card_token }
       Response: { subscription, iyzico_checkout_url, redirect }

POST   /api/v1/billing/webhook/iyzico              # Iyzico webhook (HMAC imzali)

GET    /api/v1/billing/subscription                # Kullanicinin aktif aboneligi
PATCH  /api/v1/billing/subscription                # Plan degistir (upgrade/downgrade)
       Body: { new_plan_slug }
DELETE /api/v1/billing/subscription                # Iptal et
       Body: { reason }

GET    /api/v1/billing/invoices                    # Kendi faturalari
GET    /api/v1/billing/invoices/:id                # Fatura detay
GET    /api/v1/billing/invoices/:id/pdf            # Fatura PDF (signed URL)

GET    /api/v1/billing/usage                       # Kullanim istatistigi
       Query: ?period=current_month
       Response: { api_calls, notifications_sent, locations_active, limits }

POST   /api/v1/billing/api-keys                    # Yeni API key uret
       Response: { key_prefix, full_key }  # full_key sadece bir kez doner
GET    /api/v1/billing/api-keys                    # Kendi key'lerini listele
DELETE /api/v1/billing/api-keys/:id                # Key iptal
```

### 5.2 Admin

```
GET    /api/v1/admin/billing/plans
POST   /api/v1/admin/billing/plans                 # Yeni plan olustur
PATCH  /api/v1/admin/billing/plans/:id             # Plan guncelle

GET    /api/v1/admin/billing/subscriptions         # Tum abonelikler
       Query: ?status=active&plan=profesyonel&page=1
GET    /api/v1/admin/billing/subscriptions/:id
POST   /api/v1/admin/billing/subscriptions/:id/refund
POST   /api/v1/admin/billing/subscriptions/:id/force-cancel

GET    /api/v1/admin/billing/invoices              # Tum faturalar
POST   /api/v1/admin/billing/invoices/:id/resend   # E-posta tekrar gonder
POST   /api/v1/admin/billing/invoices/:id/earsiv   # GIB e-Arsiv gonder (Faz 2)

GET    /api/v1/admin/billing/analytics/mrr         # Aylik tekrarlayan gelir
GET    /api/v1/admin/billing/analytics/churn       # Iptal orani
GET    /api/v1/admin/billing/analytics/ltv         # Musteri yasam degeri

GET    /api/v1/admin/billing/payments              # Odeme log
POST   /api/v1/admin/billing/payments/:id/retry    # Basarisiz odemeyi tekrar dene
```

### 5.3 Internal (feature gating)

```
# Middleware tarafindan cagrilir, dissarida expose degil
GET    /internal/billing/entitlement               # Kullanicinin erisim haklari
       Header: X-User-Id
       Response: { plan_slug, features, limits, is_active }
```

Bu endpoint Redis'ten cache'lenir — her istekte DB'ye gitmez.

---

## 6. Iyzico Entegrasyonu

### 6.0 Merchant Yapisi (Sub-Merchant Modeli)

- **Ana merchant:** Tarvista A.S. — Iyzico "Marketplace/Platform" paketi
- **Alt uye isyeri (sub-merchant):** GWD Teknoloji Ltd. — Ltd. kurulur kurulmaz eklenir

Her abonelik veya yazilim satisi `subMerchantKey` ile GWD Teknoloji'a route edilir. Tarim urunu satisi `subMerchantKey` olmadan default Tarvista merchant'ina gider.

Her subscription/satis icin:
- Yazilim/abonelik/API/widget/reklam → `subMerchantKey = GWD_KEY` (env)
- Tarim urun satisi (tohum/fide) → `subMerchantKey` YOK (default ana merchant)

Teknik entegrasyon: site kodunda odeme baslatilirken urun kategorisine gore `subMerchantKey` belirtilir.

### 6.1 Subscribe Flow

```
1. User "/fiyat" sayfasinda plan sec
2. "/abone-ol?plan=profesyonel" sayfasi
3. Billing address + kart formu (Iyzico hosted iframe)
4. POST /api/v1/billing/subscribe (sunucu taraf)
   - User kaydi yoksa olustur
   - Iyzico'da "Subscription Customer" olustur (eger yoksa)
   - Iyzico'da "Subscription" olustur:
     - plan + payment card
     - subMerchantKey = GWD_KEY   (ozel: para Ltd.'ye route edilir)
   - DB'de billing_subscriptions kaydi (status=trial veya active)
   - DB'de ilk billing_invoices kaydi (ay 1, GWD Teknoloji adina)
5. Iyzico 3D Secure redirect
6. Odeme basarili -> webhook gelir, para Ltd. IBAN'ina direkt dusmus
7. User dashboard'a yonlendir, "abonelik aktif" mesaji
```

### 6.2 Webhook Handler

Iyzico webhook her subscription olayinda bildirim gonderir:
- `subscription_created`
- `subscription_renewed`
- `subscription_canceled`
- `payment_succeeded`
- `payment_failed`
- `refund_processed`

**Islenir:**
- HMAC imza dogrulama (Iyzico secret ile)
- Replay koruma (event_id Redis'te 24 saat unique)
- DB guncelleme (subscription, invoice, payment)
- User'a bildirim (e-posta + Telegram)

**Rety policy:** Iyzico 3 kez retry eder. Webhook'u idempotent yaz (ayni event_id iki kez gelirse DB bozulmasin).

### 6.3 Upgrade / Downgrade

- **Upgrade (düsük->yuksek tier):** Iyzico "Prorated billing" — kalan sureyi oransal hesapla, yeni planin bedeli fark olarak cekilir
- **Downgrade:** Mevcut donem bitene kadar eski plan aktif kalir. Yeni donem basinda yeni plan
- **Faz 1 basitlestirme:** Upgrade anlik etki + full charge. Downgrade next period. Proration Faz 2'de.

### 6.4 Cancel Flow

- User "iptal" tiklar
- Iptal sebebi formu (opsiyonel, churn analizi icin)
- Iyzico subscription iptal
- DB'de `status='canceled'`, `canceled_at=now()`
- Donemin sonuna kadar erisim devam eder (Iyzico da boyle, "gracefully")
- Donem bitiminde user'i `entitlement=free` dusur

---

## 7. Feature Gating ve Rate Limit

### 7.1 Middleware

```typescript
// shared-backend/modules/billing/middleware/requireFeature.ts
export function requireFeature(featureKey: string, minValue?: any) {
  return async (req, reply) => {
    const userId = getAuthUserId(req);
    const entitlement = await getEntitlement(userId);
    
    if (!entitlement.features[featureKey]) {
      return reply.code(403).send({
        error: 'feature_not_available',
        required_feature: featureKey,
        upgrade_url: '/fiyat',
      });
    }
    
    if (minValue !== undefined && entitlement.features[featureKey] < minValue) {
      return reply.code(403).send({
        error: 'feature_limit_exceeded',
        current_limit: entitlement.features[featureKey],
        required: minValue,
      });
    }
  };
}
```

### 7.2 Rate Limit (Redis Token Bucket)

```typescript
// shared-backend/modules/billing/middleware/rateLimit.ts
export async function rateLimitByApiKey(req, reply) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return; // public endpoint
  
  const key = await verifyApiKey(apiKey);
  const entitlement = await getEntitlement(key.user_id);
  
  const bucketKey = `rl:${key.id}:minute`;
  const current = await redis.incr(bucketKey);
  if (current === 1) await redis.expire(bucketKey, 60);
  
  if (current > entitlement.limits.rate_limit_per_minute) {
    return reply.code(429).send({
      error: 'rate_limit_exceeded',
      retry_after: await redis.ttl(bucketKey),
    });
  }
  
  // Usage event ekle (async, gelis yavaslatmaz)
  recordUsageEvent(key, 'api_call').catch(() => {});
}
```

### 7.3 Kullanim Saymma

Her API cagri Redis counter artirir:
- `usage:${subscription_id}:${YYYYMM}:api_calls`
- TTL: ayin sonu + 7 gun (raporlama icin)
- Gun sonunda (cron 23:59) DB'ye flush: `billing_usage_events` insert

Monthly usage:
- `GET /api/v1/billing/usage` Redis'ten anlik okur
- Rapor icin DB'den tarihsel sorgu

---

## 8. Fatura Sistemi

### 8.1 Faz 1 — Manuel PDF (Ay 0-3)

- Abonelik basladiginda: `billing_invoices` kaydi `status='issued'`
- PDF uretimi: Fastify endpoint + HTML template + Puppeteer ya da PDFKit
- Template: GWD Teknoloji Ltd. bilgileri + musteri bilgileri + KDV breakdown
- Storage: local `/uploads/invoices/{year}/{month}/INV-{number}.pdf`
- E-posta: SMTP uzerinden musteriye PDF link
- Admin manuel olarak resmi GIB fatura kesiyor (Logo/Luca/matbu)

**Limitasyon:** Aylik <50 musteri icin yeter. Daha cok olunca Faz 2 sart.

### 8.2 Faz 2 — GIB e-Arsiv (Ay 3+)

- Mali musavir secer: Logo, Luca, Mikro, Paraşüt gibi hazir GIB entegrasyonu olan bir platform
- Integrasyon: API uzerinden `earsiv.com.tr` veya secilen saglayici
- `billing_invoices.earsiv_uuid` ile GIB'deki fatura referansi takip
- Otomatik fatura kesimi: abonelik basladiginda / yenilendiginde
- Admin panelde "GIB'de fatura kesildi" durumu
- Musteri PDF direkt GIB'den indirilebilir

**Trigger:** Aylik fatura sayisi >50 veya stratejik karar (ay 3 plan).

### 8.3 Fatura numarasi

Format: `GWD-{YYYY}{MM}-{0000N}` (GWD Teknoloji + yil + ay + sira)

Ornek: `GWD-202604-00001`, `GWD-202604-00002`, ...

Her ay sayaç sifirlanir. Atomik increment: `SELECT COALESCE(MAX(...), 0) + 1 FOR UPDATE`.

---

## 9. Multi-Site Konfigurasyon

**Onemli:** Bereketfide ve VistaSeeds ayri sirketler degil — Tarvista'nin alt markalaridir. Tum siteler Tarvista'nin ana Iyzico merchant hesabi altinda, GWD Teknoloji ise sub-merchant olarak her sitede ayni yapiyla entegre olur.

### 9.1 Faz 1 — Sadece tarimiklim

`packages/shared-backend/modules/billing/` kodu tarimiklim'e register edilir. Tablolar tarimiklim DB'sinde. Iyzico sub-merchant entegrasyonu tarimiklim site kodunda.

### 9.2 Faz 2+ — Bereketfide, VistaSeeds

Ayni kod baska projelere register edilir. Her proje kendi DB'sinde billing tablolari olur (izole). Iyzico sub-merchant bilgisi ayni (GWD Teknoloji Ltd.), sadece site kodlarinda submerchantKey env uzerinden kullanilir.

**Plan ayrimi:** Her proje kendi `billing_plans` seed'ini yazar:
- **Tarimiklim**: hava durumu odakli tier'lar (Ciftci/Baslangic/Profesyonel/Kurumsal)
- **Bereketfide**: fide katalog odakli (premium listeleme, sezonluk bulten)
- **VistaSeeds**: tohum + bayi odakli (bayi panel, toplu alim iskontosu)

Bir kullanici birden fazla sitede aboneligi olabilir — ama **ayri user_id'ler** (her sitenin kendi auth'u). Ekosistem geneli SSO Faz 5+ (strategy doc).

**Tahsilat akisi hep ayni:** Site X'te yazilim/abonelik satisi → Iyzico sub-merchant (GWD Teknoloji) → Ltd. IBAN. Site X'te tarim urun satisi → ana merchant (Tarvista) → Tarvista IBAN.

---

## 10. Admin Panel (UI)

Mevcut admin panel yapisina (tarimiklim ve digerlerinde) eklenir:

**Sidebar:** "Abonelikler" menusu
- **Planlar** — plan listesi, duzenleme, aktif/pasif
- **Aboneler** — liste, filtre (status, plan), detay modal
- **Faturalar** — liste, PDF indir, e-posta tekrar
- **Odemeler** — basarili/basarisiz log, retry butonu
- **Analytics** — MRR, churn, LTV grafikleri

**Priority:** Aboneler sayfasi + Faturalar sayfasi MVP. Analytics Faz 2.

---

## 11. Frontend Sayfalari (Public)

### 11.1 `/tr/fiyat`

- Hero: "Her olcekte dogru cozum"
- 4 plan karti (Ciftci, Baslangic, Profesyonel, Kurumsal)
- Karsilastirma tablosu (ozellik/plan matrix)
- SSS
- CTA: "Baslangic" -> `/tr/abone-ol?plan=baslangic`
- Kurumsal: "Bize Ulasin" form

### 11.2 `/tr/abone-ol`

- Plan ozeti (sol)
- Kayit + billing address formu (sag)
- Iyzico kart iframe
- "Abone Ol" -> POST /api/v1/billing/subscribe
- 3D Secure -> basari sayfasi

### 11.3 `/tr/profil/abonelik`

- Mevcut plan
- Sonraki yenileme tarihi
- "Plan degistir" butonu -> upgrade/downgrade modal
- "Iptal et" butonu (onay dialog)
- Fatura gecmisi (son 12 ay)
- API keys bolumu
- Kullanim grafikleri

---

## 12. KVKK ve Hukuki

Abonelik baslatmadan once onay alinmasi gereken metinler (avukat hazirliyor, kontrat paralel):

- [ ] **Uyelik Sozlesmesi** — checkbox "okudum kabul ediyorum"
- [ ] **KVKK Aydinlatma Metni** — kayit sirasinda goster
- [ ] **Cayma Hakki** — 14 gun cayma, KVKK kapsaminda
- [ ] **Gizlilik Politikasi** — ayri sayfa
- [ ] **Cookie Banner** — site geneli

**Teknik gereksinim:** Her user kaydinda `accepted_terms_at` + `terms_version` saklanir.

---

## 13. Implementasyon Sirasi

Tetikleyici (Ltd. + sozlesme) tamamlandiginda. Toplam: **~3 hafta solo dev**.

### Hafta 1 — Sema + Core
- Gun 1: Seed SQL'ler (250-310) + `db:seed:fresh` lokal
- Gun 2: `shared-backend/modules/billing/` iskelet — router, controller, service, repository
- Gun 3: Plan CRUD + entitlement query + Redis cache
- Gun 4: API key uretim + validation
- Gun 5: Middleware — `requireFeature`, `rateLimitByApiKey`

### Hafta 2 — Iyzico + Abonelik
- Gun 1-2: Iyzico SDK kurulum + subscription API wrapper
- Gun 3: `/subscribe` endpoint + checkout redirect
- Gun 4: Webhook handler + HMAC + idempotency
- Gun 5: Cancel + upgrade flow

### Hafta 3 — Fatura + Frontend + Admin
- Gun 1: Fatura olusturma + PDF template + SMTP e-posta
- Gun 2: `/tr/fiyat` sayfasi (mevcut design system)
- Gun 3: `/tr/abone-ol` sayfasi + Iyzico iframe
- Gun 4: `/tr/profil/abonelik` sayfasi
- Gun 5: Admin panel — aboneler + faturalar

### Hafta 4 — Test + Canli
- E2E test: fake card + Iyzico test ortami
- Webhook dogrulama
- Fatura PDF kontrol
- KVKK metinlerinin (avukat verisi) sayfalara yerlestirilmesi
- Production deploy + monitoring

---

## 14. Ortam Degiskenleri

`.env.example`'a eklenecekler:

```bash
# Iyzico
IYZICO_API_KEY=
IYZICO_SECRET_KEY=
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com  # prod: https://api.iyzipay.com
IYZICO_CALLBACK_URL=https://tarimiklim.com/api/v1/billing/webhook/iyzico
IYZICO_RETURN_URL=https://tarimiklim.com/tr/profil/abonelik?status=success

# Billing
BILLING_COMPANY_NAME=GWD Teknoloji Bilisim Ltd. Sti.
BILLING_COMPANY_TAX_NUMBER=
BILLING_COMPANY_ADDRESS=
BILLING_KDV_RATE=20
BILLING_INVOICE_PREFIX=GWD
BILLING_TRIAL_DAYS_DEFAULT=14

# Iyzico Sub-Merchant (GWD Teknoloji Ltd. alt uye isyeri)
# Tarvista'nin Marketplace Iyzico hesabinda Ltd. sub-merchant olarak eklenince gelir
GWD_SUBMERCHANT_KEY=
GWD_IBAN=
GWD_TAX_NUMBER=

# E-Arsiv (Faz 2)
EARSIV_PROVIDER=paraşüt  # paraşüt, logo, luca
EARSIV_API_KEY=
EARSIV_ENABLED=false  # Faz 1 = false, Faz 2 = true

# Notifications
BILLING_NOTIFICATION_EMAIL=destek@tarimiklim.com
BILLING_ADMIN_EMAIL=admin@tarimiklim.com
```

---

## 15. Test Stratejisi

### Unit tests
- Plan limits validation
- API key hash + verify
- Rate limit logic (mocked Redis)
- Entitlement merge (trial + active + cancel logic)

### Integration tests
- Iyzico sandbox — test card ile subscribe akisi
- Webhook — gecerli/gecersiz imza, replay, retry
- Cancel → next period entitlement degisimi
- Upgrade → proration
- Fatura PDF uretimi

### E2E
- Yeni user kayit -> plan secim -> odeme -> dashboard
- Plan degistir senaryo
- Iptal senaryo

Iyzico sandbox: https://sandbox-merchant.iyzipay.com/ — test kart numaralari Iyzico doc'unda.

---

## 16. Monitoring

### Metrikler (Sentry + kendi dashboard)

- `billing.subscription.created` / `renewed` / `canceled` counters
- `billing.payment.success` / `failed` counters
- `billing.webhook.received` / `processed` / `rejected`
- `billing.api.rate_limit_hit` counter
- `billing.mrr` gauge (guncel MRR)
- `billing.churn_rate` gauge (30 gunluk)

### Alertler

- Webhook `failed` > %5 (son 1 saat) -> kritik
- Payment `failed` > %10 (son 24 saat) -> uyari
- MRR 10% dustu (gun/gun) -> uyari
- API rate limit hit > 1000/saat (sisteme yuk) -> bilgi

---

## 17. Riskler

| Risk | Olasilik | Etki | Azaltma |
|------|----------|------|---------|
| Iyzico merchant onay gecikmesi | Orta | Yuksek | Basvuruyu Ltd. kurulur kurulmaz yap, paralel bekletme |
| Webhook replay / idempotency hatasi | Orta | Orta | Redis 24h event_id unique + DB unique constraint |
| 3D Secure musteri dusurmesi | Yuksek | Orta | Alternatif non-3D test + Iyzico optimize one-click |
| KDV orani degisimi | Dusuk | Dusuk | DB'de saklaniyor, env'de default — degisince guncellenir |
| Cayma hakki suistimali | Orta | Dusuk | 14 gun icinde abonelige erisim log, cok kullanimsa cayma reddi (sinirli hak) |
| e-Arsiv entegrasyon gecikmesi | Dusuk | Orta | Faz 1 manuel PDF + matbu fatura yeter ilk 50 musteri |
| Iyzico komisyon oranı degisimi | Orta | Dusuk | Sözleşme ile 12 ay fix, sonra revize |
| Fatura numara catismasi (concurrent) | Dusuk | Yuksek | MySQL FOR UPDATE lock + retry logic |

---

## 18. Out of Scope (Bu Plan'da Yok)

- **Coupon / indirim kodu** — Faz 2, marketing basladiginda
- **Referral program** — Faz 2
- **A/B testing plan fiyatlari** — Faz 3
- **Multi-currency (USD/EUR)** — sadece TRY, yurt disi musteri ileride
- **Enterprise custom pricing** — Kurumsal plan iletisim form + manuel, otomatik degil
- **Tax exempt handling** — KVKK muaf durumlar (az gorulur)
- **Dunning management** — 3 deneme basarisiz sonrasi elle mudahale, otomatik gelismis dunning Faz 2
- **Revenue recognition / accrual accounting** — mali musavir yapar, sistemde yok
- **Ecosystem SSO** — Faz 5 (bereketfide + vistaseed + tarimiklim tek hesap)

---

## 19. Kod Konumu (Kesin)

```
packages/shared-backend/modules/billing/
├── index.ts                  # Module entry (registerBilling)
├── router.ts                 # Route definitions
├── controller.ts             # HTTP handlers
├── service.ts                # Business logic
├── repository.ts             # DB queries (Drizzle)
├── schema.ts                 # Drizzle schemas
├── validation.ts             # Zod schemas
├── middleware/
│   ├── requireFeature.ts
│   ├── requireActiveSub.ts
│   └── rateLimitByApiKey.ts
├── providers/
│   ├── iyzico/
│   │   ├── client.ts         # Iyzico SDK wrapper
│   │   ├── subscription.ts   # Subscription API
│   │   ├── webhook.ts        # Webhook verification
│   │   └── types.ts
│   └── earsiv/               # Faz 2
│       ├── parasut.ts
│       └── logo.ts
├── invoice/
│   ├── generator.ts          # PDF generation
│   ├── template.html         # Invoice template
│   └── numbering.ts          # Atomic invoice number
├── helpers/
│   ├── entitlement.ts        # Feature resolution
│   ├── apiKey.ts             # Key generation + hash
│   ├── usage.ts              # Redis counter + DB flush
│   └── cache.ts
└── types.ts
```

Frontend (tarimiklim'e ozel):

```
projects/tarimiklim/frontend/src/app/[locale]/
├── fiyat/page.tsx
├── abone-ol/page.tsx
└── profil/abonelik/page.tsx

projects/tarimiklim/admin_panel/src/app/admin/
└── abonelikler/
    ├── planlar/page.tsx
    ├── aboneler/page.tsx
    ├── faturalar/page.tsx
    └── analytics/page.tsx
```

---

## 20. Son Soz

Bu plan sirketin kurulumu + Tarvista sozlesmesi tamam olduktan sonra 3 hafta icinde canliya cikarilabilir. Strategy doc'undaki "ay 3 ₺100k ciro" hedefinin onkosulu.

Tetikleyici gerceklesmeden tek satir kod yazilmaz — aksi halde canli test yapilamayan bolum sistem uretiriz.
