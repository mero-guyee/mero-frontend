import { budgetsApi } from '@/api/budgets';
import { BudgetRepository, OutboxRepository, TripRepository } from '@/repositories';
import * as SQLite from 'expo-sqlite';

export async function syncBudgets(db: SQLite.SQLiteDatabase): Promise<void> {
  const repo = new BudgetRepository(db);
  const tripRepo = new TripRepository(db);
  const outbox = new OutboxRepository(db);
  const ready = await outbox.getReady('budgets');

  for (const { dataId, operation } of ready) {
    try {
      if (operation === 'create') {
        const budget = await repo.findById(dataId);
        if (!budget || budget.serverId || budget.deletedAt) {
          await outbox.remove('budgets', dataId);
          continue;
        }
        const trip = await tripRepo.findById(budget.tripId);
        if (!trip?.serverId) continue;
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
          continue;
        }
        const trip = await tripRepo.findById(budget.tripId);
        if (!trip?.serverId) continue;
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
          continue;
        }
        const trip = await tripRepo.findById(budget.tripId);
        if (!trip?.serverId) continue;
        await budgetsApi.delete(parseInt(trip.serverId), parseInt(budget.serverId));
        await outbox.remove('budgets', dataId);
      }
    } catch {
      await outbox.markFailed('budgets', dataId);
    }
  }
}
