import { tripsApi } from '@/api/trips';
import { OutboxRepository, TripRepository } from '@/repositories';
import * as SQLite from 'expo-sqlite';

export async function syncTrips(db: SQLite.SQLiteDatabase): Promise<void> {
  const repo = new TripRepository(db);
  const outbox = new OutboxRepository(db);
  const ready = await outbox.getReady('trips');

  await Promise.all(
    ready.map(async ({ dataId, operation }) => {
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
        } else if (operation === 'delete') {
          const trip = await repo.findByIdIncludeDeleted(dataId);
          if (!trip?.serverId) {
            await outbox.remove('trips', dataId);
            return;
          }
          await tripsApi.delete(parseInt(trip.serverId));
          await outbox.remove('trips', dataId);
        }
      } catch {
        await outbox.incrementRetry('trips', dataId);
      }
    })
  );
}
