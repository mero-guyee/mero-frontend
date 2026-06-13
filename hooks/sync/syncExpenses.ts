import { expensesApi } from '@/api/expenses';
import {
  ExpenseCategoryRepository,
  ExpenseRepository,
  FootprintRepository,
  OutboxRepository,
  TripRepository,
} from '@/repositories';
import * as SQLite from 'expo-sqlite';

export async function syncExpenses(db: SQLite.SQLiteDatabase): Promise<void> {
  const repo = new ExpenseRepository(db);
  const tripRepo = new TripRepository(db);
  const footprintRepo = new FootprintRepository(db);
  const categoryRepo = new ExpenseCategoryRepository(db);
  const outbox = new OutboxRepository(db);
  const ready = await outbox.getReady('expenses');

  await Promise.all(
    ready.map(async ({ dataId, operation }) => {
      try {
        if (operation === 'create') {
          const expense = await repo.findById(dataId);
          if (!expense || expense.serverId || expense.deletedAt) {
            await outbox.remove('expenses', dataId);
            return;
          }
          const trip = await tripRepo.findById(expense.tripId);
          if (!trip?.serverId) return;

          const categoryServerId = (await categoryRepo.findById(expense.categoryId))?.serverId;
          if (!categoryServerId) return;

          let footprintServerId: number | undefined;
          if (expense.footprintId) {
            const footprint = await footprintRepo.findById(expense.footprintId);
            if (!footprint?.serverId) return;
            footprintServerId = parseInt(footprint.serverId);
          }

          const serverExpense = await expensesApi.create(parseInt(trip.serverId), {
            clientId: expense.id,
            tripId: parseInt(trip.serverId),
            footprintId: footprintServerId,
            amount: expense.amount,
            currency: expense.currency as any,
            categoryId: parseInt(categoryServerId),
            description: expense.description ?? undefined,
            date: expense.date,
            location: expense.location ?? undefined,
          });
          await repo.setServerId(expense.id, String(serverExpense.id));
        } else if (operation === 'update') {
          const expense = await repo.findById(dataId);
          if (!expense?.serverId) {
            await outbox.remove('expenses', dataId);
            return;
          }
          const trip = await tripRepo.findById(expense.tripId);
          if (!trip?.serverId) return;

          const categoryServerId = (await categoryRepo.findById(expense.categoryId))?.serverId;
          if (!categoryServerId) return;

          await expensesApi.update(parseInt(trip.serverId), parseInt(expense.serverId), {
            amount: expense.amount,
            currency: expense.currency as any,
            categoryId: parseInt(categoryServerId),
            description: expense.description ?? undefined,
            date: expense.date,
            location: expense.location ?? undefined,
          });
          await repo.markSynced(dataId);
        } else if (operation === 'delete') {
          const expense = await repo.findByIdIncludeDeleted(dataId);
          if (!expense?.serverId) {
            await outbox.remove('expenses', dataId);
            return;
          }
          const trip = await tripRepo.findById(expense.tripId);
          if (!trip?.serverId) return;
          await expensesApi.delete(parseInt(trip.serverId), parseInt(expense.serverId));
          await outbox.remove('expenses', dataId);
        }
      } catch {
        await outbox.markFailed('expenses', dataId);
      }
    })
  );
}
