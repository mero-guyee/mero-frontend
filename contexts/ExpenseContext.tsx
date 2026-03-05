import React, { ReactNode } from 'react';
import { Expense, Category } from '../types';
import {
  useExpensesQuery,
  useCategoriesQuery,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../hooks/queries/useExpenses';
import { ExpenseRepository } from '../repositories';
import { useDb } from '../providers/DatabaseProvider';

interface ExpenseContextType {
  expenses: Expense[];
  categories: Category[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (expenseId: string) => void;
  deleteExpensesByDiaryId: (diaryId: string) => void;
  deleteExpensesByTripId: (tripId: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  getExpensesByTripId: (tripId: string) => Expense[];
  getExpensesByDiaryId: (diaryId: string) => Expense[];
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
    deleteExpensesByDiaryId: (diaryId) => {
      new ExpenseRepository(db).deleteByDiaryId(diaryId);
    },
    deleteExpensesByTripId: (tripId) => {
      new ExpenseRepository(db).deleteByTripId(tripId);
    },
    addCategory: (category) => createCategory.mutate(category),
    updateCategory: (category) => updateCategoryMut.mutate(category),
    deleteCategory: (categoryId) => deleteCategoryMut.mutate(categoryId),
    getExpensesByTripId: (tripId) => expenses.filter((e) => e.tripId === tripId),
    getExpensesByDiaryId: (diaryId) => expenses.filter((e) => e.diaryId === diaryId),
  };
}
