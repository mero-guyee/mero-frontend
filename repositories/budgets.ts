import * as SQLite from 'expo-sqlite';
import type { BudgetResponse } from '../api/budgets';
import { Budget } from '../types';
import { BaseEntity, BaseRepository } from './base';

export interface BudgetRow extends BaseEntity {
  serverId?: string | null;
  tripId: string;
  currency: string;
  amount: number;
  exchangeRate?: number | null;
}

function rowToBudget(row: BudgetRow): Budget {
  return {
    id: row.id,
    serverId: row.serverId ?? undefined,
    tripId: row.tripId,
    currency: row.currency,
    amount: row.amount,
    exchangeRate: row.exchangeRate ?? undefined,
  };
}

export class BudgetRepository extends BaseRepository<BudgetRow> {
  constructor(db: SQLite.SQLiteDatabase) {
    super(db, 'budgets');
  }

  protected fromRow(row: Record<string, any>): BudgetRow {
    return row as BudgetRow;
  }

  async getAllBudgets(): Promise<Budget[]> {
    const rows = await this.findAll();
    return rows.map(rowToBudget);
  }

  async getBudgetsByTripId(tripId: string): Promise<Budget[]> {
    const rows = await this.db.getAllAsync<BudgetRow>(
      `SELECT * FROM budgets WHERE tripId = ? AND deletedAt IS NULL`,
      [tripId]
    );
    return rows.map(rowToBudget);
  }

  async createBudget(data: Omit<Budget, 'id' | 'serverId'>): Promise<Budget> {
    const row = await this.create({
      ...data,
      serverId: null,
      exchangeRate: data.exchangeRate ?? null,
    } as Omit<BudgetRow, keyof BaseEntity>);
    return rowToBudget(row);
  }

  async updateBudget(budget: Budget): Promise<Budget | null> {
    const row = await this.update(budget.id, {
      tripId: budget.tripId,
      currency: budget.currency,
      amount: budget.amount,
      exchangeRate: budget.exchangeRate ?? null,
    });
    return row ? rowToBudget(row) : null;
  }

  async deleteBudget(id: string): Promise<void> {
    await this.delete(id);
  }

  async deleteByTripId(tripId: string): Promise<void> {
    await this.db.runAsync(
      `UPDATE budgets SET deletedAt = datetime('now'), updatedAt = datetime('now'), syncStatus = 'pending' WHERE tripId = ?`,
      [tripId]
    );
  }

  async upsertFromServer(serverBudget: BudgetResponse, localTripId: string): Promise<void> {
    if (!serverBudget.clientId) return;
    const existing = await this.findById(serverBudget.clientId);
    if (existing) {
      if (existing.syncStatus === 'pending') return;
      await this.db.runAsync(
        `UPDATE budgets SET serverId=?, amount=?, currency=?, exchangeRate=?, syncStatus='synced', updatedAt=? WHERE id=?`,
        [
          String(serverBudget.id),
          serverBudget.amount,
          serverBudget.currency,
          serverBudget.exchangeRate ?? null,
          serverBudget.updatedAt,
          serverBudget.clientId,
        ]
      );
    } else {
      await this.db.runAsync(
        `INSERT OR IGNORE INTO budgets (id, serverId, tripId, currency, amount, exchangeRate, createdAt, updatedAt, syncStatus, deletedAt) VALUES (?,?,?,?,?,?,?,?,'synced',NULL)`,
        [
          serverBudget.clientId,
          String(serverBudget.id),
          localTripId,
          serverBudget.currency,
          serverBudget.amount,
          serverBudget.exchangeRate ?? null,
          serverBudget.createdAt,
          serverBudget.updatedAt,
        ]
      );
    }
  }
}
