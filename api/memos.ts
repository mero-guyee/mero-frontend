import { apiRequest } from './client';

// Memo = server-side equivalent of local Note

export interface MemoCreateRequest {
  clientId: string; // local UUID (noteId)
  title: string;
  content: string;
}

export interface MemoUpdateRequest {
  title: string;
  content: string;
}

export interface MemoResponse {
  id: number;
  clientId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const memosApi = {
  getAll: (tripId: number): Promise<MemoResponse[]> =>
    apiRequest(`/api/trips/${tripId}/memos`),

  getById: (tripId: number, memoId: number): Promise<MemoResponse> =>
    apiRequest(`/api/trips/${tripId}/memos/${memoId}`),

  create: (tripId: number, data: MemoCreateRequest): Promise<MemoResponse> =>
    apiRequest(`/api/trips/${tripId}/memos`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (tripId: number, memoId: number, data: MemoUpdateRequest): Promise<MemoResponse> =>
    apiRequest(`/api/trips/${tripId}/memos/${memoId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (tripId: number, memoId: number): Promise<void> =>
    apiRequest(`/api/trips/${tripId}/memos/${memoId}`, { method: 'DELETE' }),
};
