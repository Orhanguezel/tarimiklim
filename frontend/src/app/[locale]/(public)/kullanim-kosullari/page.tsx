export const revalidate = 3600;

import { setRequestLocale } from "next-intl/server";
import { fetchCustomPageBySlug } from "@/lib/api";
import LegalPageContent from "@/components/LegalPageContent";
import { getPageMetadata } from "@/lib/seo";
import { getPublicAppName } from "@/lib/public-brand";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const app = getPublicAppName();
  const isEn = locale === 'en';
  return getPageMetadata("kullanim_kosullari", {
    locale,
    pathname: "/kullanim-kosullari",
    title: isEn ? `${app} · Terms of Use` : `${app} · Kullanım Koşulları`,
    description: isEn
      ? `${app} terms of use for weather, frost-risk, API and widget services.`
      : `${app} kullanım koşulları ve platform kullanımına ilişkin kurallar.`,
  });
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const app = getPublicAppName();
  const isEn = locale === 'en';

  const page = await fetchCustomPageBySlug("kullanim-kosullari", locale);

  return (
    <LegalPageContent
      page={page}
      fallbackTitle={isEn ? "Terms of Use" : "Kullanım Koşulları"}
      fallbackContent={
        isEn ? (
          <>
            <p>{app} is a decision-support platform for weather forecasts, agricultural frost-risk scores, notifications, API and widget services.</p>
            <h2>Scope of service</h2>
            <p>The platform produces forecast and risk information using third-party meteorological data sources and local calculation models. The service supports agricultural decisions; it is not an official or guaranteed warning source by itself.</p>
            <h2>Forecast accuracy disclaimer</h2>
            <p>Weather forecasts and frost-risk scores are not guarantees. Before critical agricultural decisions, users should consider official sources, local observations and expert advice.</p>
            <h2>User responsibilities</h2>
            <p>Users are responsible for account security, accurate contact information, up-to-date notification preferences and fair use of API/widget services.</p>
            <h2>API and widget use</h2>
            <p>API and widget usage is subject to reasonable-use, quota, security and technical limits. Excessive traffic, unauthorized resale or misleading representation may lead to restricted access.</p>
            <h2>Limitation of liability</h2>
            <p>Tarvista Tarım Teknolojileri A.Ş. is not responsible for indirect losses caused by forecast deviation, data-source outages, connectivity issues or user decisions.</p>
          </>
        ) : (
          <>
            <p>{app}; hava tahmini, zirai don riski skoru, bildirim, API ve widget hizmetleri sunan bir karar destek platformudur.</p>
            <h2>Hizmetin kapsamı</h2>
            <p>Platform, üçüncü taraf meteorolojik veri kaynakları ve yerel hesaplama modelleriyle tahmin ve risk bilgisi üretir. Servis tarımsal kararları destekler; tek başına kesin veya resmi uyarı kaynağı değildir.</p>
            <h2>Tahmin doğruluğu feragatnamesi</h2>
            <p>Hava tahminleri ve don riski skorları kesinlik taşımaz. Kullanıcılar kritik tarımsal kararlar öncesinde MGM ve ilgili resmi kaynakları, yerel gözlemleri ve uzman görüşünü dikkate almalıdır.</p>
            <h2>Kullanıcı sorumlulukları</h2>
            <p>Kullanıcı, hesap güvenliğini korumak, doğru iletişim bilgisi sağlamak, bildirim tercihlerini güncel tutmak ve API/widget kullanımında hizmeti kötüye kullanmamakla sorumludur.</p>
            <h2>API ve widget kullanımı</h2>
            <p>API ve widget kullanımı makul kullanım, kota, güvenlik ve teknik sınırlara tabidir. Aşırı trafik, izinsiz yeniden satış veya yanıltıcı temsil durumunda erişim sınırlandırılabilir.</p>
            <h2>Sorumluluk sınırı</h2>
            <p>Tarvista Tarım Teknolojileri A.Ş., tahmin sapmaları, veri kaynağı kesintileri, bağlantı sorunları veya kullanıcı kararlarından doğabilecek dolaylı zararlardan sorumlu değildir.</p>
          </>
        )
      }
    />
  );
}
