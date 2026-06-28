import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { CityVariant } from '@/lib/city-pages';
import { cityPath } from '@/lib/city-pages';
import { getProvincesByRegion } from '@/lib/provinces';

/** İlleri bölgeye göre listeler — hub ve interaktif sayfalarda iç linkleme için. */
export async function CityProvinceLinks({
  variant,
  locale,
  heading,
}: {
  variant: CityVariant;
  locale: string;
  heading?: string;
}) {
  const t = await getTranslations({ locale, namespace: 'city' });
  const groups = getProvincesByRegion();

  return (
    <section className="city-province-links container-wide">
      <h2 className="city-h2">{heading ?? t('provinceLinksTitle')}</h2>
      {groups.map((group) => (
        <div key={group.region} className="city-region-block">
          <h3 className="city-region-title">{group.name}</h3>
          <ul className="city-province-grid">
            {group.provinces.map((p) => (
              <li key={p.slug}>
                <Link href={cityPath(variant, locale, p.slug)}>{p.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
