import { useTranslations } from 'next-intl';

const GROUPS = ['product', 'developer', 'ecosystem', 'company'] as const;
const GROUP_LINKS: Record<(typeof GROUPS)[number], readonly string[]> = {
  product: ['panel', 'frost', 'irrigation', 'forecast', 'alerts', 'widgets'],
  developer: ['api', 'sdk', 'widget', 'webhooks', 'status', 'changelog'],
  ecosystem: ['bereketfide', 'vistaseed', 'sera', 'ziraatHaber', 'hal', 'yield'],
  company: ['about', 'blog', 'careers', 'press', 'privacy', 'kvkk'],
};

interface Props {
  logoUrl?: string | null;
}

export function SiteFooter({ logoUrl }: Props = {}) {
  const t = useTranslations('premium.footer');

  return (
    <footer className="site-footer">
      <div className="container-wide site-footer-inner">
        <div className="site-footer-top">
          <div className="site-footer-brand">
            {logoUrl ? (
              <img src={logoUrl} alt="TarimIKlim" className="site-footer-logo" />
            ) : (
              <div className="site-footer-wordmark">
                <span className="brand-mark" aria-hidden="true" />
                <span>Tarim<em>IKlim</em></span>
              </div>
            )}
            <p className="site-footer-tag">{t('tagline')}</p>
            <p className="site-footer-copy">{t('copy')}</p>
            <ul className="site-footer-contact">
              <li>{t('contact.company')}</li>
              <li>{t('contact.city')}</li>
              <li>
                <a href={`mailto:${t('contact.email')}`}>{t('contact.email')}</a>
              </li>
              <li>{t('contact.social')}</li>
            </ul>
          </div>

          <div className="site-footer-links">
            {GROUPS.map((group) => (
              <div key={group} className="site-footer-col">
                <h3 className="site-footer-col-title">{t(`groups.${group}.title`)}</h3>
                <ul className="site-footer-col-list">
                  {GROUP_LINKS[group].map((link) => (
                    <li key={link}>
                      <a href={t(`groups.${group}.items.${link}.href`)}>
                        {t(`groups.${group}.items.${link}.label`)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="site-footer-bottom">
          <span className="site-footer-copyright">{t('bottom.copyright')}</span>
          <nav className="site-footer-legal" aria-label="Legal">
            <a href={t('bottom.privacyHref')}>{t('bottom.privacy')}</a>
            <a href={t('bottom.termsHref')}>{t('bottom.terms')}</a>
            <a href={t('bottom.cookiesHref')}>{t('bottom.cookies')}</a>
            <a href={t('bottom.securityHref')}>{t('bottom.security')}</a>
          </nav>
        </div>
        <div className="site-footer-credit">
          {t('bottom.creditLabel')}:{' '}
          <a href={t('bottom.creditUrl')} target="_blank" rel="noopener noreferrer">
            {t('bottom.creditBy')}
          </a>
        </div>
      </div>
    </footer>
  );
}
