CREATE TABLE IF NOT EXISTS home_sections (
  id CHAR(36) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  label VARCHAR(255) NOT NULL,
  component_key VARCHAR(100) NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  config LONGTEXT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY home_sections_slug_uq (slug),
  KEY home_sections_active_order_idx (is_active, order_index),
  KEY home_sections_order_idx (order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO home_sections (id, slug, label, component_key, order_index, is_active, config) VALUES
  (
    'b0000001-0000-4000-8000-000000000001',
    'hero',
    'Hero',
    'TarimHero',
    10,
    1,
    '{"content":{"tr":{"eyebrow":"TARIM İKLİM PLATFORMU","titleLine1":"Tarımsal hava verisi","titleLine2":"don riskini","titleLine3":"erken söyler","copy":"Konuma göre 7 günlük tahmin, saatlik minimum sıcaklık ve don riski uyarılarını tek ekranda takip edin.","primaryLabel":"Don uyarısını aç","secondaryLabel":"API ve widget","tertiaryPrefix":"Canlı panel","tertiary":"hemen aşağıda","stats":[{"value":"7 gün","label":"ileri tahmin"},{"value":"81 il","label":"aktif lokasyon"},{"value":"<1 dk","label":"uyarı gecikmesi"}]},"en":{"eyebrow":"TARIM İKLİM PLATFORM","titleLine1":"Agricultural weather data","titleLine2":"spots frost risk","titleLine3":"early","copy":"Track 7-day forecasts, hourly minimum temperature and frost-risk alerts by location in one focused screen.","primaryLabel":"Open frost alerts","secondaryLabel":"API and widget","tertiaryPrefix":"Live panel","tertiary":"just below","stats":[{"value":"7 days","label":"forecast horizon"},{"value":"81 cities","label":"active coverage"},{"value":"<1 min","label":"alert latency"}]}}}'
  ),
  (
    'b0000002-0000-4000-8000-000000000001',
    'ticker',
    'Canlı ticker',
    'TarimTicker',
    20,
    1,
    '{"content":{"tr":{"label":"Canlı tarımsal hava verisi"},"en":{"label":"Live agricultural weather data"}}}'
  ),
  (
    'b0000003-0000-4000-8000-000000000001',
    'dashboard',
    'Don uyarısı paneli',
    'TarimDashboard',
    30,
    1,
    '{"band":"dashboard"}'
  ),
  (
    'b0000004-0000-4000-8000-000000000001',
    'pillars',
    'Modül kartları',
    'TarimPillars',
    40,
    1,
    '{"content":{"tr":{"label":"II. MODÜLLER","titlePrefix":"Üretici için","titleEmphasis":"karar destek katmanları","lead":"Risk, tahmin ve sulama verilerini aynı dilde anlatan yalın modüller.","items":[{"index":"01","title":"Don riski","copy":"Gece minimum sıcaklık ve nem verisini birlikte okuyarak risk skorunu öne çıkarır.","features":[{"label":"Eşik","value":"0°C altı"},{"label":"Kanal","value":"Telegram, push"},{"label":"Kapsam","value":"Konum bazlı"}]},{"index":"02","title":"Hava tahmini","copy":"Saatlik ve günlük tahminleri üreticinin karar anına uygun şekilde sadeleştirir.","features":[{"label":"Ufuk","value":"7 gün"},{"label":"Veri","value":"Saatlik"},{"label":"Görünüm","value":"Panel"}]},{"index":"03","title":"Sulama ve saha","copy":"Yağış, sıcaklık ve nem sinyallerini saha planlaması için okunabilir hale getirir.","features":[{"label":"Sinyal","value":"Yağış"},{"label":"Plan","value":"Günlük"},{"label":"Format","value":"Widget"}]}]},"en":{"label":"II. MODULES","titlePrefix":"Decision layers","titleEmphasis":"for growers","lead":"Clear modules that explain risk, forecast and irrigation data in the same operational language.","items":[{"index":"01","title":"Frost risk","copy":"Combines nightly minimum temperature and humidity signals to surface a practical risk score.","features":[{"label":"Threshold","value":"Below 0°C"},{"label":"Channel","value":"Telegram, push"},{"label":"Coverage","value":"By location"}]},{"index":"02","title":"Forecasts","copy":"Turns hourly and daily forecast data into a focused producer dashboard.","features":[{"label":"Horizon","value":"7 days"},{"label":"Data","value":"Hourly"},{"label":"View","value":"Panel"}]},{"index":"03","title":"Irrigation and field","copy":"Makes rain, temperature and humidity signals readable for field planning.","features":[{"label":"Signal","value":"Rain"},{"label":"Plan","value":"Daily"},{"label":"Format","value":"Widget"}]}]}}}'
  ),
  (
    'b0000005-0000-4000-8000-000000000001',
    'api',
    'API ve widget',
    'TarimApi',
    50,
    1,
    '{"content":{"tr":{"label":"III. ENTEGRASYON","titlePrefix":"Widget ve API ile","titleEmphasis":"her siteye bağlanır","lead":"Hava durumu ve don riski widgetını kendi web sitenize iframe olarak ekleyin.","codeFilename":"widget/embed.html","codeBody":"<iframe src=\"https://tarimiklim.com/widget?location=auto\" width=\"100%\" height=\"420\"></iframe>","sideTitle":"Gömülebilir hava paneli","sideCopy":"Tek satır iframe kodu ile ziyaretçilerinize konuma göre hava tahmini ve don riski gösterin.","endpoints":[{"method":"GET","path":"/api/v1/weather","copy":"7 günlük tahmin"},{"method":"GET","path":"/api/v1/weather/frost-risk","copy":"Don riski skoru"},{"method":"GET","path":"/widget","copy":"Gömülebilir widget"}]},"en":{"label":"III. INTEGRATION","titlePrefix":"Widget and API","titleEmphasis":"connect every site","lead":"Embed the weather and frost-risk widget into your own website with an iframe.","codeFilename":"widget/embed.html","codeBody":"<iframe src=\"https://tarimiklim.com/widget?location=auto\" width=\"100%\" height=\"420\"></iframe>","sideTitle":"Embeddable weather panel","sideCopy":"Show visitors location-aware forecasts and frost-risk data with one iframe snippet.","endpoints":[{"method":"GET","path":"/api/v1/weather","copy":"7-day forecast"},{"method":"GET","path":"/api/v1/weather/frost-risk","copy":"Frost-risk score"},{"method":"GET","path":"/widget","copy":"Embeddable widget"}]}}}'
  ),
  (
    'b0000006-0000-4000-8000-000000000001',
    'stats',
    'İstatistik bandı',
    'TarimStats',
    60,
    1,
    '{"band":"stats","content":{"tr":{"items":[{"label":"Lokasyon","value":"81 il","copy":"Türkiye geneli takip"},{"label":"Tahmin","value":"7 gün","copy":"Saatlik ve günlük görünüm"},{"label":"Uyarı","value":"3 kanal","copy":"Telegram, push ve e-posta"},{"label":"Widget","value":"1 satır","copy":"Her siteye iframe ile eklenir"}]},"en":{"items":[{"label":"Locations","value":"81 cities","copy":"Coverage across Turkey"},{"label":"Forecast","value":"7 days","copy":"Hourly and daily view"},{"label":"Alerts","value":"3 channels","copy":"Telegram, push and email"},{"label":"Widget","value":"1 line","copy":"Embed with an iframe on any site"}]}}}'
  ),
  (
    'b0000007-0000-4000-8000-000000000001',
    'ecosystem',
    'Ekosistem',
    'TarimEcosystem',
    70,
    1,
    '{"content":{"tr":{"label":"IV. EKOSİSTEM","titlePrefix":"Tarım ekosistemi için","titleEmphasis":"ortak veri katmanı","lead":"Üretici, yayıncı ve geliştiriciler aynı tahmin hattını kendi ekranlarında kullanabilir.","items":[{"label":"Web sitesi","status":"Hazır","statusTone":"live","name":"Gömülü widget","copy":"Tek satır iframe kodu ile hava panelini sayfanıza ekleyin.","meta":"Widget"},{"label":"Konum","status":"Hazır","statusTone":"live","name":"Otomatik lokasyon","copy":"Kullanıcı izin verirse bulunduğu konuma göre veri gösterilir.","meta":"Geo"},{"label":"Uyarı","status":"Aktif","statusTone":"live","name":"Don riski","copy":"Tahmin verisinden don riski skoru ve kısa uyarı üretir.","meta":"Risk"},{"label":"Açık API","status":"Hazır","statusTone":"soon","name":"Geliştirici hattı","copy":"Tahmin ve risk verisini harici ürünlere bağlama.","meta":"API"}]},"en":{"label":"IV. ECOSYSTEM","titlePrefix":"A shared data layer","titleEmphasis":"for agriculture","lead":"Growers, publishers and developers can use the same forecast path inside their own screens.","items":[{"label":"Website","status":"Ready","statusTone":"live","name":"Embedded widget","copy":"Add the weather panel to your page with one iframe snippet.","meta":"Widget"},{"label":"Location","status":"Ready","statusTone":"live","name":"Auto location","copy":"If visitors allow it, the widget shows data for their current location.","meta":"Geo"},{"label":"Alert","status":"Live","statusTone":"live","name":"Frost risk","copy":"Forecast data is turned into a frost-risk score and short warning.","meta":"Risk"},{"label":"Open API","status":"Ready","statusTone":"soon","name":"Developer path","copy":"Connect forecast and risk data to external products.","meta":"API"}]}}}'
  ),
  (
    'b0000008-0000-4000-8000-000000000001',
    'final_cta',
    'Final CTA',
    'TarimFinalCta',
    80,
    1,
    '{"content":{"tr":{"megaPrefix":"Don riskini","megaEmphasis":"erken gör","megaSuffix":"sahada zaman kazan","titleLine1":"Tarım İklim verisini","titleLine2":"ürününüzde kullanın","copy":"Admin panelden bölüm sırasını, aktiflik durumunu ve bu metinleri güncelleyerek ana sayfayı canlı tutun.","primaryLabel":"API alanına git","secondaryLabel":"Paneli incele"},"en":{"megaPrefix":"See frost risk","megaEmphasis":"earlier","megaSuffix":"and move faster in the field","titleLine1":"Use Tarım İklim data","titleLine2":"inside your product","copy":"Keep the homepage fresh by editing section order, visibility and content from the admin panel.","primaryLabel":"Open API area","secondaryLabel":"Review panel"}}}'
  )
ON DUPLICATE KEY UPDATE
  label = VALUES(label),
  component_key = VALUES(component_key),
  order_index = VALUES(order_index),
  is_active = VALUES(is_active),
  config = VALUES(config),
  updated_at = CURRENT_TIMESTAMP(3);
