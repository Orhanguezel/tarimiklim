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
    const dayForecast = forecasts.slice(0, 7).map((f) => ({
      '@type': 'ForecastWeatherDay',
      validDate: String(f.date ?? '').slice(0, 10),
      lowTemperature: { '@type': 'QuantitativeValue', value: f.tempMin },
      highTemperature: { '@type': 'QuantitativeValue', value: f.tempMax },
    }));

    return {
      '@context': 'https://schema.org',
      '@type': 'WeatherForecast',
      name,
      validFrom: new Date().toISOString().slice(0, 10),
      dayForecast,
    };
  } catch {
    return null;
  }
}
