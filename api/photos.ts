import { FootprintPhoto } from '@/types';
import { apiFormRequest, apiRequest } from './client';

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

export const photosApi = {
  upload: async (
    tripId: number,
    footprintId: number,
    photos: FootprintPhoto[]
  ): Promise<PhotoResponse[]> => {
    const results: PhotoResponse[] = [];
    for (let i = 0; i < photos.length; i++) {
      const form = new FormData();
      form.append('photo', {
        uri: photos[i].localUri,
        name: `photo_${i}.jpg`,
        type: 'image/jpeg',
      } as any);
      const response = await apiFormRequest<PhotoResponse>(
        `/api/trips/${tripId}/footprints/${footprintId}/photos/${photos[i].id}`,
        form
      );
      results.push(response);
    }
    return results;
  },

  delete: (tripId: number, footprintId: number, photoId: number): Promise<void> =>
    apiRequest(`/api/trips/${tripId}/footprints/${footprintId}/photos/${photoId}`, {
      method: 'DELETE',
    }),
};
