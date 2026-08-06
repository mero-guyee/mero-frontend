import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { expenseCategoriesApi, expensesApi } from '../../api/expenses';
import { useSyncContext } from '../../contexts/SyncContext';
import { useDb } from '../../providers/DatabaseProvider';
import {
  ExpenseCategoryRepository,
  ExpenseRepository,
  FootprintRepository,
  TripRepository,
} from '../../repositories';
import { Expense, ExpenseCategory } from '../../types';
import { enqueueMutation } from './mutationQueue';

export const expenseKeys = {
  byTrip: (tripId: string) => ['expenses', 'trip', tripId] as const,
  categories: ['categories'] as const,
};

export function useExpensesQuery(tripId: string) {
  const db = useDb();
  const qc = useQueryClient();
  return useQuery({
    queryKey: expenseKeys.byTrip(tripId),
    queryFn: async () => {
      const tripRepo = new TripRepository(db);
      const repo = new ExpenseRepository(db);

      (async () => {
        try {
          const trip = await tripRepo.getTripById(tripId);
          if (trip?.serverId) {
            const { expenses: serverExpenses } = await expensesApi.getByTrip(
              parseInt(trip.serverId)
            );
            await Promise.all(serverExpenses.map((e) => repo.upsertFromServer(e, tripId)));
            const fresh = await repo.getExpensesByTripId(tripId);
            qc.setQueryData(expenseKeys.byTrip(tripId), fresh);
          }
        } catch {
          // offline — use local cache
        }
      })();

      return repo.getExpensesByTripId(tripId);
    },
    enabled: !!tripId,
  });
}

export function useCreateExpense() {
  const db = useDb();
  const qc = useQueryClient();
  const { markSyncing, unmarkSyncing, markSyncSucceeded, markSyncFailed } = useSyncContext();
  return useMutation({
    mutationFn: async (data: Omit<Expense, 'id' | 'serverId' | 'createdAt' | 'syncStatus'>) => {
      const tripRepo = new TripRepository(db);
      const repo = new ExpenseRepository(db);
      const category = await new ExpenseCategoryRepository(db).findById(data.categoryId);
      const localExpense = await repo.createExpense({
        ...data,
        categoryName: category?.name,
        categoryIcon: category?.icon,
        categoryColor: category?.color,
      });

      enqueueMutation(localExpense.id, async () => {
        markSyncing(localExpense.id);
        try {
          const fresh = await repo.findById(localExpense.id);
          if (!fresh || fresh.serverId) return;
          const trip = await tripRepo.getTripById(fresh.tripId);
          const categoryServerId = (
            await new ExpenseCategoryRepository(db).findById(fresh.categoryId)
          )?.serverId;
          const footprintServerId = fresh.footprintId
            ? (await new FootprintRepository(db).findById(fresh.footprintId))?.serverId
            : undefined;
          if (trip?.serverId && categoryServerId) {
            const serverExpense = await expensesApi.create(parseInt(trip.serverId), {
              clientId: fresh.id,
              tripId: parseInt(trip.serverId),
              footprintId: footprintServerId ? parseInt(footprintServerId) : undefined,
              amount: fresh.amount,
              currency: fresh.currency as any,
              categoryId: parseInt(categoryServerId),
              description: fresh.description ?? undefined,
              date: fresh.date,
              location: fresh.location ?? undefined,
            });
            await repo.setServerId(fresh.id, String(serverExpense.id));
            markSyncSucceeded(localExpense.id);
            qc.invalidateQueries({ queryKey: expenseKeys.byTrip(fresh.tripId) });
          }
        } catch {
          markSyncFailed(localExpense.id);
        } finally {
          unmarkSyncing(localExpense.id);
        }
      });

      return localExpense;
    },
    onSuccess: (expense) => {
      qc.invalidateQueries({ queryKey: expenseKeys.byTrip(expense.tripId) });
    },
  });
}

