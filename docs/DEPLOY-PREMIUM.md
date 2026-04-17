# TarımİKlim Premium Frontend — Deploy Rehberi

**Branch:** `feature/premium-landing`
**Hedef:** tarimiklim.com — mevcut `tarimiklim-frontend` PM2 sürecini premium UI'a geçirmek
**Risk profili:** Düşük — widget rotaları değişmedi, backend'e dokunulmadı

---

## 1. Ön Kontroller (local)

```bash
cd projects/tarimiklim/frontend
bun install          # sadece ilk kez + workspace değişti ise
bun run lint         # tsc --noEmit — SIFIR hata bekliyoruz
bun run build        # prod build — SIFIR hata bekliyoruz
```

Build çıktısında bulunması gereken rotalar:

```
○ /_not-found
ƒ /[locale]
ƒ /[locale]/don-uyarisi     ← YENİ: canlı panel
ƒ /llms.txt                 ← YENİ: AI crawler için
○ /robots.txt               ← YENİ
○ /sitemap.xml              ← YENİ
ƒ /widget/bereketfide       ← KORUNDU
ƒ /widget/vistaseed         ← KORUNDU
```

Eğer widget rotalarından biri eksikse **DUR** — regresyon var.

---

## 2. Smoke Test (local, dev server)

```bash
cd projects/tarimiklim/frontend
bun run dev            # port 3088
```

Tarayıcıda kontrol:

- `http://localhost:3088/tr` — landing açılıyor, 4 bölüm numaralandırması doğru (I, II, III, IV)
- `http://localhost:3088/tr/don-uyarisi` — WeatherDashboard çalışıyor, lokasyon seçilebiliyor
- `http://localhost:3088/en` — İngilizce metin kaçağı yok
- `http://localhost:3088/widget/bereketfide?location=antalya` — iframe widget çalışıyor
- `http://localhost:3088/widget/vistaseed?location=izmir` — aynı
- `http://localhost:3088/llms.txt` — AI crawler dosyası
- `http://localhost:3088/robots.txt` — sitemap referansı var
- `http://localhost:3088/sitemap.xml` — tr + en + don-uyarisi rotaları listeli

Özellikle hero'daki weather-card **canlı veri** göstermeli (Konya sıcaklığı mockup'taki 8°C sabit değil, gerçek temp). Dashboard city-grid 8 şehir için gerçek risk skoru döndürmeli.

---

## 3. VPS Deploy (staging yoksa direkt prod)

> **Kural:** Mevcut canlı sitede mola yok. Deploy 30 saniye içinde tamamlanır (bun build → pm2 reload).

### 3.1 · Git push

```bash
# Local'de
cd projects/tarimiklim
git status                              # untracked: docs/, brand/, sections/, types/, don-uyarisi/
git add frontend/ docs/ && git commit -m "feat: premium landing + canlı dashboard + SEO"
git push origin feature/premium-landing

# PR aç ve main'e merge
gh pr create --base main --head feature/premium-landing \
  --title "feat(frontend): premium landing + canli panel + SEO" \
  --body-file docs/PR-PREMIUM-NOTES.md
```

### 3.2 · VPS'te pull + build + reload

```bash
ssh vps-vistainsaat

cd /var/www/tarimiklim
git fetch origin
git checkout main
git pull origin main

cd frontend
bun install                             # yeni bağımlılık yoksa no-op
bun run build                           # Next 16 prod build
pm2 reload tarimiklim-frontend --update-env

# Backend'e dokunulmadı ama env değiştiyse:
# pm2 reload tarimiklim-backend --update-env

pm2 logs tarimiklim-frontend --lines 30 # hata var mı
```

`pm2 reload` (restart değil) — zero downtime. Next 16 tüm portu bir anda devralır.

### 3.3 · Doğrulama (canlı)

