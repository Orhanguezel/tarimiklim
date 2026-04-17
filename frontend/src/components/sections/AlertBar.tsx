import { useTranslations } from 'next-intl';

export function AlertBar() {
  const t = useTranslations('premium.alertBar');

  const content = (
    <div className="alert-bar-inner">
      <div className="alert-group">
        <div className="alert-left">
          <span className="pulse-dot" aria-hidden="true" />
          <span>{t('message')}</span>
        </div>
        <div className="alert-right" aria-label={t('metricsLabel')}>
          <span>{t('uptime')}</span>
          <span>{t('version')}</span>
          <span>{t('locales')}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="alert-bar" role="complementary">
      <div className="alert-bar-track">
        {content}
        {content}
        {content}
        {content}
      </div>
    </div>
  );
}
