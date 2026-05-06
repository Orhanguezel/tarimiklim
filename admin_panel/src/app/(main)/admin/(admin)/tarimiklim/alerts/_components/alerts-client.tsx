'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { weatherAdminAlertsApi } from '@/lib/weather-admin-api';

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

export default function AlertsClient() {
  const [items, setItems] = useState<AlertRow[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const data = (await weatherAdminAlertsApi.list({ page, limit })) as {
      data?: { items?: AlertRow[]; total?: number };
    };
    setItems(data.data?.items ?? []);
    setTotal(data.data?.total ?? 0);
  }, [page]);

  useEffect(() => {
    load()
      .catch(() => toast.error('Uyarılar yüklenemedi'))
      .finally(() => setLoading(false));
  }, [load]);

  const pages = Math.max(1, Math.ceil(total / limit));

  if (loading && items.length === 0) {
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
          <h1 className="font-serif text-4xl text-gm-text">Uyarı geçmişi</h1>
          <p className="text-gm-muted text-sm font-serif italic max-w-xl">
            Toplam: {total}
          </p>
        </div>
      </div>
      <div className="rounded-[32px] border border-gm-border-soft bg-gm-surface/20 backdrop-blur-sm overflow-hidden shadow-xl p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>Tip</TableHead>
              <TableHead>Önem</TableHead>
              <TableHead>Başlık</TableHead>
              <TableHead>Gönderim</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((row) => (
              <TableRow key={row.id} className="align-top">
                <TableCell className="whitespace-nowrap text-xs">{row.forecastDate}</TableCell>
                <TableCell>{row.alertType}</TableCell>
                <TableCell>{row.severity}</TableCell>
                <TableCell className="max-w-xs truncate" title={row.title}>
                  {row.title}
                </TableCell>
                <TableCell className="text-xs">
                  {row.sentAt ? `${row.sentAt} · ${row.recipients ?? 0} alıcı` : 'Bekliyor'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end gap-3 text-sm">
        <Button type="button" variant="outline" size="sm" className="rounded-full border-gm-border-soft bg-gm-surface/20 hover:bg-gm-surface hover:text-gm-gold font-bold tracking-widest uppercase text-[10px] px-6 h-10" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Önceki
        </Button>
        <span className="font-mono text-gm-gold uppercase tracking-widest text-[10px]">
          Sayfa {page} / {pages}
        </span>
        <Button type="button" variant="outline" size="sm" className="rounded-full border-gm-border-soft bg-gm-surface/20 hover:bg-gm-surface hover:text-gm-gold font-bold tracking-widest uppercase text-[10px] px-6 h-10" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
          Sonraki
        </Button>
      </div>
    </div>
  );
}
