import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const configDir = path.dirname(fileURLToPath(import.meta.url));
const root2 = path.join(configDir, '..', '..');
const root3 = path.join(configDir, '..', '..', '..');
const monorepoRoot = fs.existsSync(path.join(root2, 'packages')) ? root2 : root3;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  compiler: { removeConsole: process.env.NODE_ENV === 'production' },

  turbopack: {
    root: monorepoRoot,
  },

  // ✅ Image optimization config
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8086',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.vercel.app',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ✅ kaldırıyoruz: /admin/dashboard -> /admin/dashboard/default
  async redirects() {
    return [
      // İstersen eski linkleri yakalamak için tersine redirect bırakabilirsin:
      // { source: '/admin/dashboard/default', destination: '/admin/dashboard', permanent: false },
    ];
  },

  async rewrites() {
    const raw =
      process.env.PANEL_API_URL || process.env.NEXT_PUBLIC_PANEL_API_URL || 'http://127.0.0.1:8088';
    const originOnly = String(raw)
      .replace(/\/+$/, '')
      .replace(/\/api(\/v\d+)?$/i, '');

    return [
      {
        source: '/api/v1/:path*',
        destination: `${originOnly}/api/v1/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${originOnly}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
