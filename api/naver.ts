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

export const naverApi = {
  connect: (data: NaverConnectRequest): Promise<NaverConnectResponse> =>
    apiRequest('/api/social/naver/connect', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getStatus: (): Promise<NaverStatusResponse> => apiRequest('/api/social/naver/connect'),
};
