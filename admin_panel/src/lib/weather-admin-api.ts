import { BASE_URL } from '@/integrations/apiBase';
import { tokenStore } from '@/integrations/core/token';

function joinUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${p}`;
}

export class WeatherAdminApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function weatherAdminRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = tokenStore.get();
  const headers = new Headers(init?.headers);
  headers.set('Accept', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const body = init?.body;
  if (body && typeof body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(joinUrl(path), { ...init, headers, credentials: 'include' });
  const data = await parseBody(res);

  if (res.status === 401 && typeof window !== 'undefined') {
    window.location.href = '/auth/login';
  }

  if (!res.ok) {
    const msg =
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof (data as { error?: { message?: string } }).error?.message === 'string'
        ? (data as { error: { message: string } }).error.message
        : res.statusText;
    throw new WeatherAdminApiError(res.status, msg, data);
  }

  return data as T;
}

export const weatherAdminLocationsApi = {
  list: (params?: Record<string, unknown>) => {
    const q = new URLSearchParams();
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v === undefined || v === null) continue;
        q.set(k, String(v));
      }
    }
    const s = q.toString();
    return weatherAdminRequest<unknown>(`/admin/locations${s ? `?${s}` : ''}`);
  },
  create: (body: unknown) =>
    weatherAdminRequest<unknown>('/admin/locations', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: unknown) =>
    weatherAdminRequest<unknown>(`/admin/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  delete: (id: string) => weatherAdminRequest<unknown>(`/admin/locations/${id}`, { method: 'DELETE' }),
};

export const weatherAdminAlertsApi = {
  list: (params?: Record<string, unknown>) => {
    const q = new URLSearchParams();
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v === undefined || v === null) continue;
        q.set(k, String(v));
      }
    }
    const s = q.toString();
    return weatherAdminRequest<unknown>(`/admin/alerts${s ? `?${s}` : ''}`);
  },
  triggerFrostCheck: (locationId: string) =>
    weatherAdminRequest<unknown>(`/admin/alerts/frost-check/${locationId}`, { method: 'POST' }),
  listRules: (params?: { userId?: string; all?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.userId) q.set('userId', params.userId);
    if (params?.all) q.set('all', 'true');
    const s = q.toString();
    return weatherAdminRequest<unknown>(`/admin/alerts/rules${s ? `?${s}` : ''}`);
  },
  createRule: (body: unknown) =>
    weatherAdminRequest<unknown>('/admin/alerts/rules', { method: 'POST', body: JSON.stringify(body) }),
  deleteRule: (id: string) =>
    weatherAdminRequest<unknown>(`/admin/alerts/rules/${id}`, { method: 'DELETE' }),
  listMyRules: () => weatherAdminRequest<unknown>('/me/alert-rules'),
  createMyRule: (body: unknown) =>
    weatherAdminRequest<unknown>('/me/alert-rules', { method: 'POST', body: JSON.stringify(body) }),
  updateMyRule: (id: string, body: unknown) =>
    weatherAdminRequest<unknown>(`/me/alert-rules/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteMyRule: (id: string) =>
    weatherAdminRequest<unknown>(`/me/alert-rules/${id}`, { method: 'DELETE' }),
  getMyTelegramChatId: () => weatherAdminRequest<unknown>('/me/telegram-chat-id'),
  updateMyTelegramChatId: (chatId: string | null) =>
    weatherAdminRequest<unknown>('/me/telegram-chat-id', {
      method: 'PUT',
      body: JSON.stringify({ chat_id: chatId }),
    }),
};
