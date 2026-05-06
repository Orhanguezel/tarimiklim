import Link from 'next/link';

export default function PaymentSettingsPlaceholderPage() {
  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-gm-gold" />
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">Sistem</span>
          </div>
          <h1 className="font-serif text-4xl text-gm-text">Ödeme ayarları</h1>
          <p className="text-gm-muted text-sm font-serif italic max-w-xl">
            Bu kurulumda ödeme ağ geçidi yönetimi devre dışı. İlgili backend modülleri Tarım İklim servisinde tanımlı değil.
          </p>
        </div>
        <Link href="/admin/site-settings" className="text-gm-gold text-sm font-bold tracking-widest uppercase underline-offset-4 hover:underline">
          Site ayarlarına dön
        </Link>
      </div>
    </div>
  );
}
