import type { CSSProperties, ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { themeConfigToCssVars } from '@agro/shared-config/theme-css-vars';

import { fetchThemeConfig } from '@/lib/theme';
import '../../styles/globals.css';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: { default: t('title'), template: `%s | ${t('title')}` },
    description: t('description'),
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}`,
      languages: { tr: '/tr', en: '/en' },
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
  const theme = await fetchThemeConfig();
  const themeStyle = themeConfigToCssVars(theme) as CSSProperties;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="hava-app-shell" style={themeStyle} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
