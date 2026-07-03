import type { CityVariant } from '@/lib/city-pages';
import type { Province } from '@/lib/provinces';
import { getRegionName } from '@/lib/provinces';
import type { SsrForecast } from '@/lib/weather-ssr';

function frostLevelTr(score: number): string {
  if (score >= 81) return 'kritik';
  if (score >= 51) return 'yüksek';
  if (score >= 21) return 'orta';
  return 'düşük';
}

function frostLevelEn(score: number): string {
  if (score >= 81) return 'critical';
  if (score >= 51) return 'high';
  if (score >= 21) return 'moderate';
  return 'low';
}

const AGRICULTURAL_CONTEXT: Record<string, { tr: string; en: string }> = {
  konya: {
    tr: 'Konya Ovası hububat, şeker pancarı ve yem bitkileriyle öne çıkar; açık ve sakin ilkbahar gecelerinde radyasyon donu genç sürgünler için kritik olabilir.',
    en: 'The Konya Plain is known for cereals, sugar beet and forage crops; clear and calm spring nights can create radiation frost risk for young shoots.',
  },
  sanliurfa: {
    tr: 'Şanlıurfa pamuk, buğday, mısır ve fıstık üretimiyle güçlüdür; geç kış ve erken ilkbaharda ova tabanlarında sıcaklık düşüşleri yakından izlenmelidir.',
    en: 'Şanlıurfa is strong in cotton, wheat, maize and pistachio production; lowland temperature drops in late winter and early spring should be monitored closely.',
  },
  adana: {
    tr: 'Adana turunçgil, pamuk, mısır ve sebze üretiminde önemli bir merkezdir; Çukurova’da ani soğuk girişleri narenciye bahçeleri için risk oluşturabilir.',
    en: 'Adana is an important centre for citrus, cotton, maize and vegetables; sudden cold air intrusions in Çukurova can threaten citrus orchards.',
  },
  antalya: {
    tr: 'Antalya sera sebzeciliği, narenciye ve örtü altı üretimiyle öne çıkar; kıyı mikroklimaları ve iç kesimlerdeki gece soğuması birlikte değerlendirilmelidir.',
    en: 'Antalya stands out for greenhouse vegetables, citrus and protected cultivation; coastal microclimates and inland night cooling should be evaluated together.',
  },
  mersin: {
    tr: 'Mersin narenciye, muz, sebze ve açık tarla üretiminde yoğundur; kıyı ile iç vadiler arasındaki sıcaklık farkı don riskini yerel hale getirir.',
    en: 'Mersin has intensive citrus, banana, vegetable and field production; temperature differences between the coast and inland valleys make frost risk highly local.',
  },
  izmir: {
    tr: 'İzmir zeytin, üzüm, sebze ve süs bitkileri üretiminde çeşitlidir; Gediz ve Küçük Menderes havzalarında gece minimumları özellikle takip edilmelidir.',
    en: 'İzmir has diverse olive, grape, vegetable and ornamental production; overnight minimums in the Gediz and Küçük Menderes basins deserve close attention.',
  },
  manisa: {
    tr: 'Manisa bağcılık, zeytin ve meyvecilikte güçlüdür; bağlarda tomurcuklanma dönemindeki ilkbahar donları verim üzerinde belirleyici olabilir.',
    en: 'Manisa is strong in viticulture, olives and fruit; spring frosts during budburst can be decisive for vineyard yield.',
  },
  bursa: {
    tr: 'Bursa meyvecilik, sebze ve fide üretimiyle öne çıkar; ova tabanlarında soğuk hava birikimi erken çiçeklenen meyveler için risk yaratabilir.',
    en: 'Bursa is notable for fruit, vegetables and seedling production; cold-air pooling in plains can threaten early-blooming fruit crops.',
  },
  balikesir: {
    tr: 'Balıkesir zeytin, yem bitkileri, sebze ve hayvancılıkla bağlantılı üretimde yaygındır; kıyı ve iç ilçe farkları tahmin yorumunda önemlidir.',
    en: 'Balıkesir has widespread olive, forage, vegetable and livestock-linked production; coastal and inland district differences matter when reading forecasts.',
  },
  aydin: {
    tr: 'Aydın incir, zeytin ve pamuk üretimiyle bilinir; Büyük Menderes havzasındaki nem ve gece sıcaklığı don değerlendirmesinde birlikte izlenmelidir.',
    en: 'Aydın is known for figs, olives and cotton; humidity and night temperature in the Büyük Menderes basin should be read together for frost assessment.',
  },
  denizli: {
    tr: 'Denizli bağcılık, meyvecilik ve tarla bitkilerinde çeşitlidir; iç Ege geçiş iklimi ani gece soğumalarını mümkün kılar.',
    en: 'Denizli has diverse vineyards, fruit and field crops; the inland Aegean transition climate can bring sudden overnight cooling.',
  },
  gaziantep: {
    tr: 'Gaziantep fıstık, zeytin ve bağ alanlarıyla öne çıkar; ilkbahar geç donları özellikle fıstık bahçelerinde hassas döneme denk gelebilir.',
    en: 'Gaziantep stands out for pistachio, olive and vineyards; late spring frosts can coincide with sensitive periods in pistachio orchards.',
  },
  diyarbakir: {
    tr: 'Diyarbakır buğday, pamuk, mercimek ve bağ üretiminde önemlidir; geniş ova alanlarında rüzgar ve gece minimumu birlikte okunmalıdır.',
    en: 'Diyarbakır is important for wheat, cotton, lentils and vineyards; wind and overnight minimums should be read together across broad plains.',
  },
  samsun: {
    tr: 'Samsun fındık, sebze, çeltik ve yem bitkileriyle Karadeniz geçişinde yer alır; kıyı nemi ve iç kesim soğuması farklı risk profilleri oluşturur.',
    en: 'Samsun sits in the Black Sea transition with hazelnut, vegetable, rice and forage crops; coastal humidity and inland cooling create different risk profiles.',
  },
  tekirdag: {
    tr: 'Tekirdağ ayçiçeği, buğday, bağcılık ve kanola üretimiyle bilinir; Trakya’da rüzgar hızı ve açık gece koşulları don riskini belirgin değiştirir.',
    en: 'Tekirdağ is known for sunflower, wheat, vineyards and canola; wind speed and clear-night conditions in Thrace can strongly shift frost risk.',
  },
};

