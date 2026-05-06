# Kullanıcı Bazlı Uyarı Sistemi — Plan & Çekist

## Durum Analizi

### VPS Gözlemi
- `check-frost-risk` job'ı **saatte bir** 55 konumun tamamını kontrol ediyor
- Eşiği aşan her konum için Telegram mesajı `defaultChatId`'ye gidiyor (admin chat)
- Örnek: 02:00 → 6 uyarı, 03:00 → 2 uyarı, 04:00 → 2 uyarı (sadece bir gece)

### Sorunun Kaynağı (`backend/src/modules/alerts/service.ts`)
- `weather_alert_rules` tablosu `user_id` kolonu içeriyor **ama** delivery kodu bunu kullanmıyor
- Kural yoksa kod default davranışa düşüyor: `threshold: 30, channels: ['telegram']`
- Tüm mesajlar tek global `defaultChatId`'ye gidiyor → admin her şehrin uyarısını alıyor

---

## Faz 0 — Acil: Admin Spam'i Durdur

**Hedef:** Kural olmayan konumlar için Telegram gönderme.

- [x] `service.ts` içinde fallback default'u kaldır
  - Satır ~37: `if no rules → threshold: 30, channels: ['telegram']` bloğunu sil
  - Kural yoksa → sadece log'la, Telegram gönderme
- [x] Lokal test: kural olmadan job çalıştır, mesaj gitmediğini doğrula
  - Sonuç: `sent: false`, `reason: "no_subscribers"`
  - `weather_alerts` satır sayısı değişmedi: `0 → 0`
- [ ] VPS deploy

> **Etki:** Bu tek değişiklik mevcut spamı keser. Hiçbir kullanıcı
> subscribe olmadığı sürece mesaj gitmiyor.

---

## Faz 1 — DB: Kullanıcı Telegram Chat ID

**Hedef:** Her kullanıcı kendi Telegram chat_id'sini kaydedebilsin.

- [x] `user_profiles` tablosuna `telegram_chat_id VARCHAR(50) DEFAULT NULL` ekle
  - Seed SQL'i güncelle (ALTER değil — CREATE TABLE tanımına ekle)
  - [x] `bun run db:seed:fresh` ile lokal uygula
- [x] Drizzle schema'yı güncelle (`modules/profiles/schema.ts` veya ilgili dosya)
- [x] `weather_alert_rules` tablosu zaten doğru yapıda — değişiklik yok
  - Kolonlar: `user_id`, `location_id`, `alert_type`, `channel`, `threshold`, `is_active`

---

## Faz 2 — Backend: Kullanıcı Abonelik API'leri

**Hedef:** Kullanıcılar kendi uyarı kurallarını yönetebilsin (sadece admin değil).

### Yeni Public Endpoint'ler (auth required)

- [x] `GET  /api/v1/me/alert-rules` — kullanıcının kendi kuralları
- [x] `POST /api/v1/me/alert-rules` — yeni kural ekle
  - Body: `{ location_id, alert_type, threshold, channel }`
  - `user_id` token'dan alınır, body'den değil
- [x] `DELETE /api/v1/me/alert-rules/:id` — kural sil (sadece kendi kuralı)
- [x] `PATCH /api/v1/me/alert-rules/:id` — aktif/pasif güncelle (sadece kendi kuralı)

### Telegram Chat ID Endpoint'i

- [x] `PUT /api/v1/me/telegram-chat-id` — body: `{ chat_id: string }`
- [x] `GET /api/v1/me/telegram-chat-id` — kayıtlı chat_id oku
  - Profil güncelleme endpoint'ine eklenebilir

### Lokal API Testleri

- [x] Geçici kullanıcı ile Telegram Chat ID kaydet/oku testi
  - `PUT /api/v1/me/telegram-chat-id` → `200`
  - `GET /api/v1/me/telegram-chat-id` → `200`
- [x] Geçici kullanıcı ile alert rule CRUD testi
  - Liste başlangıç: `0`
  - Kural ekleme: `201`, `user_id` token'dan geldi
  - Aktif/pasif güncelleme: `200`, `isActive: 0`
  - Silme: `200`
  - Final liste: `0`
- [x] Test verisi temizliği doğrulandı
  - Geçici kullanıcı: `0`
  - Orphan rule: `0`

### Dosya Yapısı

```
modules/alerts/
├── router.ts          ← /me/alert-rules rotaları eklenir
├── controller.ts      ← me handler'ları eklenir
├── repository.ts      ← repoGetRulesByUser, repoCreateUserRule, repoDeleteUserRule
└── validation.ts      ← createUserAlertRuleSchema eklenir
```

---

## Faz 3 — Backend: Per-User Delivery Refactor

**Hedef:** Her kullanıcı sadece abone olduğu şehrin uyarısını alsın.

