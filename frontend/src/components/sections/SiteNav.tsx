import { SiteNavMobile } from './SiteNavMobile';
import { ThemeModeToggle } from '@/components/ThemeModeToggle';
import { resolveLocalizedHref, type NavItem } from '@/lib/navigation';
import { AuthNavButtons } from '@/components/AuthNavButtons';

interface Props {
  locale: string;
  logoUrl?: string | null;
  items?: NavItem[];
}

export function SiteNav({ locale, logoUrl, items = [] }: Props) {
  const activeItems = items.filter((item) => item.is_active !== false);
  const cta = activeItems.find((item) => item.icon === 'cta');
  const links = activeItems.filter((item) => item.icon !== 'cta');

  return (
    <nav className="site-nav">
      <div className="container-wide">
        <div className="site-nav-inner">
          <a href={`/${locale}`} className="brand-word" aria-label="TarimIKlim">
            {logoUrl ? (
              <img src={logoUrl} alt="TarimIKlim" className="brand-logo" />
            ) : (
              <>
                <span className="brand-mark" aria-hidden="true" />
                <span>
                  Tarim<em>IKlim</em>
                </span>
              </>
            )}
          </a>
          <div className="site-nav-desktop">
            <ul className="site-nav-links">
              {links.map((item) => (
                <li key={item.id}>
                  <a href={resolveLocalizedHref(item.href, locale)}>{item.title}</a>
                </li>
              ))}
            </ul>
          </div>
          {cta ? (
            <div className="site-nav-desktop">
              <AuthNavButtons locale={locale} className="site-nav-desktop" ctaItem={cta} />
            </div>
          ) : null}
          <ThemeModeToggle />
          <SiteNavMobile locale={locale} items={activeItems} />
        </div>
      </div>
    </nav>
  );
}