export function useUpdateExpense() {
  const db = useDb();
  const qc = useQueryClient();
  const { markSyncing, unmarkSyncing, markSyncSucceeded, markSyncFailed } = useSyncContext();
  return useMutation({
    mutationFn: async (expense: Expense) => {
      const tripRepo = new TripRepository(db);
      const repo = new ExpenseRepository(db);
      const category = await new ExpenseCategoryRepository(db).findById(expense.categoryId);
      const updated = await repo.updateExpense({
        ...expense,
        categoryName: category?.name,
        categoryIcon: category?.icon,
        categoryColor: category?.color,
      });

      enqueueMutation(expense.id, async () => {
        markSyncing(expense.id);
        try {
          const fresh = await repo.findById(expense.id);
          if (fresh?.serverId) {
            const trip = await tripRepo.getTripById(fresh.tripId);
            const categoryServerId = (
              await new ExpenseCategoryRepository(db).findById(fresh.categoryId)
            )?.serverId;
            const footprintServerId = fresh.footprintId
              ? (await new FootprintRepository(db).findById(fresh.footprintId))?.serverId
              : undefined;
            if (trip?.serverId && categoryServerId) {
              await expensesApi.update(parseInt(trip.serverId), parseInt(fresh.serverId), {
                footprintId: footprintServerId ? parseInt(footprintServerId) : null,
                amount: fresh.amount,
                currency: fresh.currency as any,
                categoryId: parseInt(categoryServerId),
                description: fresh.description ?? undefined,
                date: fresh.date,
                location: fresh.location ?? undefined,
              });
              await repo.markSynced(expense.id);
              markSyncSucceeded(expense.id);
              qc.invalidateQueries({ queryKey: expenseKeys.byTrip(fresh.tripId) });
            }
          }
        } catch {
          markSyncFailed(expense.id);
        } finally {
          unmarkSyncing(expense.id);
        }
      });

      return updated;
    },
    onSuccess: (_, expense) => {
      qc.invalidateQueries({ queryKey: expenseKeys.byTrip(expense.tripId) });
    },
  });
}

export function useDeleteExpense() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, tripId }: { id: string; tripId: string }) => {
      const tripRepo = new TripRepository(db);
      const repo = new ExpenseRepository(db);
      const expenseRow = await repo.findById(id);
      await repo.deleteExpense(id);

      (async () => {
        try {
          if (expenseRow?.serverId) {
            const trip = await tripRepo.getTripById(tripId);
            if (trip?.serverId) {
              await expensesApi.delete(parseInt(trip.serverId), parseInt(expenseRow.serverId));
              await repo.removeFromOutbox(id);
            }
          }
        } catch {
          // stays soft-deleted with pending status
        }
      })();

      return tripId;
    },
    onSuccess: (tripId) => {
      qc.invalidateQueries({ queryKey: expenseKeys.byTrip(tripId) });
    },
  });
}

export function useCategoriesQuery() {
  const db = useDb();
  const qc = useQueryClient();
  return useQuery({
    queryKey: expenseKeys.categories,
    queryFn: async () => {
      const repo = new ExpenseCategoryRepository(db);

      (async () => {
        try {
          const serverCategories = await expenseCategoriesApi.getAll();
          await Promise.all(serverCategories.map((c) => repo.upsertFromServer(c)));
          const fresh = await repo.getAllCategories();
          qc.setQueryData(expenseKeys.categories, fresh);
        } catch {
          // offline — use local cache
        }
      })();

      return repo.getAllCategories();
    },
  });
}

export function useCreateCategory() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<ExpenseCategory, 'id'>) => {
      const repo = new ExpenseCategoryRepository(db);
      const localCategory = await repo.createCategory(data);

      (async () => {
        try {
          const serverCategory = await expenseCategoriesApi.create({
            name: data.name,
            icon: data.icon,
            color: data.color,
          });
          await repo.setServerId(localCategory.id, String(serverCategory.id));
          qc.invalidateQueries({ queryKey: expenseKeys.categories });
        } catch {
          // stays pending
        }
      })();

      return localCategory;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: expenseKeys.categories }),
  });
}

export function useUpdateCategory() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (category: ExpenseCategory) =>
      new ExpenseCategoryRepository(db).updateCategory(category),
    onSuccess: () => qc.invalidateQueries({ queryKey: expenseKeys.categories }),
  });
}

export function useDeleteCategory() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const repo = new ExpenseCategoryRepository(db);
      const categoryRow = await repo.findById(id);
      await repo.deleteCategory(id);

      (async () => {
        try {
          if (categoryRow?.serverId) {
            await expenseCategoriesApi.delete(parseInt(categoryRow.serverId));
          }
        } catch {
          // stays soft-deleted with pending status
        }
      })();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: expenseKeys.categories }),
  });
}
