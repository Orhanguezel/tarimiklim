import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const configDir = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(configDir, '..', '..', '..');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  turbopack: {
    root: monorepoRoot,
  },
  transpilePackages: ['@agro/shared-config', '@agro/shared-types'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'openweathermap.org' },
      { protocol: 'http', hostname: 'localhost' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['next-intl'],
  },
};

export default withNextIntl(nextConfig);
