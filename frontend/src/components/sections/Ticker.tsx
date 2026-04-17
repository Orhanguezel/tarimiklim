import { useTranslations } from 'next-intl';
import { TickerController } from './TickerController';

export function Ticker() {
  const t = useTranslations('premium.ticker');

  return (
    <div className="ticker" aria-label={t('label')}>
      <div className="container-wide">
        <TickerController />
      </div>
    </div>
  );
}
