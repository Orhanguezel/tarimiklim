import Link from 'next/link';

export default function MailAdminPlaceholderPage() {
  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-gm-gold" />
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">Sistem</span>
          </div>
          <h1 className="font-serif text-4xl text-gm-text">E-posta (gelişmiş)</h1>
          <p className="text-gm-muted text-sm font-serif italic max-w-xl">
            Şablonlar için <span className="font-medium text-gm-text">E-posta şablonları</span> menüsünü kullanın. Bu sayfa tam posta kuyruğu yönetimi içindir ve bu projede backend karşılığı yok.
          </p>
        </div>
        <Link href="/admin/email-templates" className="text-gm-gold text-sm font-bold tracking-widest uppercase underline-offset-4 hover:underline">
          E-posta şablonlarına git
        </Link>
      </div>
    </div>
  );
}
