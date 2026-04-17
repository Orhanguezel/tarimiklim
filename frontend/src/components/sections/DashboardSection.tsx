import { useTranslations } from 'next-intl';
import { DashboardController } from './DashboardController';

export function DashboardSection() {
  const t = useTranslations('premium.dashboard');

  return (
    <section id="panel" className="container-section">
      <div className="section-label">
        <span className="section-label-num">I.</span>
        <span>{t('label')}</span>
      </div>
      <DashboardController />
    </section>
  );
}