### Repository

- [x] `repoGetSubscribedUsersForLocation(locationId, alertType)` fonksiyonu
  - `weather_alert_rules JOIN user_profiles` → `telegram_chat_id` dahil user listesi döner

### Service (`checkAndSendFrostAlerts`)

- [x] Rules'dan subscribed user listesi çıkar
- [x] Her user için:
  - `channel === 'telegram'` ve `user.telegram_chat_id` varsa → o chat_id'ye gönder
  - `channel === 'email'` → `user.email` adresine gönder
- [ ] `channel === 'push'` → kullanıcının Firebase/FCM tokenlarına gönder
- [x] Admin global fallback'i tamamen kaldır

### Spam Koruması

- [x] `weather_alerts` tablosuna `user_id VARCHAR(36) DEFAULT NULL` ekle
  - Aynı `(user_id, location_id, alert_type, forecast_date)` için 12 saatte 1 gönder
  - Seed SQL güncelle

### Lokal Delivery Testleri

- [x] Abonelik olmayan konumda delivery atlandı
  - `reason: "no_subscribers"`
  - Alert kaydı oluşmadı
- [x] Geçici e-posta aboneliğiyle kişi bazlı delivery yolu test edildi
  - Kullanıcıya bağlı `weather_alerts.user_id` kaydı oluştu
  - SMTP ayarı olmadığı için beklenen sonuç: `delivery_failed`
  - Test alert/user/rule kayıtları temizlendi

### Örnek Yeni Akış

```
Job tetiklenir (saatte 1)
  └── Her aktif konum için:
        ├── repoGetSubscribedUsersForLocation(locationId, 'frost')
        │     → [{ userId, telegramChatId, threshold, channel }, ...]
        ├── Eğer subscriber yoksa → ATLA (log yaz)
        └── Eşiği aşan forecast varsa:
              ├── Her subscriber için spam check (12h)
              └── İlgili kanala gönder (telegram, email, push)
```

---

## Faz 4 — Frontend: Kullanıcı Abonelik UI

**Hedef:** Kullanıcılar kendi profil sayfasından şehir/uyarı aboneliği yapabilsin.

### Profil Ayarları

- [x] Telegram Chat ID alanı ekle
  - Nasıl bulunur notu: `t.me/userinfobot`'tan öğrenilir
  - Input + Kaydet butonu

### Uyarı Abonelikleri Sayfası

Rota: `/admin/tarimiklim/alert-subscriptions`

