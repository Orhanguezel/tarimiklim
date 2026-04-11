# Hava Durumu ve Don Uyarisi — Ekosistem Entegrasyon Plani

**Durum:** Backend job'lar + Redis cache hazır; OWM anahtarı ve widget/internal endpoint'ler kısmen bekliyor  
**Katman:** Katman 4 — Veri ve Akıllı Sistemler  
**Faz:** Faz 5 (Ay 9-12)

---

## Ekosistem İçindeki Rol

Bu servis ekosistemin **çevresel veri katmanı**. Diğer modüllere hava tahmini, don riski ve yağış verisi sağlar. Bağımsız bir uygulama değil — widget ve API olarak tüketilir.

---

## Diğer Modüllerle İletişim

| Modül | Yön | İletişim Şekli | Endpoint | Durum |
|-------|-----|----------------|----------|-------|
| **Ziraat Haber Portali** | → widget verir | REST / embed | `GET /widget-data?location=antalya` | ⏳ Endpoint hazır, job yok |
| **Sera SaaS** | → tahmin verir | REST API | `GET /internal/weather/forecast` | ⏳ Endpoint hazır, job yok |
| **Açık Tarla** | → sulama verisi | REST API | `GET /rain-forecast?location=...` | ⏳ Endpoint hazır, job yok |
| **Verim Tahmini** | → iklim verisi | REST API | `GET /internal/weather/historical` | 🔲 Yazılmadı |
| **Hastalık Uyarı** | → nem/sıcaklık | REST API | `GET /internal/weather/humidity-risk` | 🔲 Yazılmadı |
| **Hal Fiyatları** | ↔ korelasyon | REST API | `GET /frost-risk?location=...` | ⏳ Endpoint hazır, job yok |
| **IoT Sensor** | ↔ doğrulama | REST API | Çift yönlü, tahmin vs gerçek | 🔲 Yazılmadı |

---

## MVP Görevleri (Faz 5)

### P0 — Canlı Veri Akışı

> Widget'a veri sunmak için DB sürekli güncel olmalı. Sadece HTTP isteği gelince API çağırmak yetmez.

- [x] `src/jobs/fetch-forecast.ts` — Her 30 dk tüm aktif konumlar için tahmin çek (BullMQ)
- [x] `src/jobs/check-frost-risk.ts` — Her saat don riski hesapla, uyarı gönder (BullMQ)
- [x] `src/jobs/daily-summary.ts` — Sabah 06:00 günlük özet (BullMQ)
- [x] `app.ts`'e BullMQ worker ve scheduler ekle
- [x] Redis plugin `app.ts`'e register et (`@agro/shared-backend/plugins/redis`)
- [x] `service.ts`'de Redis cache layer ekle (TTL: 30 dk)
- [ ] OWM API key al ve `.env`'e yaz

### P1 — Bildirim Sistemi Tamamlama

- [x] `alerts/service.ts` — `weather_alert_rules` tablosundan kullanıcı eşiklerini oku (hard-coded kaldırma)
- [x] Firebase/FCM push notification — `backend/src/modules/alerts/fcm.ts`
- [x] Email bildirim — `backend/src/modules/alerts/email-delivery.ts` (`SMTP_*`, `ALERT_EMAIL_TO`)

### P2 — Internal Endpoint'ler (Diğer Modüller İçin)

- [x] `GET /api/v1/internal/weather/forecast` — Saatlik detaylı tahmin (Sera SaaS, Açık Tarla)
- [x] `GET /api/v1/internal/weather/historical` — Geçmiş iklim verisi (Verim Tahmini AI girdisi)
- [x] `GET /api/v1/internal/weather/humidity-risk` — Yüksek nem dönemi tahmini (Hastalık Uyarı)

### P3 — Widget Embed

- [ ] `widget/` klasörü oluştur
- [ ] `WeatherWidget.tsx` — Embed edilebilir React component (iframe veya script tag)
- [ ] `FrostAlert.tsx` — Don uyarı banner
- [ ] Widget build'i ayrı bundle olarak çıkar (`widget/dist/weather-widget.js`)

### Sonraki Adımlar (Faz 6+)

- [ ] TimescaleDB entegrasyonu (uzun vadeli iklim verisi — `weather_history` tablosu)
- [ ] IoT sensor doğrulama (tahmin vs gerçek karşılaştırma)
- [ ] Hava → fiyat korelasyon raporu (Hal Fiyatları ile)
- [ ] Sezonluk iklim analizi

---

## Entegrasyon Örneği — Ziraat Haber Portali

Sidebar'a eklemek için:

```typescript
// Ziraat Haber frontend'inde
const { data } = await fetch(
  `${WEATHER_API_URL}/api/v1/weather/widget-data?location=antalya`
);
// { location, current: { temp, condition, icon }, frostRisk: { score, level } }
```

Widget job çalışmadan bu endpoint DB'deki eski veriyi döner. **Job'lar yazılmadan entegrasyon anlamsız.**

---

## Entegrasyon Örneği — Sera SaaS

```typescript
// Sera SaaS backend'inde (internal çağrı)
const forecast = await fetch(
  `${WEATHER_API_URL}/api/v1/internal/weather/forecast?lat=36.89&lon=30.68&hours=48`
);
// Saatlik sıcaklık, nem, rüzgar → havalandırma ve ısıtma kararı
```

> **Not:** Internal endpoint'ler henüz yazılmadı (P2).
