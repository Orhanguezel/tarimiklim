import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { CityVariant } from '@/lib/city-pages';
import { CITY_VARIANTS, hubPath, variantCopy } from '@/lib/city-pages';
import { CityProvinceLinks } from '@/components/city/CityProvinceLinks';
import { getPublicAppName, getPublicSiteUrl } from '@/lib/public-brand';

function hubGuide(variant: CityVariant, locale: string) {
  const isEn = locale === 'en';
  if (variant === 'don-uyarisi') {
    return isEn
      ? {
          title: 'How to use frost alerts',
          body: 'Frost pages combine minimum temperature, humidity, wind and cloud cover into an agricultural frost-risk signal. Use city pages to monitor local risk before overnight decisions.',
        }
      : {
          title: 'Don uyarısı nasıl okunmalı?',
          body: 'Don uyarısı sayfaları minimum sıcaklık, nem, rüzgar ve bulut örtüsünü birlikte değerlendirerek zirai don riski sinyali üretir. Gece öncesi hazırlık için il sayfalarından yerel riski takip edebilirsiniz.',
        };
  }
  if (variant === '7-gunluk-tahmin') {
    return isEn
      ? {
          title: '7-day planning window',
          body: 'The 7-day forecast helps growers compare daily minimum and maximum temperature, precipitation, humidity and wind conditions before irrigation, spraying or frost-protection planning.',
        }
      : {
          title: '7 günlük planlama penceresi',
          body: '7 günlük tahmin; sulama, ilaçlama ve don önlemi planı öncesinde günlük minimum/maksimum sıcaklık, yağış, nem ve rüzgar koşullarını karşılaştırmak için kullanılır.',
        };
  }
  return isEn
    ? {
        title: 'Local agricultural weather',
        body: 'Province weather pages show current conditions, 7-day forecasts and agricultural frost-risk context for all 81 provinces of Türkiye.',
      }
    : {
        title: 'Yerel tarımsal hava durumu',
        body: 'İl hava durumu sayfaları Türkiye’nin 81 ili için güncel koşulları, 7 günlük tahmini ve zirai don riski bağlamını bir arada sunar.',
      };
}

export async function CityHubView({ variant, locale }: { variant: CityVariant; locale: string }) {
  const t = await getTranslations({ locale, namespace: 'city' });
  const copy = variantCopy(variant, locale);
  const otherVariants = CITY_VARIANTS.filter((v) => v !== variant);
  const guide = hubGuide(variant, locale);
  const site = getPublicSiteUrl();
  const hubLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: copy.hub,
    url: `${site}${hubPath(variant, locale)}`,
    inLanguage: locale === 'en' ? 'en-US' : 'tr-TR',
    isPartOf: {
      '@type': 'WebSite',
      name: getPublicAppName(),
      url: `${site}/${locale}`,
    },
    about: guide.title,
  };

  return (
    <article className="city-hub container-wide">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(hubLd) }} />
      <nav className="city-breadcrumb" aria-label="Breadcrumb">
        <Link href={`/${locale}`}>{t('breadcrumbHome')}</Link>
        <span aria-hidden>/</span>
        <span aria-current="page">{copy.hub}</span>
      </nav>

      <header className="city-head">
        <p className="city-eyebrow">{t('hubEyebrow')}</p>
        <h1 className="city-title">{t('hubTitle', { hub: copy.hub })}</h1>
        <p className="city-sub">{t('hubIntro', { hub: copy.hub.toLowerCase() })}</p>
      </header>

      <nav className="city-links" aria-label={t('otherSections')}>
        <ul className="city-link-pills">
          {otherVariants.map((v) => (
            <li key={v}>
              <Link href={hubPath(v, locale)}>{variantCopy(v, locale).hub}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <section className="city-prose city-hub-guide">
        <h2 className="city-h2">{guide.title}</h2>
        <p>{guide.body}</p>
        <p>
          {locale === 'en'
            ? 'Forecast and risk pages are decision-support surfaces; official meteorological warnings and local expert review should be considered for critical agricultural action.'
            : 'Tahmin ve risk sayfaları karar destek amacıyla sunulur; kritik tarımsal aksiyonlarda resmi meteorolojik uyarılar ve yerel uzman değerlendirmesi dikkate alınmalıdır.'}
        </p>
      </section>

      <CityProvinceLinks variant={variant} locale={locale} heading={t('provinceListTitle')} />
    </article>
  );
}
