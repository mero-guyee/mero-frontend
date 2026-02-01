import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Expense, Category } from '../types';
import { MOCK_EXPENSES, MOCK_CATEGORIES } from '../data/mockData';

interface ExpenseContextType {
  // 상태
  expenses: Expense[];
  categories: Category[];

  // Expense CRUD
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (expenseId: string) => void;
  deleteExpensesByDiaryId: (diaryId: string) => void;
  deleteExpensesByTripId: (tripId: string) => void;

  // Category CRUD
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;

  // 헬퍼 함수
  getExpensesByTripId: (tripId: string) => Expense[];
  getExpensesByDiaryId: (diaryId: string) => Expense[];
}

const ExpenseContext = createContext<ExpenseContextType | null>(null);

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);

  // Expense CRUD
  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: Date.now().toString() };
    setExpenses([newExpense, ...expenses]);
  };

  const updateExpense = (expense: Expense) => {
    setExpenses(expenses.map((e) => (e.id === expense.id ? expense : e)));
  };

  const deleteExpense = (expenseId: string) => {
    setExpenses(expenses.filter((e) => e.id !== expenseId));
  };

  const deleteExpensesByDiaryId = (diaryId: string) => {
    setExpenses(expenses.filter((e) => e.diaryId !== diaryId));
  };

  const deleteExpensesByTripId = (tripId: string) => {
    setExpenses(expenses.filter((e) => e.tripId !== tripId));
  };

  // Category CRUD
  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory = { ...category, id: Date.now().toString() };
    setCategories([newCategory, ...categories]);
  };

  const updateCategory = (category: Category) => {
    setCategories(categories.map((c) => (c.id === category.id ? category : c)));
  };

  const deleteCategory = (categoryId: string) => {
    setCategories(categories.filter((c) => c.id !== categoryId));
  };

  // 헬퍼 함수
  const getExpensesByTripId = (tripId: string) => expenses.filter((e) => e.tripId === tripId);
  const getExpensesByDiaryId = (diaryId: string) => expenses.filter((e) => e.diaryId === diaryId);

  const value: ExpenseContextType = {
    expenses,
    categories,
    addExpense,
    updateExpense,
    deleteExpense,
    deleteExpensesByDiaryId,
    deleteExpensesByTripId,
    addCategory,
    updateCategory,
    deleteCategory,
    getExpensesByTripId,
    getExpensesByDiaryId,
  };

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
}

export default ExpenseContext;
