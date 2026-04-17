import * as Location from 'expo-location';
import type { SavedLocation } from '@/types/weather';

const NOMINATIM = 'https://nominatim.openstreetmap.org';
const UA = 'tarimiklim-mobile/0.1 (destek@tarimiklim.com)';

export interface GeoResult {
  status: 'granted' | 'denied' | 'unavailable' | 'pending';
  lat?: number;
  lon?: number;
  accuracy?: number;
}

export async function requestGeolocation(): Promise<GeoResult> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return { status: 'denied' };
  try {
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      status: 'granted',
      lat: pos.coords.latitude,
      lon: pos.coords.longitude,
      accuracy: pos.coords.accuracy ?? undefined,
    };
  } catch {
    return { status: 'unavailable' };
  }
}

export interface ReverseResult {
  name: string;
  subtitle?: string;
  city?: string;
  state?: string;
  country?: string;
}

export async function reverseGeocode(lat: number, lon: number): Promise<ReverseResult | null> {
  const url = new URL(`${NOMINATIM}/reverse`);
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('accept-language', 'tr');
  url.searchParams.set('zoom', '12');
  try {
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': UA, Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const raw = (await res.json()) as {
      display_name: string;
      name?: string;
      address?: {
        city?: string;
        town?: string;
        village?: string;
        suburb?: string;
        state?: string;
        country?: string;
      };
    };
    const addr = raw.address ?? {};
    const name =
      raw.name || addr.city || addr.town || addr.village || addr.suburb || raw.display_name.split(',')[0];
    const parts = [addr.suburb, addr.city || addr.town || addr.village, addr.state, addr.country].filter(Boolean);
    return {
      name: name.trim(),
      subtitle: parts.length ? parts.join(' · ') : undefined,
      city: addr.city || addr.town,
      state: addr.state,
      country: addr.country,
    };
  } catch {
    return null;
  }
}

export interface SearchPlace {
  name: string;
  displayName: string;
  lat: number;
  lon: number;
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<SearchPlace[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const url = new URL(`${NOMINATIM}/search`);
  url.searchParams.set('q', q);
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('limit', '6');
  url.searchParams.set('accept-language', 'tr');
  try {
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': UA, Accept: 'application/json' },
      signal,
    });
    if (!res.ok) return [];
    const raw = (await res.json()) as Array<{
      display_name: string;
      name?: string;
      lat: string;
      lon: string;
      address?: { city?: string; town?: string; village?: string };
    }>;
    return raw.map((r) => ({
      name:
        r.name ||
        r.address?.city ||
        r.address?.town ||
        r.address?.village ||
        r.display_name.split(',')[0],
      displayName: r.display_name,
      lat: Number(r.lat),
      lon: Number(r.lon),
    }));
  } catch {
    return [];
  }
}

export function toSavedLocation(
  lat: number,
  lon: number,
  name: string,
  source: SavedLocation['source'],
  subtitle?: string,
  accuracy?: number,
): Omit<SavedLocation, 'savedAt'> {
  return { lat, lon, name, source, subtitle, accuracy };
}
