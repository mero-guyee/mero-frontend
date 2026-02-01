import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Budget } from '../types';
import { MOCK_BUDGETS } from '../data/mockData';

interface BudgetContextType {
  // 상태
  budgets: Budget[];

  // Budget CRUD
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (budgetId: string) => void;
  deleteBudgetsByTripId: (tripId: string) => void;

  // 헬퍼 함수
  getBudgetsByTripId: (tripId: string) => Budget[];
}

const BudgetContext = createContext<BudgetContextType | null>(null);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [budgets, setBudgets] = useState<Budget[]>(MOCK_BUDGETS);

  // Budget CRUD
  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget = { ...budget, id: Date.now().toString() };
    setBudgets([newBudget, ...budgets]);
  };

  const updateBudget = (budget: Budget) => {
    setBudgets(budgets.map((b) => (b.id === budget.id ? budget : b)));
  };

  const deleteBudget = (budgetId: string) => {
    setBudgets(budgets.filter((b) => b.id !== budgetId));
  };

  const deleteBudgetsByTripId = (tripId: string) => {
    setBudgets(budgets.filter((b) => b.tripId !== tripId));
  };

  // 헬퍼 함수
  const getBudgetsByTripId = (tripId: string) => budgets.filter((b) => b.tripId === tripId);

  const value: BudgetContextType = {
    budgets,
    addBudget,
    updateBudget,
    deleteBudget,
    deleteBudgetsByTripId,
    getBudgetsByTripId,
  };

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

export function useBudgets() {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudgets must be used within a BudgetProvider');
  }
  return context;
}

export default BudgetContext;
