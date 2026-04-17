# TarımİKlim Mobile (Expo)

Tek kod tabanıyla **iOS + Android + web** çalışan React Native uygulaması.

## Stack
- Expo 52 · React Native 0.76 · TypeScript strict
- Expo Router (file-based routing)
- AsyncStorage (konum ve tercih kalıcılığı)
- expo-location + Nominatim (reverse & forward geocoding)
- expo-notifications (push — Expo Push token, FCM/APNs proxy)
- i18next (tr + en)
- Fraunces + Inter Tight + JetBrains Mono fontları

## Hızlı başlangıç
```bash
cd mobile/app
bun install
bun run start              # Expo dev server
bun run ios                # iOS simulator (macOS)
bun run android            # Android emulator
```

## Dizin
```
app/
  _layout.tsx              Root stack
  index.tsx                Giriş (onboarded? → tabs : onboarding)
  (tabs)/                  Bottom tabs
    _layout.tsx
    index.tsx              Ana sayfa (canlı kart + 7 günlük)
    hourly.tsx             Saatlik tablo
    alerts.tsx             Telegram + bildirim tercihleri
    settings.tsx           Ayarlar
  location/
    search.tsx             Modal: 81 il + Nominatim
  paywall.tsx              Premium paywall
  onboarding/
    index.tsx              İlk açılış 3 slide

src/
  lib/
    api.ts                 tarimiklim.com/api/v1 istemcisi
    storage.ts             AsyncStorage wrapper
    location.ts            Geolocation + Nominatim
    notifications.ts       Expo Push
    i18n.ts                tr + en mesajlar
    turkey-provinces.ts    81 il offline
  components/
    WeatherCard.tsx
    ForecastRow.tsx
    FrostBadge.tsx
    PaywallSheet.tsx
  hooks/
    useLocation.ts
    useWeather.ts
  theme/
    tokens.ts              paper/pine/terra (web ile eş)
  types/
    weather.ts             @agro/shared-types symmetric
```

## Build
```bash
bun run build:android      # EAS preview APK
bun run build:ios          # EAS preview IPA (TestFlight)
```

## Monetizasyon (FAZ 2'de aktive)
- Paywall bileşeni UI-ready; store entegrasyonu (Apple StoreKit / Google Play Billing) sonraki sprint
- iOS: IAP zorunlu (%30 kesinti)
- Android: IAP tercihli, Iyzico harici ödeme opsiyonu
- Web: Iyzico birincil (kesintisiz)

Detay strateji: [../MOBILE-STRATEGY.md](../MOBILE-STRATEGY.md)

## Bağımlılıklar — kritik notlar
- `@expo-google-fonts/*` paketleri `bun install` sonrası otomatik gelir (package.json'da değil, `expo install` ile eklenir)
- Expo push için gerçek cihaz gerekli (simulator'da token alınmaz)
- Reverse geocoding için Nominatim kullanıyoruz → production'da kendi proxy backend'ine geçiş (rate limit)

## Eski native planlar
`mobile/ios/AGENTS.md` ve `mobile/android/AGENTS.md` **DEPRECATED**. Expo yolu yıl 2-3 boyunca tercih edilecek. 1M+ MAU veya native-only API ihtiyacı doğduğunda migration edilir.
