# TarımİKlim — Hava Durumu ve Don Uyarısı

**Canlı:** [tarimbilgi.com](https://tarimbilgi.com) · [tarimbilgi.com.tr](https://tarimbilgi.com.tr)  
**Repo:** [github.com/Orhanguezel/tarimiklim](https://github.com/Orhanguezel/tarimiklim)

Ekosistem **Katman 4 (Veri & AI)** altında çalışan çevresel veri servisi: 7 günlük tahmin, don riski, sulama planlaması desteği. Bağımsız ürün değil — sera, açık tarla, haber portalı gibi modüllere **API ve widget olarak veri sağlar**.

## Durum

| | Durum |
|-|-------|
| HTTP endpoint'ler (public + admin) | ✅ Hazır |
| Don riski algoritması | ✅ Hazır |
| DB schema + CRUD | ✅ Hazır |
| OpenWeatherMap entegrasyonu | ✅ API key tanımlı |
| Redis cache | ✅ `app.ts` + tahmin Redis önbelleği |
| BullMQ zamanlanmış job'lar | ✅ `backend/src/jobs/` (30dk / 1s / 06:00 TR) |
| Telegram bildirimi | ✅ DB kurallarından eşik/kanal okuma |
| Embed widget (bereketfide) | ✅ `/widget/bereketfide` |
| Embed widget (vistaseed) | ✅ `/widget/vistaseed` |
| Frontend public sayfalar | 🟡 Temel yapı hazır |
| Admin paneli | 🔲 Yazılmadı |

Detaylı görev listesi: `PROJE-DEVIR-NOTU.md`  
Ekosistem entegrasyonu: `EKOSISTEM-PLAN.md`

## Teknik Özet

| Katman | Teknoloji | Geliştirme Portu |
|--------|-----------|-----------------|
| API | Fastify 5, Drizzle ORM, MySQL | 8088 |
| Public Site | Next.js 16, next-intl (tr/en) | 3088 |
| Cache | Redis (BullMQ + cache layer) | 6379 |

Ortak kod `@agro/shared-backend` ve `@agro/shared-types` üzerinden gelir. Projeye özgü modüller: `weather`, `locations`, `alerts`.

## Widget Embed

Diğer projelerde iframe ile gömülebilir:

```html
<!-- bereketfide.com sidebar'ı -->
<iframe
  src="https://tarimbilgi.com/widget/bereketfide?location=antalya-merkez"
  width="300" height="360" frameborder="0" scrolling="no"
></iframe>

<!-- vistaseed.com.tr sidebar'ı -->
<iframe
  src="https://tarimbilgi.com/widget/vistaseed?location=antalya-merkez"
  width="300" height="360" frameborder="0" scrolling="no"
></iframe>
```

## Başlatma

```bash
# Kök dizinden (tarim-dijital-ekosistem/)
bun install && bun run build:shared

# Backend
cd projects/tarimiklim/backend
cp .env.example .env   # DB, JWT, OPENWEATHERMAP_API_KEY doldur
bun run db:seed
bun run dev            # → http://localhost:8088/documentation

# Frontend
cd projects/tarimiklim/frontend
cp .env.example .env.local && bun run dev   # → http://localhost:3088
```

## DB Komutları

```bash
bun run db:seed           # Geliştirme — DROP + yeniden kur
bun run db:seed:no-drop   # Production / yeni ortam taşıma
bun run db:generate       # Drizzle tip dosyaları üret
```

**ALTER TABLE yasak.** Şema değişikliği `src/db/seed/sql/` içindeki dosyalarda yapılır.

## İlgili Dosyalar

- `PROJE-DEVIR-NOTU.md` — Görev listesi ve kurulum rehberi
- `EKOSISTEM-PLAN.md` — Diğer modüllerle entegrasyon
- `CLAUDE.md` — Detaylı mimari, endpoint ve DB şemaları
