import { ApiError } from '@/api/client';
import { budgetsApi } from '@/api/budgets';
import { SyncingCallbacks } from '@/contexts/SyncingContext';
import { enqueueMutation } from '@/hooks/queries/mutationQueue';
import { runWithConcurrency, SYNC_CONCURRENCY } from '@/hooks/sync/concurrency';
import { BudgetRepository, OutboxRepository, TripRepository } from '@/repositories';
import * as SQLite from 'expo-sqlite';

export async function syncBudgets(
  db: SQLite.SQLiteDatabase,
  maxAgeMinutes?: number,
  syncing?: SyncingCallbacks
): Promise<boolean> {
  const repo = new BudgetRepository(db);
  const tripRepo = new TripRepository(db);
  const outbox = new OutboxRepository(db);
  const ready = await outbox.getReady('budgets', maxAgeMinutes);

  await runWithConcurrency(ready, SYNC_CONCURRENCY, async ({ dataId, operation }) => {
    await enqueueMutation(dataId, async () => {
      syncing?.markSyncing(dataId);
      try {
        if (operation === 'create') {
          const budget = await repo.findById(dataId);
          if (!budget || budget.serverId || budget.deletedAt) {
            await outbox.remove('budgets', dataId);
            return;
          }
          const trip = await tripRepo.findById(budget.tripId);
          if (!trip?.serverId) {
            return;
          }
          const serverBudget = await budgetsApi.create(parseInt(trip.serverId), {
            clientId: budget.id,
            amount: budget.amount,
            currency: budget.currency as any,
            exchangeRate: budget.exchangeRate ?? undefined,
          });
          await repo.setServerId(budget.id, String(serverBudget.id));
          syncing?.markSyncingSucceeded(dataId);
        } else if (operation === 'update') {
          const budget = await repo.findById(dataId);
          if (!budget?.serverId) {
            await outbox.remove('budgets', dataId);
            return;
          }
          const trip = await tripRepo.findById(budget.tripId);
          if (!trip?.serverId) {
            return;
          }
          await budgetsApi.update(parseInt(trip.serverId), parseInt(budget.serverId), {
            amount: budget.amount,
            currency: budget.currency as any,
            exchangeRate: budget.exchangeRate ?? undefined,
          });
          await repo.markSynced(dataId);
          syncing?.markSyncingSucceeded(dataId);
        } else if (operation === 'delete') {
          const budget = await repo.findByIdIncludeDeleted(dataId);
          if (!budget?.serverId) {
            await outbox.remove('budgets', dataId);
            return;
          }
          const trip = await tripRepo.findById(budget.tripId);
          if (!trip?.serverId) {
            return;
          }
          await budgetsApi.delete(parseInt(trip.serverId), parseInt(budget.serverId));
          await outbox.remove('budgets', dataId);
        }
      } catch (e) {
        if (operation === 'delete' && e instanceof ApiError && e.status === 404) {
          await outbox.remove('budgets', dataId);
          syncing?.markSyncingSucceeded(dataId);
        } else {
          await outbox.markFailed('budgets', dataId);
          syncing?.markSyncingFailed(dataId);
        }
      } finally {
        syncing?.unmarkSyncing(dataId);
      }
    });
  });

  return ready.length > 0;
}
