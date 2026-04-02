import React, { ReactNode } from 'react';
import {
  useBudgetsQuery,
  useCreateBudget,
  useDeleteBudget,
  useUpdateBudget,
} from '../hooks/queries/useBudgets';
import { useDb } from '../providers/DatabaseProvider';
import { BudgetRepository } from '../repositories';
import { Budget } from '../types';

interface BudgetContextType {
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (budgetId: string) => void;
  deleteBudgetsByTripId: (tripId: string) => void;
  getBudgetsByTripId: (tripId: string) => Budget[];
  getBudgetByCurrency: (currency: string) => Budget | undefined;
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
    getBudgetByCurrency: (currency: string) => budgets.find((b) => b.currency === currency),
  };
}
