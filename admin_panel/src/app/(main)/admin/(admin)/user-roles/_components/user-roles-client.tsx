'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, RefreshCcw, Filter, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from '@/components/ui/table';

import type { UserRoleName, UserRole, UserRolesListParams, AdminUserView } from '@/integrations/shared';

import {
  useAdminUserRolesListQuery,
  useAdminUserRoleCreateMutation,
  useAdminUserRoleDeleteMutation,
  useAdminListQuery,
  useAdminGetQuery,
} from '@/integrations/hooks';
import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';

type UserOption = {
  id: string; // UUID (UI’da gösterilmiyor)
  name: string; // full_name
};

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * RTK hook ile "programatik" query tetikleyebilmek için:
 * - useAdminGetQuery sadece render içinde kullanılabilir.
 * - Biz ise eksik id’leri sırayla fetch edeceğiz.
 *
 * Bu yüzden bir "queue" yaklaşımı kullanıyoruz:
 * - queueId state’i => her seferinde tek kullanıcı GET çağrılır
 * - sonuç gelince cache’e alınır, sıradaki id’ye geçilir
 */
export default function UserRolesClient() {
  const t = useAdminT('admin.userRoles');

  function roleLabel(r: UserRoleName) {
    if (r === 'admin') return t('roles.admin');
    if (r === 'consultant') return t('roles.consultant');
    return t('roles.user');
  }

  function userName(u: Pick<AdminUserView, 'full_name'>): string {
    const name = String(u.full_name ?? '').trim();
    return name.length ? name : t('user.unknown');
  }

  function getErrMessage(err: unknown): string {
    const anyErr = err as any;

    const m1 = anyErr?.data?.error?.message;
    if (typeof m1 === 'string' && m1.trim()) return m1;

    const m1b = anyErr?.data?.error;
    if (typeof m1b === 'string' && m1b.trim()) return m1b;

    const m2 = anyErr?.data?.message;
    if (typeof m2 === 'string' && m2.trim()) return m2;

    const m3 = anyErr?.error;
    if (typeof m3 === 'string' && m3.trim()) return m3;

    return t('errorFallback');
  }

  // ------------------------------------------------------------
  // 1) Kullanıcı listesi: dropdown için (isim bazlı)
  // ------------------------------------------------------------
  const usersQ = useAdminListQuery(
    {
      limit: 200,
      offset: 0,
      sort: 'created_at',
      order: 'desc',
    },
    { refetchOnMountOrArgChange: true },
  );

  const baseUserOptions = React.useMemo<UserOption[]>(() => {
    const items: UserOption[] = (usersQ.data ?? []).map((u) => ({
      id: u.id,
      name: userName(u),
    }));
    items.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    return items;
  }, [usersQ.data]);

  // ------------------------------------------------------------
  // 2) Roller listesi + filtre
  // ------------------------------------------------------------
  const [filterUserId, setFilterUserId] = React.useState<string>('all');
  const [role, setRole] = React.useState<UserRoleName | 'all'>('all');
  const [limit, setLimit] = React.useState(50);

  const params = React.useMemo<UserRolesListParams>(
    () => ({
      ...(filterUserId !== 'all' ? { user_id: filterUserId } : {}),
      ...(role !== 'all' ? { role: role as UserRoleName } : {}),
      order: 'created_at',
      direction: 'desc',
      limit,
      offset: 0,
    }),
    [filterUserId, role, limit],
  );

  const rolesQ = useAdminUserRolesListQuery(params);

  const [createRole, createState] = useAdminUserRoleCreateMutation();
  const [deleteRole, deleteState] = useAdminUserRoleDeleteMutation();

  // ------------------------------------------------------------
  // 3) Local user cache: listte olmayan user_id’leri tamamlamak için
  // ------------------------------------------------------------
  const [userCache, setUserCache] = React.useState<Map<string, AdminUserView>>(() => new Map());

  // usersQ.data geldikçe cache’i güncelle (listeden gelenler cache’e yazılsın)
  React.useEffect(() => {
    if (!usersQ.data?.length) return;
    setUserCache((prev) => {
      const next = new Map(prev);
      for (const u of usersQ.data ?? []) next.set(u.id, u);
      return next;
    });
  }, [usersQ.data]);

  // ------------------------------------------------------------
  // 4) Eksik user_id’leri tespit et
  // ------------------------------------------------------------
  const missingUserIds = React.useMemo(() => {
    const ids = new Set<string>();
    for (const r of rolesQ.data ?? []) {
      if (!r?.user_id) continue;
      const id = String(r.user_id);
      // cache’de yoksa missing
      if (!userCache.has(id)) ids.add(id);
    }
    return Array.from(ids);
  }, [rolesQ.data, userCache]);

  // ------------------------------------------------------------
  // 5) Eksikleri sırayla fetch et (queue)
  // ------------------------------------------------------------
  const [queue, setQueue] = React.useState<string[]>([]);
  const [queueId, setQueueId] = React.useState<string>('');

  // missing list değişince queue’yu besle (zaten var olanları ekleme)
  React.useEffect(() => {
    if (!missingUserIds.length) return;
    setQueue((prev) => {
      const prevSet = new Set(prev);
      const toAdd = missingUserIds.filter((id) => !prevSet.has(id));
      return toAdd.length ? [...prev, ...toAdd] : prev;
    });
  }, [missingUserIds]);

  // queueId boşsa sıradakini al
  React.useEffect(() => {
    if (queueId) return;
    if (!queue.length) return;
    setQueueId(queue[0]);
    setQueue((prev) => prev.slice(1));
  }, [queue, queueId]);

  // Sıradaki id için adminGet çağır (skip ile kontrol)
  const userGetQ = useAdminGetQuery(
    { id: queueId },
    { skip: !queueId, refetchOnMountOrArgChange: true },
  );

  // Sonuç gelince cache’e koy, queueId’yi boşalt (sıradakine geçsin)
  React.useEffect(() => {
    if (!queueId) return;

    // hata da olsa döngüyü kilitlemeyelim
    if (userGetQ.isError) {
      // bu id için bir daha denemeyi istersen burada retry policy ekleriz
      setQueueId('');
      return;
    }

    if (userGetQ.data) {
      setUserCache((prev) => {
        const next = new Map(prev);
        next.set(queueId, userGetQ.data as AdminUserView);
        return next;
      });
      setQueueId('');
    }
  }, [queueId, userGetQ.data, userGetQ.isError]);

  function userNameById(id: string): { text: string; status: 'ok' | 'loading' | 'missing' } {
    const u = userCache.get(id);
    if (u) return { text: userName(u), status: 'ok' };

    // şu an fetch ediliyorsa loading
    if (queueId === id && userGetQ.isFetching) return { text: t('user.loading'), status: 'loading' };

    // kuyrukta bekliyorsa loading
    if (queue.includes(id)) return { text: t('user.loading'), status: 'loading' };

    // ne cache'de ne kuyrukta => muhtemelen bulunamadı / yetki / silinmiş
    return { text: t('user.notFound'), status: 'missing' };
  }

  // ------------------------------------------------------------
  // 6) Dropdown seçenekleri: cache + list (unique) -> isim
  // ------------------------------------------------------------
  const userOptions = React.useMemo<UserOption[]>(() => {
    // Dropdown’da sadece tam isimli kullanıcılar gösterilsin
    const items: UserOption[] = baseUserOptions.slice();

    // rollerde geçen ama listte olmayanları da dropdown’a eklemeyelim (şimdilik)
    // çünkü isimler yüklenene kadar "Yükleniyor" olabilir ve UX kötüleşir.
    // İstersen: cache’e düşenleri dropdown’a ekleriz.

    return items;
  }, [baseUserOptions]);

  // ------------------------------------------------------------
  // 7) Yeni rol ekleme
  // ------------------------------------------------------------
  const [newUserId, setNewUserId] = React.useState<string>('');
  const [newRole, setNewRole] = React.useState<UserRoleName>('user');

  const busy =
    rolesQ.isFetching ||
    createState.isLoading ||
    deleteState.isLoading ||
    usersQ.isFetching ||
    usersQ.isLoading ||
    userGetQ.isFetching;

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newUserId) {
      toast.error(t('create.selectUser'));
      return;
    }

    try {
      await createRole({ user_id: newUserId, role: newRole }).unwrap();
      toast.success(t('create.added'));
      setNewUserId('');
      setNewRole('user');
      rolesQ.refetch();
    } catch (err) {
      const msg = getErrMessage(err);
      toast.error(msg === 'user_role_already_exists' ? t('create.alreadyExists') : msg);
    }
  }

  async function onDelete(row: UserRole) {
    const who = userNameById(row.user_id).text;
    const confirmMsg = t('table.deleteConfirm', { user: who, role: roleLabel(row.role) });
    if (!confirm(confirmMsg)) return;

    try {
      await deleteRole({ id: row.id }).unwrap();
      toast.success(t('table.deleted'));
      rolesQ.refetch();
    } catch (err) {
      toast.error(getErrMessage(err));
    }
  }

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------
  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-gm-gold" />
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">{t('list.badge', null, 'Üyelik Sistemi')}</span>
          </div>
          <h1 className="font-serif text-4xl text-gm-text">{t('title')}</h1>
          <p className="text-gm-muted text-sm font-serif italic max-w-xl">
            {t('description')}
          </p>
        </div>
      </div>

      {/* ---------------- Yeni Rol Ekle ---------------- */}
      <Card className="bg-gm-surface/30 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-md shadow-2xl">
        <CardContent className="p-8">
          <div className="mb-6 space-y-1">
            <h2 className="text-lg font-serif font-bold text-gm-text">{t('create.title')}</h2>
            <p className="text-xs text-gm-muted">{t('create.description')}</p>
          </div>

          <form onSubmit={onCreate} className="grid gap-6 md:grid-cols-3 md:items-end">
            <div className="space-y-3 md:col-span-2">
              <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">{t('create.userLabel')}</Label>

              <Select value={newUserId} onValueChange={(v) => setNewUserId(v)} disabled={busy}>
                <SelectTrigger className="w-full bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm">
                  <SelectValue
                    placeholder={usersQ.isFetching ? t('create.usersLoading') : t('create.userPlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent className="bg-gm-bg border-gm-border-soft rounded-2xl">
                  {userOptions.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {usersQ.isError ? (
                <div className="text-xs text-gm-error">
                  {t('create.usersLoadError')}{' '}
                  <Button
                    type="button"
                    variant="link"
                    className="px-1 text-gm-error"
                    onClick={() => usersQ.refetch()}
                  >
                    {t('create.retryButton')}
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">{t('create.roleLabel')}</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRoleName)} disabled={busy}>
                <SelectTrigger className="w-full bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm">
                  <SelectValue placeholder={t('create.rolePlaceholder')} />
                </SelectTrigger>
                <SelectContent className="bg-gm-bg border-gm-border-soft rounded-2xl">
                  <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                  <SelectItem value="consultant">{t('roles.consultant')}</SelectItem>
                  <SelectItem value="user">{t('roles.user')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-3 flex justify-end mt-2">
              <Button 
                type="submit" 
                disabled={busy || !newUserId}
                className="rounded-full bg-gm-gold text-gm-bg hover:bg-gm-gold/90 transition-all font-bold tracking-widest uppercase text-[10px] px-8 h-12"
              >
                <Plus className="mr-2 size-4" />
                {t('create.addButton')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ---------------- Rol Listesi ---------------- */}
      <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
        <CardContent className="p-8 space-y-6">
          <div className="mb-2 space-y-1">
            <h2 className="text-lg font-serif font-bold text-gm-text">{t('list.title')}</h2>
            <p className="text-xs text-gm-muted">{t('list.description')}</p>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end">
            {/* Kullanıcı filtresi: dropdown */}
            <div className="flex-1 space-y-3">
              <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">{t('list.userFilterLabel')}</Label>
              <Select
                value={filterUserId}
                onValueChange={(v) => setFilterUserId(v)}
                disabled={busy}
              >
                <SelectTrigger className="w-full bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm">
                  <SelectValue placeholder={t('list.all')} />
                </SelectTrigger>
                <SelectContent className="bg-gm-bg border-gm-border-soft rounded-2xl">
                  <SelectItem value="all">{t('list.all')}</SelectItem>
                  {userOptions.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rol filtresi */}
            <div className="w-full space-y-3 lg:w-56">
              <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">{t('list.roleFilterLabel')}</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRoleName | 'all')} disabled={busy}>
                <SelectTrigger className="w-full bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm">
                  <SelectValue placeholder={t('list.all')} />
                </SelectTrigger>
                <SelectContent className="bg-gm-bg border-gm-border-soft rounded-2xl">
                  <SelectItem value="all">{t('list.all')}</SelectItem>
                  <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                  <SelectItem value="consultant">{t('roles.consultant')}</SelectItem>
                  <SelectItem value="user">{t('roles.user')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Limit */}
            <div className="w-full space-y-3 lg:w-44">
              <Label className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase ml-1">{t('list.limitLabel')}</Label>
              <Select
                value={String(limit)}
                onValueChange={(v) => setLimit(Number(v))}
                disabled={busy}
              >
                <SelectTrigger className="w-full bg-gm-surface/40 border-gm-border-soft rounded-2xl h-12 focus:ring-gm-gold/50 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gm-bg border-gm-border-soft rounded-2xl">
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Yenile */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => rolesQ.refetch()}
                disabled={busy}
                title={t('list.refreshButton')}
                className="rounded-2xl border-gm-border-soft px-6 h-12 bg-gm-surface/20 hover:bg-gm-surface transition-all font-bold tracking-widest uppercase text-[10px]"
              >
                <RefreshCcw className={cn("mr-2 size-4", busy && "animate-spin")} />
                Yenile
              </Button>
            </div>
          </div>

          {rolesQ.isError ? (
            <div className="rounded-2xl border border-gm-error/20 bg-gm-error/5 p-4 text-sm text-gm-error">
              {t('list.loadError')}{' '}
              <Button variant="link" className="px-1 text-gm-error font-bold" onClick={() => rolesQ.refetch()}>
                {t('list.retryButton')}
              </Button>
            </div>
          ) : null}

          <div className="rounded-2xl border border-gm-border-soft overflow-hidden">
            <Table>
              <TableHeader className="bg-gm-surface/40">
                <TableRow className="border-gm-border-soft hover:bg-transparent">
                  <TableHead className="py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('table.userColumn')}</TableHead>
                  <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('table.roleColumn')}</TableHead>
                  <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('table.createdColumn')}</TableHead>
                  <TableHead className="py-6 px-8 text-right text-[10px] font-bold uppercase tracking-widest text-gm-muted">{t('table.actionColumn')}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {(rolesQ.data ?? []).map((row) => {
                  const u = userNameById(row.user_id);
                  return (
                    <TableRow key={row.id} className="border-gm-border-soft hover:bg-gm-primary/[0.03] transition-colors group">
                      <TableCell className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gm-surface border border-gm-border-soft flex items-center justify-center text-gm-gold font-serif text-lg shadow-inner group-hover:border-gm-gold/50 transition-all">
                            {u.text?.[0] || 'U'}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-serif text-base text-gm-text group-hover:text-gm-primary transition-colors">{u.text}</span>
                            {u.status === 'loading' ? (
                              <span className="text-[10px] text-gm-muted font-mono opacity-60 uppercase tracking-tighter">{t('table.loading')}</span>
                            ) : null}
                            {u.status === 'missing' ? (
                              <span className="text-[10px] text-gm-error font-mono opacity-60 uppercase tracking-tighter">{t('table.notFound')}</span>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-6">
                        <Badge 
                          variant="outline"
                          className={cn(
                            "text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded border",
                            row.role === 'admin' ? 'border-gm-gold/30 text-gm-gold bg-gm-gold/5' :
                            row.role === 'consultant' ? 'border-gm-primary/30 text-gm-primary-light bg-gm-primary/5' :
                            'border-gm-border-soft text-gm-muted'
                          )}
                        >
                          {roleLabel(row.role)}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-6 text-xs text-gm-muted font-mono">
                        {row.created_at ? new Date(row.created_at).toLocaleString() : '—'}
                      </TableCell>

                      <TableCell className="py-6 px-8 text-right">
                        <div className="flex justify-end opacity-20 group-hover:opacity-100 transition-all">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onDelete(row)}
                            disabled={busy}
                            className="rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {!rolesQ.isFetching && (rolesQ.data?.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <Users className="w-16 h-16 text-gm-gold/50" />
                        <span className="font-serif italic text-lg text-gm-muted">{t('list.noRecords')}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>

          <div className="text-[10px] font-bold text-gm-muted tracking-[0.2em] uppercase pt-2">
            {t('list.note')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
