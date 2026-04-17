/**
 * Browser Geolocation API + localStorage persistence.
 * HTTPS ve localhost'ta çalışır.
 */

export interface SavedLocation {
  lat: number;
  lon: number;
  name: string;
  source: 'geolocation' | 'search' | 'province' | 'manual';
  accuracy?: number;
  savedAt: number;
}

export const LOW_ACCURACY_THRESHOLD_M = 10_000;

const KEY = 'tarimiklim.location.v1';

export function readSaved(): SavedLocation | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedLocation;
    if (
      typeof parsed?.lat === 'number' &&
      typeof parsed?.lon === 'number' &&
      typeof parsed?.name === 'string'
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveLocation(loc: Omit<SavedLocation, 'savedAt'>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...loc, savedAt: Date.now() }));
  } catch {
    /* quota/private mode — sessiz geç */
  }
}

export function clearSaved(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* sessiz geç */
  }
}

export type GeolocationStatus = 'idle' | 'pending' | 'granted' | 'denied' | 'unavailable';

export interface GeolocationResult {
  status: GeolocationStatus;
  lat?: number;
  lon?: number;
  accuracy?: number;
  errorMessage?: string;
}

export function requestBrowserLocation(timeoutMs = 15000): Promise<GeolocationResult> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      resolve({ status: 'unavailable' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          status: 'granted',
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      (err) => {
        const denied = err.code === err.PERMISSION_DENIED;
        resolve({
          status: denied ? 'denied' : 'unavailable',
          errorMessage: err.message,
        });
      },
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 0 },
    );
  });
}
