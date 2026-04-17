import { useTranslations } from 'next-intl';

const STATS = ['cities', 'accuracy', 'latency', 'water'] as const;

export function StatsStrip() {
  const t = useTranslations('premium.stats');

  return (
    <section className="container-section">
      <div className="stats-grid">
        {STATS.map((stat) => (
          <article key={stat} className="stat-card">
            <div className="stat-label">{t(`items.${stat}.label`)}</div>
            <div className="stat-number">{t(`items.${stat}.value`)}</div>
            <div className="stat-copy">{t(`items.${stat}.copy`)}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
