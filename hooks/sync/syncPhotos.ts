import { ApiError } from '@/api/client';
import { photosApi } from '@/api/photos';
import { SyncingCallbacks } from '@/contexts/SyncingContext';
import { enqueueMutation } from '@/hooks/queries/mutationQueue';
import { FootprintRepository, OutboxRepository, PhotoRepository, TripRepository } from '@/repositories';
import { uploadPhotosAndSync } from '@/utils/photoSync';
import * as SQLite from 'expo-sqlite';

export async function syncPhotos(
  db: SQLite.SQLiteDatabase,
  maxAgeMinutes?: number,
  syncing?: SyncingCallbacks
): Promise<boolean> {
  const photoRepo = new PhotoRepository(db);
  const footprintRepo = new FootprintRepository(db);
  const tripRepo = new TripRepository(db);
  const outbox = new OutboxRepository(db);

  // 1. Upload pending photos (grouped by footprintId)
  const pendingUploads = await photoRepo.getAllPendingUploads();

  const byFootprint = new Map<string, typeof pendingUploads>();
  for (const photo of pendingUploads) {
    const group = byFootprint.get(photo.footprintId) ?? [];
    group.push(photo);
    byFootprint.set(photo.footprintId, group);
  }

  for (const [footprintId, photos] of byFootprint) {
    await enqueueMutation(footprintId, async () => {
      syncing?.markSyncing(footprintId);
      try {
        const footprint = await footprintRepo.findById(footprintId);
        if (!footprint?.serverId) {
          return;
        }
        const trip = await tripRepo.getTripById(footprint.tripId);
        if (!trip?.serverId) {
          return;
        }
        await uploadPhotosAndSync(
          photoRepo,
          photos,
          parseInt(trip.serverId),
          parseInt(footprint.serverId)
        );
        syncing?.markSyncingSucceeded(footprintId);
      } catch (e) {
        // leave as pending for next sync
        syncing?.markSyncingFailed(footprintId);
      } finally {
        syncing?.unmarkSyncing(footprintId);
      }
    });
  }

  // 2. Delete photos from outbox
  const readyDeletes = await outbox.getReady('photos', maxAgeMinutes);
  for (const { dataId } of readyDeletes) {
    await enqueueMutation(dataId, async () => {
      try {
        const photo = await photoRepo.findByIdIncludeDeleted(dataId);
        if (!photo?.serverId) {
          await outbox.remove('photos', dataId);
          return;
        }
        const footprint = await footprintRepo.findByIdIncludeDeleted(photo.footprintId);
        if (!footprint?.serverId) {
          await outbox.remove('photos', dataId);
          return;
        }
        const trip = await tripRepo.getTripById(footprint.tripId);
        if (!trip?.serverId) {
          return;
        }
        await photosApi.delete(
          parseInt(trip.serverId),
          parseInt(footprint.serverId),
          parseInt(photo.serverId)
        );
        await outbox.remove('photos', dataId);
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) {
          await outbox.remove('photos', dataId);
        } else {
          await outbox.markFailed('photos', dataId);
        }
      }
    });
  }

  return pendingUploads.length > 0 || readyDeletes.length > 0;
}
