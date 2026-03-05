import { apiFormRequest, apiRequest } from './client';

export interface TripCreateRequest {
  clientId: string; // local UUID
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  countries?: string[];
}

export interface TripUpdateRequest {
  title: string;
  startDate: string;
  endDate: string;
  countries?: string[];
}

export interface TripDocumentResponse {
  id: number;
  fileName: string;
  fileUrl: string;
  createdAt: string;
}

export interface TripResponse {
  id: number;
  clientId: string;
  title: string;
  startDate: string;
  endDate: string;
  countries: string[];
  imageUrl?: string;
  createdAt: string;
}

export interface TripDetailResponse extends TripResponse {
  documents: TripDocumentResponse[];
}

export const tripsApi = {
  getAll: (): Promise<TripResponse[]> =>
    apiRequest('/api/trips'),

  getById: (tripId: number): Promise<TripDetailResponse> =>
    apiRequest(`/api/trips/${tripId}`),

  create: (data: TripCreateRequest): Promise<TripResponse> =>
    apiRequest('/api/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (tripId: number, data: TripUpdateRequest): Promise<TripResponse> =>
    apiRequest(`/api/trips/${tripId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (tripId: number): Promise<void> =>
    apiRequest(`/api/trips/${tripId}`, { method: 'DELETE' }),

  uploadImage: (tripId: number, imageUri: string): Promise<TripResponse> => {
    const form = new FormData();
    form.append('image', { uri: imageUri, name: 'cover.jpg', type: 'image/jpeg' } as any);
    return apiFormRequest(`/api/trips/${tripId}/image`, form);
  },

  deleteImage: (tripId: number): Promise<void> =>
    apiRequest(`/api/trips/${tripId}/image`, { method: 'DELETE' }),

  uploadDocument: (tripId: number, fileUri: string, fileName: string): Promise<TripDocumentResponse> => {
    const form = new FormData();
    form.append('file', { uri: fileUri, name: fileName, type: 'application/octet-stream' } as any);
    return apiFormRequest(`/api/trips/${tripId}/documents`, form);
  },

  deleteDocument: (tripId: number, documentId: number): Promise<void> =>
    apiRequest(`/api/trips/${tripId}/documents/${documentId}`, { method: 'DELETE' }),
};
