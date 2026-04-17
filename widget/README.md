# Hava widget (embed — MVP)

Ekosistem planındaki **P3 — Widget embed** için ilk adım: ayrı JS bundle yerine **iframe + public API** ile gömme. İçerik aynı kalır; sadece yerleşim.

## Önerilen kullanım

1. Ziraat haber / portal sitenizde bir kutuda şu adresi iframe ile açın (örnek):

   - Ön yüz ana sayfa: `https://<frontend-host>/tr` veya `.../en`
   - Sadece özet veri: `GET /api/v1/weather/widget-data?location=<slug>` ile kendi kartınızı çizersiniz.

2. `embed-iframe.example.html` dosyasındaki şablonu kopyalayın; `src` ve boyutları kendi domain’inize göre düzenleyin.

## Sonraki adım (opsiyonel)

- `WeatherWidget.tsx` + Vite/Rollup ile `dist/weather-widget.js` üretmek (script tag embed) — ayrı iş paketi.

## API

- Widget verisi: `GET /api/v1/weather/widget-data?location=antalya`
- Dahili saatlik: `GET /api/v1/internal/weather/forecast?lat=..&lon=..&hours=48` (bkz. backend `.env` `INTERNAL_WEATHER_API_TOKEN`)
