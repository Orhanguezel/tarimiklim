# Tarım İklim DNS ve E-posta Kimlik Doğrulama Notları

Tarih: 2026-07-03

Bu dosya GEO checklist madde 44-47 ve 59 için mevcut DNS durumunu ve sonraki DNS paneli aksiyonlarını kaydeder.

## Mevcut Durum

Komutlar:

```bash
dig +short TXT tarimiklim.com
dig +short TXT _dmarc.tarimiklim.com
dig +short MX tarimiklim.com
```

Çıktı özeti:

- Kök TXT: yalnızca `google-site-verification=zzVUmhpLmB5g0QxVW-ZGpUf0GvZ_FT7kAwdl7HYa6yU`
- `_dmarc.tarimiklim.com`: kayıt yok
- MX: `0 tarimiklim.com.`

## Eksikler

- SPF kaydı henüz yok.
- DMARC kaydı henüz yok.
- DKIM selector ve sağlayıcı bilgisi bilinmiyor.
- Uyarı e-postalarının hangi sağlayıcıdan gönderileceği netleşmeden SPF/DKIM kesinleştirilemez.

## DNS Panelinde Yapılacaklar

1. E-posta gönderici sağlayıcıyı netleştir:
   - Google Workspace
   - Postmark
   - Resend
   - Amazon SES
   - SMTP sunucu
   - başka sağlayıcı

2. SPF kaydı ekle:
   - Tek SPF kaydı olmalı; birden fazla `v=spf1` TXT kaydı bırakılmamalı.
   - Sağlayıcıya göre `include:` alanı belirlenecek.
   - Örnek şablon: `v=spf1 include:SAĞLAYICI_SPF -all`

3. DKIM kaydı ekle:
   - Sağlayıcının verdiği selector kullanılacak.
   - Örnek host formatı: `selector._domainkey.tarimiklim.com`
   - Örnek value formatı: `v=DKIM1; k=rsa; p=PUBLIC_KEY`

4. DMARC kaydı ekle:
   - Başlangıç önerisi: `v=DMARC1; p=none; rua=mailto:dmarc@tarimiklim.com; adkim=s; aspf=s`
   - Raporlar izlendikten sonra `p=quarantine`, en son `p=reject` değerlendirilecek.

5. Teslim testi yap:
   - Gmail
   - Outlook
   - Kurumsal e-posta kutusu
   - Spam/promotions/primary yerleşimi

## Kapatma Kriteri

- `dig +short TXT tarimiklim.com` SPF kaydını gösteriyor.
- `dig +short TXT _dmarc.tarimiklim.com` DMARC kaydını gösteriyor.
- Sağlayıcının DKIM doğrulama ekranı başarılı.
- En az 3 posta kutusunda test e-postası teslim edildi.
