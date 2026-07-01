import { PhotoResponse, photosApi } from '@/api/photos';
import { PhotoRepository } from '@/repositories';
import { FootprintPhoto } from '@/types';

function isLocalUri(uri: string): boolean {
  return uri.startsWith('file://') || uri.startsWith('content://');
}

export function filterNewPhotoUris(existing: FootprintPhoto[], uris: string[]): string[] {
  const existingUris = new Set(existing.map((p) => p.localUri));
  return uris.filter(isLocalUri).filter((uri) => !existingUris.has(uri));
}

export async function createLocalPhotos(
  photoRepo: PhotoRepository,
  footprintId: string,
  uris: string[],
  startIndex = 0
): Promise<FootprintPhoto[]> {
  const photos: FootprintPhoto[] = [];
  for (const [i, uri] of uris.entries()) {
    photos.push(await photoRepo.createPhoto(footprintId, uri, startIndex + i));
  }
  return photos;
}

export async function uploadPhotosAndSync(
  photoRepo: PhotoRepository,
  localPhotos: FootprintPhoto[],
  tripServerId: number,
  footprintServerId: number
): Promise<string[]> {
  if (localPhotos.length === 0) return [];

  const uploadedPhotos = await photosApi.upload(tripServerId, footprintServerId, localPhotos);

  for (let i = 0; i < uploadedPhotos.length; i++) {
    const photo = uploadedPhotos[i];
    await photoRepo.syncUploaded(localPhotos[i].id, {
      serverId: String(photo.id),
      s3Url: photo.s3Url,
      originalFilename: photo.originalFilename,
      fileSize: photo.fileSize,
      mimeType: photo.mimeType,
      width: photo.width,
      height: photo.height,
      orderIndex: photo.orderIndex,
    });
  }

  return uploadedPhotos.map((p: PhotoResponse) => p.s3Url);
}