- [x] Mevcut abonelikler listesi (aktif/pasif toggle)
- [x] Yeni abonelik ekle formu:
  - Şehir/konum seç (locations API'den)
  - Alert tipi: Don / Yağmur / Sıcaklık
  - Eşik değeri: 30 (Düşük) / 50 (Orta) / 80 (Kritik)
  - Kanal: Telegram / E-posta
- [x] Abonelik sil

### Admin Panel

- [x] Kullanıcıların aboneliklerini görme (mevcut admin endpoint'i genişlet)

---

## Faz 5 — Firebase / FCM Push Bildirimleri

**Hedef:** Üyeler mobil cihazlarında don uyarısını push notification olarak alabilsin. Telegram aynı şekilde çalışmaya devam eder.

### Firebase Admin Ayarı

- [x] Firebase service account JSON lokal backend'e kopyalandı
  - Kaynak: `/home/orhan/Documents/Projeler/goldmoodastro/doc/goldmoodastro-firebase-adminsdk-fbsvc-7d2ef5db46.json`
  - Hedef: `backend/secrets/firebase-service-account.json`
  - Dosya izni: `600`
- [x] Secret dosya git'e girmesin diye ignore edildi
  - `.gitignore` → `backend/secrets/`
  - `backend/.gitignore` → `secrets/`
- [x] `FIREBASE_SERVICE_ACCOUNT_PATH=./secrets/firebase-service-account.json` lokal `.env` içine eklendi
- [x] `backend/src/modules/alerts/fcm.ts` service account JSON path desteği aldı
  - JSON varsa `admin.credential.cert(...)` buradan kurulur
  - Yoksa eski `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` env akışı çalışır
- [x] `backend/.env.example` Firebase ayarlarıyla güncellendi
- [x] Backend build doğrulandı: `bun run build`

### Push Token Saklama

- [ ] `user_push_tokens` tablosu ekle
  - Önerilen kolonlar: `id`, `user_id`, `token`, `provider`, `platform`, `device_id`, `is_active`, `last_seen_at`, `created_at`, `updated_at`
  - `provider`: `fcm` veya `expo`
  - Unique: `(user_id, token)`
- [ ] Drizzle schema ve seed SQL güncelle
- [ ] Token silme/deaktive etme mekanizması ekle
  - Firebase invalid token dönerse `is_active=0`

### Push Token API

- [ ] `GET /api/v1/me/push-tokens` — kullanıcının kayıtlı cihaz tokenları
- [ ] `POST /api/v1/me/push-tokens` — cihaz tokenı kaydet/güncelle
  - Body: `{ token, provider, platform, device_id? }`
  - `user_id` token'dan alınır
- [ ] `DELETE /api/v1/me/push-tokens/:id` — kendi tokenını sil

### Mobil Uygulama Entegrasyonu

- [ ] `mobile/app/src/lib/notifications.ts` içindeki FAZ 2 yorumunu gerçek API çağrısına çevir
  - Şu an Expo push token alıp local storage'a yazıyor
  - Backend'e `POST /api/v1/me/push-tokens` göndermeli
- [ ] Firebase/FCM mi Expo Push mu kullanılacağı netleştir
  - Expo managed akış kalacaksa provider `expo`
  - Native FCM token alınacaksa provider `fcm`
- [ ] Kullanıcı abonelik formunda Push kanalını kullanıcı tarafında aktif et
  - Backend validation zaten `push` kabul ediyor
  - UI'da kullanıcı abonelik sayfasına `Push` seçeneği eklenmeli

### Delivery Refactor

- [ ] `repoGetSubscribedUsersForLocation` sonucu push tokenları da içerecek şekilde genişlet
- [ ] `sendFcmFrostAlert` fonksiyonunu kullanıcı token listesi alacak hale getir
  - Mevcut durum: `FCM_DEVICE_TOKENS` env listesinden global token okuyor
  - Hedef: subscriber bazlı DB tokenları
- [ ] `checkAndSendFrostAlerts` içinde `channel === 'push'` yolunu aktif et
- [ ] Push delivery testleri
  - Token yoksa delivery failed ama alert kaydı kontrollü oluşmalı
  - Geçerli token mock/fixture ile success count doğrulanmalı
  - Invalid token durumunda token pasifleştirilmeli

---

## Faz 6 — Telegram Bot (Sonraki Sprint)

**Hedef:** Bot üzerinden chat_id otomatik alınsın, manuel giriş gerekmeksin.

### Mevcut Telegram Durumu

- [x] Canlı VPS Telegram ayarları lokale taşındı
  - Kaynak: `vps-vistainsaat:/var/www/tarimiklim/backend/.env`
  - Hedef: `backend/.env`
  - Taşınanlar: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ALERT_CHANNEL_ID`
  - Secret değerler ekrana basılmadı
- [x] Lokal doğrulama: `TELEGRAM_BOT_TOKEN=<set>`, `TELEGRAM_ALERT_CHANNEL_ID=<set>`

- [ ] `/start` komutu → chat_id'yi user token ile eşleştir
- [ ] `/subscribe antalya frost` → konum + tip aboneliği
- [ ] `/unsubscribe` → tüm abonelikleri iptal
- [ ] Webhook'tan gelen chat_id'yi user_profiles'a otomatik yaz

---

## Uygulama Sırası

| Öncelik | Faz | Süre | Etki |
|---------|-----|------|------|
| **P0** | Faz 0 — Spam durdur | 30 dk | Anında, deploy gerekir |
| **P1** | Faz 1 — DB schema | 1 saat | Lokal, seed fresh |
| **P1** | Faz 2 — API endpoint'ler | 2-3 saat | Backend |
| **P1** | Faz 3 — Per-user delivery | 2-3 saat | Backend, kritik refactor |
| **P2** | Faz 4 — Frontend UI | 3-4 saat | Kullanıcıya görünür |
| **P2** | Faz 5 — Firebase / FCM push | 3-5 saat | Mobil kullanıcı bildirimi |
| **P3** | Faz 6 — Bot entegrasyonu | Sonraki sprint | — |

---

## İlgili Dosyalar

```
backend/src/
├── jobs/check-frost-risk.ts          ← Faz 0, Faz 3
├── modules/alerts/
│   ├── service.ts                    ← Faz 0, Faz 3 (ana refactor)
│   ├── repository.ts                 ← Faz 2, Faz 3
│   ├── router.ts                     ← Faz 2
│   ├── controller.ts                 ← Faz 2
│   ├── validation.ts                 ← Faz 2
│   └── fcm.ts                        ← Faz 5 (Firebase push)
└── db/seed/sql/
    ├── 001_auth_schema.sql           ← Faz 1 (telegram_chat_id)
    ├── 120_weather_alerts_schema.sql ← Faz 3 (user_id kolonu)
    └── 130_weather_alert_rules_schema.sql ← kontrol

mobile/app/src/
└── lib/notifications.ts              ← Faz 5 (push token backend'e kaydetme)

backend/secrets/
└── firebase-service-account.json      ← Lokal secret, git'e girmez
```
