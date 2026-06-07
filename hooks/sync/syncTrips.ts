import { tripsApi } from '@/api/trips';
import { TripRepository } from '@/repositories';
import * as SQLite from 'expo-sqlite';

export async function syncTrips(db: SQLite.SQLiteDatabase): Promise<void> {
  const repo = new TripRepository(db);
  const pending = await repo.getPending();
  const unsynced = pending.filter((t) => !t.serverId && !t.deletedAt);

  await Promise.all(
    unsynced.map(async ({ id, title, startDate, endDate, countries, imageUrl }) => {
      try {
        const serverTrip = await tripsApi.create({
          clientId: id,
          title,
          startDate,
          endDate,
          countries: typeof countries === 'string' ? JSON.parse(countries) : countries,
          imageUrl,
        });
        await repo.setServerId(id, String(serverTrip.id));
      } catch {}
    })
  );
}
