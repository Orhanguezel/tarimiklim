# Tarımİklim - Hava Durumu Lokasyon Güncellemesi (TAMAMLANDI)

Hal Fiyatları platformundaki tüm hallerde hava durumu widget'ının doğru çalışabilmesi için Tarımİklim veri tabanındaki desteklenen şehirlerin genişletilmesi ve API desteğinin artırılması gerekiyordu.

## Yapılan Değişiklikler
- [x] `backend/src/db/seed/sql/200_weather_locations_seed.sql` dosyası güncellenerek yeni şehirler eklendi (Mersin, Kayseri, Eskişehir vb.).
- [x] **API Geliştirmesi:** `/api/v1/weather/widget-data` endpoint'i artık hem `location` (slug) hem de `lat`/`lon` (koordinat) destekliyor.
- [x] **Frontend Geliştirmesi:** `WeatherDashboard` bileşeni artık URL'den `city` veya `location` parametresini okuyabiliyor.
- [x] **Otomatik Konum:** Widget ve Dashboard artık tarayıcı Geolocation API kullanarak kullanıcının konumunu otomatik algılıyor.
- [x] **Hal Fiyatları Markası:** `WeatherWidget` bileşenine `haldefiyat` teması/markası eklendi.
- [x] **Widget Sayfası:** `/tr/widget/haldefiyat` sayfası oluşturuldu.

## Uygulama Adımları (Veri Tabanı)
Veri tabanındaki lokasyon listesini güncellemek için aşağıdaki SQL komutunu veya seed komutunu çalıştırmanız gerekmektedir:

### 1. SQL ile Doğrudan Güncelleme
```bash
mysql -uapp -papp hava_durumu < backend/src/db/seed/sql/200_weather_locations_seed.sql
```

## Notlar
- Artık widget'lar `antalya` ile sabit değil, `location=auto` parametresi ile (veya parametresiz) açıldığında kullanıcının konumuna göre veri getirmektedir.
- `haldefiyat` entegrasyonu için şehir bazlı erişim `?city=mersin` şeklinde yapılabilir.
