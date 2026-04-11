'use client';

import { useEffect, useState } from 'react';
import { fetchWidgetData } from '@/lib/api';

export type Brand = 'bereketfide' | 'vistaseed';

interface BrandTokens {
  bg: string;
  card: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  badge: string;
}

const BRAND: Record<Brand, BrandTokens> = {
  bereketfide: {
    bg: '#faf8f5',
    card: '#ffffff',
    border: '#e8e0d5',
    text: '#1a1207',
    textMuted: '#4a3f2f',
    primary: '#4a7c59',
    badge: '#b8a98a',
  },
  vistaseed: {
    bg: '#f6faf8',
    card: '#ffffff',
    border: '#d1e8dc',
    text: '#101e17',
    textMuted: '#374a40',
    primary: '#006838',
    badge: '#0a2b1e',
  },
};

function frostColor(score: number) {
  if (score >= 60) return '#dc2626';
  if (score >= 25) return '#ea580c';
  return '#16a34a';
}

function frostLabel(score: number) {
  if (score >= 60) return 'Yüksek don riski';
  if (score >= 25) return 'Orta don riski';
  return 'Don riski yok';
}

function conditionIcon(icon: string) {
  const base = 'https://openweathermap.org/img/wn/';
  return icon ? `${base}${icon}@2x.png` : null;
}

function shortDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' });
}

interface WidgetData {
  location: { name: string; city?: string };
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    condition: string;
    icon: string;
  };
  forecast: Array<{
    date: string;
    forecastDate?: string;
    tempMin: number;
    tempMax: number;
    frostRisk: number;
    condition: string;
  }>;
}

interface Props {
  location: string;
  brand: Brand;
  apiBase?: string;
}

export function WeatherWidget({ location, brand, apiBase }: Props) {
  const c = BRAND[brand];
  const [data, setData] = useState<WidgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (apiBase) {
      process.env.NEXT_PUBLIC_API_URL = apiBase;
    }
    fetchWidgetData(location)
      .then((d) => setData(d as WidgetData))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [location, apiBase]);

  const containerStyle: React.CSSProperties = {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    background: c.bg,
    borderRadius: 12,
    border: `1px solid ${c.border}`,
    padding: '1rem',
    minWidth: 200,
    maxWidth: 280,
    color: c.text,
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: c.textMuted }}>Yükleniyor…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={containerStyle}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#dc2626' }}>Hava verisi alınamadı.</p>
      </div>
    );
  }

  const maxFrost = Math.max(...data.forecast.map((f) => f.frostRisk ?? 0));

  return (
    <div style={containerStyle}>
      {/* Başlık */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: c.textMuted }}>
            Hava Durumu
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: c.text }}>
            {data.location.city ?? data.location.name}
          </div>
        </div>
        {data.current.icon && (
          <img
            src={conditionIcon(data.current.icon) ?? ''}
            alt={data.current.condition}
            width={48}
            height={48}
            style={{ margin: '-4px -4px 0 0' }}
          />
        )}
      </div>

      {/* Anlık sıcaklık */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
        <span style={{ fontSize: '2rem', fontWeight: 800, color: c.primary }}>
          {Math.round(data.current.temp)}°
        </span>
        <span style={{ fontSize: '0.8rem', color: c.textMuted }}>
          Hissedilen {Math.round(data.current.feelsLike)}°
        </span>
      </div>
      <div style={{ fontSize: '0.8rem', color: c.textMuted, marginBottom: '0.75rem', textTransform: 'capitalize' }}>
        {data.current.condition} · Nem %{data.current.humidity} · {data.current.windSpeed.toFixed(1)} m/s
      </div>

      {/* Don riski bandı */}
      {maxFrost > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: frostColor(maxFrost) + '18',
          border: `1px solid ${frostColor(maxFrost)}40`,
          borderRadius: 8,
          padding: '0.35rem 0.6rem',
          marginBottom: '0.75rem',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: frostColor(maxFrost),
        }}>
          <span>❄</span>
          <span>{frostLabel(maxFrost)} ({maxFrost}/100)</span>
        </div>
      )}

      {/* 3 günlük mini tahmin */}
      <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {data.forecast.slice(0, 3).map((f) => {
          const dk = f.date ?? f.forecastDate ?? '';
          return (
            <div key={dk} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
              <span style={{ color: c.textMuted, minWidth: 80 }}>{shortDate(dk)}</span>
              <span style={{ fontWeight: 600, color: c.text }}>
                {Math.round(f.tempMin)}° / {Math.round(f.tempMax)}°
              </span>
              {f.frostRisk > 20 && (
                <span style={{ fontSize: '0.7rem', color: frostColor(f.frostRisk), fontWeight: 700 }}>
                  ❄{f.frostRisk}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ marginTop: '0.65rem', paddingTop: '0.5rem', borderTop: `1px solid ${c.border}`, fontSize: '0.68rem', color: c.textMuted, textAlign: 'right' }}>
        tarimiklim.agro.com.tr
      </div>
    </div>
  );
}
