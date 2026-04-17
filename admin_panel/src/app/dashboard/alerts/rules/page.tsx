'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { alertsApi, locationsApi } from '@/lib/api';

type Rule = {
  id: string;
  userId: string;
  locationId: string;
  alertType: string;
  threshold: string;
  channel: string;
  isActive: number;
};

type Loc = { id: string; name: string };

export default function AlertRulesPage() {
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
    const [rRes, lRes] = await Promise.all([
      alertsApi.listRules({ all: true }),
      locationsApi.list({ limit: 100 }),
    ]);
    const rPayload = rRes.data as { data?: Rule[] };
    setRules(Array.isArray(rPayload.data) ? rPayload.data : []);
    const lPayload = lRes.data as { data?: { items?: Loc[] } };
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
      await alertsApi.createRule({
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
      await alertsApi.deleteRule(id);
      toast.success('Silindi');
      await load();
    } catch {
      toast.error('Silinemedi');
    }
  }

  if (loading && rules.length === 0) {
    return <p className="text-[var(--color-text-secondary)]">Yükleniyor...</p>;
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Uyarı kuralları</h1>
      <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
        Kurallar oturum açmış yönetici kullanıcıya bağlanır. Kanal: Telegram, push (FCM) veya e-posta.
      </p>

      <div className="mb-8 overflow-x-auto rounded-lg border border-[var(--color-border)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]">
            <tr>
              <th className="px-3 py-2">Konum</th>
              <th className="px-3 py-2">Tip</th>
              <th className="px-3 py-2">Eşik</th>
              <th className="px-3 py-2">Kanal</th>
              <th className="px-3 py-2">Aktif</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {rules.map((row) => (
              <tr key={row.id} className="border-b border-[var(--color-border)]">
                <td className="px-3 py-2 font-mono text-xs">{row.locationId.slice(0, 8)}…</td>
                <td className="px-3 py-2">{row.alertType}</td>
                <td className="px-3 py-2">{row.threshold}</td>
                <td className="px-3 py-2">{row.channel}</td>
                <td className="px-3 py-2">{row.isActive ? 'Evet' : 'Hayır'}</td>
                <td className="px-3 py-2">
                  <button type="button" className="text-red-600 underline" onClick={() => void onDelete(row.id)}>
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-2 text-lg font-medium">Yeni kural</h2>
      <form onSubmit={(e) => void onCreate(e)} className="max-w-md space-y-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-4">
        <label className="block text-sm">
          Konum
          <select
            className="mt-1 w-full rounded border border-[var(--color-border)] px-2 py-1"
            value={form.locationId}
            onChange={(ev) => setForm((f) => ({ ...f, locationId: ev.target.value }))}
            required
          >
            <option value="">—</option>
            {locs.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Uyarı tipi
          <select
            className="mt-1 w-full rounded border border-[var(--color-border)] px-2 py-1"
            value={form.alertType}
            onChange={(ev) =>
              setForm((f) => ({
                ...f,
                alertType: ev.target.value as typeof form.alertType,
              }))
            }
          >
            <option value="frost">Don (frost)</option>
            <option value="heavy_rain">Şiddetli yağış</option>
            <option value="storm">Fırtına</option>
            <option value="heat">Sıcak</option>
            <option value="humidity">Nem</option>
          </select>
        </label>
        <label className="block text-sm">
          Eşik (ör. don riski 0–100)
          <input
            className="mt-1 w-full rounded border border-[var(--color-border)] px-2 py-1"
            value={form.threshold}
            onChange={(ev) => setForm((f) => ({ ...f, threshold: ev.target.value }))}
            required
          />
        </label>
        <label className="block text-sm">
          Kanal
          <select
            className="mt-1 w-full rounded border border-[var(--color-border)] px-2 py-1"
            value={form.channel}
            onChange={(ev) =>
              setForm((f) => ({
                ...f,
                channel: ev.target.value as typeof form.channel,
              }))
            }
          >
            <option value="telegram">Telegram</option>
            <option value="push">Push (FCM)</option>
            <option value="email">E-posta</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(ev) => setForm((f) => ({ ...f, isActive: ev.target.checked }))}
          />
          Aktif
        </label>
        <button type="submit" className="rounded bg-[var(--color-brand)] px-4 py-2 text-white">
          Kural ekle
        </button>
      </form>
    </div>
  );
}
