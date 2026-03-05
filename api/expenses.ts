import { apiRequest } from './client';
import { Currency } from './auth';

export interface ExpenseCreateRequest {
  clientId: string; // local UUID
  tripId: number;
  footprintId?: number;
  amount: number;
  currency: Currency;
  categoryId: number;
  description?: string;
  date: string; // YYYY-MM-DD
  location?: string;
}

export interface ExpenseUpdateRequest {
  footprintId?: number;
  amount: number;
  currency: Currency;
  categoryId: number;
  description?: string;
  date: string;
  location?: string;
}

export interface ExpenseResponse {
  id: number;
  clientId: string;
  tripId: number;
  footprintId?: number;
  amount: number;
  currency: Currency;
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  description?: string;
  date: string;
  location?: string;
  createdAt: string;
}

export interface CurrencyUsageDto {
  currency: Currency;
  totalSpent: number;
  budget?: number;
  usagePercent?: number;
}

export interface ExpenseListResponse {
  expenses: ExpenseResponse[];
  currencyUsages: CurrencyUsageDto[];
}

export const expensesApi = {
  getByTrip: (tripId: number): Promise<ExpenseListResponse> =>
    apiRequest(`/api/trips/${tripId}/expenses`),

  create: (tripId: number, data: ExpenseCreateRequest): Promise<ExpenseResponse> =>
    apiRequest(`/api/trips/${tripId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (tripId: number, expenseId: number, data: ExpenseUpdateRequest): Promise<ExpenseResponse> =>
    apiRequest(`/api/trips/${tripId}/expenses/${expenseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (tripId: number, expenseId: number): Promise<void> =>
    apiRequest(`/api/trips/${tripId}/expenses/${expenseId}`, { method: 'DELETE' }),
};

export interface ExpenseCategoryCreateRequest {
  name: string;
  icon: string;
  color: string;
}

export interface ExpenseCategoryResponse {
  id: number;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
}

export const expenseCategoriesApi = {
  create: (data: ExpenseCategoryCreateRequest): Promise<ExpenseCategoryResponse> =>
    apiRequest(`/api/expense-categories?name=${encodeURIComponent(data.name)}&icon=${encodeURIComponent(data.icon)}&color=${encodeURIComponent(data.color)}`, {
      method: 'POST',
    }),

  delete: (categoryId: number): Promise<void> =>
    apiRequest(`/api/expense-categories/${categoryId}`, { method: 'DELETE' }),
};
