import { useTranslations } from 'next-intl';

export function FinalCta() {
  const t = useTranslations('premium.finalCta');

  return (
    <>
      <div className="mega-type">
        {t('megaPrefix')} <em>{t('megaEmphasis')}</em> {t('megaSuffix')}
      </div>
      <section className="final-cta" id="docs">
        <div className="container-wide final-cta-card">
          <div>
            <h2 className="final-cta-title">
              {t('title.line1')} <em>{t('title.line2')}</em>
            </h2>
          </div>
          <div>
            <p className="final-cta-copy">{t('copy')}</p>
            <div className="final-actions">
              <a href="#api" className="button-final">
                {t('actions.primary')}
              </a>
              <a href="#panel" className="button-final-ghost">
                {t('actions.secondary')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
