import createMiddleware from 'next-intl/middleware';

import { routing } from './i18n/routing';

export const proxy = createMiddleware(routing);

export const config = {
  // widget/* yollarini i18n middleware'den hariç tut — bunlarin locale prefix'i yok
  matcher: ['/((?!api|_next|_vercel|widget|.*\\..*).*)'],
};
