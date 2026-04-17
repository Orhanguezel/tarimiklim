import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

const PILLARS = ['risk', 'forecast', 'irrigation'] as const;
const FEATURES = ['one', 'two', 'three', 'four'] as const;

const ICONS: Record<(typeof PILLARS)[number], ReactNode> = {
  risk: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  ),
  forecast: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 18c0-3 2-5 5-5 1-3 4-5 7-5s6 2 6 5c2 0 3 1 3 3s-1 3-3 3H5c-1 0-2-1-2-1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  ),
  irrigation: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2s6 6 6 11a6 6 0 01-12 0c0-5 6-11 6-11z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  ),
};

export function PillarsSection() {
  const t = useTranslations('premium.pillars');

  return (
    <section id="modules" className="container-section">
      <div className="section-label">
        <span className="section-label-num">II.</span>
        <span>{t('label')}</span>
      </div>
      <h2 className="section-title">
        {t('title.line1')} <em>{t('title.line2')}</em>
      </h2>
      <p className="section-lead">{t('lead')}</p>
      <div className="pillars-grid">
        {PILLARS.map((pillar) => (
          <article key={pillar} className="pillar-card">
            <div className="pillar-index">{t(`items.${pillar}.index`)}</div>
            <div className="pillar-icon">{ICONS[pillar]}</div>
            <div className="pillar-title">
              {t(`items.${pillar}.titlePrefix`)} <em>{t(`items.${pillar}.titleEmphasis`)}</em>
            </div>
            <div className="pillar-copy">{t(`items.${pillar}.copy`)}</div>
            <ul className="pillar-list">
              {FEATURES.map((feature) => (
                <li key={feature}>
                  <span>{t(`items.${pillar}.features.${feature}.label`)}</span>
                  <strong>{t(`items.${pillar}.features.${feature}.value`)}</strong>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
