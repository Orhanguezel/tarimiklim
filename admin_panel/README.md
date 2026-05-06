# Tarım İklim — Admin panel

Next.js yönetim arayüzü. **Marka ve metinler** `site_settings.ui_admin` seed’i, `src/locale/*.json` ve `NEXT_PUBLIC_*` ortam değişkenleriyle gelir; iş mantığı dosyalarında ürün adı sabitlenmez.

## Geliştirme

```bash
cd projects/tarimiklim/admin_panel && bun run dev
```

Varsayılan port: **3096** (`package.json`). Backend: `projects/tarimiklim/backend` (**8088**).

Kopyala: `.env.example` → `.env` ve `NEXT_PUBLIC_API_URL` ile backend kökünü (`/api/v1`) eşleştir.

## Yapılandırma

- `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_COPYRIGHT`, `NEXT_PUBLIC_APP_DESCRIPTION`
- Opsiyonel giriş / hub: `NEXT_PUBLIC_ADMIN_LOGIN_HEADING`, `NEXT_PUBLIC_ADMIN_LOGIN_QUOTE`, `NEXT_PUBLIC_ADMIN_WEATHER_HUB_TITLE`, `NEXT_PUBLIC_ADMIN_WEATHER_HUB_SUBTITLE`
- Hava modülü API: `src/lib/weather-admin-api.ts` (ortak `BASE_URL` + oturum token’ı)
