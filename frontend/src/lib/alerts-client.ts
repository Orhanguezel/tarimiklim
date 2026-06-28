import { API_URL } from '@/lib/site-settings';
import { getAuthHeader } from '@/lib/auth-client';

type ApiOk<T> = { success: true; data: T };

export type LocationRow = {
  id: string;
  name: string;
  slug: string;
  latitude: string | number;
  longitude: string | number;
  city?: string | null;
  district?: string | null;
};

export type MyAlertRule = {
  id: string;
  userId: string;
  locationId: string;
  alertType: 'frost' | 'heavy_rain' | 'storm' | 'heat' | 'humidity';
  threshold: string;
  channel: 'telegram' | 'push' | 'email';
  isActive: number;
  createdAt?: string;
  updatedAt?: string;
};

export async function listLocations(): Promise<LocationRow[]> {
  const params = new URLSearchParams({
    limit: '100',
    page: '1',
    active: 'true',
  });
  const res = await fetch(`${API_URL}/locations?${params.toString()}`, { next: { revalidate: 300 } });
  const json = (await res.json()) as ApiOk<{ items: LocationRow[] }> | ApiOk<LocationRow[]>;
  if (!res.ok) return [];
  const data: any = (json as any)?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

export async function listMyAlertRules(): Promise<MyAlertRule[]> {
  const res = await fetch(`${API_URL}/me/alert-rules`, {
    headers: { ...getAuthHeader() },
    credentials: 'include',
  });
  const json = (await res.json()) as ApiOk<MyAlertRule[]>;
  if (!res.ok) throw new Error('rules_list_failed');
  return json.data || [];
}

export async function createMyAlertRule(input: {
  locationId: string;
  alertType: MyAlertRule['alertType'];
  threshold: string | number;
  channel: MyAlertRule['channel'];
}): Promise<MyAlertRule> {
  const res = await fetch(`${API_URL}/me/alert-rules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    credentials: 'include',
    body: JSON.stringify({
      locationId: input.locationId,
      alertType: input.alertType,
      threshold: input.threshold,
      channel: input.channel,
    }),
  });
  const json = (await res.json()) as ApiOk<MyAlertRule> | { error?: unknown };
  if (!res.ok) throw new Error('rule_create_failed');
  return (json as ApiOk<MyAlertRule>).data;
}

export async function setMyAlertRuleActive(id: string, isActive: boolean): Promise<MyAlertRule> {
  const res = await fetch(`${API_URL}/me/alert-rules/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    credentials: 'include',
    body: JSON.stringify({ isActive }),
  });
  const json = (await res.json()) as ApiOk<MyAlertRule>;
  if (!res.ok) throw new Error('rule_update_failed');
  return json.data;
}

export async function deleteMyAlertRule(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/me/alert-rules/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('rule_delete_failed');
}

export async function getMyTelegramChatId(): Promise<string | null> {
  const res = await fetch(`${API_URL}/me/telegram-chat-id`, {
    headers: { ...getAuthHeader() },
    credentials: 'include',
  });
  if (!res.ok) return null;
  const json = (await res.json()) as ApiOk<{ chat_id: string | null }>;
  return json.data?.chat_id ?? null;
}

export async function updateMyTelegramChatId(chatId: string | null): Promise<string | null> {
  const res = await fetch(`${API_URL}/me/telegram-chat-id`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    credentials: 'include',
    body: JSON.stringify({ chatId }),
  });
  const json = (await res.json()) as ApiOk<{ chat_id: string | null }>;
  if (!res.ok) throw new Error('telegram_update_failed');
  return json.data?.chat_id ?? null;
}

