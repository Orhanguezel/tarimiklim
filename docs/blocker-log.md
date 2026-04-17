# Blocker Log — Premium Frontend Sprint

Codex veya Antigravity takıldığında buraya yazar. Claude Code bakıp çözer.

**Kullanım:**
- Her blocker tek bölüm olsun
- Tarih + kim + hangi faz + hangi dosya
- Hata mesajı varsa aynen yapıştır
- "Denedim X, olmadı" notu değerli

---

## Şablon

```
### <Kısa başlık>

**Tarih:** YYYY-MM-DD HH:MM
**Kim:** Codex / Antigravity
**Faz:** FAZ 1 / 2 / 3 / ...
**Dosya/Bağlam:** <path:line veya component adı>
**Durum:** 🔴 açık · 🟡 inceleniyor · ✅ çözüldü

**Problem:**
<ne oldu, hangi adımda durdun>

**Denenenler:**
- …
- …

**Çıktı / hata:**
```
<terminal çıktısı veya ss>
```

**Çözüm (Claude):**
<doldur>
```

---

## Kayıtlı Blocker'lar

### WeatherDashboard legacy tip cast'i — FAZ 3 refactor için not

**Tarih:** 2026-04-17
**Kim:** Claude Code (preemptive)
**Faz:** FAZ 1 temizlik
**Dosya:** [WeatherDashboard.tsx:101](../frontend/src/components/WeatherDashboard.tsx#L101)
**Durum:** 🟡 erteleniyor — FAZ 3

**Not:** `fetchWeather` yeni tipli (`ForecastResponse`) olduktan sonra `dedupeForecastDays(list as Record<string, unknown>[])` TS2352 hatası verdi. `as unknown as Record<string, unknown>[]` double cast'i ile geçici susturuldu. FAZ 3'te panel sayfası refactor edilirken:
- `dedupeForecastDays` imzası `ForecastDay[]` kabul etsin (strict + geriye uyumlu deduplication)
- Eski `Record<string, unknown>` akışı tamamen `types/weather.ts` tipine geçsin

Şimdi davranış doğru, sadece tip güvenliği gevşek. Codex FAZ 2'ye geçebilir, bu FAZ 3'ün parçası.

---

## Genel Kurallar

- **Claude'un onayı olmadan** yasak tekniklere başvurma (ALTER TABLE, hard-code, 200 satır üstü dosya, @eco/* yerine @agro/* karışıklığı vb).
- **Widget rotalarına dokunma** — `/widget/bereketfide` ve `/widget/vistaseed` canlıda, ekosistem projeleri tüketiyor. Tipleri güçlendirmek için refactor tamam (yapıldı), davranış değişmez.
- **Yeni CSS class eklemek gerekirse** önce [globals.css](../frontend/src/styles/globals.css)'te `grep -i <benzer>` — büyük olasılıkla zaten var. Varsa, kullan.
- **i18n anahtarı eklemek:** TR ve EN aynı anda — yalnız biri yasak.
