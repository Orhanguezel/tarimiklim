import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import type { Metadata } from 'next';

import { fetchSetting, fetchSiteMedia } from '@/lib/site-settings';
import { fetchNavigation } from '@/lib/navigation';
import { SiteNav } from '@/components/sections/SiteNav';
import { SiteFooter } from '@/components/sections/SiteFooter';
import { AlertBar } from '@/components/sections/AlertBar';
import { getDefaultLogoAlt, getOpenGraphSiteName, getPublicSiteUrl } from '@/lib/public-brand';
import { fetchPageSeo, mergePageMetadata } from '@/lib/page-seo';
import {
  buildRuntimeThemeCss,
  fetchRuntimeCustomCss,
  fetchRuntimeDesignTokens,
} from '@/lib/design-tokens-runtime';

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
  const favicon = media.favicon ?? '/icon';
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
    icons: { icon: favicon, apple: appleTouch ?? favicon },
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
  const [messages, tokens, customCss, nav, media, gtmRow, ga4Row] = await Promise.all([
    getMessages(),
    fetchRuntimeDesignTokens(),
    fetchRuntimeCustomCss(),
    fetchNavigation(locale),
    fetchSiteMedia(locale),
    fetchSetting('gtm_container_id', locale, { revalidate: 3600 }),
    fetchSetting('ga4_measurement_id', locale, { revalidate: 3600 }),
  ]);
  const runtimeCss = buildRuntimeThemeCss(tokens);
  const gtmId = typeof gtmRow?.value === 'string' ? gtmRow.value.trim() : '';
  const ga4Id = typeof ga4Row?.value === 'string' ? ga4Row.value.trim() : '';

  return (
    <NextIntlClientProvider messages={messages}>
      <style id="runtime-design-tokens" dangerouslySetInnerHTML={{ __html: runtimeCss }} />
      {customCss ? <style id="runtime-custom-css" dangerouslySetInnerHTML={{ __html: customCss }} /> : null}
      {gtmId ? <GoogleTagManager gtmId={gtmId} /> : ga4Id ? <GoogleAnalytics gaId={ga4Id} /> : null}
      <AlertBar />
      <SiteNav locale={locale} logoUrl={media.logo} items={nav.header} />
      {children}
      <SiteFooter
        locale={locale}
        logoUrl={media.logo}
        sections={nav.footer.sections}
        items={nav.footer.items}
        content={nav.footer.content}
      />
    </NextIntlClientProvider>
  );
}
