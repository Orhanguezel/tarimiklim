'use client';

import type { HourlySlot } from '@/types/weather';

const OWM_ICON = (icon: string) => `https://openweathermap.org/img/wn/${icon}@2x.png`;

interface Labels {
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
}

interface Props {
  slots: HourlySlot[];
  loading: boolean;
  labels: Labels;
}

function frostTier(score: number): 'low' | 'medium' | 'high' {
  if (score >= 70) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

export function HourlyForecastTable({ slots, loading, labels }: Props) {
  if (loading) {
    return (
      <section className="hourly-block">
        <div className="hourly-head">
          <h3 className="hourly-title">{labels.title}</h3>
        </div>
        <p className="hourly-footnote">{labels.loading}</p>
      </section>
    );
  }
  if (!slots.length) return null;

  return (
    <section className="hourly-block">
      <div className="hourly-head">
        <h3 className="hourly-title">{labels.title}</h3>
        <span className="hourly-footnote">{labels.footnote}</span>
      </div>
      <div className="hourly-scroll">
        <table className="hourly-table">
          <tbody>
            <tr data-kind="cond">
              <td className="hourly-row-label">{labels.hadise}</td>
              {slots.map((s, i) => (
                <td key={`h-cond-${i}-${s.dt || i}`}>
                  {s.icon ? <img src={OWM_ICON(s.icon)} alt="" width={36} height={36} /> : '—'}
                </td>
              ))}
            </tr>
            <tr data-kind="temp">
              <td className="hourly-row-label">{labels.sicaklik}</td>
              {slots.map((s, i) => (
                <td key={`h-temp-${i}-${s.dt || i}`}>{s.temp}°</td>
              ))}
            </tr>
            <tr data-kind="wind">
              <td className="hourly-row-label">{labels.ruzgar}</td>
              {slots.map((s, i) => (
                <td key={`h-wind-${i}-${s.dt || i}`} title={`${s.windDir} ${s.windSpeedKmh} km/h`}>
                  <span style={{ display: 'inline-block', transform: `rotate(${s.windDeg + 180}deg)` }}>↑</span>{' '}
                  <small>{s.windDir}</small>
                </td>
              ))}
            </tr>
            <tr data-kind="rain">
              <td className="hourly-row-label">{labels.yagis}</td>
              {slots.map((s, i) => (
                <td key={`h-rain-${i}-${s.dt || i}`}>{s.precipitationLabel}</td>
              ))}
            </tr>
            <tr data-kind="frost">
              <td className="hourly-row-label">{labels.ziraiDon}</td>
              {slots.map((s, i) => (
                <td key={`h-frost-${i}-${s.dt || i}`} data-frost={frostTier(s.frostScore)}>
                  {s.frostShort}
                </td>
              ))}
            </tr>
            <tr data-kind="spray">
              <td className="hourly-row-label">{labels.ilaclama}</td>
              {slots.map((s, i) => (
                <td
                  key={`h-spray-${i}-${s.dt || i}`}
                  title={s.sprayOk ? labels.uygun : labels.uygunDegil}
                  aria-label={s.sprayOk ? labels.uygun : labels.uygunDegil}
                  style={{ color: s.sprayOk ? 'var(--moss)' : 'var(--danger)', fontWeight: 700 }}
                >
                  {s.sprayOk ? '✓' : '✗'}
                </td>
              ))}
            </tr>
            <tr data-kind="stress">
              <td className="hourly-row-label">{labels.sicaklikStresi}</td>
              {slots.map((s, i) => (
                <td key={`h-stress-${i}-${s.dt || i}`}>{s.tempStressLabel}</td>
              ))}
            </tr>
            <tr data-kind="foot">
              <td className="hourly-row-label">{labels.saat}</td>
              {slots.map((s, i) => (
                <td key={`h-hour-${i}-${s.dt || i}`}>{s.timeRangeLabel}</td>
              ))}
            </tr>
            <tr data-kind="foot">
              <td className="hourly-row-label">{labels.gun}</td>
              {slots.map((s, i) => (
                <td key={`h-day-${i}-${s.dt || i}`}>{s.weekdayShort}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
