# AGENTS.md — Tarım İklim admin panel

Codex / otomasyon için kısa rehber.

- **Marka:** Kod içinde sabit ürün adı yok; `.env`, `src/locale/*.json`, `site_settings.ui_admin` (seed: `015_ui_admin_seed.sql`).
- **API:** `NEXT_PUBLIC_API_URL` → `projects/tarimiklim/backend` `/api/v1`.
- **Hava / konum / uyarı sayfaları:** `src/app/(main)/admin/(admin)/tarimiklim/`, istemci API: `src/lib/weather-admin-api.ts`.
- **Sidebar:** `src/navigation/sidebar/sidebar-items.ts` — grup ve öğe başlıkları locale + `ui_admin` ile gelir.
