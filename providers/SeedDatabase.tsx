import React, { ReactNode, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import {
  MOCK_BUDGETS,
  MOCK_EXPENSE_CATEGORIES,
  MOCK_EXPENSES,
  MOCK_FOOTPRINTS,
  MOCK_MEMOS
} from '../data/mockData';
import { BudgetRepository } from '../repositories/budgets';
import { ExpenseCategoryRepository, ExpenseRepository } from '../repositories/expenses';
import { FootprintRepository } from '../repositories/footprints';
import { MemoRepository, TripRepository } from '../repositories/trips';
import { useDb } from './DatabaseProvider';

async function seedIfEmpty(db: ReturnType<typeof useDb>): Promise<void> {
  const tripRepo = new TripRepository(db);
  const existing = await tripRepo.findAll();
  if (existing.length > 0) return; // 이미 시드됨

  const memoRepo = new MemoRepository(db);
  const footprintRepo = new FootprintRepository(db);
  const expenseRepo = new ExpenseRepository(db);
  const categoryRepo = new ExpenseCategoryRepository(db);
  const budgetRepo = new BudgetRepository(db);

  const tripIdMap = new Map<string, string>();
  const footprintIdMap = new Map<string, string>();
  const categoryIdMap = new Map<string, string>();

  // for (const t of MOCK_TRIPS) {
  //   const row = await tripRepo.createTrip(t);
  //   tripIdMap.set(t.id, row.id);
  // }

  for (const f of MOCK_FOOTPRINTS) {
    const newTripId = tripIdMap.get(f.tripId);
    if (!newTripId) continue;
    const row = await footprintRepo.createFootprint({ ...f, tripId: newTripId });
    footprintIdMap.set(f.id, row.id);
  }

  for (const c of MOCK_EXPENSE_CATEGORIES) {
    const row = await categoryRepo.createCategory(c);
    categoryIdMap.set(c.id, row.id);
  }

  for (const e of MOCK_EXPENSES) {
    const newTripId = tripIdMap.get(e.tripId);
    if (!newTripId) continue;
    const newFootprintId = e.footprintId ? footprintIdMap.get(e.footprintId) : undefined;
    const newCategoryId = categoryIdMap.get(e.categoryId);
    if (!newCategoryId) continue;
    await expenseRepo.createExpense({
      ...e,
      tripId: newTripId,
      footprintId: newFootprintId,
      categoryId: newCategoryId,
    });
  }

  for (const b of MOCK_BUDGETS) {
    const newTripId = tripIdMap.get(b.tripId);
    if (!newTripId) continue;
    await budgetRepo.createBudget({ ...b, tripId: newTripId });
  }

  for (const m of MOCK_MEMOS) {
    const newTripId = tripIdMap.get(m.tripId);
    if (!newTripId) continue;
    await memoRepo.createMemo({ tripId: newTripId, title: m.title, content: m.content });
  }
}

export function SeedDatabase({ children }: { children: ReactNode }) {
  const db = useDb();
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    seedIfEmpty(db).then(() => setSeeded(true));
  }, [db]);

  if (!seeded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}
