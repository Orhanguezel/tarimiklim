'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { weatherAdminAlertsApi, weatherAdminLocationsApi } from '@/lib/weather-admin-api';

type Loc = {
  id: string;
  name: string;
  slug: string;
  latitude: string;
  longitude: string;
  city?: string | null;
  isActive: number;
};

const emptyForm = {
  name: '',
  slug: '',
  latitude: '41.0082',
  longitude: '28.9784',
  city: '',
  isActive: true,
};

export default function LocationsClient() {
  const [items, setItems] = useState<Loc[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [frostBusy, setFrostBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = (await weatherAdminLocationsApi.list({ limit: 100 })) as {
      data?: { items?: Loc[] };
    };
    setItems(data.data?.items ?? []);
  }, []);

  useEffect(() => {
    load()
      .catch(() => toast.error('Konumlar yüklenemedi'))
      .finally(() => setLoading(false));
  }, [load]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const body = {
        name: form.name,
        slug: form.slug,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        city: form.city || undefined,
        isActive: form.isActive,
      };
      if (editingId) {
        await weatherAdminLocationsApi.update(editingId, body);
        toast.success('Konum güncellendi');
      } else {
        await weatherAdminLocationsApi.create(body);
        toast.success('Konum eklendi');
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch {
      toast.error(editingId ? 'Güncelleme başarısız' : 'Kayıt başarısız (slug benzersiz mi?)');
    }
  }

  function startEdit(row: Loc) {
    setEditingId(row.id);
    setForm({
      name: row.name,
      slug: row.slug,
      latitude: String(row.latitude),
      longitude: String(row.longitude),
      city: row.city ?? '',
      isActive: Boolean(row.isActive),
    });
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function onDelete(id: string) {
    if (!confirm('Bu konumu silmek istiyor musunuz?')) return;
    try {
      await weatherAdminLocationsApi.delete(id);
      toast.success('Silindi');
      await load();
    } catch {
      toast.error('Silinemedi');
    }
  }

  async function onFrostCheck(id: string) {
    setFrostBusy(id);
    try {
      const res = (await weatherAdminAlertsApi.triggerFrostCheck(id)) as {
        data?: { sent?: boolean; reason?: string };
      };
      const inner = res.data;
      if (inner?.sent) toast.success('Don kontrolü tamamlandı, uyarı gönderildi');
      else toast.message(`Gönderilmedi: ${inner?.reason ?? 'bilinmiyor'}`);
    } catch {
      toast.error('Don kontrolü başarısız');
    } finally {
      setFrostBusy(null);
    }
  }

  if (loading) {
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
          <h1 className="font-serif text-4xl text-gm-text">Konumlar</h1>
        </div>
      </div>

      <div className="rounded-[32px] border border-gm-border-soft bg-gm-surface/20 backdrop-blur-sm overflow-hidden shadow-xl p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Koordinat</TableHead>
              <TableHead>Aktif</TableHead>
              <TableHead className="text-right">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell className="font-mono text-xs">{row.slug}</TableCell>
                <TableCell className="text-xs">
                  {row.latitude}, {row.longitude}
                </TableCell>
                <TableCell>{row.isActive ? 'Evet' : 'Hayır'}</TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 text-gm-gold"
                    disabled={frostBusy === row.id}
                    onClick={() => void onFrostCheck(row.id)}
                  >
                    {frostBusy === row.id ? '...' : 'Don kontrolü'}
                  </Button>
                  <Button type="button" variant="link" className="h-auto p-0" onClick={() => startEdit(row)}>
                    Düzenle
                  </Button>
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
        <h2 className="font-medium">{editingId ? 'Konumu düzenle' : 'Yeni konum'}</h2>
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loc-name">Ad</Label>
            <Input
              id="loc-name"
              value={form.name}
              onChange={(ev) => setForm((f) => ({ ...f, name: ev.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loc-slug">Slug (küçük harf, tire)</Label>
            <Input
              id="loc-slug"
              className="font-mono"
              value={form.slug}
              onChange={(ev) => setForm((f) => ({ ...f, slug: ev.target.value }))}
              required
              pattern="[a-z0-9-]+"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="loc-lat">Enlem</Label>
              <Input
                id="loc-lat"
                type="number"
                step="any"
                value={form.latitude}
                onChange={(ev) => setForm((f) => ({ ...f, latitude: ev.target.value }))}
                required
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="loc-lon">Boylam</Label>
              <Input
                id="loc-lon"
                type="number"
                step="any"
                value={form.longitude}
                onChange={(ev) => setForm((f) => ({ ...f, longitude: ev.target.value }))}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="loc-city">İl (isteğe bağlı)</Label>
            <Input
              id="loc-city"
              value={form.city}
              onChange={(ev) => setForm((f) => ({ ...f, city: ev.target.value }))}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="loc-active"
              checked={form.isActive}
              onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: Boolean(v) }))}
            />
            <Label htmlFor="loc-active" className="font-normal">
              Aktif
            </Label>
          </div>
          <div className="flex gap-2">
            <Button type="submit">{editingId ? 'Güncelle' : 'Kaydet'}</Button>
            {editingId ? (
              <Button type="button" variant="outline" onClick={cancelEdit}>
                İptal
              </Button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