```bash
# API hâlâ sağlıklı
curl -sS https://tarimiklim.com/api/v1/health | head

# Landing yeni premium UI'da
curl -sI https://tarimiklim.com/tr | grep -i 'content-type\|server'

# Widget'lar bozulmadı
curl -sI https://tarimiklim.com/widget/bereketfide?location=antalya | head -3
curl -sI https://tarimiklim.com/widget/vistaseed?location=izmir | head -3

# SEO rotaları açıldı
curl -sS https://tarimiklim.com/robots.txt | head -5
curl -sS https://tarimiklim.com/sitemap.xml | head -20
curl -sS https://tarimiklim.com/llms.txt | head -20

# JSON-LD page source'ta var mı
curl -sS https://tarimiklim.com/tr | grep -c 'application/ld+json'
# Beklenen: 2 (site JSON-LD + weather JSON-LD)
```

Tarayıcıda manuel:
- Hero weather-card sıcaklık gerçek değer mi
- DashboardSection city-grid risk skorları farklı farklı mı (hepsi aynı değilse canlı veri geliyor)
- "Panele giris" CTA → `/tr/don-uyarisi`
- Canlı panelde lokasyon seçici çalışıyor mu

### 3.4 · Rollback (gerekirse)

```bash
ssh vps-vistainsaat
cd /var/www/tarimiklim
git log --oneline main -5               # önceki commit ID'yi al
git checkout <previous-commit>
cd frontend && bun run build && pm2 reload tarimiklim-frontend
```

---

## 4. Deploy Sonrası — GEO/SEO Tarama

```bash
# Ekosistemdeki geo-audit skill ile tam tarama
# (Claude Code içinden)
/geo-audit https://tarimiklim.com/tr
```

Beklenen skor profili:
- Citability ≥ 75 (llms.txt + zengin JSON-LD + structured içerik)
- Technical ≥ 85 (robots, sitemap, canonical, hreflang zaten aktif)
- Content ≥ 70 (landing metinleri TR dolu, EN kısa ama yeterli)

İlk tarama baseline olarak kaydedilir → aylık karşılaştırma için `/geo-compare`.

---

## 5. Takip ve Bakım

### Cache/CDN (varsa Cloudflare)

Landing ana sayfa ve `don-uyarisi` paneli dinamik — cache süresi kısa tutulmalı (60s max). Widget'lar 5-10 dk cache'lenebilir. `llms.txt`, `sitemap.xml`, `robots.txt` günlük cache.

### Metrikler

İlk hafta izle:
- `tarimiklim-frontend` PM2 memory (1 GB'ı aşarsa `pm2 restart`)
- `GET /api/v1/weather/frost-risk` istekleri (landing + panel = her sayfa yüklemede 8 şehir × 2 call = 16 istek; cache yoksa 30 dk sonra yinelenir)
- OpenWeatherMap quota (Free tier 60/dk — 8 şehir × 2 call aynı anda düşünülürse 30 dk'da bir çekim oranında sınıra gelmiyor)

### Opsiyonel iyileştirmeler (gelecek sprint)

- OG image dinamik (Next 16 `opengraph-image.tsx` + ImageResponse)
- DashboardSection tab filter client island (now/6h/24h/7d aktif)
- Ticker için canlı şehir isimleri (şu an statik metrik)
- Panel sayfası SSR'ye çevrilmesi (şu an client-side fetch)

---

## 6. Özellik Kaybı Kontrol Listesi (regresyon)

Deploy sonrası **her biri doğrulanmalı**:

- [ ] `/widget/bereketfide?location=antalya` — bereketfide.com iframe'i hâlâ canlı hava gösteriyor
- [ ] `/widget/vistaseed?location=izmir` — vistaseeds.com.tr iframe'i canlı
- [ ] `/api/v1/weather/widget-data?location=antalya` — 200 OK, JSON payload bozulmadı
- [ ] `/api/v1/weather/frost-risk?location=konya` — 200 OK
- [ ] Lokasyon seçici `/tr/don-uyarisi` — 8 şehir çekiliyor, değişim weather gösteriyor
- [ ] Saatlik tablo çalışıyor (HourlyForecastTable)
- [ ] `/en` sayfa açılıyor
- [ ] `tarimiklim.com.tr` yönlendirmesi bozulmadı (mevcut rewrite korundu)

Herhangi bir madde ✗ ise: rollback + blocker-log.md'ye yaz.
