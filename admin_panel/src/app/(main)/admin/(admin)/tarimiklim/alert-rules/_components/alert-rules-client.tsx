'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { weatherAdminAlertsApi, weatherAdminLocationsApi } from '@/lib/weather-admin-api';

type Rule = {
  id: string;
  userId: string;
  locationId: string;
  alertType: string;
  threshold: string;
  channel: string;
  isActive: number;
  userEmail?: string | null;
  userFullName?: string | null;
  telegramChatId?: string | null;
};

type Loc = { id: string; name: string };

export default function AlertRulesClient() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [locs, setLocs] = useState<Loc[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    locationId: '',
    alertType: 'frost' as 'frost' | 'heavy_rain' | 'storm' | 'heat' | 'humidity',
    threshold: '30',
    channel: 'telegram' as 'telegram' | 'push' | 'email',
    isActive: true,
  });

  const load = useCallback(async () => {
    const [rData, lData] = await Promise.all([
      weatherAdminAlertsApi.listRules({ all: true }),
      weatherAdminLocationsApi.list({ limit: 100 }),
    ]);
    const rPayload = rData as { data?: Rule[] };
    setRules(Array.isArray(rPayload.data) ? rPayload.data : []);
    const lPayload = lData as { data?: { items?: Loc[] } };
    const items = lPayload.data?.items ?? [];
    setLocs(items.map((x) => ({ id: x.id, name: x.name })));
  }, []);

  useEffect(() => {
    load()
      .catch(() => toast.error('Kurallar yüklenemedi'))
      .finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    if (locs.length === 0) return;
    setForm((f) => (f.locationId ? f : { ...f, locationId: locs[0].id }));
  }, [locs]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.locationId) {
      toast.error('Konum seçin');
      return;
    }
    try {
      await weatherAdminAlertsApi.createRule({
        locationId: form.locationId,
        alertType: form.alertType,
        threshold: form.threshold,
        channel: form.channel,
        isActive: form.isActive,
      });
      toast.success('Kural eklendi');
      await load();
    } catch {
      toast.error('Kural eklenemedi');
    }
  }

  async function onDelete(id: string) {
    if (!confirm('Bu kuralı silmek istiyor musunuz?')) return;
    try {
      await weatherAdminAlertsApi.deleteRule(id);
      toast.success('Silindi');
      await load();
    } catch {
      toast.error('Silinemedi');
    }
  }

  if (loading && rules.length === 0) {
    return <p className="text-sm text-muted-foreground">Yükleniyor...</p>;
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-gm-gold" />
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">Sistem</span>
          </div>
          <h1 className="font-serif text-4xl text-gm-text">Uyarı kuralları</h1>
          <p className="text-gm-muted text-sm font-serif italic max-w-xl">
            Kurallar oturum açmış yönetici kullanıcıya bağlanır. Kanal: Telegram, push (FCM) veya e-posta.
          </p>
        </div>
      </div>

      <div className="rounded-[32px] border border-gm-border-soft bg-gm-surface/20 backdrop-blur-sm overflow-hidden shadow-xl p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Konum</TableHead>
              <TableHead>Kullanıcı</TableHead>
              <TableHead>Tip</TableHead>
              <TableHead>Eşik</TableHead>
              <TableHead>Kanal</TableHead>
              <TableHead>Aktif</TableHead>
              <TableHead className="w-24 text-right">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-xs">{row.locationId.slice(0, 8)}…</TableCell>
                <TableCell className="max-w-[220px] truncate">
                  {row.userEmail ?? row.userFullName ?? row.userId.slice(0, 8)}
                  {row.telegramChatId ? <span className="ml-2 text-xs text-muted-foreground">TG</span> : null}
                </TableCell>
                <TableCell>{row.alertType}</TableCell>
                <TableCell>{row.threshold}</TableCell>
                <TableCell>{row.channel}</TableCell>
                <TableCell>{row.isActive ? 'Evet' : 'Hayır'}</TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 text-destructive"
                    onClick={() => void onDelete(row.id)}
                  >
                    Sil
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="max-w-md space-y-4 rounded-xl border border-gm-border-soft p-6">
        <h2 className="font-medium">Yeni kural</h2>
        <form onSubmit={(e) => void onCreate(e)} className="space-y-4">
          <div className="space-y-2">
            <Label>Konum</Label>
            <Select value={form.locationId || undefined} onValueChange={(v) => setForm((f) => ({ ...f, locationId: v }))}>
              <SelectTrigger>
                <SelectValue placeholder={locs.length ? 'Konum seçin' : 'Önce konum ekleyin'} />
              </SelectTrigger>
              <SelectContent>
                {locs.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Uyarı tipi</Label>
            <Select
              value={form.alertType}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, alertType: v as typeof form.alertType }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="frost">Don (frost)</SelectItem>
                <SelectItem value="heavy_rain">Şiddetli yağış</SelectItem>
                <SelectItem value="storm">Fırtına</SelectItem>
                <SelectItem value="heat">Sıcak</SelectItem>
                <SelectItem value="humidity">Nem</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rule-threshold">Eşik (ör. don riski 0–100)</Label>
            <Input
              id="rule-threshold"
              value={form.threshold}
              onChange={(ev) => setForm((f) => ({ ...f, threshold: ev.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Kanal</Label>
            <Select
              value={form.channel}
              onValueChange={(v) => setForm((f) => ({ ...f, channel: v as typeof form.channel }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="telegram">Telegram</SelectItem>
                <SelectItem value="push">Push (FCM)</SelectItem>
                <SelectItem value="email">E-posta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="rule-active"
              checked={form.isActive}
              onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: Boolean(v) }))}
            />
            <Label htmlFor="rule-active" className="font-normal">
              Aktif
            </Label>
          </div>
          <Button type="submit">Kural ekle</Button>
        </form>
      </div>
    </div>
  );
}
