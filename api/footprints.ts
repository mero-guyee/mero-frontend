import { apiFormRequest, apiRequest } from './client';
import { ExpenseResponse } from './expenses';

// Footprint = server-side equivalent of local Diary

export interface LocationRequest {
  placeName?: string;
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export interface LocationResponse {
  placeName?: string;
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export interface FootprintCreateRequest {
  clientId: string; // local UUID (diaryId)
  title?: string;
  content?: string;
  date: string; // YYYY-MM-DD
  locations?: LocationRequest[];
  photoUrls?: string[];
}

export interface FootprintUpdateRequest {
  title?: string;
  content?: string;
  date: string;
  locations?: LocationRequest[];
  photoUrls?: string[];
}

export interface FootprintResponse {
  id: number;
  clientId: string;
  tripId: number;
  content?: string;
  date: string;
  locations: LocationResponse[];
  thumbnailUrl?: string;
}

export interface FootprintDetailResponse {
  id: number;
  tripId: number;
  content?: string;
  date: string;
  locations: LocationResponse[];
  weatherInfo?: string;
  photoUrls: string[];
  expenses: ExpenseResponse[];
}

export const footprintsApi = {
  getAll: (tripId: number): Promise<FootprintResponse[]> =>
    apiRequest(`/api/trips/${tripId}/footprints`),

  getById: (tripId: number, footprintId: number): Promise<FootprintDetailResponse> =>
    apiRequest(`/api/trips/${tripId}/footprints/${footprintId}`),

  create: (tripId: number, data: FootprintCreateRequest): Promise<FootprintResponse> =>
    apiRequest(`/api/trips/${tripId}/footprints`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (tripId: number, footprintId: number, data: FootprintUpdateRequest): Promise<FootprintResponse> =>
    apiRequest(`/api/trips/${tripId}/footprints/${footprintId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (tripId: number, footprintId: number): Promise<void> =>
    apiRequest(`/api/trips/${tripId}/footprints/${footprintId}`, { method: 'DELETE' }),

  uploadPhotos: (tripId: number, footprintId: number, imageUris: string[]): Promise<FootprintDetailResponse> => {
    const form = new FormData();
    imageUris.forEach((uri, i) => {
      form.append('photos', { uri, name: `photo_${i}.jpg`, type: 'image/jpeg' } as any);
    });
    return apiFormRequest(`/api/trips/${tripId}/footprints/${footprintId}/photos`, form);
  },

  deletePhoto: (tripId: number, footprintId: number, photoId: number): Promise<void> =>
    apiRequest(`/api/trips/${tripId}/footprints/${footprintId}/photos/${photoId}`, {
      method: 'DELETE',
    }),
};
