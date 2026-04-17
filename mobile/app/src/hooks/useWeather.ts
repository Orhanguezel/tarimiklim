import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { CurrentWeather, ForecastDay, FrostRiskResponse } from '@/types/weather';

interface WeatherState {
  current: CurrentWeather | null;
  forecast: ForecastDay[];
  frost: FrostRiskResponse | null;
  loading: boolean;
  error: string | null;
}

export function useWeather(lat: number | null, lon: number | null): WeatherState {
  const [state, setState] = useState<WeatherState>({
    current: null,
    forecast: [],
    frost: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (lat == null || lon == null) return;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    (async () => {
      const [curRes, fcRes, frRes] = await Promise.allSettled([
        api.currentWeather(lat, lon),
        api.weather(lat, lon, 7),
        api.frostRiskByCoords(lat, lon),
      ]);
      if (cancelled) return;
      setState({
        current: curRes.status === 'fulfilled' ? curRes.value : null,
        forecast: fcRes.status === 'fulfilled' ? fcRes.value.forecasts : [],
        frost: frRes.status === 'fulfilled' ? frRes.value : null,
        loading: false,
        error:
          curRes.status === 'rejected' && fcRes.status === 'rejected'
            ? 'fetch-failed'
            : null,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [lat, lon]);

  return state;
}
