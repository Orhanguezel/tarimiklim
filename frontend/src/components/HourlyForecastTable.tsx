'use client';

import type { CSSProperties } from 'react';
import type { HourlySlot } from '@/lib/api';

const OWM_ICON = (icon: string) => `https://openweathermap.org/img/wn/${icon}@2x.png`;

type Labels = {
  title: string;
  hadise: string;
  sicaklik: string;
  ruzgar: string;
  yagis: string;
  ziraiDon: string;
  ilaclama: string;
  sicaklikStresi: string;
  saat: string;
  gun: string;
  uygun: string;
  uygunDegil: string;
  loading: string;
  footnote: string;
};

type Props = {
  slots: HourlySlot[];
  loading: boolean;
  labels: Labels;
};

export function HourlyForecastTable({ slots, loading, labels }: Props) {
  if (loading) {
    return (
      <section style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--color-text)' }}>{labels.title}</h3>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>{labels.loading}</p>
      </section>
    );
  }

  if (!slots.length) return null;

  const cell: CSSProperties = {
    border: '1px solid #e2e8f0',
    padding: '0.35rem 0.5rem',
    textAlign: 'center',
    fontSize: '0.8rem',
    verticalAlign: 'middle',
    minWidth: 72,
    background: '#fff',
  };
  const labelCell: React.CSSProperties = {
    ...cell,
    textAlign: 'left',
    fontWeight: 600,
    background: '#f8fafc',
    position: 'sticky',
    left: 0,
    zIndex: 1,
    minWidth: 120,
  };
  const windRowBg = { ...cell, background: '#fffbeb' };
  const footCell: React.CSSProperties = { ...cell, background: '#f1f5f9', fontSize: '0.75rem' };
  const footLabel: React.CSSProperties = { ...labelCell, background: '#e2e8f0' };

  return (
    <section style={{ marginTop: '1.5rem' }}>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--color-text)' }}>{labels.title}</h3>
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', border: '1px solid #e2e8f0', borderRadius: 8 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: slots.length * 76 + 130 }}>
          <tbody>
            <tr>
              <td style={labelCell}>{labels.hadise}</td>
              {slots.map((s, i) => (
                <td key={`row-hadise-cell-${i}-${s.dt || i}`} style={cell}>
                  {s.icon ? (
                    <img src={OWM_ICON(s.icon)} alt="" width={36} height={36} style={{ display: 'block', margin: '0 auto' }} />
                  ) : (
                    '—'
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td style={labelCell}>{labels.sicaklik}</td>
              {slots.map((s, i) => (
                <td key={`row-sicak-cell-${i}-${s.dt || i}`} style={cell}>
                  {s.temp}°
                </td>
              ))}
            </tr>
            <tr>
              <td style={{ ...labelCell, background: '#fef9c3' }}>{labels.ruzgar}</td>
              {slots.map((s, i) => (
                <td key={`row-ruzgar-cell-${i}-${s.dt || i}`} style={windRowBg}>
                  <span
                    title={`${s.windDir} ${s.windSpeedKmh} km/h`}
                    style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        transform: `rotate(${s.windDeg + 180}deg)`,
                        fontSize: '1rem',
                        lineHeight: 1,
                      }}
                    >
                      ↑
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{s.windDir}</span>
                  </span>
                </td>
              ))}
            </tr>
            <tr>
              <td style={labelCell}>{labels.yagis}</td>
              {slots.map((s, i) => (
                <td key={`row-yagis-cell-${i}-${s.dt || i}`} style={cell}>
                  {s.precipitationLabel}
                </td>
              ))}
            </tr>
            <tr>
              <td style={labelCell}>{labels.ziraiDon}</td>
              {slots.map((s, i) => (
                <td key={`row-don-cell-${i}-${s.dt || i}`} style={cell}>
                  {s.frostShort}
                </td>
              ))}
            </tr>
            <tr>
              <td style={labelCell}>{labels.ilaclama}</td>
              {slots.map((s, i) => (
                <td key={`row-ilac-cell-${i}-${s.dt || i}`} style={cell}>
                  <span
                    title={s.sprayOk ? labels.uygun : labels.uygunDegil}
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: s.sprayOk ? '#16a34a' : '#dc2626',
                    }}
                    aria-label={s.sprayOk ? labels.uygun : labels.uygunDegil}
                  >
                    {s.sprayOk ? '✓' : '✗'}
                  </span>
                </td>
              ))}
            </tr>
            <tr>
              <td style={labelCell}>{labels.sicaklikStresi}</td>
              {slots.map((s, i) => (
                <td key={`row-stres-cell-${i}-${s.dt || i}`} style={cell}>
                  {s.tempStressLabel}
                </td>
              ))}
            </tr>
            <tr>
              <td style={footLabel}>{labels.saat}</td>
              {slots.map((s, i) => (
                <td key={`row-saat-cell-${i}-${s.dt || i}`} style={footCell}>
                  {s.timeRangeLabel}
                </td>
              ))}
            </tr>
            <tr>
              <td style={footLabel}>{labels.gun}</td>
              {slots.map((s, i) => (
                <td key={`row-gun-cell-${i}-${s.dt || i}`} style={footCell}>
                  {s.weekdayShort}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>{labels.footnote}</p>
    </section>
  );
}
