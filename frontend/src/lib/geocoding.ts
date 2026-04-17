/**
 * Nominatim (OpenStreetMap) wrapper — free, rate-limited 1 req/s.
 * Kendi backend proxy'si olmadığı için doğrudan kullanıyoruz.
 * User-Agent başlığı Nominatim Usage Policy için zorunlu.
 */

const NOMINATIM = 'https://nominatim.openstreetmap.org';
const UA = 'tarimiklim.com/1.0 (destek@tarimiklim.com)';

export interface GeocodeResult {
  name: string;
  displayName: string;
  lat: number;
  lon: number;
  type?: string;
  country?: string;
  state?: string;
  city?: string;
  town?: string;
  village?: string;
  district?: string;
}

interface NominatimItem {
  place_id: number;
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
  type?: string;
  address?: {
    country?: string;
    country_code?: string;
    state?: string;
    province?: string;
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    municipality?: string;
    county?: string;
    road?: string;
  };
}

function normalize(item: NominatimItem): GeocodeResult {
  const addr = item.address ?? {};
  const primary =
    item.name ||
    addr.city ||
    addr.town ||
    addr.village ||
    addr.suburb ||
    addr.county ||
    addr.state ||
    item.display_name.split(',')[0];

  return {
    name: primary.trim(),
    displayName: item.display_name,
    lat: Number(item.lat),
    lon: Number(item.lon),
    type: item.type,
    country: addr.country,
    state: addr.state || addr.province,
    city: addr.city || addr.town,
    town: addr.town,
    village: addr.village,
    district: addr.suburb || addr.county || addr.municipality,
  };
}

interface SearchOptions {
  /** ISO-3166-1 alpha-2 country codes, comma-separated. Boş bırakılırsa tüm dünya. */
  countryCodes?: string;
  limit?: number;
  language?: string;
}

export async function searchPlaces(
  query: string,
  signal?: AbortSignal,
  options: SearchOptions = {},
): Promise<GeocodeResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const url = new URL(`${NOMINATIM}/search`);
  url.searchParams.set('q', q);
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('limit', String(options.limit ?? 6));
  url.searchParams.set('accept-language', options.language ?? 'tr');
  if (options.countryCodes) {
    url.searchParams.set('countrycodes', options.countryCodes);
  }

  const res = await fetch(url.toString(), {
    signal,
    headers: { 'User-Agent': UA, 'Accept': 'application/json' },
  });
  if (!res.ok) return [];
  const raw = (await res.json()) as NominatimItem[];
  return raw.map(normalize);
}

export async function reverseGeocode(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<GeocodeResult | null> {
  const url = new URL(`${NOMINATIM}/reverse`);
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('accept-language', 'tr');
  url.searchParams.set('zoom', '12');

  try {
    const res = await fetch(url.toString(), {
      signal,
      headers: { 'User-Agent': UA, 'Accept': 'application/json' },
    });
    if (!res.ok) return null;
    const raw = (await res.json()) as NominatimItem;
    return normalize(raw);
  } catch {
    return null;
  }
}
