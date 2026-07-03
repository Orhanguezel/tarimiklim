-- Tarim Iklim public SEO records.
-- Public frontend reads seo_pages_<pageKey> and admin inline editor reads aggregate seo_pages.
INSERT INTO site_settings (id, `key`, locale, value) VALUES
  (
    'a0000100-0000-4000-8000-000000000001',
    'seo_defaults',
    'tr',
    '{"title":"Tarım İklim","description":"Türkiye için tarımsal hava tahmini, don riski erken uyarı ve üretici odaklı iklim verisi.","og_image":"/brand/og-image.png","no_index":false,"robots":{"index":true,"follow":true}}'
  ),
  (
    'a0000100-0000-4000-8000-000000000002',
    'seo_defaults',
    'en',
    '{"title":"Tarım İklim","description":"Agricultural weather forecasts, frost-risk alerts and grower-focused climate data for Turkey.","og_image":"/brand/og-image.png","no_index":false,"robots":{"index":true,"follow":true}}'
  ),
  (
    'a0000101-0000-4000-8000-000000000001',
    'seo_pages_site',
    'tr',
    '{"title":"Tarım İklim | Tarımsal Hava ve Don Uyarısı","description":"Tarım İklim, üreticiler için 7 günlük hava tahmini, don riski uyarısı, tarımsal hava verisi ve abonelik tabanlı bildirimler sunar.","og_image":"/brand/og-image.png","no_index":false,"robots":{"index":true,"follow":true}}'
  ),
  (
    'a0000101-0000-4000-8000-000000000002',
    'seo_pages_site',
    'en',
    '{"title":"Tarım İklim | Agricultural Weather and Frost Alerts","description":"Tarım İklim provides 7-day forecasts, frost-risk alerts, agricultural weather data and subscription-based notifications for growers.","og_image":"/brand/og-image.png","no_index":false,"robots":{"index":true,"follow":true}}'
  ),
  (
    'a0000102-0000-4000-8000-000000000001',
    'seo_pages_home',
    'tr',
    '{"title":"Tarım İklim | 7 Günlük Tahmin ve Don Riski","description":"Şehir ve bölge bazlı hava tahmini, don riski skoru, üretici uyarıları ve tarım ekosistemi için iklim verisi.","og_image":"/brand/og-image.png","no_index":false,"robots":{"index":true,"follow":true}}'
  ),
  (
    'a0000102-0000-4000-8000-000000000002',
    'seo_pages_home',
    'en',
    '{"title":"Tarım İklim | 7-Day Forecasts and Frost Risk","description":"Location-based weather forecasts, frost-risk scores, grower alerts and climate data for the agricultural ecosystem.","og_image":"/brand/og-image.png","no_index":false,"robots":{"index":true,"follow":true}}'
  ),
  (
    'a0000103-0000-4000-8000-000000000001',
    'seo_pages_don-uyarisi',
    'tr',
    '{"title":"Don Uyarısı | Tarım İklim","description":"Konum seçerek don riski, saatlik tahmin ve minimum sıcaklık verilerini izleyin, Telegram, e-posta veya push uyarısı alın.","og_image":"/brand/og-image.png","no_index":false,"robots":{"index":true,"follow":true}}'
  ),
  (
    'a0000103-0000-4000-8000-000000000002',
    'seo_pages_don-uyarisi',
    'en',
    '{"title":"Frost Alert | Tarım İklim","description":"Track frost risk, hourly forecasts and minimum temperature by location, receive alerts via Telegram, email or push notifications.","og_image":"/brand/og-image.png","no_index":false,"robots":{"index":true,"follow":true}}'
  ),
  (
    'a0000104-0000-4000-8000-000000000001',
    'seo_pages_auth-login',
    'tr',
    '{"title":"Giriş Yap | Tarım İklim","description":"Tarım İklim hesabınıza giriş yaparak don uyarısı ve bildirim tercihlerinizi yönetin.","og_image":"/brand/og-image.png","no_index":true,"robots":{"index":false,"follow":false}}'
  ),
  (
    'a0000104-0000-4000-8000-000000000002',
    'seo_pages_auth-login',
    'en',
    '{"title":"Sign In | Tarım İklim","description":"Sign in to manage your Tarım İklim frost-alert and notification preferences.","og_image":"/brand/og-image.png","no_index":true,"robots":{"index":false,"follow":false}}'
  ),
  (
    'a0000105-0000-4000-8000-000000000001',
    'seo_pages_auth-register',
    'tr',
    '{"title":"Kayıt Ol | Tarım İklim","description":"Tarım İklim üyeliği oluşturun, şehir bazlı don uyarısı ve bildirim tercihlerinizi saklayın.","og_image":"/brand/og-image.png","no_index":true,"robots":{"index":false,"follow":false}}'
  ),
  (
    'a0000105-0000-4000-8000-000000000002',
    'seo_pages_auth-register',
    'en',
    '{"title":"Create Account | Tarım İklim","description":"Create a Tarım İklim account to save location-based frost alerts and notification preferences.","og_image":"/brand/og-image.png","no_index":true,"robots":{"index":false,"follow":false}}'
  ),
  (
    'a0000106-0000-4000-8000-000000000001',
    'seo_pages_widget-bereketfide',
    'tr',
    '{"title":"Bereket Fide Hava Widget | Tarım İklim","description":"Bereket Fide web siteleri için gömülebilir hava durumu ve don riski widgetı.","og_image":"/brand/og-image.png","no_index":true,"robots":{"index":false,"follow":false}}'
  ),
  (
    'a0000106-0000-4000-8000-000000000002',
    'seo_pages_widget-bereketfide',
    'en',
    '{"title":"Bereket Fide Weather Widget | Tarım İklim","description":"Embeddable weather and frost-risk widget for Bereket Fide websites.","og_image":"/brand/og-image.png","no_index":true,"robots":{"index":false,"follow":false}}'
  ),
  (
    'a0000107-0000-4000-8000-000000000001',
    'seo_pages_widget-vistaseed',
    'tr',
    '{"title":"VistaSeed Hava Widget | Tarım İklim","description":"VistaSeed web siteleri için gömülebilir hava durumu ve don riski widgetı.","og_image":"/brand/og-image.png","no_index":true,"robots":{"index":false,"follow":false}}'
  ),
  (
    'a0000107-0000-4000-8000-000000000002',
    'seo_pages_widget-vistaseed',
    'en',
    '{"title":"VistaSeed Weather Widget | Tarım İklim","description":"Embeddable weather and frost-risk widget for VistaSeed websites.","og_image":"/brand/og-image.png","no_index":true,"robots":{"index":false,"follow":false}}'
  ),
  (
    'a0000108-0000-4000-8000-000000000001',
    'seo_pages_widget-haldefiyat',
    'tr',
    '{"title":"Haldefiyat Hava Widget | Tarım İklim","description":"Haldefiyat entegrasyonları için gömülebilir hava durumu ve don riski widgetı.","og_image":"/brand/og-image.png","no_index":true,"robots":{"index":false,"follow":false}}'
  ),
  (
    'a0000108-0000-4000-8000-000000000002',
    'seo_pages_widget-haldefiyat',
    'en',
    '{"title":"Haldefiyat Weather Widget | Tarım İklim","description":"Embeddable weather and frost-risk widget for Haldefiyat integrations.","og_image":"/brand/og-image.png","no_index":true,"robots":{"index":false,"follow":false}}'
  ),
  (
    'a0000190-0000-4000-8000-000000000001',
    'seo_pages',
    'tr',
    '{"site":{"title":"Tarım İklim | Tarımsal Hava ve Don Uyarısı","description":"Tarım İklim, üreticiler için 7 günlük hava tahmini, don riski uyarısı, tarımsal hava verisi ve abonelik tabanlı bildirimler sunar.","og_image":"/brand/og-image.png","no_index":false},"home":{"title":"Tarım İklim | 7 Günlük Tahmin ve Don Riski","description":"Şehir ve bölge bazlı hava tahmini, don riski skoru, üretici uyarıları ve tarım ekosistemi için iklim verisi.","og_image":"/brand/og-image.png","no_index":false},"don-uyarisi":{"title":"Don Uyarısı | Tarım İklim","description":"Konum seçerek don riski, saatlik tahmin ve minimum sıcaklık verilerini izleyin, Telegram, e-posta veya push uyarısı alın.","og_image":"/brand/og-image.png","no_index":false},"auth-login":{"title":"Giriş Yap | Tarım İklim","description":"Tarım İklim hesabınıza giriş yaparak don uyarısı ve bildirim tercihlerinizi yönetin.","og_image":"/brand/og-image.png","no_index":true},"auth-register":{"title":"Kayıt Ol | Tarım İklim","description":"Tarım İklim üyeliği oluşturun, şehir bazlı don uyarısı ve bildirim tercihlerinizi saklayın.","og_image":"/brand/og-image.png","no_index":true},"widget-bereketfide":{"title":"Bereket Fide Hava Widget | Tarım İklim","description":"Bereket Fide web siteleri için gömülebilir hava durumu ve don riski widgetı.","og_image":"/brand/og-image.png","no_index":true},"widget-vistaseed":{"title":"VistaSeed Hava Widget | Tarım İklim","description":"VistaSeed web siteleri için gömülebilir hava durumu ve don riski widgetı.","og_image":"/brand/og-image.png","no_index":true},"widget-haldefiyat":{"title":"Haldefiyat Hava Widget | Tarım İklim","description":"Haldefiyat entegrasyonları için gömülebilir hava durumu ve don riski widgetı.","og_image":"/brand/og-image.png","no_index":true}}'
  ),
  (
    'a0000190-0000-4000-8000-000000000002',
    'seo_pages',
    'en',
    '{"site":{"title":"Tarım İklim | Agricultural Weather and Frost Alerts","description":"Tarım İklim provides 7-day forecasts, frost-risk alerts, agricultural weather data and subscription-based notifications for growers.","og_image":"/brand/og-image.png","no_index":false},"home":{"title":"Tarım İklim | 7-Day Forecasts and Frost Risk","description":"Location-based weather forecasts, frost-risk scores, grower alerts and climate data for the agricultural ecosystem.","og_image":"/brand/og-image.png","no_index":false},"don-uyarisi":{"title":"Frost Alert | Tarım İklim","description":"Track frost risk, hourly forecasts and minimum temperature by location, receive alerts via Telegram, email or push notifications.","og_image":"/brand/og-image.png","no_index":false},"auth-login":{"title":"Sign In | Tarım İklim","description":"Sign in to manage your Tarım İklim frost-alert and notification preferences.","og_image":"/brand/og-image.png","no_index":true},"auth-register":{"title":"Create Account | Tarım İklim","description":"Create a Tarım İklim account to save location-based frost alerts and notification preferences.","og_image":"/brand/og-image.png","no_index":true},"widget-bereketfide":{"title":"Bereket Fide Weather Widget | Tarım İklim","description":"Embeddable weather and frost-risk widget for Bereket Fide websites.","og_image":"/brand/og-image.png","no_index":true},"widget-vistaseed":{"title":"VistaSeed Weather Widget | Tarım İklim","description":"Embeddable weather and frost-risk widget for VistaSeed websites.","og_image":"/brand/og-image.png","no_index":true},"widget-haldefiyat":{"title":"Haldefiyat Weather Widget | Tarım İklim","description":"Embeddable weather and frost-risk widget for Haldefiyat integrations.","og_image":"/brand/og-image.png","no_index":true}}'
  )
ON DUPLICATE KEY UPDATE
  value = VALUES(value),
  updated_at = CURRENT_TIMESTAMP(3);
