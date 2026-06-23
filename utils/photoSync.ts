import { PhotoResponse, footprintsApi } from '@/api/footprints';
import { PhotoRepository } from '@/repositories';
import { FootprintPhoto } from '@/types';

export async function uploadPhotosAndSync(
  photoRepo: PhotoRepository,
  localPhotos: FootprintPhoto[],
  tripServerId: number,
  footprintServerId: number
): Promise<string[]> {
  if (localPhotos.length === 0) return [];

  const uploadedPhotos = await footprintsApi.uploadPhotos(
    tripServerId,
    footprintServerId,
    localPhotos
  );

  await Promise.all(
    uploadedPhotos.map((photo: PhotoResponse, i: number) =>
      photoRepo.syncUploaded(localPhotos[i].id, {
        serverId: String(photo.id),
        s3Url: photo.s3Url,
        originalFilename: photo.originalFilename,
        fileSize: photo.fileSize,
        mimeType: photo.mimeType,
        width: photo.width,
        height: photo.height,
        orderIndex: photo.orderIndex,
      })
    )
  );

  return uploadedPhotos.map((p: PhotoResponse) => p.s3Url);
}
