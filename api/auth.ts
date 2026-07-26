import { apiRequest } from './client';
import { tokenStorage } from './tokenStorage';

export interface SignUpRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  email: string;
  nickname: string;
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
}

export interface UserResponse {
  id: number;
  email: string;
  nickname: string;
  profileImage?: string;
  createdAt: string;
}

export const authApi = {
  signup: (data: SignUpRequest): Promise<UserResponse> =>
    apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await apiRequest<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    await tokenStorage.setTokens(res.accessToken, res.refreshToken);
    return res;
  },

  googleLogin: async (idToken: string): Promise<LoginResponse> => {
    const res = await apiRequest<LoginResponse>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
    await tokenStorage.setTokens(res.accessToken, res.refreshToken);
    return res;
  },

  appleLogin: async (identityToken: string): Promise<LoginResponse> => {
    const res = await apiRequest<LoginResponse>('/api/auth/apple', {
      method: 'POST',
      body: JSON.stringify({ identityToken }),
    });
    await tokenStorage.setTokens(res.accessToken, res.refreshToken);
    return res;
  },

  logout: async (): Promise<void> => {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (refreshToken) {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }
    await tokenStorage.clearTokens();
  },
};
