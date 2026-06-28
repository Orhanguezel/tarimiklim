import type { ForecastDay } from '@/types/weather';

interface Labels {
  date: string;
  min: string;
  max: string;
  rain: string;
  humidity: string;
  wind: string;
  frost: string;
}

function riskTier(score: number): string {
  if (score >= 70) return 'critical';
  if (score >= 40) return 'alert';
  if (score >= 15) return 'warn';
  return 'ok';
}

function fmtDate(iso: string, locale: string): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'tr-TR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    }).format(new Date(`${iso}T00:00:00`));
  } catch {
    return iso;
  }
}

export function CityForecastTable({
  forecasts,
  labels,
  locale,
}: {
  forecasts: ForecastDay[];
  labels: Labels;
  locale: string;
}) {
  return (
    <div className="city-table-wrap">
      <table className="city-forecast-table">
        <thead>
          <tr>
            <th scope="col">{labels.date}</th>
            <th scope="col">{labels.min}</th>
            <th scope="col">{labels.max}</th>
            <th scope="col">{labels.rain}</th>
            <th scope="col">{labels.humidity}</th>
            <th scope="col">{labels.wind}</th>
            <th scope="col">{labels.frost}</th>
          </tr>
        </thead>
        <tbody>
          {forecasts.map((d, i) => (
            <tr key={`${d.date}-${i}`}>
              <th scope="row">{fmtDate(d.date, locale)}</th>
              <td className="city-cell-min">{d.tempMin.toFixed(0)}°</td>
              <td className="city-cell-max">{d.tempMax.toFixed(0)}°</td>
              <td>{d.precipitation != null ? `${d.precipitation.toFixed(1)} mm` : '—'}</td>
              <td>{d.humidity != null ? `%${d.humidity}` : '—'}</td>
              <td>{d.windSpeed != null ? `${d.windSpeed.toFixed(0)} km/h` : '—'}</td>
              <td>
                <span className="city-frost-pill" data-tier={riskTier(d.frostRisk)}>
                  {d.frostRisk}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
