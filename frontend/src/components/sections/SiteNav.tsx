import { useTranslations } from 'next-intl';
import { SiteNavMobile } from './SiteNavMobile';

const ANCHOR_IDS = ['modules', 'api', 'ekosistem', 'docs'] as const;

interface Props {
  locale: string;
}

export function SiteNav({ locale }: Props) {
  const t = useTranslations('premium.nav');
  const panelHref = `/${locale}/don-uyarisi`;

  return (
    <nav className="site-nav">
      <div className="container-wide">
        <div className="site-nav-inner">
          <a href={`/${locale}`} className="brand-word" aria-label="TarimIKlim">
            <span className="brand-mark" aria-hidden="true" />
            <span>
              Tarim<em>IKlim</em>
            </span>
          </a>
          <div className="site-nav-desktop">
            <ul className="site-nav-links">
              <li>
                <a href={panelHref}>{t('links.panel')}</a>
              </li>
              {ANCHOR_IDS.map((id) => (
                <li key={id}>
                  <a href={`#${id}`}>{t(`links.${id}`)}</a>
                </li>
              ))}
            </ul>
          </div>
          <a href={panelHref} className="site-nav-cta site-nav-desktop-cta">
            {t('cta')}
          </a>
          <SiteNavMobile locale={locale} />
        </div>
      </div>
    </nav>
  );
}
