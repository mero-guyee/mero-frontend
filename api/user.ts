import { UserResponse } from './auth';
import { apiRequest } from './client';

export const userApi = {
  getMe: (): Promise<UserResponse> => apiRequest('/api/users/me'),
};