/**
 * Her il + sayfa türü için özgün (~300 kelime) içerik üretir.
 * İçerik dinamik verilerle (il, bölge, sıcaklık, don skoru) zenginleştirilir;
 * böylece thin/duplicate content riski olmaz.
 */
export function cityProse(
  variant: CityVariant,
  locale: string,
  province: Province,
  data: SsrForecast | null,
): string[] {
  const region = getRegionName(province.region);
  const isTr = locale !== 'en';
  const minT = data ? Math.round(data.minTemp) : null;
  const maxT = data ? Math.round(data.maxTemp) : null;
  const frost = data?.maxFrostRisk ?? 0;

  const context = AGRICULTURAL_CONTEXT[province.slug];
  if (isTr) return proseTr(variant, province.name, region, minT, maxT, frost, context?.tr);
  return proseEn(variant, province.name, region, minT, maxT, frost, context?.en);
}

function tempLineTr(min: number | null, max: number | null): string {
  if (min == null || max == null) return 'Sıcaklık verileri canlı tahmin tablosunda gösterilmektedir.';
  return `Önümüzdeki 7 gün boyunca beklenen sıcaklıklar ${min}°C ile ${max}°C arasında değişiyor.`;
}

function proseTr(
  variant: CityVariant,
  city: string,
  region: string,
  min: number | null,
  max: number | null,
  frost: number,
  context?: string,
): string[] {
  const lvl = frostLevelTr(frost);
  const tempLine = tempLineTr(min, max);

  const common = [
    `${city}, ${region} Bölgesi'nde yer alır ve tarımsal üretimde iklim koşulları büyük önem taşır. ${tempLine} Aşağıdaki tablo, OpenWeatherMap verileriyle her gün otomatik güncellenir.`,
    ...(context ? [context] : []),
  ];

  if (variant === 'don-uyarisi') {
    return [
      `${city} için güncel zirai don riski **${frost}/100** seviyesinde ve ${lvl} olarak değerlendiriliyor. Don, özellikle ilkbahar ve sonbahar geçişlerinde meyve bahçeleri, bağlar ve hassas sebze fideleri için en büyük tehditlerden biridir.`,
      `Zirai don riski yalnızca gece minimum sıcaklığına değil; nem oranı, rüzgâr hızı ve bulutluluğa da bağlıdır. Açık ve durgun gecelerde radyasyon donu riski artar. ${city} özelinde bu faktörler birlikte değerlendirilerek 0-100 arası bir risk skoru üretilir.`,
      ...(context ? [context] : []),
      `${tempLine} Don riskinin yüksek olduğu gecelerde seralarda ısıtmayı kontrol etmeniz, açık alandaki hassas bitkileri örtmeniz ve sulama hatlarını boşaltmanız önerilir. Saatlik don tahmini ve ilaçlama uygunluğu için aşağıdaki interaktif panele göz atın.`,
      `${city} ve ${region} Bölgesi çiftçileri, kritik don gecelerinden önce Telegram ve push bildirimleriyle ücretsiz uyarı alabilir. Böylece ürün kaybını en aza indirerek zamanında önlem alabilirsiniz.`,
    ];
  }

  if (variant === '7-gunluk-tahmin') {
    return [
      ...common,
      `7 günlük tahmin; günlük en düşük ve en yüksek sıcaklık, yağış miktarı, nem ve rüzgâr bilgisini bir arada sunar. ${city} için planlama yaparken ekim, hasat, ilaçlama ve sulama zamanlamasını bu verilere göre belirleyebilirsiniz.`,
      `Tabloda her güne ait zirai don riski skoru da yer alır. Şu an ${city} için 7 günlük dönemdeki en yüksek don riski ${frost}/100 (${lvl}) olarak görünüyor. Yağış beklenen günlerde ilaçlama planınızı öne çekmek, kuru günleri sulama için değerlendirmek verim açısından önemlidir.`,
      `Daha detaylı saatlik tahmin, 3 saatlik dilimlerde sıcaklık, yağış ve don bilgisi için sayfanın altındaki interaktif paneli kullanabilirsiniz.`,
    ];
  }

  // hava-durumu (genel)
  return [
    ...common,
    `${city} hava durumu sayfası; anlık koşulların yanı sıra 7 günlük tahmini ve zirai don riskini bir arada gösterir. Tarımsal faaliyetlerde doğru zamanlama, verim ve maliyet üzerinde doğrudan etkilidir.`,
    `Şu an ${city} için 7 günlük dönemdeki en yüksek don riski ${frost}/100 (${lvl}) seviyesinde. Don, dolu, aşırı yağış veya sıcak hava dalgaları gibi olaylar tarımsal üretimi tehdit edebilir; bu nedenle bölgesel tahminleri düzenli takip etmek önemlidir.`,
    `${region} Bölgesi'nin iklim özellikleri ${city} tarımını şekillendirir. Saatlik tahmin, ilaçlama uygunluğu ve don bildirimleri için sayfadaki interaktif paneli kullanabilir; ücretsiz hesap oluşturarak ${city} için kişisel don ve yağış uyarıları alabilirsiniz.`,
  ];
}

