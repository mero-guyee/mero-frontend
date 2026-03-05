import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Expense, Category } from '../../types';
import { ExpenseRepository, CategoryRepository } from '../../repositories';
import { useDb } from '../../providers/DatabaseProvider';

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
    queryFn: () => new ExpenseRepository(db).getExpensesByTripId(tripId),
    enabled: !!tripId,
  });
}

export function useCategoriesQuery() {
  const db = useDb();
  return useQuery({
    queryKey: expenseKeys.categories,
    queryFn: () => new CategoryRepository(db).getAllCategories(),
  });
}

export function useCreateExpense() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Expense, 'id'>) => new ExpenseRepository(db).createExpense(data),
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
    mutationFn: (expense: Expense) => new ExpenseRepository(db).updateExpense(expense),
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
      await new ExpenseRepository(db).deleteExpense(id);
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
    mutationFn: (data: Omit<Category, 'id'>) => new CategoryRepository(db).createCategory(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: expenseKeys.categories }),
  });
}

export function useUpdateCategory() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (category: Category) => new CategoryRepository(db).updateCategory(category),
    onSuccess: () => qc.invalidateQueries({ queryKey: expenseKeys.categories }),
  });
}

export function useDeleteCategory() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => new CategoryRepository(db).deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: expenseKeys.categories }),
  });
}
