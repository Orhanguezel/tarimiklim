// /favicon.ico — <link rel="icon"> okumayan istemciler (link onizlemeleri, botlar,
// bazi tarayicilar) bu yolu dogrudan ister.
//
// NEDEN route: bu yolun karsiligi yoktu. proxy noktali yollari atladigi ve [locale]
// gecersiz dili reddetmedigi icin istek "favicon.ico" dilinde ana sayfa HTML'ini
// 200 ile donduruyordu (2026-10-01). Kaynak site_settings.site_favicon; yoksa
// app/icon.tsx'in urettigi /icon.
import { fetchSiteMedia } from '@/lib/site-settings';

export const revalidate = 300;

export async function GET(request: Request) {
  const { favicon } = await fetchSiteMedia();
  return new Response(null, {
    status: 308,
    headers: {
      Location: favicon ?? new URL('/icon', request.url).pathname,
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
