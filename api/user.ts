import { UserResponse } from './auth';
import { apiFormRequest, apiRequest } from './client';

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
  uploadProfileImage: (uri: string): Promise<UserResponse> => {
    const form = new FormData();
    form.append('image', {
      uri,
      name: 'profile.jpg',
      type: 'image/jpeg',
    } as any);
    return apiFormRequest('/api/users/me/profile-image', form);
  },
};
