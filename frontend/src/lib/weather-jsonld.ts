const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8088/api/v1';

export async function buildWeatherForecastJsonLd(): Promise<Record<string, unknown> | null> {
  try {
    const locRes = await fetch(`${API_BASE}/locations?active=true&limit=1`, {
      next: { revalidate: 600 },
    });
    if (!locRes.ok) return null;
    const locJson = (await locRes.json()) as { data?: { items?: { latitude: number; longitude: number; name?: string; city?: string }[] } };
    const first = locJson?.data?.items?.[0];
    if (!first) return null;
    const { latitude: lat, longitude: lon } = first;
    const wRes = await fetch(`${API_BASE}/weather?lat=${lat}&lon=${lon}&days=7`, {
      next: { revalidate: 600 },
    });
    if (!wRes.ok) return null;
    const wJson = (await wRes.json()) as {
      data?: { forecasts?: { date?: string; tempMin?: number; tempMax?: number }[] };
    };
    const forecasts = wJson?.data?.forecasts ?? [];
    const name = first.name ?? first.city ?? 'Forecast';
    const firstDate = String(forecasts[0]?.date ?? '').slice(0, 10);
    const lastDate = String(forecasts.at(-1)?.date ?? '').slice(0, 10);

    return {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: `${name} 7 günlük tarımsal hava tahmini`,
      description: `${name} için 7 günlük sıcaklık tahmini ve tarımsal hava verisi.`,
      temporalCoverage: firstDate && lastDate ? `${firstDate}/${lastDate}` : undefined,
      measurementTechnique: 'OpenWeatherMap forecast data with agricultural weather normalization',
      variableMeasured: [
        { '@type': 'PropertyValue', name: 'Minimum temperature', unitCode: 'CEL' },
        { '@type': 'PropertyValue', name: 'Maximum temperature', unitCode: 'CEL' },
      ],
      spatialCoverage: {
        '@type': 'Place',
        name,
        geo: {
          '@type': 'GeoCoordinates',
          latitude: lat,
          longitude: lon,
        },
      },
    };
  } catch {
    return null;
  }
}
