# Mobil istemciler

Native iOS ve Android uygulamaları bu repoda üretim kodu olarak tutulmaz; gereksinim ve yapı için:

- `ios/AGENTS.md`
- `android/AGENTS.md`

Önerilen sıra: önce REST API (`/api/v1/weather`, `/api/v1/locations`) ve admin panelden FCM cihaz tokenlarını `FCM_DEVICE_TOKENS` ile backend’e bağlamak; ardından mobil istemcide token kaydı ve ekranlar.
