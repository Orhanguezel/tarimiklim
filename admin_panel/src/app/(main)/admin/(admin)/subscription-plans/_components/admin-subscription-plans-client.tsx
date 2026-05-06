'use client';

import * as React from 'react';
import { Plus, RefreshCcw, Save, Trash2, Pencil, Receipt } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  useCreateSubscriptionPlanAdminMutation,
  useDeleteSubscriptionPlanAdminMutation,
  useListSubscriptionPlansAdminQuery,
  useUpdateSubscriptionPlanAdminMutation,
} from '@/integrations/hooks';
import type {
  SubscriptionPlanAdmin,
  SubscriptionPlanAdminPayload,
  SubscriptionPlanAdminUpdatePayload,
  SubscriptionPlanPeriod,
} from '@/integrations/shared';

type PlanFormValues = {
  code: string;
  name_tr: string;
  name_en: string;
  description_tr: string;
  description_en: string;
  currency: string;
  period: SubscriptionPlanPeriod;
  trial_days: string;
  price_minor: string;
  features: string;
  is_active: boolean;
  display_order: string;
};

const PERIODS: SubscriptionPlanPeriod[] = ['monthly', 'yearly', 'lifetime'];

function emptyForm(): PlanFormValues {
  return {
    code: '',
    name_tr: '',
    name_en: '',
    description_tr: '',
    description_en: '',
    currency: 'TRY',
    period: 'monthly',
    trial_days: '0',
    price_minor: '0',
    features: '',
    is_active: true,
    display_order: '0',
  };
}

function toPayload(v: PlanFormValues): SubscriptionPlanAdminPayload {
  return {
    code: v.code.trim(),
    name_tr: v.name_tr.trim(),
    name_en: v.name_en.trim(),
    description_tr: v.description_tr.trim() || null,
    description_en: v.description_en.trim() || null,
    currency: v.currency.trim() || 'TRY',
    period: v.period,
    trial_days: Number(v.trial_days || 0),
    price_minor: Number(v.price_minor || 0),
    features: v.features
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean),
    is_active: v.is_active ? 1 : 0,
    display_order: Number(v.display_order || 0),
  };
}

function toPatchPayload(v: PlanFormValues): SubscriptionPlanAdminUpdatePayload {
  return {
    ...toPayload(v),
    code: v.code.trim(),
  };
}

function hydrateForm(row: SubscriptionPlanAdmin): PlanFormValues {
  return {
    code: row.code,
    name_tr: row.name_tr,
    name_en: row.name_en,
    description_tr: row.description_tr || '',
    description_en: row.description_en || '',
    currency: row.currency,
    period: row.period,
    trial_days: String(row.trial_days || 0),
    price_minor: String(row.price_minor || 0),
    features: Array.isArray(row.features)
      ? row.features.join(', ')
      : typeof row.features === 'string'
        ? row.features
        : '',
    is_active: Boolean(row.is_active),
    display_order: String(row.display_order || 0),
  };
}

function formatPriceMinor(value: string) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return '-';
  return `${(n / 100).toFixed(2)} TL`;
}

