import * as SQLite from 'expo-sqlite';
import { useEffect } from 'react';
import { expenseCategoriesApi, userApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useDb } from '../providers/DatabaseProvider';
import { ExpenseCategoryRepository, UserRepository } from '../repositories';

async function cacheCurrentUser(db: SQLite.SQLiteDatabase) {
  try {
    const user = await userApi.getMe();
    await new UserRepository(db).upsertFromServer(user);
  } catch (e) {
    console.error('Failed to cache user:', e);
  }
}

async function cacheCategories(db: SQLite.SQLiteDatabase) {
  try {
    const categories = await expenseCategoriesApi.getAll();
    const repo = new ExpenseCategoryRepository(db);
    await Promise.all(categories.map((c) => repo.upsertFromServer(c)));
  } catch (e) {
    console.error('Failed to cache categories:', e);
  }
}

export function useAuthDataSync() {
  const { isAuthenticated } = useAuth();
  const db = useDb();

  useEffect(() => {
    if (!isAuthenticated) return;

    cacheCurrentUser(db);
    cacheCategories(db);
  }, [isAuthenticated, db]);
}
