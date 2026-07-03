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
  return getPageMetadata("kvkk", {
    locale,
    pathname: "/kvkk",
    title: isEn ? `${app} · Data Processing Notice` : `${app} · KVKK Aydınlatma Metni`,
    description: isEn
      ? `${app} data processing notice and privacy-related information.`
      : `${app} KVKK aydınlatma metni ve kişisel veri işleme süreçleri.`,
  });
}

export default async function KvkkPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const app = getPublicAppName();
  const isEn = locale === 'en';

  const page = await fetchCustomPageBySlug("kvkk", locale);

  return (
    <LegalPageContent
      page={page}
      fallbackTitle={isEn ? "Data Processing Notice" : "KVKK Aydınlatma Metni"}
      fallbackContent={
        isEn ? (
          <>
            <p>{app} is an agricultural weather forecast, frost-risk alert, notification and widget/API service provided by Tarvista Tarım Teknolojileri A.Ş.</p>
            <h2>Data categories</h2>
            <p>Account details, contact details, city/location preferences, notification preferences, support requests, technical logs and, where permission is granted, device or push-token information may be processed.</p>
            <h2>Purposes of processing</h2>
            <p>Data is processed to provide the service, deliver frost-risk and weather notifications, maintain security and abuse prevention, handle support, improve the product and comply with legal obligations.</p>
            <h2>Legal basis</h2>
            <p>Processing may rely on contract performance, legitimate interest, legal obligation and, where required, explicit consent.</p>
            <h2>Sharing and retention</h2>
            <p>Data may be shared only with infrastructure, email, notification, hosting and analytics providers necessary for the service. Retention is limited to service needs and legal requirements.</p>
            <h2>Your rights</h2>
            <p>You can contact destek@tarimiklim.com for access, correction, deletion, objection and related privacy requests.</p>
          </>
        ) : (
          <>
            <p>{app}, Tarvista Tarım Teknolojileri A.Ş. tarafından sunulan tarımsal hava tahmini, don riski uyarısı, bildirim ve widget/API servisidir.</p>
            <h2>İşlenen veri kategorileri</h2>
            <p>Hesap bilgileri, iletişim bilgileri, şehir/konum tercihleri, bildirim tercihleri, destek talepleri, teknik loglar ve açık rıza verilmesi halinde cihaz/push token bilgileri işlenebilir.</p>
            <h2>İşleme amaçları</h2>
            <p>Hizmetin sunulması, don riski ve hava durumu bildirimlerinin iletilmesi, güvenlik ve kötüye kullanım kontrolleri, destek süreçleri, ürün iyileştirme ve yasal yükümlülüklerin yerine getirilmesi amaçlanır.</p>
            <h2>Hukuki sebepler</h2>
            <p>Veriler; sözleşmenin kurulması ve ifası, meşru menfaat, hukuki yükümlülük ve gerekli hallerde açık rıza hukuki sebeplerine dayanarak işlenir.</p>
            <h2>Aktarım ve saklama</h2>
            <p>Veriler yalnızca hizmet için gerekli altyapı, e-posta, bildirim, barındırma ve analitik sağlayıcılarıyla sınırlı olarak paylaşılabilir. Saklama süreleri hizmet ihtiyacı ve mevzuat gereklilikleriyle sınırlıdır.</p>
            <h2>Haklarınız</h2>
            <p>KVKK madde 11 kapsamındaki bilgi alma, düzeltme, silme, itiraz ve zarar giderimi haklarınız için destek@tarimiklim.com adresinden başvurabilirsiniz.</p>
          </>
        )
      }
    />
  );
}
