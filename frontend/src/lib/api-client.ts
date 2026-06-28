import { getStoredAccessToken, setStoredAccessToken } from '@/lib/auth-token';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8088/api/v1').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredAccessToken();
  const makeHeaders = (withAuth: boolean): HeadersInit => ({
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(withAuth && token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  });
  const doFetch = (withAuth: boolean) =>
    fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: 'include',
      headers: makeHeaders(withAuth),
    });

  let res = await doFetch(true);
  // Backend is bearer-first; if localStorage token is stale, cookie fallback is bypassed.
  // Retry once without Authorization so valid cookie sessions can continue.
  if (res.status === 401 && token) {
    res = await doFetch(false);
  }

  if (!res.ok) {
    let code = 'request_failed';
    try {
      const body = await res.json();
      code = body?.error?.message ?? body?.message ?? code;
    } catch {
      // keep generic code
    }
    if (res.status === 401) setStoredAccessToken(null);
    throw new ApiError(res.status, code, `${res.status} ${code}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function apiGet<T>(path: string, query?: Record<string, unknown>, options?: RequestInit) {
  let url = path;
  if (query) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) params.set(key, String(value));
    }
    const qs = params.toString();
    if (qs) url += `${path.includes('?') ? '&' : '?'}${qs}`;
  }
  return request<T>(url, { ...options, method: 'GET' });
}

export const apiPost = <T>(path: string, body?: unknown, options?: RequestInit) =>
  request<T>(path, { ...options, method: 'POST', body: body == null ? undefined : JSON.stringify(body) });

export const apiPatch = <T>(path: string, body?: unknown, options?: RequestInit) =>
  request<T>(path, { ...options, method: 'PATCH', body: body == null ? undefined : JSON.stringify(body) });

export const apiDelete = <T>(path: string, options?: RequestInit) =>
  request<T>(path, { ...options, method: 'DELETE' });
