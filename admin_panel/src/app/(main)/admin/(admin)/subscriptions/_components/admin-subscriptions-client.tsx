'use client';

import * as React from 'react';
import { RefreshCcw, Search, Undo2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import type { TranslateFn } from '@/i18n';
import {
  useListSubscriptionsAdminQuery,
  useRefundSubscriptionAdminMutation,
} from '@/integrations/hooks';
import type { AdminSubscriptionStatus } from '@/integrations/shared';

type StatusFilter = AdminSubscriptionStatus | 'all';

const STATUSES: StatusFilter[] = ['all', 'pending', 'active', 'cancelled', 'expired', 'grace_period', 'past_due'];

function fmtDate(value: string | null | undefined) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('tr-TR');
}

function statusVariant(status: AdminSubscriptionStatus) {
  if (status === 'active') return 'default' as const;
  if (status === 'cancelled') return 'destructive' as const;
  return 'secondary' as const;
}

function moneyFromMinor(amount: number, currency: string) {
  const n = Number(amount || 0) / 100;
  if (!Number.isFinite(n)) return `${currency}`;
  return `${n.toFixed(2)} ${currency}`;
}

function resolvePlanName(item: { plan_name_tr: string | null; plan_name_en: string | null; plan_code: string | null }) {
  return item.plan_name_tr || item.plan_name_en || item.plan_code || '-';
}

function resolveUser(item: { user_full_name: string | null; user_email: string | null; user_id: string }) {
  return item.user_full_name || item.user_email || item.user_id;
}

function statusLabel(t: TranslateFn, status: StatusFilter) {
  return status === 'all' ? t('statuses.all') : t(`statuses.${status}` as string);
}

