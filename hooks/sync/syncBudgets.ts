import { budgetsApi } from '@/api/budgets';
import { BudgetRepository, OutboxRepository, TripRepository } from '@/repositories';
import * as SQLite from 'expo-sqlite';

export async function syncBudgets(db: SQLite.SQLiteDatabase): Promise<void> {
  const repo = new BudgetRepository(db);
  const tripRepo = new TripRepository(db);
  const outbox = new OutboxRepository(db);
  const ready = await outbox.getReady('budgets');

  await Promise.all(
    ready.map(async ({ dataId, operation }) => {
      try {
        if (operation === 'create') {
          const budget = await repo.findById(dataId);
          if (!budget || budget.serverId || budget.deletedAt) {
            await outbox.remove('budgets', dataId);
            return;
          }
          const trip = await tripRepo.findById(budget.tripId);
          if (!trip?.serverId) return;
          const serverBudget = await budgetsApi.create(parseInt(trip.serverId), {
            clientId: budget.id,
            amount: budget.amount,
            currency: budget.currency as any,
            exchangeRate: budget.exchangeRate ?? undefined,
          });
          await repo.setServerId(budget.id, String(serverBudget.id));
        } else if (operation === 'update') {
          const budget = await repo.findById(dataId);
          if (!budget?.serverId) {
            await outbox.remove('budgets', dataId);
            return;
          }
          const trip = await tripRepo.findById(budget.tripId);
          if (!trip?.serverId) return;
          await budgetsApi.update(parseInt(trip.serverId), parseInt(budget.serverId), {
            amount: budget.amount,
            currency: budget.currency as any,
            exchangeRate: budget.exchangeRate ?? undefined,
          });
          await repo.markSynced(dataId);
        } else if (operation === 'delete') {
          const budget = await repo.findByIdIncludeDeleted(dataId);
          if (!budget?.serverId) {
            await outbox.remove('budgets', dataId);
            return;
          }
          const trip = await tripRepo.findById(budget.tripId);
          if (!trip?.serverId) return;
          await budgetsApi.delete(parseInt(trip.serverId), parseInt(budget.serverId));
          await outbox.remove('budgets', dataId);
        }
      } catch {
        await outbox.incrementRetry('budgets', dataId);
      }
    })
  );
}
