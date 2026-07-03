import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getPageMetadata } from '@/lib/seo';
import { getPublicAppName, getPublicSiteUrl } from '@/lib/public-brand';

type Props = { params: Promise<{ locale: string }> };

function pageCopy(locale: string, app: string) {
  const isEn = locale === 'en';
  return isEn
    ? {
        metaTitle: `How agricultural frost risk is calculated | ${app}`,
        metaDescription:
          `${app} combines temperature, humidity, wind and cloud cover to generate a 0-100 agricultural frost-risk decision-support score.`,
        label: 'METHODOLOGY',
        title: 'How is agricultural frost risk calculated?',
        lead: `${app} does not read overnight temperature alone. It evaluates temperature, humidity, wind and cloud cover together to generate a clear 0-100 decision-support signal.`,
        factorTitle: 'Four-factor scoring model',
        thresholdTitle: 'Risk thresholds',
        timingTitle: 'Alert timing',
        timing:
          'Frost risk becomes most critical overnight and toward dawn. The system therefore monitors the following night during the evening; email, Telegram or push notification preferences may be triggered at high and critical thresholds.',
        limitsTitle: 'Limitations and proper use',
        limits:
          'Microclimate, parcel elevation, cover status, irrigation, soil moisture and crop phenology can change frost impact. The score is not a guaranteed damage forecast. Official meteorological warnings, local measurements and agronomic expert review should be considered before critical decisions.',
        expertiseTitle: 'Expertise process',
        expertise:
          'The methodology is developed by evaluating agricultural decision-support needs, data engineering, meteorological forecast data and field-use scenarios together. The goal is to turn complex forecast data into a risk signal that growers and agricultural businesses can read quickly.',
        articleHeadline: 'How is agricultural frost risk calculated?',
        articleDescription:
          'A methodology for calculating a 0-100 agricultural frost-risk score with temperature, humidity, wind and cloud cover.',
        about: ['agricultural frost', 'agricultural weather forecast', 'frost-risk score'],
        faq: [
          ['Is the frost-risk score a guaranteed forecast?', 'No. The score is provided for decision support and should be used together with official meteorological warnings, local observation and expert review.'],
          ['Which factor matters most in the score?', 'Overnight minimum temperature and how quickly it approaches freezing form the largest part of the total score.'],
          ['Which data sources does Tarım İklim use?', 'The service uses OpenWeatherMap forecast data as the primary source and can evaluate Open-Meteo as a fallback source where appropriate.'],
        ],
        factors: [
          ['Temperature', '60%', 'Overnight minimum temperature and the rate of approach to freezing are the primary signal.'],
          ['Humidity', '15%', 'Low humidity can increase radiative heat loss; higher humidity can soften risk in some conditions.'],
          ['Wind', '15%', 'Calm air increases radiation-frost risk; light air movement can reduce inversion effects.'],
          ['Cloud cover', '10%', 'Clear sky accelerates overnight heat loss; cloud cover can provide a protective effect.'],
        ],
        thresholds: [
          ['0-20', 'Low', 'Standard monitoring is usually sufficient.'],
          ['21-50', 'Moderate', 'Sensitive crops and low-elevation parcels should be checked.'],
          ['51-80', 'High', 'Plan cover, irrigation, fogging or greenhouse measures.'],
          ['81-100', 'Critical', 'Urgent protection action and multi-channel notification are recommended.'],
        ],
      }
    : {
        metaTitle: `Zirai don riski nasıl hesaplanır? | ${app}`,
        metaDescription:
          'Tarım İklim don riski skoru; sıcaklık, nem, rüzgar ve bulut örtüsünü birlikte değerlendirerek 0-100 arası karar destek skoru üretir.',
        label: 'METODOLOJİ',
        title: 'Zirai don riski nasıl hesaplanır?',
        lead: `${app} don riski skoru, gece sıcaklığını tek başına okumaz; sıcaklık, nem, rüzgar ve bulut örtüsünü birlikte değerlendirerek 0-100 arasında anlaşılır bir karar destek sinyali üretir.`,
        factorTitle: '4 faktörlü skor modeli',
        thresholdTitle: 'Risk eşikleri',
        timingTitle: 'Uyarı zamanlaması',
        timing:
          'Don riski özellikle gece ve sabaha karşı kritik hale gelir. Bu nedenle sistem, akşam saatlerinde ertesi geceye dönük riski izlemeye alır; yüksek ve kritik eşiklerde e-posta, Telegram veya push bildirim tercihleri devreye girebilir.',
        limitsTitle: 'Sınırlılıklar ve doğru kullanım',
        limits:
          'Mikroklima, parsel kotu, örtü durumu, sulama, toprak nemi ve ürün fenolojisi don etkisini değiştirebilir. Skor kesin hasar tahmini değildir. Kritik kararlar öncesinde MGM uyarıları, yerel ölçümler ve ziraat uzmanı değerlendirmesi dikkate alınmalıdır.',
        expertiseTitle: 'Uzmanlık süreci',
        expertise:
          'Metodoloji, tarımsal karar destek ihtiyacına göre veri mühendisliği, meteorolojik tahmin verisi ve saha kullanım senaryoları birlikte değerlendirilerek geliştirilir. Amaç, karmaşık tahmin verisini çiftçi ve tarımsal işletmeler için hızlı okunur bir risk sinyaline dönüştürmektir.',
        articleHeadline: 'Zirai don riski nasıl hesaplanır?',
        articleDescription:
          'Sıcaklık, nem, rüzgar ve bulut örtüsüyle 0-100 arası zirai don riski skoru hesaplama metodolojisi.',
        about: ['zirai don', 'tarımsal hava tahmini', 'don riski skoru'],
        faq: [
          ['Don riski skoru kesin tahmin midir?', 'Hayır. Skor karar destek amacıyla sunulur; resmi meteorolojik uyarılar, yerel gözlem ve uzman değerlendirmesiyle birlikte kullanılmalıdır.'],
          ['Skorda en önemli faktör hangisidir?', 'Gece minimum sıcaklığı ve sıcaklığın sıfır dereceye yaklaşma davranışı toplam skorun en büyük bölümünü oluşturur.'],
          ['Tarım İklim hangi veri kaynaklarını kullanır?', 'Servis, OpenWeatherMap tahmin verisini birincil kaynak olarak kullanır; uygun senaryolarda Open-Meteo yedek veri kaynağı olarak değerlendirilir.'],
        ],
        factors: [
          ['Sıcaklık', '60%', 'Gece minimum sıcaklığı ve sıfır dereceye yaklaşma hızı ana sinyaldir.'],
          ['Nem', '15%', 'Düşük nem radyasyonla ısı kaybını artırabilir; yüksek nem bazı koşullarda riski yumuşatabilir.'],
          ['Rüzgar', '15%', 'Durgun hava radyasyon donu riskini artırır; hafif hava hareketi terselme etkisini azaltabilir.'],
          ['Bulut örtüsü', '10%', 'Açık gökyüzü gece ısı kaybını hızlandırır; bulut örtüsü koruyucu etki sağlayabilir.'],
        ],
        thresholds: [
          ['0-20', 'Düşük', 'Standart izleme yeterlidir.'],
          ['21-50', 'Orta', 'Hassas ürünler ve düşük kotlu parseller kontrol edilir.'],
          ['51-80', 'Yüksek', 'Örtü, sulama, sisleme veya sera tedbirleri planlanır.'],
          ['81-100', 'Kritik', 'Acil koruma aksiyonu ve çoklu bildirim önerilir.'],
        ],
      };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const app = getPublicAppName();
  const copy = pageCopy(locale, app);
  return getPageMetadata('zirai_don_metodoloji', {
    locale,
    pathname: '/zirai-don-riski-nasil-hesaplanir',
    title: copy.metaTitle,
    description: copy.metaDescription,
  });
}

