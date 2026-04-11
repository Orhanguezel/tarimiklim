# Hava Durumu & Don Uyarisi — Proje Devir Notu

**Hazirlayan:** Orhan  
**Son Guncelleme:** 2026-04-11  
**Proje Durumu:** Canlıda — temel sistem çalışıyor

---

## Projenin Amacı

Türkiye'deki çiftçiler için **7 günlük hava tahmini, don riski uyarısı ve sulama planlama** servisi.

Ekosistem içinde **Katman 4 (Veri & AI)** altında çalışır. Bağımsız uygulama değil — sera yönetimi, açık tarla, verim tahmini, ziraat haber gibi diğer modüllere API ve widget olarak veri sağlayan **servis katmanı**.

---

## Canlı Ortam

| | |
|-|-|
| **Domain** | [tarimiklim.com](https://tarimiklim.com) · [tarimiklim.com.tr](http://tarimiklim.com.tr) → tarimiklim.com'a yönlenir |
| **Repo** | https://github.com/Orhanguezel/tarimiklim |
| **VPS** | vps-vistainsaat (187.124.166.65) — `/var/www/tarimiklim/` |
| **API** | https://tarimiklim.com/api/v1 |
| **Swagger** | https://tarimiklim.com/documentation |
| **Health** | https://tarimiklim.com/api/v1/health |
| **Widget (bereketfide)** | https://tarimiklim.com/widget/bereketfide?location=antalya-merkez |
| **Widget (vistaseed)** | https://tarimiklim.com/widget/vistaseed?location=antalya-merkez |

**PM2 süreçleri:**
- `tarimiklim-backend` — bun src/index.ts, port 8088
- `tarimiklim-frontend` — Next.js, port 3088

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

## Mevcut Durum — Modül Bazlı

| Modül | Durum | Notlar |
|-------|-------|--------|
| HTTP endpoint'ler (public + admin) | ✅ Tam | Çalışıyor |
| DB schema + CRUD | ✅ Tam | MySQL, seed çalışıyor |
| Don riski algoritması | ✅ Tam | 4 faktörlü |
| OpenWeatherMap entegrasyonu | ✅ Tam | API key .env'de, canlı veri çekiyor |
| Open-Meteo fallback | ✅ Tam | OWM çökerse devreye girer |
| Redis cache | ✅ Tam | 30dk TTL, canlıda aktif |
| BullMQ zamanlanmış job'lar | ✅ Tam | Redis'te kayıtlı (30dk/1s/06:00) |
| Alert rules DB'den okuma | ✅ Tam | `weather_alert_rules` tablosu |
| Embed widget (bereketfide) | ✅ Canlı | `/widget/bereketfide` |
| Embed widget (vistaseed) | ✅ Canlı | `/widget/vistaseed` |
| Frontend public sayfalar | ✅ MVP | Hava dashboard, lokasyon seçici |
| SSL (tarimiklim.com) | ✅ Aktif | Let's Encrypt, otomatik yenileme |
| SSL (tarimiklim.com.tr) | ⚠️ Bekliyor | DNS CAA hatası — nameserver sorununu çöz |
| Telegram bildirimi | ❌ Eksik | Kod var, `TELEGRAM_BOT_TOKEN` boş |
| E-posta bildirimi | ❌ Eksik | Kod var, `SMTP_USER`/`SMTP_PASS` boş |
| Firebase Push (FCM) | ❌ Eksik | Kod var, service account env'leri boş |
| Admin Panel | ❌ Eksik | VPS'te deploy edilmedi |
| Mobile (iOS/Android) | ❌ Bekliyor | AGENTS.md hazır, native proje yok |

---

## Yapılacaklar — Öncelik Sırasıyla

### P0 — Bildirim Sistemini Aktifleştir

Kod tamam, sadece .env doldurulacak ve backend restart:

**Telegram:**
```bash
# @BotFather'dan bot oluştur → token al
# Kanal oluştur → bot'u ekle → channel ID al
TELEGRAM_BOT_TOKEN=7xxxxxxxxx:AAxxxxxxxxxxxxxx
TELEGRAM_ALERT_CHANNEL_ID=-100xxxxxxxxxx
```

**E-posta (SMTP):**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@tarimiklim.com
SMTP_PASS=gmail-app-password   # Gmail → Uygulama Şifresi
MAIL_FROM=noreply@tarimiklim.com
```

**Firebase (Push):**
```bash
FIREBASE_PROJECT_ID=tarimiklim-app
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@tarimiklim-app.iam.gserviceaccount.com
FCM_DEVICE_TOKENS=token1,token2
```

Env doldurulduktan sonra:
```bash
ssh vps-vistainsaat "pm2 restart tarimiklim-backend --update-env"
```

### P1 — tarimiklim.com.tr SSL

DNS sağlayıcısında CAA kaydı sorunu var. Nameserver düzeldikten sonra:
```bash
ssh vps-vistainsaat "certbot --nginx -d tarimiklim.com.tr -d www.tarimiklim.com.tr --non-interactive --agree-tos --email admin@tarimiklim.com"
```

### P2 — Admin Panel Deploy

```bash
# VPS'te
cd /var/www/tarimiklim/admin_panel
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=https://tarimiklim.com/api/v1 doldur
bun install && bun run build
pm2 start bun --name tarimiklim-admin -- run start   # port 3048
```

Nginx'e eklenecek blok:
```nginx
location /admin {
    proxy_pass http://127.0.0.1:3048;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### P3 — Mobile (iOS / Android)

`mobile/ios/AGENTS.md` ve `mobile/android/AGENTS.md` talimatlarına göre:
- iOS: Xcode projesi oluştur, APIClient + WeatherViewModel + APNs
- Android: Android Studio + Hilt + Jetpack Compose + FCM

### P4 — Widget Embed (Bereketfide / VistaSeed)

Sidebar'a eklemek için:
```html
<!-- bereketfide.com -->
<iframe
  src="https://tarimiklim.com/widget/bereketfide?location=antalya-merkez"
  width="300" height="380" frameborder="0" scrolling="no"
  style="border-radius:12px"
></iframe>

<!-- vistaseed.com.tr -->
<iframe
  src="https://tarimiklim.com/widget/vistaseed?location=antalya-merkez"
  width="300" height="380" frameborder="0" scrolling="no"
  style="border-radius:12px"
></iframe>
```

`location` parametresi: `antalya-merkez`, `istanbul-merkez`, `izmir-merkez`, `ankara-merkez` vb.

---

## VPS Operasyon Komutları

```bash
# SSH
ssh vps-vistainsaat

# Servis durumu
pm2 list | grep tarimiklim

# Log izle
pm2 logs tarimiklim-backend --lines 50
pm2 logs tarimiklim-frontend --lines 20

# Yeni deploy (kod güncellemesi)
cd /var/www/tarimiklim
git pull origin main
cd frontend && bun run build && pm2 restart tarimiklim-frontend
pm2 restart tarimiklim-backend --update-env

# DB işlemleri (production — DROP YOK)
cd /var/www/tarimiklim/backend
NODE_ENV=production bun run db:seed:no-drop
```

---

## Veritabanı Kuralları

- **ALTER TABLE YASAK** — Şema değişikliği SQL dosyasında yapılır, `db:seed:no-drop` ile uygulanır
- Geliştirme: `bun run db:seed` (DROP + yeniden kur)
- Production: `NODE_ENV=production bun run db:seed:no-drop`

---

## API Hızlı Referans

```
GET /api/v1/health
GET /api/v1/weather?lat=36.89&lon=30.68&days=7
GET /api/v1/weather/current?lat=36.89&lon=30.68
GET /api/v1/weather/hourly?lat=36.89&lon=30.68&slots=40
GET /api/v1/weather/frost-risk?location=antalya
GET /api/v1/weather/rain-forecast?location=antalya&days=3
GET /api/v1/weather/widget-data?location=antalya
GET /api/v1/locations?active=true&limit=100

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
