import React, { ReactNode } from 'react';
import { Budget } from '../types';
import {
  useBudgetsQuery,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
} from '../hooks/queries/useBudgets';
import { BudgetRepository } from '../repositories';
import { useDb } from '../providers/DatabaseProvider';

interface BudgetContextType {
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (budgetId: string) => void;
  deleteBudgetsByTripId: (tripId: string) => void;
  getBudgetsByTripId: (tripId: string) => Budget[];
}

export function BudgetProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useBudgets(): BudgetContextType {
  const db = useDb();
  const { data: budgets = [] } = useBudgetsQuery();
  const createBudget = useCreateBudget();
  const updateBudgetMut = useUpdateBudget();
  const deleteBudgetMut = useDeleteBudget();

  return {
    budgets,
    addBudget: (budget) => createBudget.mutate(budget),
    updateBudget: (budget) => updateBudgetMut.mutate(budget),
    deleteBudget: (budgetId) => {
      const budget = budgets.find((b) => b.id === budgetId);
      if (budget) deleteBudgetMut.mutate({ id: budgetId, tripId: budget.tripId });
    },
    deleteBudgetsByTripId: (tripId) => {
      new BudgetRepository(db).deleteByTripId(tripId);
    },
    getBudgetsByTripId: (tripId) => budgets.filter((b) => b.tripId === tripId),
  };
}
