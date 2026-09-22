import { ApiError } from '@/api/client';
import { tripsApi } from '@/api/trips';
import { SyncingCallbacks } from '@/contexts/SyncingContext';
import { enqueueMutation } from '@/hooks/queries/mutationQueue';
import { OutboxRepository, TripRepository } from '@/repositories';
import * as SQLite from 'expo-sqlite';

export async function syncTrips(
  db: SQLite.SQLiteDatabase,
  maxAgeMinutes?: number,
  syncing?: SyncingCallbacks
): Promise<boolean> {
  const repo = new TripRepository(db);
  const outbox = new OutboxRepository(db);
  const ready = await outbox.getReady('trips', maxAgeMinutes);

  for (const { dataId, operation } of ready) {
    await enqueueMutation(dataId, async () => {
      syncing?.markSyncing(dataId);

      try {
        if (operation === 'create') {
          const trip = await repo.findById(dataId);
          if (!trip || trip.serverId || trip.deletedAt) {
            await outbox.remove('trips', dataId);
            return;
          }
          const serverTrip = await tripsApi.create({
            clientId: trip.id,
            title: trip.title,
            startDate: trip.startDate,
            endDate: trip.endDate,
            countries:
              typeof trip.countries === 'string' ? JSON.parse(trip.countries) : trip.countries,
            imageUrl: trip.imageUrl,
          });
          await repo.setServerId(trip.id, String(serverTrip.id));
          syncing?.markSyncingSucceeded(dataId);
        } else if (operation === 'update') {
          const trip = await repo.findById(dataId);
          if (!trip?.serverId) {
            await outbox.remove('trips', dataId);
            return;
          }
          await tripsApi.update(parseInt(trip.serverId), {
            title: trip.title,
            startDate: trip.startDate,
            endDate: trip.endDate,
            countries:
              typeof trip.countries === 'string' ? JSON.parse(trip.countries) : trip.countries,
          });
          await repo.markSynced(dataId);
          syncing?.markSyncingSucceeded(dataId);
        } else if (operation === 'delete') {
          const trip = await repo.findByIdIncludeDeleted(dataId);
          if (!trip?.serverId) {
            await outbox.remove('trips', dataId);
            return;
          }
          await tripsApi.delete(parseInt(trip.serverId));
          await outbox.remove('trips', dataId);
        }
      } catch (e) {
        if (operation === 'delete' && e instanceof ApiError && e.status === 404) {
          await outbox.remove('trips', dataId);
          syncing?.markSyncingSucceeded(dataId);
        } else {
          await outbox.markFailed('trips', dataId);
          syncing?.markSyncingFailed(dataId);
        }
      } finally {
        syncing?.unmarkSyncing(dataId);
      }
    });
  }

  return ready.length > 0;
}
