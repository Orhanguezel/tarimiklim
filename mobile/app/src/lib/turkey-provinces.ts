/**
 * 81 il özet listesi (mobile bundle için kısa). Tam liste web
 * public/data/turkey-provinces.json. Mobile için aynı veri
 * derlenir ve bundle boyutu küçük olur.
 */

export interface Province {
  plate: number;
  slug: string;
  name: string;
  lat: number;
  lon: number;
  region: string;
}

export const PROVINCES: Province[] = [
  { plate: 1,  slug: 'adana',          name: 'Adana',          lat: 37.0017, lon: 35.3289, region: 'Akdeniz' },
  { plate: 2,  slug: 'adiyaman',       name: 'Adıyaman',       lat: 37.7648, lon: 38.2786, region: 'Güneydoğu Anadolu' },
  { plate: 3,  slug: 'afyon',          name: 'Afyonkarahisar', lat: 38.7507, lon: 30.5567, region: 'Ege' },
  { plate: 4,  slug: 'agri',           name: 'Ağrı',           lat: 39.7191, lon: 43.0503, region: 'Doğu Anadolu' },
  { plate: 5,  slug: 'amasya',         name: 'Amasya',         lat: 40.6499, lon: 35.8353, region: 'Karadeniz' },
  { plate: 6,  slug: 'ankara',         name: 'Ankara',         lat: 39.9334, lon: 32.8597, region: 'İç Anadolu' },
  { plate: 7,  slug: 'antalya',        name: 'Antalya',        lat: 36.8841, lon: 30.7056, region: 'Akdeniz' },
  { plate: 8,  slug: 'artvin',         name: 'Artvin',         lat: 41.1828, lon: 41.8183, region: 'Karadeniz' },
  { plate: 9,  slug: 'aydin',          name: 'Aydın',          lat: 37.856,  lon: 27.8416, region: 'Ege' },
  { plate: 10, slug: 'balikesir',      name: 'Balıkesir',      lat: 39.6484, lon: 27.8826, region: 'Marmara' },
  { plate: 11, slug: 'bilecik',        name: 'Bilecik',        lat: 40.1426, lon: 29.9793, region: 'Marmara' },
  { plate: 12, slug: 'bingol',         name: 'Bingöl',         lat: 38.8847, lon: 40.4986, region: 'Doğu Anadolu' },
  { plate: 13, slug: 'bitlis',         name: 'Bitlis',         lat: 38.4006, lon: 42.1095, region: 'Doğu Anadolu' },
  { plate: 14, slug: 'bolu',           name: 'Bolu',           lat: 40.7357, lon: 31.6084, region: 'Karadeniz' },
  { plate: 15, slug: 'burdur',         name: 'Burdur',         lat: 37.7205, lon: 30.291,  region: 'Akdeniz' },
  { plate: 16, slug: 'bursa',          name: 'Bursa',          lat: 40.1824, lon: 29.067,  region: 'Marmara' },
  { plate: 17, slug: 'canakkale',      name: 'Çanakkale',      lat: 40.1553, lon: 26.4142, region: 'Marmara' },
  { plate: 18, slug: 'cankiri',        name: 'Çankırı',        lat: 40.6013, lon: 33.6134, region: 'İç Anadolu' },
  { plate: 19, slug: 'corum',          name: 'Çorum',          lat: 40.5506, lon: 34.9556, region: 'Karadeniz' },
  { plate: 20, slug: 'denizli',        name: 'Denizli',        lat: 37.7765, lon: 29.0864, region: 'Ege' },
  { plate: 21, slug: 'diyarbakir',     name: 'Diyarbakır',     lat: 37.9144, lon: 40.2306, region: 'Güneydoğu Anadolu' },
  { plate: 22, slug: 'edirne',         name: 'Edirne',         lat: 41.6818, lon: 26.5623, region: 'Marmara' },
  { plate: 23, slug: 'elazig',         name: 'Elazığ',         lat: 38.681,  lon: 39.2264, region: 'Doğu Anadolu' },
  { plate: 24, slug: 'erzincan',       name: 'Erzincan',       lat: 39.75,   lon: 39.5,    region: 'Doğu Anadolu' },
  { plate: 25, slug: 'erzurum',        name: 'Erzurum',        lat: 39.9,    lon: 41.27,   region: 'Doğu Anadolu' },
  { plate: 26, slug: 'eskisehir',      name: 'Eskişehir',      lat: 39.7767, lon: 30.5206, region: 'İç Anadolu' },
  { plate: 27, slug: 'gaziantep',      name: 'Gaziantep',      lat: 37.0662, lon: 37.3833, region: 'Güneydoğu Anadolu' },
  { plate: 28, slug: 'giresun',        name: 'Giresun',        lat: 40.9128, lon: 38.3895, region: 'Karadeniz' },
  { plate: 29, slug: 'gumushane',      name: 'Gümüşhane',      lat: 40.4386, lon: 39.5086, region: 'Karadeniz' },
  { plate: 30, slug: 'hakkari',        name: 'Hakkari',        lat: 37.5744, lon: 43.7408, region: 'Doğu Anadolu' },
  { plate: 31, slug: 'hatay',          name: 'Hatay',          lat: 36.4018, lon: 36.3498, region: 'Akdeniz' },
  { plate: 32, slug: 'isparta',        name: 'Isparta',        lat: 37.7648, lon: 30.5566, region: 'Akdeniz' },
  { plate: 33, slug: 'mersin',         name: 'Mersin',         lat: 36.8121, lon: 34.6415, region: 'Akdeniz' },
  { plate: 34, slug: 'istanbul',       name: 'İstanbul',       lat: 41.0082, lon: 28.9784, region: 'Marmara' },
  { plate: 35, slug: 'izmir',          name: 'İzmir',          lat: 38.4237, lon: 27.1428, region: 'Ege' },
  { plate: 36, slug: 'kars',           name: 'Kars',           lat: 40.6013, lon: 43.0975, region: 'Doğu Anadolu' },
  { plate: 37, slug: 'kastamonu',      name: 'Kastamonu',      lat: 41.3887, lon: 33.7827, region: 'Karadeniz' },
  { plate: 38, slug: 'kayseri',        name: 'Kayseri',        lat: 38.7312, lon: 35.4787, region: 'İç Anadolu' },
  { plate: 39, slug: 'kirklareli',     name: 'Kırklareli',     lat: 41.7333, lon: 27.2167, region: 'Marmara' },
  { plate: 40, slug: 'kirsehir',       name: 'Kırşehir',       lat: 39.1425, lon: 34.1709, region: 'İç Anadolu' },
  { plate: 41, slug: 'kocaeli',        name: 'Kocaeli',        lat: 40.8533, lon: 29.8815, region: 'Marmara' },
  { plate: 42, slug: 'konya',          name: 'Konya',          lat: 37.8746, lon: 32.4932, region: 'İç Anadolu' },
  { plate: 43, slug: 'kutahya',        name: 'Kütahya',        lat: 39.4167, lon: 29.9833, region: 'Ege' },
  { plate: 44, slug: 'malatya',        name: 'Malatya',        lat: 38.3554, lon: 38.3335, region: 'Doğu Anadolu' },
  { plate: 45, slug: 'manisa',         name: 'Manisa',         lat: 38.6191, lon: 27.4289, region: 'Ege' },
  { plate: 46, slug: 'kahramanmaras',  name: 'Kahramanmaraş',  lat: 37.5858, lon: 36.9371, region: 'Akdeniz' },
  { plate: 47, slug: 'mardin',         name: 'Mardin',         lat: 37.3212, lon: 40.7245, region: 'Güneydoğu Anadolu' },
  { plate: 48, slug: 'mugla',          name: 'Muğla',          lat: 37.2154, lon: 28.3636, region: 'Ege' },
  { plate: 49, slug: 'mus',            name: 'Muş',            lat: 38.7347, lon: 41.5064, region: 'Doğu Anadolu' },
  { plate: 50, slug: 'nevsehir',       name: 'Nevşehir',       lat: 38.6245, lon: 34.7117, region: 'İç Anadolu' },
  { plate: 51, slug: 'nigde',          name: 'Niğde',          lat: 37.9701, lon: 34.6927, region: 'İç Anadolu' },
  { plate: 52, slug: 'ordu',           name: 'Ordu',           lat: 40.9839, lon: 37.8764, region: 'Karadeniz' },
  { plate: 53, slug: 'rize',           name: 'Rize',           lat: 41.0201, lon: 40.5234, region: 'Karadeniz' },
  { plate: 54, slug: 'sakarya',        name: 'Sakarya',        lat: 40.7569, lon: 30.3783, region: 'Marmara' },
  { plate: 55, slug: 'samsun',         name: 'Samsun',         lat: 41.2867, lon: 36.33,   region: 'Karadeniz' },
  { plate: 56, slug: 'siirt',          name: 'Siirt',          lat: 37.9333, lon: 41.95,   region: 'Güneydoğu Anadolu' },
  { plate: 57, slug: 'sinop',          name: 'Sinop',          lat: 42.0231, lon: 35.1531, region: 'Karadeniz' },
  { plate: 58, slug: 'sivas',          name: 'Sivas',          lat: 39.7477, lon: 37.0179, region: 'İç Anadolu' },
  { plate: 59, slug: 'tekirdag',       name: 'Tekirdağ',       lat: 40.9833, lon: 27.5167, region: 'Marmara' },
  { plate: 60, slug: 'tokat',          name: 'Tokat',          lat: 40.3167, lon: 36.55,   region: 'Karadeniz' },
  { plate: 61, slug: 'trabzon',        name: 'Trabzon',        lat: 41.0015, lon: 39.7178, region: 'Karadeniz' },
  { plate: 62, slug: 'tunceli',        name: 'Tunceli',        lat: 39.3074, lon: 39.4388, region: 'Doğu Anadolu' },
  { plate: 63, slug: 'sanliurfa',      name: 'Şanlıurfa',      lat: 37.1671, lon: 38.7939, region: 'Güneydoğu Anadolu' },
  { plate: 64, slug: 'usak',           name: 'Uşak',           lat: 38.6823, lon: 29.4082, region: 'Ege' },
  { plate: 65, slug: 'van',            name: 'Van',            lat: 38.4942, lon: 43.38,   region: 'Doğu Anadolu' },
  { plate: 66, slug: 'yozgat',         name: 'Yozgat',         lat: 39.8181, lon: 34.8147, region: 'İç Anadolu' },
  { plate: 67, slug: 'zonguldak',      name: 'Zonguldak',      lat: 41.4564, lon: 31.7987, region: 'Karadeniz' },
  { plate: 68, slug: 'aksaray',        name: 'Aksaray',        lat: 38.3687, lon: 34.037,  region: 'İç Anadolu' },
  { plate: 69, slug: 'bayburt',        name: 'Bayburt',        lat: 40.2552, lon: 40.2249, region: 'Karadeniz' },
  { plate: 70, slug: 'karaman',        name: 'Karaman',        lat: 37.1811, lon: 33.215,  region: 'İç Anadolu' },
  { plate: 71, slug: 'kirikkale',      name: 'Kırıkkale',      lat: 39.8469, lon: 33.5153, region: 'İç Anadolu' },
  { plate: 72, slug: 'batman',         name: 'Batman',         lat: 37.8812, lon: 41.1351, region: 'Güneydoğu Anadolu' },
  { plate: 73, slug: 'sirnak',         name: 'Şırnak',         lat: 37.4187, lon: 42.4918, region: 'Güneydoğu Anadolu' },
  { plate: 74, slug: 'bartin',         name: 'Bartın',         lat: 41.6344, lon: 32.3375, region: 'Karadeniz' },
  { plate: 75, slug: 'ardahan',        name: 'Ardahan',        lat: 41.1105, lon: 42.7022, region: 'Doğu Anadolu' },
  { plate: 76, slug: 'igdir',          name: 'Iğdır',          lat: 39.9237, lon: 44.045,  region: 'Doğu Anadolu' },
  { plate: 77, slug: 'yalova',         name: 'Yalova',         lat: 40.65,   lon: 29.2667, region: 'Marmara' },
  { plate: 78, slug: 'karabuk',        name: 'Karabük',        lat: 41.2061, lon: 32.6204, region: 'Karadeniz' },
  { plate: 79, slug: 'kilis',          name: 'Kilis',          lat: 36.7184, lon: 37.1212, region: 'Güneydoğu Anadolu' },
  { plate: 80, slug: 'osmaniye',       name: 'Osmaniye',       lat: 37.213,  lon: 36.1763, region: 'Akdeniz' },
  { plate: 81, slug: 'duzce',          name: 'Düzce',          lat: 40.8438, lon: 31.1566, region: 'Karadeniz' },
];

export function matchProvinces(q: string): Province[] {
  const norm = q.toLocaleLowerCase('tr').trim();
  if (!norm) return [];
  return PROVINCES.filter(
    (p) => p.name.toLocaleLowerCase('tr').includes(norm) || p.slug.includes(norm),
  ).slice(0, 6);
}
