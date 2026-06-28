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

  if (isTr) return proseTr(variant, province.name, region, minT, maxT, frost);
  return proseEn(variant, province.name, region, minT, maxT, frost);
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
): string[] {
  const lvl = frostLevelTr(frost);
  const tempLine = tempLineTr(min, max);

  const common = [
    `${city}, ${region} Bölgesi'nde yer alır ve tarımsal üretimde iklim koşulları büyük önem taşır. ${tempLine} Aşağıdaki tablo, OpenWeatherMap verileriyle her gün otomatik güncellenir.`,
  ];

  if (variant === 'don-uyarisi') {
    return [
      `${city} için güncel zirai don riski **${frost}/100** seviyesinde ve ${lvl} olarak değerlendiriliyor. Don, özellikle ilkbahar ve sonbahar geçişlerinde meyve bahçeleri, bağlar ve hassas sebze fideleri için en büyük tehditlerden biridir.`,
      `Zirai don riski yalnızca gece minimum sıcaklığına değil; nem oranı, rüzgâr hızı ve bulutluluğa da bağlıdır. Açık ve durgun gecelerde radyasyon donu riski artar. ${city} özelinde bu faktörler birlikte değerlendirilerek 0-100 arası bir risk skoru üretilir.`,
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
): string[] {
  const lvl = frostLevelEn(frost);
  const tempLine = tempLineEn(min, max);

  const common = [
    `${city} is located in the ${region} region of Türkiye, where climate conditions strongly affect agricultural production. ${tempLine} The table below updates automatically every day using OpenWeatherMap data.`,
  ];

  if (variant === 'don-uyarisi') {
    return [
      `The current agricultural frost risk for ${city} is **${frost}/100**, rated as ${lvl}. Frost is one of the biggest threats to orchards, vineyards and sensitive vegetable seedlings, especially during spring and autumn transitions.`,
      `Frost risk depends not only on the overnight minimum temperature but also on humidity, wind speed and cloud cover. On clear, calm nights the risk of radiation frost increases. For ${city}, these factors are combined into a single 0-100 risk score.`,
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
