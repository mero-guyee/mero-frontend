import { footprintsApi } from '@/api/footprints';
import { FootprintRepository, OutboxRepository, TripRepository } from '@/repositories';
import * as SQLite from 'expo-sqlite';

export async function syncFootprints(db: SQLite.SQLiteDatabase): Promise<void> {
  const repo = new FootprintRepository(db);
  const tripRepo = new TripRepository(db);
  const outbox = new OutboxRepository(db);
  const ready = await outbox.getReady('footprints');

  for (const { dataId, operation } of ready) {
    try {
      if (operation === 'create') {
        const footprint = await repo.findById(dataId);
        if (!footprint || footprint.serverId || footprint.deletedAt) {
          await outbox.remove('footprints', dataId);
          continue;
        }
        const trip = await tripRepo.findById(footprint.tripId);
        if (!trip?.serverId) continue;
        const serverFootprint = await footprintsApi.create(parseInt(trip.serverId), {
          clientId: footprint.id,
          title: footprint.title,
          content: footprint.content,
          date: footprint.date,
          locations:
            typeof footprint.locations === 'string'
              ? JSON.parse(footprint.locations)
              : footprint.locations,
        });
        await repo.setServerId(footprint.id, String(serverFootprint.id));
      } else if (operation === 'update') {
        const footprint = await repo.findById(dataId);
        if (!footprint?.serverId) {
          await outbox.remove('footprints', dataId);
          continue;
        }
        const trip = await tripRepo.findById(footprint.tripId);
        if (!trip?.serverId) continue;
        await footprintsApi.update(parseInt(trip.serverId), parseInt(footprint.serverId), {
          title: footprint.title,
          content: footprint.content,
          date: footprint.date,
          locations:
            typeof footprint.locations === 'string'
              ? JSON.parse(footprint.locations)
              : footprint.locations,
        });
        await repo.markSynced(dataId);
      } else if (operation === 'delete') {
        const footprint = await repo.findByIdIncludeDeleted(dataId);
        if (!footprint?.serverId) {
          await outbox.remove('footprints', dataId);
          continue;
        }
        const trip = await tripRepo.findById(footprint.tripId);
        if (!trip?.serverId) continue;
        await footprintsApi.delete(parseInt(trip.serverId), parseInt(footprint.serverId));
        await outbox.remove('footprints', dataId);
      }
    } catch {
      await outbox.markFailed('footprints', dataId);
    }
  }
}
