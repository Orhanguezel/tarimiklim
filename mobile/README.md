# TarımİKlim — Mobil

Tek kod tabanıyla **iOS + Android** çalışan Expo (React Native) uygulaması.

## Belgeler
- 📱 [**MOBILE-STRATEGY.md**](MOBILE-STRATEGY.md) — Strateji, monetizasyon, yol haritası, KPI'lar
- 🛠 [**app/README.md**](app/README.md) — Geliştirici kılavuzu (scaffold, komutlar)

## Dizin
```
mobile/
├── MOBILE-STRATEGY.md      Detaylı strateji (freemium, paywall, app store, CAC/LTV)
├── app/                    Expo projesi (geliştirme burada)
│   ├── app/                Expo Router dosyaları
│   ├── src/                lib, components, hooks, theme, types
│   ├── package.json
│   ├── app.json
│   ├── tsconfig.json
│   └── eas.json
├── ios/AGENTS.md           DEPRECATED — native Swift planı, yıl 3+ referans
└── android/AGENTS.md       DEPRECATED — native Kotlin planı, yıl 3+ referans
```

## Hızlı giriş
```bash
cd mobile/app
bun install
bun run start              # Expo dev server (QR kod ile telefon veya simulator)
```

## Stratejik özet
- **Freemium** model: Çiftçi (₺0) → Başlangıç (₺135/ay) → Profesyonel (₺599/ay)
- **Yıl 1 hedef:** 500 premium abone × ₺135 = ₺65k/ay MRR
- **Hedef kitle:** Orta ölçek çiftçi (10-100 dönüm), kooperatif başkanı, genç dijital çiftçi
- **Ödeme:** iOS StoreKit (zorunlu %30), Android Google Play + Iyzico harici, Web Iyzico
- **MVP süresi:** 4 sprint (8 hafta)

## Backend entegrasyonu
Mobil uygulama `https://tarimiklim.com/api/v1` endpoint'lerini kullanır:
- `GET /weather` (7 günlük tahmin)
- `GET /weather/current` (anlık hava)
- `GET /weather/hourly` (40 saatlik slot)
- `GET /weather/frost-risk` (don skoru 0-100)
- `GET /locations` (81 il)

FAZ 2'de eklenecek backend endpoint'leri:
- `POST /api/v1/push/tokens` (Expo Push token kaydı)
- `GET /api/v1/me` (JWT'li kullanıcı profili)
- `POST /api/v1/subscriptions/verify` (IAP receipt validation)
