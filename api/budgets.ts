import { Currency } from './auth';
import { apiRequest } from './client';

export interface BudgetCreateRequest {
  clientId: string; // local UUID
  amount: number;
  currency: Currency;
  exchangeRate?: number;
}

export interface BudgetUpdateRequest {
  amount: number;
  currency: Currency;
  exchangeRate?: number;
}

export interface BudgetResponse {
  id: number;
  clientId: string;
  tripId: number;
  amount: number;
  currency: Currency;
  exchangeRate?: number;
  createdAt: string;
  updatedAt: string;
}

export const budgetsApi = {
  getByTrip: (tripId: number): Promise<BudgetResponse[]> =>
    apiRequest(`/api/trips/${tripId}/budgets`),

  create: (tripId: number, data: BudgetCreateRequest): Promise<BudgetResponse> =>
    apiRequest(`/api/trips/${tripId}/budgets`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (tripId: number, budgetId: number, data: BudgetUpdateRequest): Promise<BudgetResponse> =>
    apiRequest(`/api/trips/${tripId}/budgets/${budgetId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (tripId: number, budgetId: number): Promise<void> =>
    apiRequest(`/api/trips/${tripId}/budgets/${budgetId}`, { method: 'DELETE' }),
};
