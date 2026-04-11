'use client';

export type ForecastDay = {
  date: string;
  tempMin: number;
  tempMax: number;
  frostRisk: number;
  condition: string;
};

type Props = {
  day: ForecastDay;
  labels: { tempMin: string; tempMax: string; frostRisk: string };
};

export function ForecastCard({ day, labels }: Props) {
  const dayKey = day.date.length >= 10 ? day.date.slice(0, 10) : day.date;
  return (
    <article
      style={{
        padding: '0.75rem',
        borderRadius: 10,
        background: 'var(--color-surface, #f4f4f5)',
        border: '1px solid var(--color-border, #e4e4e7)',
      }}
    >
      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{dayKey}</div>
      <div style={{ fontWeight: 600, marginTop: 4 }}>
        {labels.tempMin}: {day.tempMin.toFixed(1)}° · {labels.tempMax}: {day.tempMax.toFixed(1)}°
      </div>
      <div style={{ fontSize: '0.85rem', marginTop: 4 }}>{day.condition}</div>
      <div style={{ fontSize: '0.8rem', marginTop: 6, color: '#b45309' }}>
        {labels.frostRisk}: {day.frostRisk}
      </div>
    </article>
  );
}
