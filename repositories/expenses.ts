import * as SQLite from 'expo-sqlite';
import type { ExpenseResponse } from '../api/expenses';
import { Expense, ExpenseCategory } from '../types';
import { BaseEntity, BaseRepository } from './base';

export interface ExpenseRow extends BaseEntity {
  serverId?: string | null;
  tripId: string;
  footprintId?: string | null;
  categoryId: string;
  categoryName?: string | null;
  categoryIcon?: string | null;
  categoryColor?: string | null;
  amount: number;
  currency: string;
  description?: string | null;
  date: string;
  location?: string | null;
}

export interface ExpenseCategoryRow extends BaseEntity {
  serverId?: string | null;
  name: string;
  icon: string;
  color: string;
  isDefault: number; // 0 | 1 in SQLite
}

function rowToExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    serverId: row.serverId ?? undefined,
    tripId: row.tripId,
    footprintId: row.footprintId ?? undefined,
    categoryId: row.categoryId,
    categoryName: row.categoryName ?? undefined,
    categoryIcon: row.categoryIcon ?? undefined,
    categoryColor: row.categoryColor ?? undefined,
    amount: row.amount,
    currency: row.currency,
    description: row.description ?? undefined,
    date: row.date,
    location: row.location ?? undefined,
    createdAt: row.createdAt,
  };
}

function rowToExpenseCategory(row: ExpenseCategoryRow): ExpenseCategory {
  return {
    id: row.id,
    serverId: row.serverId ?? undefined,
    name: row.name,
    icon: row.icon,
    color: row.color,
    isDefault: row.isDefault === 1,
  };
}

export class ExpenseRepository extends BaseRepository<ExpenseRow> {
  constructor(db: SQLite.SQLiteDatabase) {
    super(db, 'expenses');
  }

  protected fromRow(row: Record<string, any>): ExpenseRow {
    return row as ExpenseRow;
  }

  async getAllExpenses(): Promise<Expense[]> {
    const rows = await this.findAll();
    return rows.map(rowToExpense);
  }

  async getExpensesByTripId(tripId: string): Promise<Expense[]> {
    const rows = await this.db.getAllAsync<ExpenseRow>(
      `SELECT * FROM expenses WHERE tripId = ? AND deletedAt IS NULL ORDER BY date DESC`,
      [tripId]
    );
    return rows.map(rowToExpense);
  }

  async getExpensesByFootprintId(footprintId: string): Promise<Expense[]> {
    const rows = await this.db.getAllAsync<ExpenseRow>(
      `SELECT * FROM expenses WHERE footprintId = ? AND deletedAt IS NULL ORDER BY date DESC`,
      [footprintId]
    );
    return rows.map(rowToExpense);
  }

  async createExpense(data: Omit<Expense, 'id' | 'serverId' | 'createdAt'>): Promise<Expense> {
    const row = await this.create({
      ...data,
      serverId: null,
      footprintId: data.footprintId ?? null,
      categoryName: data.categoryName ?? null,
      categoryIcon: data.categoryIcon ?? null,
      categoryColor: data.categoryColor ?? null,
      description: data.description ?? null,
      location: data.location ?? null,
    } as Omit<ExpenseRow, keyof BaseEntity>);
    return rowToExpense(row);
  }

  async updateExpense(expense: Expense): Promise<Expense | null> {
    const row = await this.update(expense.id, {
      tripId: expense.tripId,
      footprintId: expense.footprintId ?? null,
      categoryId: expense.categoryId,
      categoryName: expense.categoryName ?? null,
      categoryIcon: expense.categoryIcon ?? null,
      categoryColor: expense.categoryColor ?? null,
      amount: expense.amount,
      currency: expense.currency,
      description: expense.description ?? null,
      date: expense.date,
      location: expense.location ?? null,
    });
    return row ? rowToExpense(row) : null;
  }

  async deleteExpense(id: string): Promise<void> {
    await this.delete(id);
  }

  async deleteByTripId(tripId: string): Promise<void> {
    await this.db.runAsync(
      `UPDATE expenses SET deletedAt = datetime('now'), updatedAt = datetime('now'), syncStatus = 'pending' WHERE tripId = ?`,
      [tripId]
    );
  }

  async deleteByFootprintId(footprintId: string): Promise<void> {
    await this.db.runAsync(
      `UPDATE expenses SET deletedAt = datetime('now'), updatedAt = datetime('now'), syncStatus = 'pending' WHERE footprintId = ?`,
      [footprintId]
    );
  }

  async upsertFromServer(serverExpense: ExpenseResponse, localTripId: string): Promise<void> {
    if (!serverExpense.clientId) return;
    const existing = await this.findById(serverExpense.clientId);
    if (existing) {
      if (existing.syncStatus === 'pending') return;
      await this.db.runAsync(
        `UPDATE expenses SET serverId=?, amount=?, currency=?, categoryId=?, categoryName=?, categoryIcon=?, categoryColor=?, description=?, date=?, syncStatus='synced' WHERE id=?`,
        [String(serverExpense.id), serverExpense.amount, serverExpense.currency,
          String(serverExpense.categoryId), serverExpense.categoryName, serverExpense.categoryIcon,
          serverExpense.categoryColor, serverExpense.description ?? null, serverExpense.date,
          serverExpense.clientId]
      );
    } else {
      await this.db.runAsync(
        `INSERT OR IGNORE INTO expenses (id, serverId, tripId, footprintId, categoryId, categoryName, categoryIcon, categoryColor, amount, currency, description, date, location, createdAt, updatedAt, syncStatus, deletedAt) VALUES (?,?,?,NULL,?,?,?,?,?,?,?,?,NULL,?,?,'synced',NULL)`,
        [serverExpense.clientId, String(serverExpense.id), localTripId,
          String(serverExpense.categoryId), serverExpense.categoryName, serverExpense.categoryIcon,
          serverExpense.categoryColor, serverExpense.amount, serverExpense.currency,
          serverExpense.description ?? null, serverExpense.date,
          serverExpense.createdAt, serverExpense.createdAt]
      );
    }
  }
}

export class ExpenseCategoryRepository extends BaseRepository<ExpenseCategoryRow> {
  constructor(db: SQLite.SQLiteDatabase) {
    super(db, 'expense_categories');
  }

  protected fromRow(row: Record<string, any>): ExpenseCategoryRow {
    return row as ExpenseCategoryRow;
  }

  async getAllCategories(): Promise<ExpenseCategory[]> {
    const rows = await this.findAll();
    return rows.map(rowToExpenseCategory);
  }

  async createCategory(data: Omit<ExpenseCategory, 'id' | 'serverId'>): Promise<ExpenseCategory> {
    const row = await this.create({
      ...data,
      serverId: null,
      isDefault: data.isDefault ? 1 : 0,
    } as Omit<ExpenseCategoryRow, keyof BaseEntity>);
    return rowToExpenseCategory(row);
  }

  async updateCategory(category: ExpenseCategory): Promise<ExpenseCategory | null> {
    const row = await this.update(category.id, {
      name: category.name,
      icon: category.icon,
      color: category.color,
      isDefault: category.isDefault ? 1 : 0,
    });
    return row ? rowToExpenseCategory(row) : null;
  }

  async deleteCategory(id: string): Promise<void> {
    await this.delete(id);
  }
}
