import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

const tr = {
  onboarding: {
    title1: 'Don gelmeden haber verin',
    body1: 'Parselinize özel 4 faktörlü don skoru, gece başlamadan saatler önce.',
    title2: 'Konum esnekliği',
    body2: '81 il + tüm adresler. Yurt dışındaysanız da çalışır.',
    title3: 'Ücretsiz başlayın',
    body3: '1 parsel, 7 günlük tahmin ve Telegram uyarısı ücretsiz.',
    next: 'Devam',
    finish: 'Başla',
  },
  home: {
    location: 'Konumunuz',
    live: 'Canlı',
    temp: 'Sıcaklık',
    humidity: 'Nem',
    wind: 'Rüzgâr',
    frostNone: 'Don riski yok',
    frostAlert: 'Don riski: %{score}',
    forecast7: '7 günlük tahmin',
    loading: 'Veri alınıyor...',
    error: 'Veri alınamadı',
    refresh: 'Yenile',
    editLocation: 'Konum yanlış mı?',
  },
  hourly: {
    title: 'Saatlik tahmin',
    empty: 'Saatlik veri yok',
    temp: 'Sıcaklık',
    rain: 'Yağış',
    frost: 'Don',
    wind: 'Rüzgâr',
  },
  alerts: {
    title: 'Uyarılar',
    empty: 'Henüz uyarı yok',
    telegramCTA: 'Telegram kanalına katıl',
    subTitle: 'Bildirim tercihleri',
  },
  settings: {
    title: 'Ayarlar',
    location: 'Konum',
    language: 'Dil',
    plan: 'Abonelik',
    notifications: 'Bildirimler',
    about: 'Hakkında',
    logout: 'Çıkış',
    upgradeCTA: "Pro'ya yükselt",
    current: 'Mevcut',
  },
  locationSearch: {
    title: 'Konum seç',
    useMyLocation: 'Mevcut konumumu kullan',
    placeholder: 'İl, ilçe, köy veya adres ara...',
    provinces: 'Türkiye illeri',
    results: 'Arama sonuçları',
    noResults: 'Sonuç bulunamadı',
    close: 'Kapat',
  },
  paywall: {
    title: 'Daha fazlası için Pro',
    subtitle: 'Sınırsız parsel, saatlik 5 gün, push bildirim',
    monthly: '₺135/ay',
    yearly: '₺1.215/yıl (%25 indirim)',
    subscribe: 'Pro ol',
    later: 'Sonra',
  },
  tabs: { home: 'Ana sayfa', hourly: 'Saatlik', alerts: 'Uyarılar', settings: 'Ayarlar' },
};

const en = {
  onboarding: {
    title1: 'Know before the frost',
    body1: 'Parcel-level 4-factor frost score, hours before night begins.',
    title2: 'Location flexibility',
    body2: '81 provinces + any address. Works internationally too.',
    title3: 'Free to start',
    body3: '1 parcel, 7-day forecast and Telegram alerts free forever.',
    next: 'Next',
    finish: 'Start',
  },
  home: {
    location: 'Your location',
    live: 'Live',
    temp: 'Temperature',
    humidity: 'Humidity',
    wind: 'Wind',
    frostNone: 'No frost risk',
    frostAlert: 'Frost risk: {score}%',
    forecast7: '7-day forecast',
    loading: 'Loading...',
    error: 'Could not load',
    refresh: 'Refresh',
    editLocation: 'Wrong location?',
  },
  hourly: {
    title: 'Hourly forecast',
    empty: 'No hourly data',
    temp: 'Temp',
    rain: 'Rain',
    frost: 'Frost',
    wind: 'Wind',
  },
  alerts: {
    title: 'Alerts',
    empty: 'No alerts yet',
    telegramCTA: 'Join Telegram channel',
    subTitle: 'Notification preferences',
  },
  settings: {
    title: 'Settings',
    location: 'Location',
    language: 'Language',
    plan: 'Subscription',
    notifications: 'Notifications',
    about: 'About',
    logout: 'Log out',
    upgradeCTA: 'Upgrade to Pro',
    current: 'Current',
  },
  locationSearch: {
    title: 'Pick a location',
    useMyLocation: 'Use my current location',
    placeholder: 'Province, district, village or address...',
    provinces: 'Turkey provinces',
    results: 'Search results',
    noResults: 'No results',
    close: 'Close',
  },
  paywall: {
    title: 'Go Pro for more',
    subtitle: 'Unlimited parcels, 5-day hourly, push alerts',
    monthly: '$4.99 /mo',
    yearly: '$29.99 /yr (25% off)',
    subscribe: 'Subscribe',
    later: 'Later',
  },
  tabs: { home: 'Home', hourly: 'Hourly', alerts: 'Alerts', settings: 'Settings' },
};

export function initI18n(): void {
  const device = Localization.getLocales()[0]?.languageCode ?? 'tr';
  const initial = device === 'tr' ? 'tr' : 'en';
  i18n.use(initReactI18next).init({
    resources: { tr: { translation: tr }, en: { translation: en } },
    lng: initial,
    fallbackLng: 'tr',
    interpolation: { escapeValue: false },
  });
}

export { i18n };
