import { useCallback, useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import { requestGeolocation, reverseGeocode } from '@/lib/location';
import type { SavedLocation } from '@/types/weather';

const FALLBACK: Omit<SavedLocation, 'savedAt'> = {
  lat: 36.8841,
  lon: 30.7056,
  name: 'Antalya',
  subtitle: 'Akdeniz · Türkiye',
  source: 'province',
};

export function useLocation() {
  const [loc, setLoc] = useState<SavedLocation | null>(null);
  const [status, setStatus] = useState<'idle' | 'locating' | 'denied'>('idle');

  const detect = useCallback(async () => {
    setStatus('locating');
    const geo = await requestGeolocation();
    if (geo.status !== 'granted' || geo.lat == null || geo.lon == null) {
      setStatus('denied');
      return null;
    }
    const meta = await reverseGeocode(geo.lat, geo.lon);
    const next: Omit<SavedLocation, 'savedAt'> = {
      lat: geo.lat,
      lon: geo.lon,
      name: meta?.name ?? 'Mevcut konum',
      subtitle: meta?.subtitle,
      source: 'geolocation',
      accuracy: geo.accuracy,
    };
    await storage.setLocation(next);
    const saved = await storage.getLocation();
    setLoc(saved);
    setStatus('idle');
    return saved;
  }, []);

  const commit = useCallback(async (next: Omit<SavedLocation, 'savedAt'>) => {
    await storage.setLocation(next);
    const saved = await storage.getLocation();
    setLoc(saved);
  }, []);

  useEffect(() => {
    (async () => {
      const saved = await storage.getLocation();
      if (saved) {
        setLoc(saved);
        return;
      }
      const detected = await detect();
      if (!detected) {
        await storage.setLocation(FALLBACK);
        setLoc(await storage.getLocation());
      }
    })();
  }, [detect]);

  return { loc, status, detect, commit };
}
