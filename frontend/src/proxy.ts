import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';

import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// SEO: tek kanonik host + kalıcı yönlendirmeler.
// Canonical host env'den (NEXT_PUBLIC_SITE_URL) türetilir, hard-coded değil.
function canonicalHost(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tarimiklim.com').host;
  } catch {
    return 'tarimiklim.com';
  }
}

export function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const host = req.headers.get('host') ?? '';

  // 1) www → non-www (301 kalıcı). Google'ın /en için www, /tr için non-www seçmesinden
  //    kaynaklanan sinyal bölünmesini önler.
  if (host.startsWith('www.')) {
    const target = new URL(url);
    target.protocol = 'https:';
    target.host = canonicalHost();
    return NextResponse.redirect(target, 301);
  }

  // 2) Kök → varsayılan dil (308 kalıcı). next-intl varsayılanı 307 (geçici).
  if (url.pathname === '/') {
    const target = new URL(`/${routing.defaultLocale}`, url);
    return NextResponse.redirect(target, 308);
  }

  return intlMiddleware(req);
}

export const config = {
  // widget/* yollarini i18n middleware'den hariç tut — bunlarin locale prefix'i yok
  matcher: ['/((?!api|_next|_vercel|widget|.*\\..*).*)'],
};
