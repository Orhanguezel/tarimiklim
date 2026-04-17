import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { HeroLiveCard } from './HeroLiveCard';

const HERO_STATS = ['queries', 'accuracy', 'latency'] as const;

export function HeroSection() {
  const t = useTranslations('premium.hero');

  return (
    <section id="top">
      <div className="container-wide hero-grid">
        <div>
          <div className="hero-eyebrow">{t('eyebrow')}</div>
          <h1 className="hero-title">
            <span className="hero-break">{t('title.line1')}</span>
            <span className="hero-break">
              <em>{t('title.line2')}</em>
            </span>
            <span className="hero-break hero-indent">{t('title.line3')}</span>
          </h1>
          <p className="hero-copy">{t('copy')}</p>
          <div className="hero-actions">
            <a href="#panel" className="button-primary">
              {t('actions.primary')}
            </a>
            <a href="#api" className="button-ghost">
              {t('actions.secondary')}
            </a>
            <a href="#docs" className="hero-meta-link">
              {t('actions.tertiaryPrefix')} <span>{t('actions.tertiary')}</span>
            </a>
          </div>
          <div className="hero-stat-grid">
            {HERO_STATS.map((key) => (
              <article key={key} className="hero-stat">
                <div className="hero-stat-number">{t(`stats.${key}.value`)}</div>
                <div>{t(`stats.${key}.label`)}</div>
              </article>
            ))}
          </div>
        </div>
        <Suspense fallback={<HeroCardSkeleton />}>
          <HeroLiveCard />
        </Suspense>
      </div>
    </section>
  );
}

function HeroCardSkeleton() {
  return (
    <div className="hero-card-stack" aria-hidden="true">
      <article className="weather-card" style={{ minHeight: '20rem' }} />
      <article className="weather-alert-card" style={{ minHeight: '8rem' }} />
    </div>
  );
}
