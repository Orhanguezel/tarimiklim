import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';

import { fetchSiteMedia } from '@/lib/site-settings';
import { getDefaultLogoAlt, getOpenGraphSiteName, getPublicSiteUrl } from '@/lib/public-brand';
import { fetchPageSeo, mergePageMetadata } from '@/lib/page-seo';

import '../../styles/globals.css';

/* ── Self-hosted fonts via next/font ─────────────────────────── */
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
});

const fontVars = [spaceGrotesk.variable, inter.variable, jetbrainsMono.variable].join(' ');

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const site = getPublicSiteUrl();
  const [t, media] = await Promise.all([
    getTranslations({ locale, namespace: 'meta' }),
    fetchSiteMedia(locale),
  ]);

  const ogImage = media.logo;
  const favicon = media.favicon;
  const appleTouch = media.appleTouchIcon ?? favicon;

  const baseMeta: Metadata = {
    title: { default: t('title'), template: `%s | ${t('title')}` },
    description: t('description'),
    metadataBase: new URL(site),
    alternates: {
      canonical: `${site}/${locale}`,
      languages: { tr: '/tr', en: '/en' },
    },
    openGraph: {
      siteName: getOpenGraphSiteName(),
      locale,
      type: 'website',
      ...(ogImage
        ? { images: [{ url: ogImage, width: 1200, height: 630, alt: getDefaultLogoAlt() }] }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    ...(favicon ? { icons: { icon: favicon, apple: appleTouch ?? favicon } } : {}),
  };
  const seo = await fetchPageSeo('site', locale);
  return mergePageMetadata(baseMeta, seo, locale);
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} className={fontVars} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
