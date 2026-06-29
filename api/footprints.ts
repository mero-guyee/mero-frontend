import { FootprintPhoto } from '@/types';
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
  clientId: string; // local UUID (footprintId)
  title?: string;
  content?: string;
  date: string; // YYYY-MM-DD
  wheaterInfo?: string;
  locations?: LocationRequest[];
  photoUrls?: string[]; // local URIs for photos to be uploaded
}

export interface FootprintUpdateRequest {
  title?: string;
  content?: string;
  date: string;
  locations?: LocationRequest[];
}

export interface FootprintResponse {
  id: number;
  clientId: string;
  tripId: number;
  title?: string;
  content?: string;
  date: string;
  locations: LocationResponse[];
  thumbnailUrl?: string;
  photos: PhotoDetailItem[];
}

export interface PhotoResponse {
  id: number;
  s3Url: string;
  originalFilename?: string;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  orderIndex?: number;
}

export interface PhotoDetailItem {
  id: number;
  clientId: string;
  s3Url: string;
  originalFilename?: string;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  orderIndex?: number;
}

export interface FootprintDetailResponse {
  id: number;
  tripId: number;
  content?: string;
  date: string;
  locations: LocationResponse[];
  weatherInfo?: string;
  photos: PhotoDetailItem[];
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

  update: (
    tripId: number,
    footprintId: number,
    data: FootprintUpdateRequest
  ): Promise<FootprintResponse> =>
    apiRequest(`/api/trips/${tripId}/footprints/${footprintId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (tripId: number, footprintId: number): Promise<void> =>
    apiRequest(`/api/trips/${tripId}/footprints/${footprintId}`, { method: 'DELETE' }),

  uploadPhotos: async (
    tripId: number,
    footprintId: number,
    imageUris: FootprintPhoto[]
  ): Promise<PhotoResponse[]> => {
    const results: PhotoResponse[] = [];
    for (let i = 0; i < imageUris.length; i++) {
      const form = new FormData();
      form.append('photo', {
        uri: imageUris[i].localUri,
        name: `photo_${i}.jpg`,
        type: 'image/jpeg',
      } as any);
      const response = await apiFormRequest<PhotoResponse>(
        `/api/trips/${tripId}/footprints/${footprintId}/photos/${imageUris[i].id}`,
        form
      );
      results.push(response);
    }
    return results;
  },

  deletePhoto: (tripId: number, footprintId: number, photoId: number): Promise<void> =>
    apiRequest(`/api/trips/${tripId}/footprints/${footprintId}/photos/${photoId}`, {
      method: 'DELETE',
    }),
};
