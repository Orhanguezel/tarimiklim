export const AUTH_TOKEN_KEY = 'tarimiklim_access_token';
export const AUTH_CHANGED_EVENT = 'auth:changed';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8088/api/v1';

export type AuthUser = {
  id: string;
  email: string;
  full_name?: string | null;
  role?: string | null;
};

export function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem(AUTH_TOKEN_KEY) || '';
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

type AuthResponse = {
  access_token: string;
  token_type: string;
  user: AuthUser;
};

let pendingAuthUser: Promise<AuthUser | null> | null = null;
let rejectedAuthToken = '';

function readToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(AUTH_TOKEN_KEY) || '';
}

function storeToken(token: string) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function clearAuthToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json()) as AuthResponse | { error?: { message?: string } };
  if (!res.ok) {
    const errMsg = 'error' in data ? data.error?.message : undefined;
    throw new Error(errMsg || 'login_failed');
  }
  storeToken((data as AuthResponse).access_token);
  return data as AuthResponse;
}

export async function register(input: {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ ...input, rules_accepted: true }),
  });
  const data = (await res.json()) as AuthResponse | { error?: { message?: string } };
  if (!res.ok) {
    const errMsg = 'error' in data ? data.error?.message : undefined;
    throw new Error(errMsg || 'register_failed');
  }
  storeToken((data as AuthResponse).access_token);
  return data as AuthResponse;
}

export async function googleSignIn(idToken: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ id_token: idToken }),
  });
  const data = (await res.json()) as AuthResponse | { error?: { message?: string } };
  if (!res.ok) {
    const errMsg = 'error' in data ? data.error?.message : undefined;
    throw new Error(errMsg || 'google_login_failed');
  }
  storeToken((data as AuthResponse).access_token);
  return data as AuthResponse;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const token = readToken();
  // Do not probe /auth/user when we clearly have no client session token.
  // This avoids noisy 401 requests on public pages.
  if (!token) return null;
  if (token === rejectedAuthToken) return null;
  if (pendingAuthUser) return pendingAuthUser;

  pendingAuthUser = (async () => {
    const headers: Record<string, string> = {};
    headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_URL}/auth/user`, {
      method: 'GET',
      headers,
      credentials: 'include',
    }).catch(() => null);
    if (!res) return null;
    if (!res.ok) {
      if (res.status === 401) {
        rejectedAuthToken = token;
        clearAuthToken();
      }
      return null;
    }
    rejectedAuthToken = '';
    const data = (await res.json()) as { user?: AuthUser } | AuthUser;
    if ('user' in data && data.user) return data.user;
    return data as AuthUser;
  })().finally(() => {
    pendingAuthUser = null;
  });

  return pendingAuthUser;
}

export async function logout(): Promise<void> {
  const token = readToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers,
    credentials: 'include',
  }).catch(() => undefined);
  clearAuthToken();
}
