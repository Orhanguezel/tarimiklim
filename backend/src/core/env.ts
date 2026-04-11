const get = (key: string, fallback?: string): string => {
  const v = process.env[key] ?? fallback;
  if (v === undefined) throw new Error(`Missing env: ${key}`);
  return v;
};

const getOptional = (key: string, fallback = ''): string =>
  process.env[key] ?? fallback;

export const env = {
  NODE_ENV: getOptional('NODE_ENV', 'development'),
  PORT: Number(getOptional('PORT', '8088')),
  HOST: getOptional('HOST', '127.0.0.1'),

  DB: {
    host: get('DB_HOST', '127.0.0.1'),
    port: Number(getOptional('DB_PORT', '3306')),
    user: get('DB_USER', 'app'),
    password: get('DB_PASSWORD', 'app'),
    name: get('DB_NAME', 'hava_durumu'),
    /** TCP yerine Unix soketi (ornek: /tmp/mysql.sock). Bos ise host+port. */
    socketPath: getOptional('DB_SOCKET_PATH', ''),
  },

  JWT_SECRET: get('JWT_SECRET', 'dev-secret'),
  COOKIE_SECRET: getOptional('COOKIE_SECRET', 'dev-cookie-secret'),
  AUTH_ADMIN_EMAILS: getOptional('AUTH_ADMIN_EMAILS', ''),

  CORS_ORIGIN: getOptional(
    'CORS_ORIGIN',
    'http://localhost:3088,http://localhost:3048,http://127.0.0.1:3088,http://127.0.0.1:3048',
  ),

  STORAGE_DRIVER: getOptional('STORAGE_DRIVER', 'local') as 'local' | 'cloudinary',
  LOCAL_STORAGE_ROOT: getOptional('LOCAL_STORAGE_ROOT', './uploads'),
  LOCAL_STORAGE_BASE_URL: getOptional('LOCAL_STORAGE_BASE_URL', 'http://localhost:8088'),
  CDN_PUBLIC_BASE: getOptional('CDN_PUBLIC_BASE'),
  CLOUDINARY_CLOUD_NAME: getOptional('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: getOptional('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: getOptional('CLOUDINARY_API_SECRET'),
  CLOUDINARY_FOLDER: getOptional('CLOUDINARY_FOLDER', 'hava-durumu'),

  WEATHER_API_PROVIDER: getOptional('WEATHER_API_PROVIDER', 'openweathermap') as 'openweathermap' | 'mgm',
  OPENWEATHERMAP_API_KEY: getOptional('OPENWEATHERMAP_API_KEY'),
  WEATHER_CACHE_TTL_SECONDS: Number(getOptional('WEATHER_CACHE_TTL_SECONDS', '1800')),
  /** Bos ise /internal/weather/* herkese acik; doluysa Authorization: Bearer <token> zorunlu */
  INTERNAL_WEATHER_API_TOKEN: getOptional('INTERNAL_WEATHER_API_TOKEN', ''),
  MGM_API_URL: getOptional('MGM_API_URL'),
  MGM_API_KEY: getOptional('MGM_API_KEY'),

  REDIS_URL: getOptional('REDIS_URL', 'redis://localhost:6379'),

  TELEGRAM_BOT_TOKEN: getOptional('TELEGRAM_BOT_TOKEN'),
  TELEGRAM_ALERT_CHANNEL_ID: getOptional('TELEGRAM_ALERT_CHANNEL_ID'),

  FIREBASE_PROJECT_ID: getOptional('FIREBASE_PROJECT_ID'),
  FIREBASE_PRIVATE_KEY: getOptional('FIREBASE_PRIVATE_KEY'),
  FIREBASE_CLIENT_EMAIL: getOptional('FIREBASE_CLIENT_EMAIL'),
  /** Virgulle ayrilmis FCM cihaz tokenlari (don uyarisi push) */
  FCM_DEVICE_TOKENS: getOptional('FCM_DEVICE_TOKENS'),
  /** Virgulle ayrilmis e-posta alicilari (frost uyarisi) */
  ALERT_EMAIL_TO: getOptional('ALERT_EMAIL_TO'),

  SMTP_HOST: getOptional('SMTP_HOST'),
  SMTP_PORT: Number(getOptional('SMTP_PORT', '587')),
  SMTP_SECURE: getOptional('SMTP_SECURE', 'false') === 'true',
  SMTP_USER: getOptional('SMTP_USER'),
  SMTP_PASS: getOptional('SMTP_PASS'),
  MAIL_FROM: getOptional('MAIL_FROM', 'noreply@agro.com.tr'),

  SENTRY_DSN: getOptional('SENTRY_DSN'),
  PUBLIC_URL: getOptional('PUBLIC_URL', 'http://localhost:8088'),
  FRONTEND_URL: getOptional('FRONTEND_URL', 'http://localhost:3088'),

  GOOGLE: {
    clientId: getOptional('GOOGLE_CLIENT_ID'),
    clientSecret: getOptional('GOOGLE_CLIENT_SECRET'),
  },

  SITE_NAME: getOptional('SITE_NAME', 'Hava Durumu ve Don Uyarisi'),
};

export type AppEnv = typeof env;
