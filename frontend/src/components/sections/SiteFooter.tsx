import { useTranslations } from 'next-intl';

const GROUPS = ['product', 'developer', 'ecosystem', 'company'] as const;
const GROUP_LINKS: Record<(typeof GROUPS)[number], readonly string[]> = {
  product: ['panel', 'frost', 'irrigation', 'forecast', 'alerts', 'widgets'],
  developer: ['api', 'sdk', 'widget', 'webhooks', 'status', 'changelog'],
  ecosystem: ['bereketfide', 'vistaseed', 'sera', 'ziraatHaber', 'hal', 'yield'],
  company: ['about', 'blog', 'careers', 'press', 'privacy', 'kvkk'],
};

export function SiteFooter() {
  const t = useTranslations('premium.footer');

  return (
    <footer className="site-footer">
      <div className="container-wide footer-card">
        <div className="footer-grid">
          <div>
            <div className="brand-word" style={{ marginBottom: '0.8rem' }}>
              <span className="brand-mark" aria-hidden="true" />
              <span>
                Tarim<em>IKlim</em>
              </span>
            </div>
            <p className="footer-tag">{t('tagline')}</p>
            <p className="footer-copy">{t('copy')}</p>
            <div className="footer-divider">
              <div className="footer-meta">{t('contact.company')}</div>
              <div className="footer-meta">{t('contact.city')}</div>
              <div className="footer-meta">{t('contact.email')}</div>
              <div className="footer-meta">{t('contact.social')}</div>
            </div>
          </div>
          {GROUPS.map((group) => (
            <div key={group}>
              <h3 className="footer-link-title">{t(`groups.${group}.title`)}</h3>
              <ul className="footer-link-list">
                {GROUP_LINKS[group].map((link) => (
                  <li key={link}>
                    <a href={t(`groups.${group}.items.${link}.href`)}>{t(`groups.${group}.items.${link}.label`)}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom footer-divider">
          <div className="footer-meta">{t('bottom.copyright')}</div>
          <div className="footer-links-row">
            <a href={t('bottom.privacyHref')}>{t('bottom.privacy')}</a>
            <a href={t('bottom.termsHref')}>{t('bottom.terms')}</a>
            <a href={t('bottom.cookiesHref')}>{t('bottom.cookies')}</a>
            <a href={t('bottom.securityHref')}>{t('bottom.security')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
