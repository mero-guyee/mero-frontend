import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PhotoResponse, footprintsApi } from '../../api/footprints';
import { useDb } from '../../providers/DatabaseProvider';
import { FootprintRepository, PhotoRepository, TripRepository } from '../../repositories';
import { Footprint, FootprintPhoto } from '../../types';

export const footprintKeys = {
  byTrip: (tripId: string) => ['footprints', 'trip', tripId] as const,
  detail: (id: string) => ['footprints', id] as const,
  photos: (footprintId: string) => ['footprints', footprintId, 'photos'] as const,
};

export function useFootprintsQuery(tripId: string) {
  const db = useDb();
  const qc = useQueryClient();
  return useQuery({
    queryKey: footprintKeys.byTrip(tripId),
    queryFn: async () => {
      const tripRepo = new TripRepository(db);
      const repo = new FootprintRepository(db);
      try {
        (async () => {
          const trip = await tripRepo.getTripById(tripId);
          if (trip?.serverId) {
            const serverFootprints = await footprintsApi.getAll(parseInt(trip.serverId));
            await Promise.all(serverFootprints.map((f) => repo.upsertFromServer(f, tripId)));
            const fresh = await repo.getFootprintsByTripId(tripId);
            qc.setQueryData(footprintKeys.byTrip(trip?.id), fresh);
          }
        })();
      } catch {
        // offline — use local cache
      }
      return repo.getFootprintsByTripId(tripId);
    },
    enabled: !!tripId,
  });
}

export function useCreateFootprint() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Footprint, 'id' | 'serverId'>) => {
      const tripRepo = new TripRepository(db);
      const repo = new FootprintRepository(db);
      const photoRepo = new PhotoRepository(db);

      const localFootprint = await repo.createFootprint({ ...data });
      const localPhotos = await Promise.all(
        data.photoUrls.map((uri, i) => photoRepo.createPhoto(localFootprint.id, uri, i))
      );

      (async () => {
        try {
          const trip = await tripRepo.getTripById(data.tripId);
          if (trip?.serverId) {
            const serverFootprint = await footprintsApi.create(parseInt(trip.serverId), {
              clientId: localFootprint.id,
              title: data.title,
              content: data.content,
              date: data.date,
              wheaterInfo: data.weatherInfo,
              locations: data.locations,
            });
            await repo.setServerId(localFootprint.id, String(serverFootprint.id));

            if (localPhotos) {
              const newUrls = await uploadPhotosAndSync(
                photoRepo,
                localPhotos,
                parseInt(trip.serverId),
                serverFootprint.id
              );
              await repo.updatePhotoUrls(localFootprint.id, [...newUrls]);
            }

            qc.invalidateQueries({ queryKey: footprintKeys.byTrip(data.tripId) });
            qc.invalidateQueries({ queryKey: footprintKeys.photos(localFootprint.id) });
          }
        } catch {
          // stays pending
        }
      })();

      return localFootprint;
    },
    onSuccess: (footprint) => {
      qc.invalidateQueries({ queryKey: footprintKeys.byTrip(footprint.tripId) });
    },
  });
}

export function useUpdateFootprint() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (footprint: Footprint) => {
      const tripRepo = new TripRepository(db);
      const repo = new FootprintRepository(db);
      const photoRepo = new PhotoRepository(db);

      const localUris = footprint.photoUrls.filter(isLocalUri);
      const serverUrls = footprint.photoUrls.filter((u) => !isLocalUri(u));

      const updated = await repo.updateFootprint({ ...footprint, photoUrls: serverUrls });

      const existingPhotos = await photoRepo.getByFootprintId(footprint.id);
      const existingLocalUris = new Set(existingPhotos.map((p) => p.localUri));
      const newLocalPhotos = await Promise.all(
        localUris
          .filter((uri) => !existingLocalUris.has(uri))
          .map((uri, i) => photoRepo.createPhoto(footprint.id, uri, existingPhotos.length + i))
      );

      (async () => {
        try {
          if (footprint.serverId) {
            const trip = await tripRepo.getTripById(footprint.tripId);
            if (trip?.serverId) {
              await footprintsApi.update(parseInt(trip.serverId), parseInt(footprint.serverId), {
                title: footprint.title,
                content: footprint.content,
                date: footprint.date,
                locations: footprint.locations,
              });
              await repo.markSynced(footprint.id);

              const newUrls = await uploadPhotosAndSync(
                photoRepo,
                newLocalPhotos,
                parseInt(trip.serverId),
                parseInt(footprint.serverId)
              );
              await repo.updatePhotoUrls(footprint.id, [...serverUrls, ...newUrls]);

              qc.invalidateQueries({ queryKey: footprintKeys.byTrip(footprint.tripId) });
              qc.invalidateQueries({ queryKey: footprintKeys.detail(footprint.id) });
              qc.invalidateQueries({ queryKey: footprintKeys.photos(footprint.id) });
            }
          }
        } catch {
          // stays pending
        }
      })();

      return updated;
    },
    onSuccess: (_, footprint) => {
      qc.invalidateQueries({ queryKey: footprintKeys.byTrip(footprint.tripId) });
      qc.invalidateQueries({ queryKey: footprintKeys.detail(footprint.id) });
      qc.invalidateQueries({ queryKey: footprintKeys.photos(footprint.id) });
    },
  });
}

export function useDeleteFootprint() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, tripId }: { id: string; tripId: string }) => {
      const tripRepo = new TripRepository(db);
      const repo = new FootprintRepository(db);
      const photoRepo = new PhotoRepository(db);
      const footprintRow = await repo.findById(id);
      await repo.deleteFootprint(id);
      await photoRepo.deleteByFootprintId(id);

      (async () => {
        try {
          if (footprintRow?.serverId) {
            const trip = await tripRepo.getTripById(tripId);
            if (trip?.serverId) {
              await footprintsApi.delete(parseInt(trip.serverId), parseInt(footprintRow.serverId));
            }
          }
        } catch {
          // stays soft-deleted with pending status
        }
      })();

      return tripId;
    },
    onSuccess: (tripId) => {
      qc.invalidateQueries({ queryKey: footprintKeys.byTrip(tripId) });
    },
  });
}

function isLocalUri(uri: string): boolean {
  return uri.startsWith('file://') || uri.startsWith('content://');
}

async function uploadPhotosAndSync(
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
