import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';

import { fetchSiteMedia } from '@/lib/site-settings';

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
  const [t, media] = await Promise.all([
    getTranslations({ locale, namespace: 'meta' }),
    fetchSiteMedia(locale),
  ]);

  const ogImage = media.logo ?? '/brand/og-image.svg';
  const favicon = media.favicon ?? '/brand/favicon.svg';
  const appleTouch = media.appleTouchIcon ?? favicon;

  return {
    title: { default: t('title'), template: `%s | ${t('title')}` },
    description: t('description'),
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3088'),
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}`,
      languages: { tr: '/tr', en: '/en' },
    },
    openGraph: {
      siteName: 'TarımİKlim',
      locale,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'TarımİKlim',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      images: [ogImage],
    },
    icons: {
      icon: favicon,
      apple: appleTouch,
    },
  };
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