export default function AdminSubscriptionsClient() {
  const t = useAdminT('admin.subscriptions');
  const [status, setStatus] = React.useState<StatusFilter>('all');
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const limit = 20;
  const offset = (page - 1) * limit;

  const list = useListSubscriptionsAdminQuery({
    limit,
    offset,
    status: status === 'all' ? undefined : status,
    q: search || undefined,
  });

  const [refund, refundState] = useRefundSubscriptionAdminMutation();

  const rows = list.data?.data ?? [];
  const total = list.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  async function doRefund(id: string) {
    const reason = window.prompt(t('actions.refundReasonPrompt'));
    if (reason === null) return;
    try {
      await refund({ id, body: { reason: reason.trim() } }).unwrap();
      toast.success(t('toasts.refundSuccess'));
    } catch {
      toast.error(t('toasts.refundFailed'));
    }
  }

  function doSearch() {
    setSearch(searchInput.trim());
    setPage(1);
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-gm-gold" />
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">{t('list.badge', null, 'Abonelik Sistemi')}</span>
          </div>
          <h1 className="font-serif text-4xl text-gm-text">{t('title')}</h1>
          <p className="text-gm-muted text-sm font-serif italic max-w-xl">
            {t('description')}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => list.refetch()} 
            disabled={list.isFetching}
            className="rounded-full border-gm-border-soft px-8 h-12 bg-gm-surface/20 hover:bg-gm-surface transition-all font-bold tracking-widest uppercase text-[10px]"
          >
            <RefreshCcw className={`mr-2 size-4 ${list.isFetching ? 'animate-spin' : ''}`} />
            {t('actions.refresh')}
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="bg-gm-surface/30 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-md shadow-2xl">
        <CardContent className="p-8 grid gap-8 md:grid-cols-3 items-end">
          <div className="space-y-3">
            <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">{t('filters.status')}</Label>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as StatusFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gm-bg border-gm-border-soft rounded-2xl">
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabel(t, s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 md:col-span-2">
            <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">{t('filters.search')}</Label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gm-muted/60" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && doSearch()}
                placeholder={t('filters.searchPlaceholder')}
                className="pl-12 bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm"
              />
              <Button 
                variant="ghost" 
                onClick={doSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl text-gm-gold hover:bg-gm-gold/10 hover:text-gm-gold font-bold tracking-widest uppercase text-[10px]"
              >
                {t('actions.search')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gm-surface/40">
              <TableRow className="border-gm-border-soft hover:bg-transparent">
                <TableHead className="py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('table.user')}</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('table.plan')}</TableHead>
                <TableHead className="py-6 text-center text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('table.status')}</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('table.provider')}</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('table.price')}</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('table.started')}</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('table.ends')}</TableHead>
                <TableHead className="py-6 px-8 text-right text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!list.isLoading && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <CreditCard className="w-16 h-16 text-gm-gold/50" />
                      <span className="font-serif italic text-lg text-gm-muted">{t('table.noRecords')}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : null}

              {rows.map((item) => (
                <TableRow key={item.id} className="border-gm-border-soft hover:bg-gm-primary/[0.03] transition-colors group">
                  <TableCell className="py-6 px-8">
                    <div className="font-serif text-lg text-gm-text flex items-center gap-2 group-hover:text-gm-primary transition-colors">
                      {resolveUser(item)}
                    </div>
                    <div className="text-[10px] text-gm-muted font-mono opacity-60 uppercase tracking-tighter mt-1">{item.user_phone || '-'}</div>
                  </TableCell>
                  <TableCell className="py-6 font-serif text-base text-gm-text">{resolvePlanName(item)}</TableCell>
                  <TableCell className="py-6 text-center">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                      item.status === 'active' ? 'bg-gm-success/10 text-gm-success' : 
                      item.status === 'cancelled' ? 'bg-gm-error/10 text-gm-error' : 
                      'bg-gm-gold/10 text-gm-gold'
                    }`}>
                      <div className={`w-1 h-1 rounded-full ${
                        item.status === 'active' ? 'bg-gm-success' : 
                        item.status === 'cancelled' ? 'bg-gm-error' : 
                        'bg-gm-gold'
                      }`} />
                      {statusLabel(t, item.status)}
                    </div>
                  </TableCell>
                  <TableCell className="py-6 text-xs text-gm-muted font-mono uppercase tracking-widest opacity-80">{item.provider}</TableCell>
                  <TableCell className="py-6 text-sm font-bold text-gm-text">{moneyFromMinor(item.price_minor, item.currency)}</TableCell>
                  <TableCell className="py-6 text-xs text-gm-muted font-mono">{fmtDate(item.started_at)}</TableCell>
                  <TableCell className="py-6 text-xs text-gm-muted font-mono">{fmtDate(item.ends_at)}</TableCell>
                  <TableCell className="py-6 px-8 text-right">
                    <div className="flex justify-end opacity-20 group-hover:opacity-100 transition-all">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => doRefund(item.id)}
                        disabled={refundState.isLoading || item.status === 'cancelled'}
                        className="rounded-full border-gm-border-soft hover:bg-gm-gold/10 hover:text-gm-gold hover:border-gm-gold/30 transition-all font-bold tracking-widest uppercase text-[9px]"
                      >
                        <Undo2 className="mr-2 size-3" />
                        {t('actions.refund')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-8">
        <div className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase bg-gm-surface/30 px-6 py-3 rounded-full border border-gm-border-soft">
          {t('listTitle')} ({total}) — {t('pagination.page', { page, totalPages })}
        </div>

        <div className="flex gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || list.isLoading} 
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-full border-gm-border-soft px-8 h-12 hover:bg-gm-surface transition-all text-[10px] font-bold tracking-widest uppercase"
          >
            {t('pagination.prev')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || list.isLoading} 
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full border-gm-border-soft px-8 h-12 hover:bg-gm-surface transition-all text-[10px] font-bold tracking-widest uppercase"
          >
            {t('pagination.next')}
          </Button>
        </div>
      </div>
    </div>
  );
}
