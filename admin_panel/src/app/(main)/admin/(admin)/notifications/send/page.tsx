'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Bell, CheckCircle2, Megaphone, Send, Smartphone, User, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  useListPushCampaignsQuery,
  useSendManualPushMutation,
  useSendPushCampaignMutation,
} from '@/integrations/hooks';
import { getAdminAppName } from '@/lib/admin-brand';

export default function SendPushNotificationPage() {
  const router = useRouter();
  const [sendPush, { isLoading }] = useSendManualPushMutation();
  const { data: campaigns = [], isLoading: campaignsLoading } = useListPushCampaignsQuery();
  const [sendCampaign, { isLoading: isSendingCampaign }] = useSendPushCampaignMutation();

  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [target, setTarget] = React.useState<'all' | 'specific'>('all');
  const [userId, setUserId] = React.useState('');
  const [selectedCampaignSlug, setSelectedCampaignSlug] = React.useState('');
  const selectedCampaign = campaigns.find((campaign) => campaign.slug === selectedCampaignSlug);

  React.useEffect(() => {
    if (!selectedCampaignSlug && campaigns.length > 0) {
      setSelectedCampaignSlug(campaigns[0].slug);
    }
  }, [campaigns, selectedCampaignSlug]);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Başlık ve mesaj alanları zorunludur.');
      return;
    }

    if (target === 'specific' && !userId.trim()) {
      toast.error('Belirli kullanıcı hedefi için kullanıcı ID zorunludur.');
      return;
    }

    try {
      const res = await sendPush({
        title: title.trim(),
        body: body.trim(),
        target_all: target === 'all',
        user_id: target === 'specific' ? userId.trim() : undefined,
      }).unwrap();

      if (Number(res.target_count ?? 0) === 0) {
        toast.error('Gönderim yapılmadı: aktif push tokenı olan kullanıcı bulunamadı.');
        return;
      }

      toast.success(
        `${res.sent_count}/${res.target_count} bildirim gönderildi. Başarısız: ${res.failed_count ?? 0}.`,
      );
      router.back();
    } catch (err: any) {
      toast.error(err?.data?.error?.message || 'Bildirim gönderilemedi.');
    }
  };

  const handleSendCampaign = async () => {
    if (!selectedCampaignSlug) {
      toast.error('Lütfen bir kampanya seçin.');
      return;
    }

    try {
      const res = await sendCampaign(selectedCampaignSlug).unwrap();
      if (Number(res.target_count ?? 0) === 0) {
        toast.error('Kampanya gönderilmedi: bu hedef segmentte aktif push tokenı yok.');
        return;
      }
      toast.success(
        `${res.sent_count}/${res.target_count} kampanya bildirimi gönderildi. Başarısız: ${res.failed_count}.`,
      );
    } catch (err: any) {
      toast.error(err?.data?.error?.message || 'Kampanya gönderilemedi.');
    }
  };

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="h-10 rounded-full border-gm-border-soft px-4 text-[10px] font-bold uppercase tracking-widest text-gm-muted hover:bg-gm-primary/5"
          >
            <ArrowLeft className="mr-2 size-4" />
            Geri Dön
          </Button>
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gm-gold" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gm-gold">
              Push Bildirimleri
            </span>
          </div>
          <div>
            <h1 className="font-serif text-4xl text-gm-text">Bildirim Gönder</h1>
            <p className="mt-2 max-w-2xl font-serif text-sm italic text-gm-muted opacity-75">
              Kullanıcılara anlık push bildirimi veya önceden hazırlanmış kampanya gönderin.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[460px]">
          <div className="rounded-2xl border border-gm-border-soft bg-gm-surface/50 p-4 shadow-lg">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gm-muted">
              <Megaphone className="size-4 text-gm-gold" />
              Kampanya
            </div>
            <div className="mt-2 text-2xl font-semibold text-gm-text">{campaigns.length}</div>
          </div>
          <div className="rounded-2xl border border-gm-border-soft bg-gm-surface/50 p-4 shadow-lg">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gm-muted">
              <Users className="size-4 text-gm-gold" />
              Hedef
            </div>
            <div className="mt-2 text-2xl font-semibold text-gm-text">
              {target === 'all' ? 'Tümü' : 'Tekil'}
            </div>
          </div>
          <div className="rounded-2xl border border-gm-border-soft bg-gm-surface/50 p-4 shadow-lg">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gm-muted">
              <Smartphone className="size-4 text-gm-gold" />
              Önizleme
            </div>
            <div className="mt-2 text-2xl font-semibold text-gm-text">
              {title.trim() ? 'Hazır' : 'Taslak'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
      <Card className="overflow-hidden border-gm-border-soft bg-gm-surface/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif text-xl text-gm-text">
            <Megaphone className="size-5 text-gm-gold" />
            Kampanya Gönderimi
          </CardTitle>
          <CardDescription>Kayıtlı hedef kitlesi olan hazır bir push kampanyasını gönderin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="campaign">Kampanya</Label>
            <Select
              value={selectedCampaignSlug}
              onValueChange={setSelectedCampaignSlug}
              disabled={campaignsLoading || campaigns.length === 0}
            >
              <SelectTrigger id="campaign" className="h-12 rounded-xl border-gm-border-soft bg-gm-bg/70">
                <SelectValue placeholder={campaignsLoading ? 'Kampanyalar yükleniyor...' : 'Kampanya seçin'} />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map((campaign) => (
                  <SelectItem key={campaign.slug} value={campaign.slug} disabled={!campaign.is_active}>
                    {campaign.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCampaign ? (
            <div className="rounded-2xl border border-gm-border-soft bg-gm-bg/60 p-5 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-gm-text">{selectedCampaign.title}</span>
                <span className="rounded-full bg-gm-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gm-gold">
                  {selectedCampaign.target_segment}
                </span>
                {selectedCampaign.deep_link ? (
                  <span className="rounded-full bg-gm-surface px-3 py-1 text-[10px] text-gm-muted">
                    {selectedCampaign.deep_link}
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-gm-muted">{selectedCampaign.body}</p>
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-gm-border-soft p-5 text-sm text-gm-muted">
              Aktif push kampanyası bulunamadı.
            </p>
          )}
        </CardContent>
        <CardFooter className="justify-end border-t border-gm-border-soft bg-gm-bg/30 pt-6">
          <Button
            onClick={handleSendCampaign}
            disabled={!selectedCampaignSlug || isSendingCampaign}
            className="h-11 rounded-full bg-gm-gold px-7 text-[10px] font-bold uppercase tracking-widest text-gm-bg shadow-lg shadow-gm-gold/20 hover:bg-gm-gold-dim"
          >
            <Send className="mr-2 size-4" />
            {isSendingCampaign ? 'Gönderiliyor...' : 'Kampanyayı Gönder'}
          </Button>
        </CardFooter>
      </Card>

      <Card className="overflow-hidden border-gm-border-soft bg-gm-surface/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif text-xl text-gm-text">
            <Bell className="size-5 text-gm-gold" />
            Manuel Bildirim İçeriği
          </CardTitle>
          <CardDescription>Bu içerik kullanıcının cihazında push bildirimi olarak görünecek.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Başlık</Label>
            <Input 
              id="title" 
              placeholder="Örn. Don riski uyarısı" 
              className="h-12 rounded-xl border-gm-border-soft bg-gm-bg/70"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="body">Mesaj</Label>
            <Textarea 
              id="body" 
              placeholder="Örn. Bu gece seçili konumlarınızda don riski bekleniyor. Detayları panelden inceleyin." 
              className="min-h-[120px] rounded-xl border-gm-border-soft bg-gm-bg/70"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <div className="space-y-3 border-t border-gm-border-soft pt-5">
            <Label>Hedef Kitle</Label>
            <RadioGroup value={target} onValueChange={(v) => setTarget(v as 'all' | 'specific')} className="grid gap-4 sm:grid-cols-2">
              <div>
                <RadioGroupItem value="all" id="target-all" className="peer sr-only" />
                <Label
                  htmlFor="target-all"
                  className="flex cursor-pointer flex-col items-center justify-between rounded-2xl border border-gm-border-soft bg-gm-bg/60 p-5 text-gm-muted transition-all hover:border-gm-gold/50 hover:bg-gm-gold/5 peer-data-[state=checked]:border-gm-gold peer-data-[state=checked]:text-gm-text"
                >
                  <Users className="mb-3 size-6" />
                  Tüm Kullanıcılar
                </Label>
              </div>
              <div>
                <RadioGroupItem value="specific" id="target-specific" className="peer sr-only" />
                <Label
                  htmlFor="target-specific"
                  className="flex cursor-pointer flex-col items-center justify-between rounded-2xl border border-gm-border-soft bg-gm-bg/60 p-5 text-gm-muted transition-all hover:border-gm-gold/50 hover:bg-gm-gold/5 peer-data-[state=checked]:border-gm-gold peer-data-[state=checked]:text-gm-text"
                >
                  <User className="mb-3 size-6" />
                  Belirli Kullanıcı
                </Label>
              </div>
            </RadioGroup>
          </div>

          {target === 'specific' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label htmlFor="userId">Kullanıcı ID</Label>
              <Input 
                id="userId" 
                placeholder="Kullanıcı UUID değerini girin" 
                className="h-12 rounded-xl border-gm-border-soft bg-gm-bg/70"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-end gap-3 border-t border-gm-border-soft bg-gm-bg/30 pt-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="h-11 rounded-full border-gm-border-soft px-6 text-[10px] font-bold uppercase tracking-widest"
          >
            Vazgeç
          </Button>
          <Button
            onClick={handleSend}
            disabled={isLoading}
            className="h-11 rounded-full bg-gm-gold px-7 text-[10px] font-bold uppercase tracking-widest text-gm-bg shadow-lg shadow-gm-gold/20 hover:bg-gm-gold-dim"
          >
            <Send className="mr-2 size-4" />
            {isLoading ? 'Gönderiliyor...' : 'Bildirimi Gönder'}
          </Button>
        </CardFooter>
      </Card>
        </div>

      <aside className="xl:sticky xl:top-24 xl:self-start">
        <div className="rounded-3xl border border-gm-border-soft bg-gm-surface/50 p-6 shadow-xl">
          <h3 className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gm-gold">
            <Bell className="size-4" /> Cihaz Önizleme
          </h3>
          <div className="mx-auto w-72 rounded-[2rem] border-4 border-gm-border-soft bg-gm-bg p-4 shadow-2xl">
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-gm-border-soft" />
            <div className="rounded-2xl border border-gm-border-soft bg-gm-surface/90 p-4 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex size-5 items-center justify-center rounded bg-gm-gold/15 text-gm-gold">
                <CheckCircle2 className="size-3" />
              </div>
              <span className="max-w-[160px] truncate text-[10px] font-bold text-gm-text">
                {getAdminAppName().toUpperCase()}
              </span>
              <span className="ml-auto text-[8px] text-gm-muted">şimdi</span>
            </div>
            <p className="line-clamp-1 text-[12px] font-bold text-gm-text">{title || 'Bildirim başlığı'}</p>
            <p className="line-clamp-3 text-[11px] leading-snug text-gm-muted">
              {body || 'Bildirim mesajınız burada görünecek...'}
            </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-gm-border-soft bg-gm-bg/50 p-4 text-xs leading-relaxed text-gm-muted">
            <strong className="block text-gm-text">Gönderim notu</strong>
            Tüm kullanıcılar seçildiğinde kayıtlı push tokenı olan aktif kullanıcılara gönderim yapılır. Tekil gönderimde kullanıcı UUID değeri kullanılır.
          </div>
        </div>
      </aside>
      </div>
    </div>
  );
}
