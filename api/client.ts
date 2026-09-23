import { tokenStorage } from './tokenStorage';

export const BASE_URL = process.env.EXPO_PUBLIC_TEST_BASE_URL;

const REQUEST_TIMEOUT_MS = 5000;
const RETRY_BASE_DELAY_MS = 400;
const RETRY_MAX_DELAY_MS = 2000;
const RETRY_BUDGET_MS = 7000;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkTimeoutError extends Error {
  constructor(
    public timeoutMs: number,
    public originalError: unknown
  ) {
    super(`요청이 ${timeoutMs}ms 내에 응답하지 않았습니다`);
    this.name = 'NetworkTimeoutError';
  }
}

type AuthExpiredHandler = () => void;
let authExpiredHandler: AuthExpiredHandler | null = null;

export function setAuthExpiredHandler(handler: AuthExpiredHandler | null) {
  authExpiredHandler = handler;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function registerRefreshSubscriberAction(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await tokenStorage.getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      await tokenStorage.clearTokens();
      authExpiredHandler?.();
      return null;
    }
    const data = await res.json();
    const newAccessToken = data.accessToken;
    const newRefreshToken = data.refreshToken ?? refreshToken;
    await tokenStorage.setTokens(newAccessToken, newRefreshToken);
    return newAccessToken;
  } catch {
    await tokenStorage.clearTokens();
    authExpiredHandler?.();
    return null;
  }
}

async function retryOriginRequestWithToken<T>(
  path: string,
  options: RequestInit,
  headers: Record<string, string>,
  token: string
): Promise<T> {
  const retryHeaders = { ...headers, Authorization: `Bearer ${token}` };
  const retryRes = await fetch(`${BASE_URL}${path}`, { ...options, headers: retryHeaders });
  if (!retryRes.ok) throw new ApiError(retryRes.status, await retryRes.text());
  return retryRes.status === 204 ? (undefined as T) : await retryRes.json();
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, options: RequestInit): Promise<Response> {
  const startAll = Date.now();
  for (let attempt = 0; ; attempt++) {
    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      return res;
    } catch (e) {
      const error = timedOut ? new NetworkTimeoutError(REQUEST_TIMEOUT_MS, e) : e;
      const elapsed = Date.now() - startAll;
      if (elapsed >= RETRY_BUDGET_MS) throw error;
      const retryDelay = Math.min(RETRY_BASE_DELAY_MS * 2 ** attempt, RETRY_MAX_DELAY_MS);
      await delay(retryDelay);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const accessToken = await tokenStorage.getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetchWithRetry(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 || res.status === 403) {
    if (isRefreshing) {
      return new Promise<T>((resolve, reject) => {
        registerRefreshSubscriberAction((token) => {
          retryOriginRequestWithToken<T>(path, options, headers, token).then(resolve).catch(reject);
        });
      });
    }

    isRefreshing = true;
    const newToken = await refreshAccessToken();
    isRefreshing = false;

    if (!newToken) throw new ApiError(401, 'Unauthorized');

    onRefreshed(newToken);
    return retryOriginRequestWithToken<T>(path, options, headers, newToken);
  }

  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      message = JSON.parse(text).message ?? text;
    } catch {}
    throw new ApiError(res.status, message);
  }

  return res.status === 204 ? (undefined as T) : await res.json();
}

export async function apiFormRequest<T>(path: string, body: FormData): Promise<T> {
  const accessToken = await tokenStorage.getAccessToken();
  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetchWithRetry(`${BASE_URL}${path}`, { method: 'POST', headers, body });

  if (res.status === 401 || res.status === 403) {
    if (isRefreshing) {
      return new Promise<T>((resolve, reject) => {
        registerRefreshSubscriberAction((token) => {
          const retryHeaders = { ...headers, Authorization: `Bearer ${token}` };
          fetchWithRetry(`${BASE_URL}${path}`, { method: 'POST', headers: retryHeaders, body })
            .then((r) => (r.status === 204 ? (undefined as T) : r.json()))
            .then(resolve)
            .catch(reject);
        });
      });
    }

    isRefreshing = true;
    const newToken = await refreshAccessToken();
    isRefreshing = false;

    if (!newToken) throw new ApiError(401, 'Unauthorized');

    onRefreshed(newToken);
    const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
    const retryRes = await fetchWithRetry(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: retryHeaders,
      body,
    });
    if (!retryRes.ok) throw new ApiError(retryRes.status, await retryRes.text());
    return retryRes.status === 204 ? (undefined as T) : await retryRes.json();
  }

  if (!res.ok) {
    const text = await res.text();

    let message = text;
    try {
      message = JSON.parse(text).message ?? text;
    } catch {}
    throw new ApiError(res.status, message);
  }
  return res.status === 204 ? (undefined as T) : await res.json();
}
