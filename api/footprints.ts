import { apiRequest } from './client';
import { ExpenseResponse } from './expenses';
import { PhotoDetailItem } from './photos';

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
  clientId: string;
  title?: string;
  content?: string;
  date: string;
  wheaterInfo?: string;
  locations?: LocationRequest[];
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
};
