import { UserResponse } from './auth';
import { apiRequest } from './client';

export interface UpdateNicknameRequest {
  nickname: string;
}

export const userApi = {
  getMe: (): Promise<UserResponse> => apiRequest('/api/users/me'),
  updateNickname: (data: UpdateNicknameRequest): Promise<void> =>
    apiRequest('/api/users/me/nickname', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
