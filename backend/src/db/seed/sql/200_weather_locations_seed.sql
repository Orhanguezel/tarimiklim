INSERT IGNORE INTO weather_locations (id, name, slug, latitude, longitude, city, region, timezone, is_active) VALUES
  (UUID(), 'Antalya Merkez',  'antalya',  36.8968946, 30.7133233, 'Antalya',  'Akdeniz',     'Europe/Istanbul', 1),
  (UUID(), 'İzmir Merkez',    'izmir',    38.4189208, 27.1287065, 'İzmir',    'Ege',          'Europe/Istanbul', 1),
  (UUID(), 'Ankara Merkez',   'ankara',   39.9207886, 32.8540195, 'Ankara',   'İç Anadolu',  'Europe/Istanbul', 1),
  (UUID(), 'İstanbul Merkez', 'istanbul', 41.0082376, 28.9783589, 'İstanbul', 'Marmara',      'Europe/Istanbul', 1),
  (UUID(), 'Bursa Merkez',    'bursa',    40.1826781, 29.0663949, 'Bursa',    'Marmara',      'Europe/Istanbul', 1),
  (UUID(), 'Adana Merkez',    'adana',    37.0000000, 35.3213000, 'Adana',    'Akdeniz',      'Europe/Istanbul', 1),
  (UUID(), 'Konya Merkez',    'konya',    37.8713000, 32.4846000, 'Konya',    'İç Anadolu',  'Europe/Istanbul', 1),
  (UUID(), 'Samsun Merkez',   'samsun',   41.2867000, 36.3300000, 'Samsun',   'Karadeniz',    'Europe/Istanbul', 1);
