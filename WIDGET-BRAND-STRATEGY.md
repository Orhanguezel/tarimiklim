# Widget / Brand Stratejisi (Tarımİklim)

## Amaç

Bu repo hem **public site** (`/tr`, `/en`) hem de ekosistem içinde embed edilen **widget endpoint’lerini** (`/widget/*`) barındırıyor. Public site “markasız / dinamik marka” yönünde evrilirken, widget’lar bazı projeler için sabit brand token’larıyla çalışmaya devam edebilir.

## Kural (2026-05-06 kararı)

- **BereketFide widget’ı** (`frontend/src/app/widget/bereketfide/page.tsx`) mevcut davranışta kalır.
- Bu repo içinde widget’ı kıracak refactor yapılmaz.
- BereketFide tarafı “dinamik brand” uyumuna geçtiğinde, bu geçici istisna ve ilgili notlar **BereketFide repo’suna taşınır**.
- Sonrasında burada kalan istisna temizlenir.

## Teknik Durum

- Widget sayfaları `WeatherWidget` bileşenini çağırıyor.
- `apiBase` query param’ı ile farklı backend origin’lerine bağlanmak gerekiyor.
- **Önemli düzeltme**: client tarafında `process.env` mutate edilmez; `apiBase` override’ı request bazlı client ile yapılır.

## Sonraki Adımlar (Faz E)

- Widget brand token’larını (bereketfide/vistaseed/haldefiyat) ayrı bir JSON dosyaya taşı (breaking değil).
- Uzun vadede widget’ı ayrı “widget package” veya ayrı repo (ekosistem plugin) olarak konumlandır.

## Ekosistem Plugin (Package) — ✅ Eklendi

- Monorepo paketi: `packages/ecosystem-weather-widget`
- Paket adı: `@agro/ecosystem-weather-widget`
- Amaç: Tarımİklim repo’sundan bağımsız şekilde ekosistem içinde reuse edilebilir “embed widget” bileşeni sağlamak.
- Not: Bu paket şu an **private**. İleride publish / ayrı repo opsiyonu açık.

### Entegre Edilen Projeler

| Proje | Durum | Brand | Route |
|-------|-------|-------|-------|
| **Hal Fiyatları** | ✅ 2026-05-12 CANLI | `haldefiyat` | `/tr/hava/widget?location={slug}` |
| Bereketfide | ⏳ Dinamik brand geçişi sonrası | `bereketfide` | Mevcut tarimiklim-içi widget |
| VistaSeed | Planlandı | `vistaseed` | — |

