import { budgetsApi } from '@/api/budgets';
import { BudgetRepository, TripRepository } from '@/repositories';
import * as SQLite from 'expo-sqlite';

export async function syncBudgets(db: SQLite.SQLiteDatabase): Promise<void> {
  const repo = new BudgetRepository(db);
  const tripRepo = new TripRepository(db);
  const pending = await repo.getPending();
  const unsynced = pending.filter((b) => !b.serverId && !b.deletedAt);

  await Promise.all(
    unsynced.map(async ({ id, tripId, amount, currency, exchangeRate }) => {
      try {
        const trip = await tripRepo.findById(tripId);
        if (!trip?.serverId) return;

        const serverBudget = await budgetsApi.create(parseInt(trip.serverId), {
          clientId: id,
          amount,
          currency: currency as any,
          exchangeRate: exchangeRate ?? undefined,
        });
        await repo.setServerId(id, String(serverBudget.id));
      } catch {}
    })
  );
}
