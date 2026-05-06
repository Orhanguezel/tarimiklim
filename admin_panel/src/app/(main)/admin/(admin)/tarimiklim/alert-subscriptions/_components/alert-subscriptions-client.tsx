"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { weatherAdminAlertsApi, weatherAdminLocationsApi } from "@/lib/weather-admin-api";

type Rule = {
  id: string;
  locationId: string;
  alertType: string;
  threshold: string;
  channel: string;
  isActive: number;
};

type Loc = { id: string; name: string; city?: string | null };

const alertTypeLabels: Record<string, string> = {
  frost: "Don",
  heavy_rain: "Yağmur",
  heat: "Sıcaklık",
  storm: "Fırtına",
  humidity: "Nem",
};

export default function AlertSubscriptionsClient() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [locs, setLocs] = useState<Loc[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    locationId: "",
    alertType: "frost",
    threshold: "30",
    channel: "telegram",
  });

  const locById = useMemo(() => new Map(locs.map((loc) => [loc.id, loc])), [locs]);

  const load = useCallback(async () => {
    const [rulesData, locData] = await Promise.all([
      weatherAdminAlertsApi.listMyRules(),
      weatherAdminLocationsApi.list({ limit: 200, active: true }),
    ]);
    const rulesPayload = rulesData as { data?: Rule[] };
    const locPayload = locData as { data?: { items?: Loc[] } };
    const locations = locPayload.data?.items ?? [];
    setRules(Array.isArray(rulesPayload.data) ? rulesPayload.data : []);
    setLocs(locations);
    setForm((current) => (current.locationId || !locations[0] ? current : { ...current, locationId: locations[0].id }));
  }, []);

  useEffect(() => {
    load()
      .catch(() => toast.error("Abonelikler yüklenemedi"))
      .finally(() => setLoading(false));
  }, [load]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!form.locationId) {
      toast.error("Konum seçin");
      return;
    }
    try {
      await weatherAdminAlertsApi.createMyRule({
        location_id: form.locationId,
        alert_type: form.alertType,
        threshold: form.threshold,
        channel: form.channel,
      });
      toast.success("Abonelik eklendi");
      await load();
    } catch {
      toast.error("Abonelik eklenemedi");
    }
  }

  async function onDelete(id: string) {
    try {
      await weatherAdminAlertsApi.deleteMyRule(id);
      toast.success("Abonelik silindi");
      await load();
    } catch {
      toast.error("Abonelik silinemedi");
    }
  }

  async function onToggle(id: string, isActive: boolean) {
    const previous = rules;
    setRules((current) => current.map((rule) => (rule.id === id ? { ...rule, isActive: isActive ? 1 : 0 } : rule)));
    try {
      await weatherAdminAlertsApi.updateMyRule(id, { is_active: isActive });
    } catch {
      setRules(previous);
      toast.error("Abonelik güncellenemedi");
    }
  }

  if (loading && rules.length === 0) {
    return <p className="text-sm text-muted-foreground">Yükleniyor...</p>;
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="w-8 h-px bg-gm-gold" />
          <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">Profil</span>
        </div>
        <h1 className="font-serif text-4xl text-gm-text">Uyarı abonelikleri</h1>
        <p className="text-gm-muted text-sm font-serif italic max-w-xl">
          Kendi şehir ve kanal tercihlerinizi yönetin. Telegram için profil sayfasındaki Chat ID alanı dolu olmalı.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[24px] border border-gm-border-soft bg-gm-surface/20 overflow-hidden p-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Konum</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Eşik</TableHead>
                <TableHead>Kanal</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="w-16 text-right">Sil</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((row) => {
                const loc = locById.get(row.locationId);
                return (
                  <TableRow key={row.id}>
                    <TableCell>{loc?.name ?? row.locationId.slice(0, 8)}</TableCell>
                    <TableCell>{alertTypeLabels[row.alertType] ?? row.alertType}</TableCell>
                    <TableCell>{row.threshold}</TableCell>
                    <TableCell>
                      {row.channel === "email" ? "E-posta" : row.channel === "telegram" ? "Telegram" : row.channel}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={Boolean(row.isActive)}
                        onCheckedChange={(checked) => void onToggle(row.id, checked)}
                        aria-label="Abonelik durumunu değiştir"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => void onDelete(row.id)}
                        aria-label="Aboneliği sil"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {rules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    Henüz abonelik yok.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>

        <form
          onSubmit={(e) => void onCreate(e)}
          className="space-y-4 rounded-[24px] border border-gm-border-soft bg-gm-surface/20 p-5"
        >
          <h2 className="font-medium">Yeni abonelik</h2>
          <div className="space-y-2">
            <Label>Şehir / konum</Label>
            <Select
              value={form.locationId || undefined}
              onValueChange={(v) => setForm((f) => ({ ...f, locationId: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Konum seçin" />
              </SelectTrigger>
              <SelectContent>
                {locs.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Uyarı tipi</Label>
            <Select value={form.alertType} onValueChange={(v) => setForm((f) => ({ ...f, alertType: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="frost">Don</SelectItem>
                <SelectItem value="heavy_rain">Yağmur</SelectItem>
                <SelectItem value="heat">Sıcaklık</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Eşik değeri</Label>
            <Select value={form.threshold} onValueChange={(v) => setForm((f) => ({ ...f, threshold: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 - Düşük</SelectItem>
                <SelectItem value="50">50 - Orta</SelectItem>
                <SelectItem value="80">80 - Kritik</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Kanal</Label>
            <Select value={form.channel} onValueChange={(v) => setForm((f) => ({ ...f, channel: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="telegram">Telegram</SelectItem>
                <SelectItem value="email">E-posta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">
            Abonelik ekle
          </Button>
        </form>
      </div>
    </div>
  );
}
