import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { CityVariant } from '@/lib/city-pages';
import { CITY_VARIANTS, hubPath, variantCopy } from '@/lib/city-pages';
import { CityProvinceLinks } from '@/components/city/CityProvinceLinks';

export async function CityHubView({ variant, locale }: { variant: CityVariant; locale: string }) {
  const t = await getTranslations({ locale, namespace: 'city' });
  const copy = variantCopy(variant, locale);
  const otherVariants = CITY_VARIANTS.filter((v) => v !== variant);

  return (
    <article className="city-hub container-wide">
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

      <CityProvinceLinks variant={variant} locale={locale} heading={t('provinceListTitle')} />
    </article>
  );
}
