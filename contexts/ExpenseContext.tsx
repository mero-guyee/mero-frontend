import React, { ReactNode } from 'react';
import {
  useCategoriesQuery,
  useCreateCategory,
  useCreateExpense,
  useDeleteCategory,
  useDeleteExpense,
  useExpensesQuery,
  useUpdateCategory,
  useUpdateExpense,
} from '../hooks/queries/useExpenses';
import { useDb } from '../providers/DatabaseProvider';
import { ExpenseRepository } from '../repositories';
import { Expense, ExpenseCategory } from '../types';

interface ExpenseContextType {
  expenses: Expense[];
  categories: ExpenseCategory[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (expenseId: string) => void;
  deleteExpensesByFootprintId: (footprintId: string) => void;
  deleteExpensesByTripId: (tripId: string) => void;
  addCategory: (category: Omit<ExpenseCategory, 'id'>) => void;
  updateCategory: (category: ExpenseCategory) => void;
  deleteCategory: (categoryId: string) => void;
  getExpensesByTripId: (tripId: string) => Expense[];
  getExpensesByFootprintId: (footprintId: string) => Expense[];
}

export function ExpenseProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useExpenses(): ExpenseContextType {
  const db = useDb();
  const { data: expenses = [] } = useExpensesQuery();
  const { data: categories = [] } = useCategoriesQuery();

  const createExpense = useCreateExpense();
  const updateExpenseMut = useUpdateExpense();
  const deleteExpenseMut = useDeleteExpense();
  const createCategory = useCreateCategory();
  const updateCategoryMut = useUpdateCategory();
  const deleteCategoryMut = useDeleteCategory();

  return {
    expenses,
    categories,
    addExpense: (expense) => createExpense.mutate(expense),
    updateExpense: (expense) => updateExpenseMut.mutate(expense),
    deleteExpense: (expenseId) => {
      const expense = expenses.find((e) => e.id === expenseId);
      if (expense) deleteExpenseMut.mutate({ id: expenseId, tripId: expense.tripId });
    },
    deleteExpensesByFootprintId: (footprintId) => {
      new ExpenseRepository(db).deleteByFootprintId(footprintId);
    },
    deleteExpensesByTripId: (tripId) => {
      new ExpenseRepository(db).deleteByTripId(tripId);
    },
    addCategory: (category) => createCategory.mutate(category),
    updateCategory: (category) => updateCategoryMut.mutate(category),
    deleteCategory: (categoryId) => deleteCategoryMut.mutate(categoryId),
    getExpensesByTripId: (tripId) => expenses.filter((e) => e.tripId === tripId),
    getExpensesByFootprintId: (footprintId) => expenses.filter((e) => e.footprintId === footprintId),
  };
}