function tempLineEn(min: number | null, max: number | null): string {
  if (min == null || max == null) return 'Temperature data is shown in the live forecast table below.';
  return `Expected temperatures over the next 7 days range between ${min}°C and ${max}°C.`;
}

function proseEn(
  variant: CityVariant,
  city: string,
  region: string,
  min: number | null,
  max: number | null,
  frost: number,
  context?: string,
): string[] {
  const lvl = frostLevelEn(frost);
  const tempLine = tempLineEn(min, max);

  const common = [
    `${city} is located in the ${region} region of Türkiye, where climate conditions strongly affect agricultural production. ${tempLine} The table below updates automatically every day using OpenWeatherMap data.`,
    ...(context ? [context] : []),
  ];

  if (variant === 'don-uyarisi') {
    return [
      `The current agricultural frost risk for ${city} is **${frost}/100**, rated as ${lvl}. Frost is one of the biggest threats to orchards, vineyards and sensitive vegetable seedlings, especially during spring and autumn transitions.`,
      `Frost risk depends not only on the overnight minimum temperature but also on humidity, wind speed and cloud cover. On clear, calm nights the risk of radiation frost increases. For ${city}, these factors are combined into a single 0-100 risk score.`,
      ...(context ? [context] : []),
      `${tempLine} On high-risk nights, check greenhouse heating, cover sensitive outdoor plants and drain irrigation lines. Use the interactive panel below for hourly frost forecasts and spraying suitability.`,
      `Farmers in ${city} and the ${region} region can receive free Telegram and push alerts before critical frost nights, helping minimise crop loss with timely action.`,
    ];
  }

  if (variant === '7-gunluk-tahmin') {
    return [
      ...common,
      `The 7-day forecast brings together daily minimum and maximum temperatures, precipitation, humidity and wind. When planning for ${city}, you can schedule planting, harvest, spraying and irrigation around this data.`,
      `Each day also shows an agricultural frost risk score. The highest frost risk for ${city} over the next 7 days is currently ${frost}/100 (${lvl}). Bringing spraying forward before rainy days and using dry days for irrigation improves yield.`,
      `For more detailed hourly forecasts — temperature, rain and frost in 3-hour slots — use the interactive panel at the bottom of the page.`,
    ];
  }

  return [
    ...common,
    `This ${city} weather page shows current conditions together with the 7-day forecast and agricultural frost risk. In farming, correct timing directly affects yield and cost.`,
    `The highest frost risk for ${city} over the next 7 days is currently ${frost}/100 (${lvl}). Events such as frost, hail, heavy rain or heat waves can threaten production, so monitoring regional forecasts regularly is essential.`,
    `The climate of the ${region} region shapes agriculture in ${city}. Use the interactive panel for hourly forecasts, spraying suitability and frost alerts; create a free account to receive personalised frost and rain alerts for ${city}.`,
  ];
}
