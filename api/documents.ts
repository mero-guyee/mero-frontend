import { apiFormRequest, apiRequest } from './client';

export interface ServerTripDocument {
  id: number;
  fileName: string;
  fileUri: string;
  fileSize?: number;
}

export interface TripDocumentCreateRequest {
  tripId: number;
  clientId: string;
  file: { fileName: string; fileUri: string };
}

export const documentsApi = {
  upload: (params: TripDocumentCreateRequest): Promise<ServerTripDocument> => {
    const { tripId, clientId, file } = params;
    const { fileName, fileUri } = file;
    const extension = fileName.split('.').pop()?.toLowerCase();
    let mimeType = 'application/octet-stream';
    if (extension === 'jpg' || extension === 'jpeg') mimeType = 'image/jpeg';
    else if (extension === 'png') mimeType = 'image/png';
    else if (extension === 'pdf') mimeType = 'application/pdf';
    const form = new FormData();
    form.append('clientId', clientId);
    form.append('file', { uri: fileUri, name: fileName, type: mimeType } as any);
    return apiFormRequest(`/api/trips/${tripId}/documents`, form);
  },

  delete: (tripId: number, documentId: number): Promise<void> =>
    apiRequest(`/api/trips/${tripId}/documents/${documentId}`, { method: 'DELETE' }),
};
