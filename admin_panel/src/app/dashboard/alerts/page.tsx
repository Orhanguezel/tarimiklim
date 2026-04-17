'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { alertsApi } from '@/lib/api';

type AlertRow = {
  id: string;
  locationId: string;
  alertType: string;
  severity: string;
  title: string;
  message: string;
  forecastDate: string;
  sentAt: string | null;
  recipients: number | null;
  createdAt: string | null;
};

export default function AlertsPage() {
  const [items, setItems] = useState<AlertRow[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await alertsApi.list({ page, limit });
    const payload = res.data as { data?: { items?: AlertRow[]; total?: number } };
    setItems(payload.data?.items ?? []);
    setTotal(payload.data?.total ?? 0);
  }, [page]);

  useEffect(() => {
    load()
      .catch(() => toast.error('Uyarılar yüklenemedi'))
      .finally(() => setLoading(false));
  }, [load]);

  const pages = Math.max(1, Math.ceil(total / limit));

  if (loading && items.length === 0) {
    return <p className="text-[var(--color-text-secondary)]">Yükleniyor...</p>;
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Uyarı geçmişi</h1>
      <p className="mb-4 text-sm text-[var(--color-text-secondary)]">Toplam: {total}</p>
      <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]">
            <tr>
              <th className="px-3 py-2">Tarih</th>
              <th className="px-3 py-2">Tip</th>
              <th className="px-3 py-2">Önem</th>
              <th className="px-3 py-2">Başlık</th>
              <th className="px-3 py-2">Gönderim</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id} className="border-b border-[var(--color-border)] align-top">
                <td className="px-3 py-2 whitespace-nowrap text-xs">{row.forecastDate}</td>
                <td className="px-3 py-2">{row.alertType}</td>
                <td className="px-3 py-2">{row.severity}</td>
                <td className="max-w-xs truncate px-3 py-2" title={row.title}>
                  {row.title}
                </td>
                <td className="px-3 py-2 text-xs">
                  {row.sentAt ? `${row.sentAt} · ${row.recipients ?? 0} alıcı` : 'Bekliyor'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center gap-3 text-sm">
        <button
          type="button"
          disabled={page <= 1}
          className="rounded border border-[var(--color-border)] px-3 py-1 disabled:opacity-40"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Önceki
        </button>
        <span>
          Sayfa {page} / {pages}
        </span>
        <button
          type="button"
          disabled={page >= pages}
          className="rounded border border-[var(--color-border)] px-3 py-1 disabled:opacity-40"
          onClick={() => setPage((p) => p + 1)}
        >
          Sonraki
        </button>
      </div>
    </div>
  );
}
