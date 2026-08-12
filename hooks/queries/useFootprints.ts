import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { footprintsApi } from '../../api/footprints';
import { photosApi } from '../../api/photos';
import { useSyncContext } from '../../contexts/SyncContext';
import { useDb } from '../../providers/DatabaseProvider';
import {
  FootprintDraftRepository,
  FootprintRepository,
  OutboxRepository,
  PhotoRepository,
  TripRepository,
} from '../../repositories';
import { Footprint } from '../../types';
import {
  createLocalPhotos,
  filterNewPhotoUris,
  filterRemovedPhotos,
  uploadPhotosAndSync,
} from '../../utils/photoSync';
import { enqueueMutation } from './mutationQueue';
import { unrecordedTripsKeys } from './queryKeys';

export const footprintKeys = {
  byTrip: (tripId: string) => ['footprints', 'trip', tripId] as const,
  detail: (id: string) => ['footprints', id] as const,
  photos: (footprintId: string) => ['footprints', footprintId, 'photos'] as const,
};

export const footprintDraftKeys = {
  byTrip: (tripId: string) => ['footprintDrafts', 'trip', tripId] as const,
};

export function useFootprintDraftsQuery(tripId: string) {
  const db = useDb();
  return useQuery({
    queryKey: footprintDraftKeys.byTrip(tripId),
    queryFn: () => new FootprintDraftRepository(db).getByTripId(tripId),
    enabled: !!tripId,
  });
}

export function useFootprintPhotosQuery(footprintId: string) {
  const db = useDb();
  return useQuery({
    queryKey: footprintKeys.photos(footprintId),
    queryFn: () => new PhotoRepository(db).getByFootprintId(footprintId),
    enabled: !!footprintId,
  });
}

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
            const photoRepo = new PhotoRepository(db);
            const serverFootprints = await footprintsApi.getAll(parseInt(trip.serverId));
            await Promise.all(
              serverFootprints.map(async (f) => {
                await repo.upsertFromServer(f, tripId);
                if (f.clientId && f.photos.length > 0) {
                  await photoRepo.upsertFromServer(f.clientId, f.photos);
                }
              })
            );
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
  const { markSyncing, unmarkSyncing, markSyncSucceeded, markSyncFailed } = useSyncContext();
  return useMutation({
    mutationFn: async ({
      photoUris,
      ...data
    }: Omit<Footprint, 'id' | 'serverId'> & { photoUris: string[] }) => {
      const tripRepo = new TripRepository(db);
      const repo = new FootprintRepository(db);
      const photoRepo = new PhotoRepository(db);

      const localFootprint = await repo.createFootprint({ ...data });

      const localPhotos = await createLocalPhotos(photoRepo, localFootprint.id, photoUris);

      enqueueMutation(localFootprint.id, async () => {
        markSyncing(localFootprint.id);
        try {
          const fresh = await repo.getFootprintById(localFootprint.id);
          if (!fresh || fresh.serverId) return;
          const trip = await tripRepo.getTripById(fresh.tripId);
          if (trip?.serverId) {
            const serverFootprint = await footprintsApi.create(parseInt(trip.serverId), {
              clientId: fresh.id,
              title: fresh.title,
              content: fresh.content,
              date: fresh.date,
              wheaterInfo: fresh.weatherInfo,
              locations: fresh.locations,
            });
            await repo.setServerId(fresh.id, String(serverFootprint.id));

            if (localPhotos.length > 0) {
              try {
                await uploadPhotosAndSync(
                  photoRepo,
                  localPhotos,
                  parseInt(trip.serverId),
                  serverFootprint.id
                );
              } catch (error) {
                console.error('Error uploading photos:', error);
              }
            }

            markSyncSucceeded(localFootprint.id);
            qc.invalidateQueries({ queryKey: footprintKeys.byTrip(fresh.tripId) });
            qc.invalidateQueries({ queryKey: footprintKeys.photos(localFootprint.id) });
          }
        } catch {
          markSyncFailed(localFootprint.id);
        } finally {
          unmarkSyncing(localFootprint.id);
        }
      });

      return localFootprint;
    },
    onSuccess: (footprint) => {
      qc.invalidateQueries({ queryKey: footprintKeys.byTrip(footprint.tripId) });
      qc.invalidateQueries({ queryKey: unrecordedTripsKeys.all });
    },
  });
}

export function useUpdateFootprint() {
  const db = useDb();
  const qc = useQueryClient();
  const { markSyncing, unmarkSyncing, markSyncSucceeded, markSyncFailed } = useSyncContext();
  return useMutation({
    mutationFn: async ({ photoUris, ...footprint }: Footprint & { photoUris: string[] }) => {
      const tripRepo = new TripRepository(db);
      const repo = new FootprintRepository(db);
      const photoRepo = new PhotoRepository(db);

      const updated = await repo.updateFootprint(footprint);

      const existingPhotos = await photoRepo.getByFootprintId(footprint.id);
      const removedPhotos = filterRemovedPhotos(existingPhotos, photoUris);
      for (const photo of removedPhotos) {
        await photoRepo.delete(photo.id);
      }
      const newLocalPhotos = await createLocalPhotos(
        photoRepo,
        footprint.id,
        filterNewPhotoUris(existingPhotos, photoUris),
        existingPhotos.length
      );

      enqueueMutation(footprint.id, async () => {
        markSyncing(footprint.id);
        try {
          const fresh = await repo.getFootprintById(footprint.id);
          if (fresh?.serverId) {
            const trip = await tripRepo.getTripById(fresh.tripId);
            if (trip?.serverId) {
              await footprintsApi.update(parseInt(trip.serverId), parseInt(fresh.serverId), {
                title: fresh.title,
                content: fresh.content,
                date: fresh.date,
                locations: fresh.locations,
              });
              await repo.markSynced(footprint.id);
              markSyncSucceeded(footprint.id);

              if (newLocalPhotos.length > 0) {
                await uploadPhotosAndSync(
                  photoRepo,
                  newLocalPhotos,
                  parseInt(trip.serverId),
                  parseInt(fresh.serverId)
                );
              }

              qc.invalidateQueries({ queryKey: footprintKeys.byTrip(fresh.tripId) });
              qc.invalidateQueries({ queryKey: footprintKeys.detail(footprint.id) });
              qc.invalidateQueries({ queryKey: footprintKeys.photos(footprint.id) });
            }
          }
        } catch {
          markSyncFailed(footprint.id);
        } finally {
          unmarkSyncing(footprint.id);
        }
      });

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
      const outbox = new OutboxRepository(db);
      const footprintRow = await repo.findById(id);
      const photos = await photoRepo.getByFootprintId(id);
      await repo.deleteFootprint(id);
      await photoRepo.deleteByFootprintId(id);

      (async () => {
        try {
          if (footprintRow?.serverId) {
            const trip = await tripRepo.getTripById(tripId);
            if (trip?.serverId) {
              const tServerId = parseInt(trip.serverId);
              const fServerId = parseInt(footprintRow.serverId);
              for (const photo of photos) {
                if (photo.serverId) {
                  await photosApi.delete(tServerId, fServerId, parseInt(photo.serverId));
                  await outbox.remove('photos', photo.id);
                }
              }
              await footprintsApi.delete(tServerId, fServerId);
              await repo.removeFromOutbox(id);
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
      qc.invalidateQueries({ queryKey: unrecordedTripsKeys.all });
    },
  });
}
