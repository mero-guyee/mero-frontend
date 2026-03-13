import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { expenseCategoriesApi, expensesApi } from '../../api/expenses';
import { useDb } from '../../providers/DatabaseProvider';
import { ExpenseCategoryRepository, ExpenseRepository } from '../../repositories';
import { TripRepository } from '../../repositories';
import { Expense, ExpenseCategory } from '../../types';

export const expenseKeys = {
  all: ['expenses'] as const,
  byTrip: (tripId: string) => ['expenses', 'trip', tripId] as const,
  categories: ['categories'] as const,
};

export function useExpensesQuery() {
  const db = useDb();
  return useQuery({
    queryKey: expenseKeys.all,
    queryFn: () => new ExpenseRepository(db).getAllExpenses(),
  });
}

export function useExpensesByTripQuery(tripId: string) {
  const db = useDb();
  return useQuery({
    queryKey: expenseKeys.byTrip(tripId),
    queryFn: async () => {
      const tripRepo = new TripRepository(db);
      const repo = new ExpenseRepository(db);
      try {
        const trip = await tripRepo.getTripById(tripId);
        if (trip?.serverId) {
          const { expenses: serverExpenses } = await expensesApi.getByTrip(parseInt(trip.serverId));
          await Promise.all(serverExpenses.map((e) => repo.upsertFromServer(e, tripId)));
        }
      } catch {
        // offline — use local cache
      }
      return repo.getExpensesByTripId(tripId);
    },
    enabled: !!tripId,
  });
}

export function useCategoriesQuery() {
  const db = useDb();
  return useQuery({
    queryKey: expenseKeys.categories,
    queryFn: () => new ExpenseCategoryRepository(db).getAllCategories(),
  });
}

export function useCreateExpense() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Expense, 'id' | 'serverId' | 'createdAt'>) => {
      const tripRepo = new TripRepository(db);
      const repo = new ExpenseRepository(db);
      const localExpense = await repo.createExpense(data);
      try {
        const trip = await tripRepo.getTripById(data.tripId);
        const categoryServerId = (await new ExpenseCategoryRepository(db).findById(data.categoryId))?.serverId;
        if (trip?.serverId && categoryServerId) {
          const serverExpense = await expensesApi.create(parseInt(trip.serverId), {
            clientId: localExpense.id,
            tripId: parseInt(trip.serverId),
            amount: data.amount,
            currency: data.currency as any,
            categoryId: parseInt(categoryServerId),
            description: data.description,
            date: data.date,
            location: data.location,
          });
          await repo.setServerId(localExpense.id, String(serverExpense.id));
        }
      } catch {
        // stays pending
      }
      return localExpense;
    },
    onSuccess: (expense) => {
      qc.invalidateQueries({ queryKey: expenseKeys.all });
      qc.invalidateQueries({ queryKey: expenseKeys.byTrip(expense.tripId) });
    },
  });
}

export function useUpdateExpense() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (expense: Expense) => {
      const tripRepo = new TripRepository(db);
      const repo = new ExpenseRepository(db);
      const updated = await repo.updateExpense(expense);
      try {
        if (expense.serverId) {
          const trip = await tripRepo.getTripById(expense.tripId);
          const categoryServerId = (await new ExpenseCategoryRepository(db).findById(expense.categoryId))?.serverId;
          if (trip?.serverId && categoryServerId) {
            await expensesApi.update(parseInt(trip.serverId), parseInt(expense.serverId), {
              amount: expense.amount,
              currency: expense.currency as any,
              categoryId: parseInt(categoryServerId),
              description: expense.description,
              date: expense.date,
              location: expense.location,
            });
            await repo.markSynced(expense.id);
          }
        }
      } catch {
        // stays pending
      }
      return updated;
    },
    onSuccess: (_, expense) => {
      qc.invalidateQueries({ queryKey: expenseKeys.all });
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
      try {
        if (expenseRow?.serverId) {
          const trip = await tripRepo.getTripById(tripId);
          if (trip?.serverId) {
            await expensesApi.delete(parseInt(trip.serverId), parseInt(expenseRow.serverId));
          }
        }
      } catch {
        // stays soft-deleted with pending status
      }
      return tripId;
    },
    onSuccess: (tripId) => {
      qc.invalidateQueries({ queryKey: expenseKeys.all });
      qc.invalidateQueries({ queryKey: expenseKeys.byTrip(tripId) });
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
      try {
        const serverCategory = await expenseCategoriesApi.create({
          name: data.name,
          icon: data.icon,
          color: data.color,
        });
        await repo.setServerId(localCategory.id, String(serverCategory.id));
      } catch {
        // stays pending
      }
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
      try {
        if (categoryRow?.serverId) {
          await expenseCategoriesApi.delete(parseInt(categoryRow.serverId));
        }
      } catch {
        // stays soft-deleted with pending status
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: expenseKeys.categories }),
  });
}
