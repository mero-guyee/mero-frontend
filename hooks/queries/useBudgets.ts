import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Budget } from '../../types';
import { BudgetRepository } from '../../repositories';
import { useDb } from '../../providers/DatabaseProvider';

export const budgetKeys = {
  all: ['budgets'] as const,
  byTrip: (tripId: string) => ['budgets', 'trip', tripId] as const,
};

export function useBudgetsQuery() {
  const db = useDb();
  return useQuery({
    queryKey: budgetKeys.all,
    queryFn: () => new BudgetRepository(db).getAllBudgets(),
  });
}

export function useBudgetsByTripQuery(tripId: string) {
  const db = useDb();
  return useQuery({
    queryKey: budgetKeys.byTrip(tripId),
    queryFn: () => new BudgetRepository(db).getBudgetsByTripId(tripId),
    enabled: !!tripId,
  });
}

export function useCreateBudget() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Budget, 'id'>) => new BudgetRepository(db).createBudget(data),
    onSuccess: (budget) => {
      qc.invalidateQueries({ queryKey: budgetKeys.all });
      qc.invalidateQueries({ queryKey: budgetKeys.byTrip(budget.tripId) });
    },
  });
}

export function useUpdateBudget() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (budget: Budget) => new BudgetRepository(db).updateBudget(budget),
    onSuccess: (_, budget) => {
      qc.invalidateQueries({ queryKey: budgetKeys.all });
      qc.invalidateQueries({ queryKey: budgetKeys.byTrip(budget.tripId) });
    },
  });
}

export function useDeleteBudget() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, tripId }: { id: string; tripId: string }) => {
      await new BudgetRepository(db).deleteBudget(id);
      return tripId;
    },
    onSuccess: (tripId) => {
      qc.invalidateQueries({ queryKey: budgetKeys.all });
      qc.invalidateQueries({ queryKey: budgetKeys.byTrip(tripId) });
    },
  });
}
