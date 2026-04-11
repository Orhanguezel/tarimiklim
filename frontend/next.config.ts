import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const configDir = path.dirname(fileURLToPath(import.meta.url));
// VPS: frontend/ is directly under /var/www/tarimiklim/ (2 levels to monorepo root)
// Local: frontend/ is under .../tarim-dijital-ekosistem/projects/tarimiklim/ (3 levels)
const root2 = path.join(configDir, '..', '..');
const root3 = path.join(configDir, '..', '..', '..');
const monorepoRoot = fs.existsSync(path.join(root2, 'packages')) ? root2 : root3;

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
