import provincesData from '../../public/data/turkey-provinces.json';

export interface Province {
  plate: number;
  slug: string;
  name: string;
  lat: number;
  lon: number;
  region: string;
}

const DATA = provincesData as {
  regions: Record<string, string>;
  provinces: Province[];
};

export const PROVINCES: Province[] = DATA.provinces;
export const REGIONS: Record<string, string> = DATA.regions;

const BY_SLUG = new Map(PROVINCES.map((p) => [p.slug, p]));

export function getProvince(slug: string): Province | null {
  return BY_SLUG.get(slug) ?? null;
}

export function getRegionName(region: string): string {
  return REGIONS[region] ?? region;
}

/** Aynı bölgedeki komşu illeri döndürür (iç linkleme için). */
export function getRegionPeers(province: Province, limit = 8): Province[] {
  return PROVINCES.filter((p) => p.region === province.region && p.slug !== province.slug).slice(0, limit);
}

/** İlleri bölgeye göre gruplar (hub sayfaları için). */
export function getProvincesByRegion(): Array<{ region: string; name: string; provinces: Province[] }> {
  return Object.keys(REGIONS).map((region) => ({
    region,
    name: REGIONS[region],
    provinces: PROVINCES.filter((p) => p.region === region).sort((a, b) => a.name.localeCompare(b.name, 'tr')),
  }));
}

/** En kalabalık / öncelikli iller — index isteme ve iç linkleme önceliği. */
export const PRIORITY_PROVINCE_SLUGS = [
  'istanbul', 'ankara', 'izmir', 'antalya', 'bursa', 'adana', 'konya', 'gaziantep',
  'sanliurfa', 'mersin', 'kayseri', 'samsun', 'denizli', 'manisa', 'aydin', 'mugla',
  'hatay', 'tekirdag', 'balikesir', 'trabzon',
];
