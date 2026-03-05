import { tokenStorage } from './tokenStorage';

export { tokenStorage } from './tokenStorage';

export const BASE_URL = 'https://mero-dev-development.up.railway.app';

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

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken = await tokenStorage.getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
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
    const body = await res.text();
    throw new ApiError(res.status, body);
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

  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.status === 204 ? (undefined as T) : await res.json();
}
