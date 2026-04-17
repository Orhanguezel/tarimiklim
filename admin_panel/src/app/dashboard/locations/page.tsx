'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { alertsApi, locationsApi } from '@/lib/api';

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

export default function LocationsPage() {
  const [items, setItems] = useState<Loc[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [frostBusy, setFrostBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await locationsApi.list({ limit: 100 });
    const payload = res.data as { data?: { items?: Loc[] } };
    setItems(payload.data?.items ?? []);
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
        await locationsApi.update(editingId, body);
        toast.success('Konum güncellendi');
      } else {
        await locationsApi.create(body);
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
      await locationsApi.delete(id);
      toast.success('Silindi');
      await load();
    } catch {
      toast.error('Silinemedi');
    }
  }

  async function onFrostCheck(id: string) {
    setFrostBusy(id);
    try {
      const res = await alertsApi.triggerFrostCheck(id);
      const d = res.data as { data?: { sent?: boolean; reason?: string } };
      const inner = d.data;
      if (inner?.sent) toast.success('Don kontrolü tamamlandı, uyarı gönderildi');
      else toast.message(`Gönderilmedi: ${inner?.reason ?? 'bilinmiyor'}`);
    } catch {
      toast.error('Don kontrolü başarısız');
    } finally {
      setFrostBusy(null);
    }
  }

  if (loading) {
    return <p className="text-[var(--color-text-secondary)]">Yükleniyor...</p>;
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Konumlar</h1>
      <div className="mb-8 overflow-x-auto rounded-lg border border-[var(--color-border)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]">
            <tr>
              <th className="px-3 py-2">Ad</th>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2">Koordinat</th>
              <th className="px-3 py-2">Aktif</th>
              <th className="px-3 py-2">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id} className="border-b border-[var(--color-border)]">
                <td className="px-3 py-2">{row.name}</td>
                <td className="px-3 py-2 font-mono text-xs">{row.slug}</td>
                <td className="px-3 py-2 text-xs">
                  {row.latitude}, {row.longitude}
                </td>
                <td className="px-3 py-2">{row.isActive ? 'Evet' : 'Hayır'}</td>
                <td className="space-x-2 px-3 py-2">
                  <button
                    type="button"
                    className="text-[var(--color-brand)] underline"
                    disabled={frostBusy === row.id}
                    onClick={() => void onFrostCheck(row.id)}
                  >
                    {frostBusy === row.id ? '...' : 'Don kontrolü'}
                  </button>
                  <button type="button" className="text-slate-600 underline" onClick={() => startEdit(row)}>
                    Düzenle
                  </button>
                  <button
                    type="button"
                    className="text-red-600 underline"
                    onClick={() => void onDelete(row.id)}
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-2 text-lg font-medium">{editingId ? 'Konumu düzenle' : 'Yeni konum'}</h2>
      <form onSubmit={(e) => void onSubmit(e)} className="max-w-md space-y-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-4">
        <label className="block text-sm">
          Ad
          <input
            className="mt-1 w-full rounded border border-[var(--color-border)] px-2 py-1"
            value={form.name}
            onChange={(ev) => setForm((f) => ({ ...f, name: ev.target.value }))}
            required
          />
        </label>
        <label className="block text-sm">
          Slug (küçük harf, tire)
          <input
            className="mt-1 w-full rounded border border-[var(--color-border)] px-2 py-1 font-mono"
            value={form.slug}
            onChange={(ev) => setForm((f) => ({ ...f, slug: ev.target.value }))}
            required
            pattern="[a-z0-9-]+"
          />
        </label>
        <div className="flex gap-2">
          <label className="block flex-1 text-sm">
            Enlem
            <input
              type="number"
              step="any"
              className="mt-1 w-full rounded border border-[var(--color-border)] px-2 py-1"
              value={form.latitude}
              onChange={(ev) => setForm((f) => ({ ...f, latitude: ev.target.value }))}
              required
            />
          </label>
          <label className="block flex-1 text-sm">
            Boylam
            <input
              type="number"
              step="any"
              className="mt-1 w-full rounded border border-[var(--color-border)] px-2 py-1"
              value={form.longitude}
              onChange={(ev) => setForm((f) => ({ ...f, longitude: ev.target.value }))}
              required
            />
          </label>
        </div>
        <label className="block text-sm">
          İl (isteğe bağlı)
          <input
            className="mt-1 w-full rounded border border-[var(--color-border)] px-2 py-1"
            value={form.city}
            onChange={(ev) => setForm((f) => ({ ...f, city: ev.target.value }))}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(ev) => setForm((f) => ({ ...f, isActive: ev.target.checked }))}
          />
          Aktif
        </label>
        <div className="flex gap-2">
          <button type="submit" className="rounded bg-[var(--color-brand)] px-4 py-2 text-white">
            {editingId ? 'Güncelle' : 'Kaydet'}
          </button>
          {editingId ? (
            <button type="button" className="rounded border border-[var(--color-border)] px-4 py-2" onClick={cancelEdit}>
              İptal
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
