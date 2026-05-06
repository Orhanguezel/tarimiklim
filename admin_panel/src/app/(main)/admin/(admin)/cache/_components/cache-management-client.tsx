'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  Trash2,
  RefreshCcw,
  Globe,
  Star,
  Calendar,
  LogIn,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

async function revalidate(opts: { all?: boolean; path?: string }) {
  const res = await fetch('/api/revalidate-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(opts),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Revalidation failed');
  return data;
}

const CACHE_ACTIONS = [
  {
    id: 'all',
    label: 'Tüm Site Cache',
    description:
      "Tüm sayfaların cache'ini temizler. Tema/tasarım değişiklikleri ve site ayarları için bunu kullanın.",
    icon: Globe,
    action: () => revalidate({ all: true }),
    variant: 'destructive' as const,
  },
  {
    id: 'home',
    label: 'Ana Sayfa',
    description: "Ana sayfanın cache'ini temizler.",
    icon: Globe,
    action: () => revalidate({ path: '/tr' }),
  },
  {
    id: 'birth-chart',
    label: 'Doğum Haritası',
    description: "Doğum haritası sayfası cache'ini temizler.",
    icon: Sparkles,
    action: () => revalidate({ path: '/tr/birth-chart' }),
  },
  {
    id: 'consultants',
    label: 'Danışmanlar',
    description: "Danışman listesi ve detay sayfaları cache'ini temizler.",
    icon: Star,
    action: () => revalidate({ path: '/tr/consultants' }),
  },
  {
    id: 'booking',
    label: 'Randevu',
    description: "Randevu akışının cache'ini temizler.",
    icon: Calendar,
    action: () => revalidate({ path: '/tr/booking' }),
  },
  {
    id: 'auth',
    label: 'Giriş / Kayıt',
    description: "Giriş ve kayıt sayfalarının cache'ini temizler.",
    icon: LogIn,
    action: () => revalidate({ path: '/tr/auth/login' }),
  },
];

export default function CacheManagementClient() {
  const [loading, setLoading] = React.useState<string | null>(null);
  const [lastCleared, setLastCleared] = React.useState<Record<string, string>>({});

  async function handleClear(id: string, action: () => Promise<any>) {
    setLoading(id);
    try {
      await action();
      const now = new Date().toLocaleTimeString('tr-TR');
      setLastCleared((prev) => ({ ...prev, [id]: now }));
      toast.success(id === 'all' ? 'Tüm site cache temizlendi' : 'Cache temizlendi');
    } catch (err: any) {
      toast.error(err?.message || 'Cache temizlenemedi');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-gm-gold" />
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">Sistem</span>
          </div>
          <h1 className="font-serif text-4xl text-gm-text">Cache Yönetimi</h1>
          <p className="text-gm-muted text-sm font-serif italic max-w-xl">
            Frontend sayfalarının cache'ini temizleyin. İçerik güncellemelerinin anında görünmesini sağlar.
          </p>
        </div>
      </div>

      <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
        <CardHeader className="border-b border-gm-border-soft/50 pb-6 p-8">
          <CardTitle className="font-serif text-2xl text-gm-text">Hızlı Temizle</CardTitle>
          <CardDescription className="text-gm-muted font-serif italic mt-2">
            Belirli bir sayfanın veya tüm sitenin cache'ini temizleyin. Cache temizlendikten sonra
            sayfa ilk ziyarette yeniden oluşturulur.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-8">
          {CACHE_ACTIONS.map((item, idx) => (
            <React.Fragment key={item.id}>
              {idx === 1 && <Separator className="bg-gm-border-soft/50 my-6" />}
              <div className="flex items-center justify-between rounded-2xl border border-gm-border-soft bg-gm-surface/30 p-6 group hover:bg-gm-surface/50 transition-colors">
                <div className="flex items-center gap-6">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-gm-surface/50 border border-gm-border-soft group-hover:border-gm-gold/30 transition-colors">
                    <item.icon className="size-6 text-gm-gold" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-lg font-serif text-gm-text">{item.label}</span>
                      {lastCleared[item.id] && (
                        <Badge variant="outline" className="text-[9px] uppercase tracking-widest font-mono text-gm-success border-gm-success/30 bg-gm-success/10">
                          {lastCleared[item.id]}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gm-muted">{item.description}</p>
                  </div>
                </div>
                <Button
                  variant={item.variant === 'destructive' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => handleClear(item.id, item.action)}
                  disabled={loading !== null}
                  className={cn(
                    "rounded-full px-8 h-12 transition-all font-bold tracking-widest uppercase text-[10px]",
                    item.variant === 'destructive' 
                      ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-0" 
                      : "border-gm-border-soft bg-gm-surface/20 hover:bg-gm-surface hover:text-gm-gold"
                  )}
                >
                  {loading === item.id ? (
                    <RefreshCcw className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 size-4" />
                  )}
                  Temizle
                </Button>
              </div>
            </React.Fragment>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-gm-surface/10 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="font-serif text-lg text-gm-gold flex items-center gap-3">
            <Sparkles className="size-5" />
            Sistem Bilgisi
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gm-muted space-y-4 p-8 pt-0 leading-relaxed font-serif italic">
          <p>
            Frontend sayfaları 5 dakika (300 saniye) boyunca cache'lenir. Cache temizlendiğinde
            sayfalar bir sonraki ziyarette API'den taze veri çeker.
          </p>
          <p>
            Tema şablonu uygulandığında otomatik olarak tüm cache temizlenir — el ile temizlemeye
            gerek yoktur. Sadece içerik (yorumlar, ürünler vb.) güncellendiğinde bu sayfayı
            kullanın.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