export default async function FrostMethodologyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const site = getPublicSiteUrl();
  const app = getPublicAppName();
  const copy = pageCopy(locale, app);
  const url = `${site}/${locale}/zirai-don-riski-nasil-hesaplanir`;
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: copy.articleHeadline,
    description: copy.articleDescription,
    url,
    inLanguage: locale === 'en' ? 'en-US' : 'tr-TR',
    author: {
      '@type': 'Organization',
      name: app,
      url: site,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Tarvista Tarım Teknolojileri A.Ş.',
      url: site,
    },
    about: copy.about,
  };
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: copy.faq.map(([name, text]) => ({
        '@type': 'Question',
        name,
        acceptedAnswer: {
          '@type': 'Answer',
          text,
        },
      })),
  };

  return (
    <main className="container-section methodology-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <article className="mx-auto max-w-4xl">
        <p className="section-label"><span>{copy.label}</span></p>
        <h1 className="section-title">{copy.title}</h1>
        <p className="section-lead">{copy.lead}</p>

        <section className="methodology-block">
          <h2>{copy.factorTitle}</h2>
          <div className="methodology-factor-grid">
            {copy.factors.map(([name, weight, detail]) => (
              <article key={name} className="methodology-factor">
                <div className="methodology-factor-weight">{weight}</div>
                <h3>{name}</h3>
                <p>{detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="methodology-block">
          <h2>{copy.thresholdTitle}</h2>
          <div className="methodology-table" role="table" aria-label="Don riski eşikleri">
            {copy.thresholds.map(([range, label, action]) => (
              <div key={range} className="methodology-row" role="row">
                <strong>{range}</strong>
                <span>{label}</span>
                <p>{action}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="methodology-block">
          <h2>{copy.timingTitle}</h2>
          <p>{copy.timing}</p>
        </section>

        <section className="methodology-block">
          <h2>{copy.limitsTitle}</h2>
          <p>{copy.limits}</p>
        </section>

        <section className="methodology-block">
          <h2>{copy.expertiseTitle}</h2>
          <p>{copy.expertise}</p>
        </section>
      </article>
    </main>
  );
}
