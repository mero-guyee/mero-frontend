import { expensesApi } from '@/api/expenses';
import { ExpenseCategoryRepository, ExpenseRepository, FootprintRepository, TripRepository } from '@/repositories';
import * as SQLite from 'expo-sqlite';

export async function syncExpenses(db: SQLite.SQLiteDatabase): Promise<void> {
  const repo = new ExpenseRepository(db);
  const tripRepo = new TripRepository(db);
  const footprintRepo = new FootprintRepository(db);
  const categoryRepo = new ExpenseCategoryRepository(db);
  const pending = await repo.getPending();
  const unsynced = pending.filter((e) => !e.serverId && !e.deletedAt);

  await Promise.all(
    unsynced.map(async ({ id, tripId, footprintId, categoryId, amount, currency, description, date, location }) => {
      try {
        const trip = await tripRepo.findById(tripId);
        if (!trip?.serverId) return;

        const categoryServerId = (await categoryRepo.findById(categoryId))?.serverId;
        if (!categoryServerId) return;

        let footprintServerId: number | undefined;
        if (footprintId) {
          const footprint = await footprintRepo.findById(footprintId);
          if (!footprint?.serverId) return;
          footprintServerId = parseInt(footprint.serverId);
        }

        const serverExpense = await expensesApi.create(parseInt(trip.serverId), {
          clientId: id,
          tripId: parseInt(trip.serverId),
          footprintId: footprintServerId,
          amount,
          currency: currency as any,
          categoryId: parseInt(categoryServerId),
          description: description ?? undefined,
          date,
          location: location ?? undefined,
        });
        await repo.setServerId(id, String(serverExpense.id));
      } catch {}
    })
  );
}
