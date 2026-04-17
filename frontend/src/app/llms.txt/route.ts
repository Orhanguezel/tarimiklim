const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tarimiklim.com';

const BODY = `# TarımİKlim

> Türkiye çiftçisi için 7 günlük hava tahmini, don riski erken uyarı ve sulama
> planlama servisi. Ekosistem Katman 4 (Veri & AI) altyapısı olarak Sera SaaS,
> Açık Tarla, Ziraat Haber, Hal Fiyatları ve diğer modüllere API + widget ile
> veri sağlar.

## Üretim URL'leri

- [Ana sayfa (TR)](${SITE}/tr)
- [Ana sayfa (EN)](${SITE}/en)
- [Canlı panel (don uyarısı)](${SITE}/tr/don-uyarisi)
- [Bereketfide widget'ı](${SITE}/widget/bereketfide?location=antalya)
- [VistaSeed widget'ı](${SITE}/widget/vistaseed?location=izmir)

## Açık API (v1)

- GET ${SITE}/api/v1/weather?lat&lon&days — 7 günlük tahmin
- GET ${SITE}/api/v1/weather/current?lat&lon — anlık hava
- GET ${SITE}/api/v1/weather/hourly?lat&lon&slots — 3 saatlik (≤120 saat)
- GET ${SITE}/api/v1/weather/frost-risk?location — don riski skoru (0-100)
- GET ${SITE}/api/v1/weather/rain-forecast?location&days — yağış tahmini
- GET ${SITE}/api/v1/weather/widget-data?location — hafif widget payload
- GET ${SITE}/api/v1/locations?active=true — takip edilen 8 şehir

## Mimari

- Runtime: Bun + Fastify v5 + Drizzle ORM + MySQL
- Cache: Redis 30 dk TTL
- Kuyruk: BullMQ (30 dk tahmin, saatlik don kontrolü, 06:00 günlük özet)
- Bildirim: Telegram (aktif), SMTP, Firebase FCM (mobil ile)
- Kaynak: OpenWeatherMap birincil, Open-Meteo fallback

## Don riski algoritması

Sıcaklık (60%) + Nem (15%) + Rüzgâr (15%) + Bulut örtüsü (10%). Skor 0-100.
- 0-20 düşük · 21-50 orta · 51-80 yüksek · 81-100 kritik

Uyarılar aksam 18:00'da ertesi gece için; kritik seviyede SMS + Telegram +
Push kanalları birlikte tetiklenir.

## Ekosistem tüketicileri

- Bereketfide (fide, açık tarla yönetimi) — sidebar widget
- VistaSeed (tohum) — iklim profili
- Ziraat Haber Portali — hava widget
- Sera SaaS — iç/dış hava + havalandırma kararı
- Açık Tarla — sulama planlaması
- Hal Fiyatları — don → fiyat korelasyonu
- Verim Tahmini — AI modeli girdisi
- Hastalık Uyarı — nem bazlı fungal risk

## Veriye dair kurallar

- Koordinat hassasiyeti DECIMAL(10,7) — 7 ondalık basamak
- Tüm tarihler UTC saklanır, gösterimde Europe/Istanbul
- Birimler: °C, km/h, mm, %
- Hava verisi Redis cache'e alınır; cold path <200ms
- Bildirim spam koruması: aynı kullanıcıya aynı uyarı 12 saat tekrarsız

## Geliştirici

- Developer tier ücretsiz — 100k req/ay, tüm endpoint'ler
- Rate limit 10k req/dk
- API endpoint'leri auth gerektirmez (public)
- Kaynak kod: github.com/Orhanguezel/tarimiklim

## Sahiplik

Vista İnşaat Tarım Teknolojileri A.Ş. · Ankara · Türkiye
İletişim: destek@tarimiklim.com
`;

export function GET(): Response {
  return new Response(BODY, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