export default function AdminSubscriptionPlansClient() {
  const list = useListSubscriptionPlansAdminQuery({ limit: 200 });
  const [createPlan] = useCreateSubscriptionPlanAdminMutation();
  const [updatePlan] = useUpdateSubscriptionPlanAdminMutation();
  const [deletePlan] = useDeleteSubscriptionPlanAdminMutation();

  const [form, setForm] = React.useState<PlanFormValues>(emptyForm);
  const [editingId, setEditingId] = React.useState<string>('');

  const plans = list.data?.data ?? [];

  function setField<K extends keyof PlanFormValues>(key: K, value: PlanFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function startEdit(row: SubscriptionPlanAdmin) {
    setEditingId(row.id);
    setForm(hydrateForm(row));
  }

  function resetForm() {
    setEditingId('');
    setForm(emptyForm());
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      if (!form.code.trim() || !form.name_tr.trim() || !form.name_en.trim()) {
        toast.error('Code and names are required.');
        return;
      }
      if (!editingId) {
        await createPlan(toPayload(form)).unwrap();
        toast.success('Plan created.');
      } else {
        await updatePlan({ id: editingId, body: toPatchPayload(form) }).unwrap();
        toast.success('Plan updated.');
      }
      resetForm();
    } catch (err) {
      toast.error('Failed to save plan.');
      console.error(err);
    }
  }

  async function removePlan(id: string) {
    if (!window.confirm('Delete this plan? This action cannot be undone.')) return;
    try {
      await deletePlan({ id }).unwrap();
      toast.success('Plan deleted.');
      if (editingId === id) resetForm();
    } catch {
      toast.error('Could not delete plan. It may be in use.');
    }
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-gm-gold" />
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">Abonelik Planları</span>
          </div>
          <h1 className="font-serif text-4xl text-gm-text">Plan Yönetimi</h1>
          <p className="text-gm-muted text-sm font-serif italic max-w-xl">
            Sistemdeki abonelik planlarını ekleyin, güncelleyin ve arşivleyin.
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
            Yenile
          </Button>
        </div>
      </div>

      <Card className="bg-gm-surface/30 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-md shadow-2xl">
        <CardContent className="p-8">
          <div className="mb-6 space-y-1">
            <h2 className="text-lg font-serif font-bold text-gm-text">{editingId ? 'Planı Düzenle' : 'Yeni Plan'}</h2>
            <p className="text-xs text-gm-muted">Plan detaylarını yapılandırın.</p>
          </div>

          <form className="grid gap-6 md:grid-cols-3" onSubmit={onSubmit}>
            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">KOD</Label>
              <Input value={form.code} onChange={(e) => setField('code', e.target.value)} placeholder="gold_monthly" className="bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm" />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">İsim (TR)</Label>
              <Input value={form.name_tr} onChange={(e) => setField('name_tr', e.target.value)} placeholder="Aylık Abonelik" className="bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm" />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">İsim (EN)</Label>
              <Input value={form.name_en} onChange={(e) => setField('name_en', e.target.value)} placeholder="Monthly Plan" className="bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm" />
            </div>

            <div className="space-y-3 md:col-span-2">
              <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">Açıklama (TR)</Label>
              <Textarea rows={2} value={form.description_tr} onChange={(e) => setField('description_tr', e.target.value)} className="bg-gm-surface/40 border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 text-sm" />
            </div>
            <div className="space-y-3 md:col-span-1">
              <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">Açıklama (EN)</Label>
              <Textarea rows={2} value={form.description_en} onChange={(e) => setField('description_en', e.target.value)} className="bg-gm-surface/40 border-gm-border-soft rounded-2xl focus:ring-gm-gold/50 text-sm" />
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">Para Birimi</Label>
              <Input value={form.currency} onChange={(e) => setField('currency', e.target.value.toUpperCase())} className="bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm" />
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">Periyot</Label>
              <select
                value={form.period}
                onChange={(e) => setField('period', e.target.value as SubscriptionPlanPeriod)}
                className="w-full bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm px-3 appearance-none text-gm-text outline-none"
              >
                {PERIODS.map((p) => (
                  <option key={p} value={p} className="bg-gm-bg">
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">Fiyat (Kuruş)</Label>
              <Input
                type="number"
                value={form.price_minor}
                onChange={(e) => setField('price_minor', e.target.value)}
                placeholder="1999"
                className="bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm"
              />
              <p className="text-[10px] text-gm-muted tracking-widest pl-1 mt-1 font-mono uppercase">Görünüm: {formatPriceMinor(form.price_minor)}</p>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">Deneme Süresi (Gün)</Label>
              <Input
                type="number"
                value={form.trial_days}
                onChange={(e) => setField('trial_days', e.target.value)}
                className="bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">Sıralama</Label>
              <Input
                type="number"
                value={form.display_order}
                onChange={(e) => setField('display_order', e.target.value)}
                className="bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">Özellikler (Virgülle ayrılmış)</Label>
              <Input
                value={form.features}
                onChange={(e) => setField('features', e.target.value)}
                placeholder="chat, voice, ai"
                className="bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm"
              />
            </div>

            <div className="flex items-center gap-3 pt-7 md:col-span-3">
              <div className="flex items-center justify-between h-12 px-6 bg-gm-surface/20 rounded-2xl border border-gm-border-soft gap-4">
                <Label htmlFor="is_active" className="text-[10px] font-bold text-gm-muted tracking-widest uppercase cursor-pointer">Aktif Plan</Label>
                <Checkbox
                  id="is_active"
                  checked={form.is_active}
                  onCheckedChange={(value) => setField('is_active', Boolean(value))}
                  className="data-[state=checked]:bg-gm-gold data-[state=checked]:border-gm-gold"
                />
              </div>

              <div className="flex flex-1 gap-2 justify-end">
                {editingId ? (
                  <Button variant="outline" type="button" onClick={resetForm} className="rounded-full border-gm-border-soft px-8 h-12 bg-gm-surface/20 hover:bg-gm-surface transition-all font-bold tracking-widest uppercase text-[10px]">
                    <Plus className="mr-2 size-4" />
                    Yeni
                  </Button>
                ) : null}
                <Button type="submit" className="rounded-full bg-gm-gold text-gm-bg hover:bg-gm-gold/90 transition-all font-bold tracking-widest uppercase text-[10px] px-8 h-12">
                  <Save className="mr-2 size-4" />
                  {editingId ? 'Planı Güncelle' : 'Plan Ekle'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gm-surface/40">
              <TableRow className="border-gm-border-soft hover:bg-transparent">
                <TableHead className="py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-gm-muted">Kod</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">İsim</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">Periyot</TableHead>
                <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">Fiyat</TableHead>
                <TableHead className="py-6 text-center text-[10px] font-bold uppercase tracking-widest text-gm-muted">Durum</TableHead>
                <TableHead className="py-6 px-8 text-right text-[10px] font-bold uppercase tracking-widest text-gm-muted">Aksiyon</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <Receipt className="w-16 h-16 text-gm-gold/50" />
                      <span className="font-serif italic text-lg text-gm-muted">Plan bulunamadı.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : null}

              {plans.map((plan) => (
                <TableRow key={plan.id} className="border-gm-border-soft hover:bg-gm-primary/[0.03] transition-colors group">
                  <TableCell className="py-6 px-8 font-mono text-sm text-gm-text">{plan.code}</TableCell>
                  <TableCell className="py-6">
                    <p className="font-serif text-lg text-gm-text group-hover:text-gm-primary transition-colors">{plan.name_tr}</p>
                    <p className="text-[10px] text-gm-muted font-mono opacity-60 uppercase tracking-tighter mt-1">{plan.name_en}</p>
                  </TableCell>
                  <TableCell className="py-6 text-xs text-gm-muted font-mono uppercase tracking-widest opacity-80">{plan.period}</TableCell>
                  <TableCell className="py-6 font-bold text-gm-text">
                    {(Number(plan.price_minor || 0) / 100).toFixed(2)} {plan.currency}
                  </TableCell>
                  <TableCell className="py-6 text-center">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                      plan.is_active ? 'bg-gm-success/10 text-gm-success' : 'bg-gm-error/10 text-gm-error'
                    }`}>
                      <div className={`w-1 h-1 rounded-full ${plan.is_active ? 'bg-gm-success' : 'bg-gm-error'}`} />
                      {plan.is_active ? 'Aktif' : 'Pasif'}
                    </div>
                  </TableCell>
                  <TableCell className="py-6 px-8 text-right">
                    <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100 transition-all">
                      <Button size="icon" variant="ghost" onClick={() => startEdit(plan)} className="rounded-full hover:bg-gm-gold/10 hover:text-gm-gold transition-colors">
                        <Pencil className="size-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => removePlan(plan.id)} className="rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

