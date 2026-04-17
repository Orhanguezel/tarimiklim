'use client';

import type { ForecastDay } from '@/types/weather';

interface Props {
  day: ForecastDay;
  labels: { tempMin: string; tempMax: string; frostRisk: string };
}

function riskTier(score: number): 'ok' | 'warn' | 'alert' | 'critical' {
  if (score >= 70) return 'critical';
  if (score >= 40) return 'alert';
  if (score >= 15) return 'warn';
  return 'ok';
}

export function ForecastCard({ day, labels }: Props) {
  const dayKey = day.date.length >= 10 ? day.date.slice(0, 10) : day.date;
  const tier = riskTier(day.frostRisk);
  return (
    <article className="forecast-card" data-tier={tier}>
      <div className="forecast-card-date">{dayKey}</div>
      <div className="forecast-card-temps">
        <span className="forecast-card-temps-min">{day.tempMin.toFixed(1)}°</span>
        {' / '}
        <span className="forecast-card-temps-max">{day.tempMax.toFixed(1)}°</span>
      </div>
      <div className="forecast-card-cond">{day.condition}</div>
      <div className="forecast-card-risk">
        {labels.frostRisk}: {day.frostRisk}
      </div>
    </article>
  );
}
