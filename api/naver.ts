import { apiRequest } from './client';

export interface NaverConnectRequest {
  code: string;
  state: string;
}

export interface NaverConnectResponse {
  connected: boolean;
  connectedAt: string;
  naverNickname: string;
}

export interface NaverStatusResponse {
  connected: boolean;
  connectedAt: string;
  naverNickname: string;
}

export interface NaverAuthUrlResponse {
  authUrl: string;
  state: string;
}

export const naverApi = {
  getAuthUrl: (): Promise<NaverAuthUrlResponse> => apiRequest('/api/social/naver/auth-url'),

  connect: (data: NaverConnectRequest): Promise<NaverConnectResponse> =>
    apiRequest('/api/social/naver/connect', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getStatus: (): Promise<NaverStatusResponse> => apiRequest('/api/social/naver/connect'),
};
