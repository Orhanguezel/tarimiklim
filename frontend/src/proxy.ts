import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';

import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// SEO: tek kanonik origin env'den (NEXT_PUBLIC_SITE_URL) türetilir, hard-coded değil.
// Yönlendirme hedefi her zaman bu temiz origin'den kurulur; gelen isteğin host/port'u
// (nginx arkasında 3088 sızabilir) asla kopyalanmaz.
const SITE_ORIGIN = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tarimiklim.com').origin;
  } catch {
    return 'https://tarimiklim.com';
  }
})();

export function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const host = req.headers.get('host') ?? '';

  // 1) www → non-www (301 kalıcı). Google'ın /en için www, /tr için non-www seçmesinden
  //    kaynaklanan sinyal bölünmesini önler.
  if (host.startsWith('www.')) {
    const target = new URL(`${url.pathname}${url.search}`, SITE_ORIGIN);
    return NextResponse.redirect(target, 301);
  }

  // 2) Kök → varsayılan dil (308 kalıcı). next-intl varsayılanı 307 (geçici).
  if (url.pathname === '/') {
    const target = new URL(`/${routing.defaultLocale}`, SITE_ORIGIN);
    return NextResponse.redirect(target, 308);
  }

  return intlMiddleware(req);
}

export const config = {
  // widget/* yollarini i18n middleware'den hariç tut — bunlarin locale prefix'i yok
  matcher: ['/((?!api|_next|_vercel|widget|.*\\..*).*)'],
};
