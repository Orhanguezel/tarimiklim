import {
  AUTH_CHANGED_EVENT,
  clearAuthToken,
  getAuthUser,
  googleSignIn,
  login,
  logout as logoutClient,
  register,
  type AuthUser,
} from '@/lib/auth-client';

const USER_KEY = 'tarimiklim_auth_user';

export { AUTH_CHANGED_EVENT };
export type { AuthUser };

export type ApiErrorShape = { code: string; message?: string };

export function isApiError(error: unknown): error is ApiErrorShape {
  return Boolean(error && typeof error === 'object' && 'code' in error);
}

function storeUser(user: AuthUser | null) {
  if (typeof window === 'undefined') return;
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
  // Keep AuthSessionProvider state in sync after login/register/google.
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function getStoredAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) as AuthUser : null;
  } catch {
    return null;
  }
}

export async function rehydrateAuthSession(): Promise<AuthUser | null> {
  const user = await getAuthUser();
  storeUser(user);
  return user;
}

export async function logout(): Promise<void> {
  await logoutClient().catch(() => undefined);
  clearAuthToken();
  storeUser(null);
}

export async function loginWithEmail(input: { email: string; password: string }) {
  try {
    const res = await login(input.email, input.password);
    storeUser(res.user);
    return res.user;
  } catch (err) {
    throw { code: err instanceof Error ? err.message : 'request_failed' };
  }
}

export async function signupWithEmail(input: { email: string; password: string; fullName?: string }) {
  try {
    const res = await register({ email: input.email, password: input.password, full_name: input.fullName });
    storeUser(res.user);
    return res.user;
  } catch (err) {
    throw { code: err instanceof Error ? err.message : 'request_failed' };
  }
}

export async function fetchGoogleAuthConfig() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || null;
  return { enabled: Boolean(clientId), client_id: clientId };
}

export async function loginWithGoogle(idToken: string) {
  try {
    const res = await googleSignIn(idToken);
    storeUser(res.user);
    return res.user;
  } catch (err) {
    throw { code: err instanceof Error ? err.message : 'google_login_failed' };
  }
}
