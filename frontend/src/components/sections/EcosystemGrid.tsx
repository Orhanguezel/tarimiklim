import { useTranslations } from 'next-intl';

const ITEMS = ['bereketfide', 'vistaseed', 'sera', 'ziraatHaber', 'hal', 'yield', 'disease', 'open'] as const;

export function EcosystemGrid() {
  const t = useTranslations('premium.ecosystem');

  return (
    <section id="ekosistem" className="container-section">
      <div className="section-label">
        <span className="section-label-num">IV.</span>
        <span>{t('label')}</span>
      </div>
      <h2 className="section-title">
        {t('title.prefix')} <em>{t('title.emphasis')}</em>
      </h2>
      <p className="section-lead">{t('lead')}</p>
      <div className="ecosystem-grid">
        {ITEMS.map((item) => (
          <article key={item} className="eco-card">
            <div>
              <div className="eco-label">{t(`items.${item}.label`)}</div>
              <div className={`status-badge ${t(`items.${item}.statusTone`)}`}>{t(`items.${item}.status`)}</div>
              <div className="eco-name">{t(`items.${item}.name`)}</div>
              <p className="eco-copy">{t(`items.${item}.copy`)}</p>
            </div>
            <div className="footer-meta">{t(`items.${item}.meta`)}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
