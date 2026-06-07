import { footprintsApi } from '@/api/footprints';
import { FootprintRepository, TripRepository } from '@/repositories';
import * as SQLite from 'expo-sqlite';

export async function syncFootprints(db: SQLite.SQLiteDatabase): Promise<void> {
  const repo = new FootprintRepository(db);
  const tripRepo = new TripRepository(db);
  const pending = await repo.getPending();
  const unsynced = pending.filter((f) => !f.serverId && !f.deletedAt);

  await Promise.all(
    unsynced.map(async ({ id, tripId, title, content, date, locations }) => {
      try {
        const trip = await tripRepo.findById(tripId);
        if (!trip?.serverId) return;

        const serverFootprint = await footprintsApi.create(parseInt(trip.serverId), {
          clientId: id,
          title,
          content,
          date,
          locations: typeof locations === 'string' ? JSON.parse(locations) : locations,
        });
        await repo.setServerId(id, String(serverFootprint.id));
      } catch {}
    })
  );
}
