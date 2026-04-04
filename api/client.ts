import Constants from 'expo-constants';
import { tokenStorage } from './tokenStorage';

export { tokenStorage } from './tokenStorage';

export const BASE_URL = Constants.expoGoConfig
  ? process.env.EXPO_PUBLIC_MOBILE_LOCAL_BASE_URL
  : __DEV__
    ? process.env.EXPO_PUBLIC_PC_LOCAL_BASE_URL
    : process.env.EXPO_PUBLIC_TEST_BASE_URL;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
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
      return null;
    }
    const data = await res.json();
    const newAccessToken = data.accessToken;
    const newRefreshToken = data.refreshToken ?? refreshToken;
    await tokenStorage.setTokens(newAccessToken, newRefreshToken);
    return newAccessToken;
  } catch {
    await tokenStorage.clearTokens();
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

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const accessToken = await tokenStorage.getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

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

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body,
  });

  if (res.status === 401 || res.status === 403) {
    if (isRefreshing) {
      return new Promise<T>((resolve, reject) => {
        registerRefreshSubscriberAction((token) => {
          const retryHeaders = { ...headers, Authorization: `Bearer ${token}` };
          fetch(`${BASE_URL}${path}`, { method: 'POST', headers: retryHeaders, body })
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
    const retryRes = await fetch(`${BASE_URL}${path}`, {
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
