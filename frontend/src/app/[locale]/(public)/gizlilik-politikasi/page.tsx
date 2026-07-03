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
  return getPageMetadata("gizlilik_politikasi", {
    locale,
    pathname: "/gizlilik-politikasi",
    title: isEn ? `${app} · Privacy Policy` : `${app} · Gizlilik Politikası`,
    description: isEn
      ? `${app} privacy policy for weather, frost-risk and notification services.`
      : `${app} gizlilik politikası ve kişisel verilerin korunmasına ilişkin bilgilendirme.`,
  });
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const app = getPublicAppName();
  const isEn = locale === 'en';

  const page = await fetchCustomPageBySlug("gizlilik-politikasi", locale);

  return (
    <LegalPageContent
      page={page}
      fallbackTitle={isEn ? "Privacy Policy" : "Gizlilik Politikası"}
      fallbackContent={
        isEn ? (
          <>
            <p>{app} processes limited data to provide weather forecasts, agricultural frost-risk alerts, notifications and widget/API services securely.</p>
            <h2>Information we collect</h2>
            <p>Email address, account details, selected city or location, notification channel preferences, support messages, IP address, device information, cookies and technical logs may be processed.</p>
            <h2>Notification channels</h2>
            <p>Email, Telegram and push notifications are used according to user preferences. Subscriptions can be managed from the account area or support channel.</p>
            <h2>Cookies and analytics</h2>
            <p>Essential or limited analytics cookies may be used for session, security, preference and performance measurement. Analytics data is evaluated in aggregate to improve product quality and error tracking.</p>
            <h2>Third-party services</h2>
            <p>Hosting, weather data, email, push notification and analytics providers may be used for service operation. These transfers are limited to the stated purpose.</p>
            <h2>Contact</h2>
            <p>For privacy requests, write to info@vistaseeds.com.tr.</p>
          </>
        ) : (
          <>
            <p>{app}, hava tahmini, zirai don riski, bildirim ve widget/API hizmetlerini güvenli biçimde sunmak için sınırlı veri işler.</p>
            <h2>Topladığımız bilgiler</h2>
            <p>E-posta adresi, hesap bilgileri, tercih edilen şehir veya konum, bildirim kanalı tercihleri, destek mesajları, IP adresi, cihaz bilgisi, çerezler ve teknik loglar işlenebilir.</p>
            <h2>Bildirim kanalları</h2>
            <p>E-posta, Telegram ve push bildirimleri yalnızca kullanıcının tercihleri doğrultusunda kullanılır. Bildirim abonelikleri hesap ekranından veya destek kanalı üzerinden yönetilebilir.</p>
            <h2>Çerezler ve analitik</h2>
            <p>Oturum, güvenlik, tercih ve performans ölçümü için zorunlu veya sınırlı analitik çerezleri kullanılabilir. Analitik veriler ürün kalitesini ve hata takibini iyileştirmek için toplulaştırılmış biçimde değerlendirilir.</p>
            <h2>Üçüncü taraf servisler</h2>
            <p>Barındırma, hava verisi, e-posta, push bildirim ve analitik sağlayıcıları hizmetin çalışması için kullanılabilir. Bu paylaşımlar amaçla sınırlı tutulur.</p>
            <h2>İletişim</h2>
            <p>Gizlilik talepleri için info@vistaseeds.com.tr adresine yazabilirsiniz.</p>
          </>
        )
      }
    />
  );
}
