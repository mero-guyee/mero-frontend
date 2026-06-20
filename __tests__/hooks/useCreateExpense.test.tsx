import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

import { expensesApi } from '../../api/expenses';
import { SyncProvider } from '../../contexts/SyncContext';
import { useCreateExpense } from '../../hooks/queries/useExpenses';
import { mockDb } from '../../test-utils/mockDb';

jest.mock('expo-crypto');

jest.mock('@/api/expenses', () => ({
  expensesApi: { create: jest.fn() },
  expenseCategoriesApi: { getAll: jest.fn() },
}));

jest.mock('@/providers/DatabaseProvider', () => ({
  useDb: () => mockDb,
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <SyncProvider>{children}</SyncProvider>
      </QueryClientProvider>
    );
  };
}

const expenseData = {
  tripId: 'trip-1',
  categoryId: 'cat-1',
  amount: 10000,
  currency: 'KRW',
  date: '2024-01-01',
  syncStatus: 'pending' as const,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockDb.runAsync.mockResolvedValue(undefined);
  mockDb.withTransactionAsync.mockImplementation(async (fn: () => Promise<void>) => fn());
  mockDb.getFirstAsync.mockImplementation(async (sql: string) => {
    if (sql.includes('FROM trips')) return { serverId: '123' };
    if (sql.includes('FROM expense_categories')) return { serverId: '456' };
    return null;
  });
});

describe('useCreateExpense - outbox', () => {
  test('서버 전송 성공 시 outbox에서 제거된다', async () => {
    (expensesApi.create as jest.Mock).mockResolvedValueOnce({ id: 666 });

    const { result } = await renderHook(() => useCreateExpense(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(expenseData);
    });

    await waitFor(() => {
      const outboxDelete = mockDb.runAsync.mock.calls.find(([sql]: [string]) =>
        sql.includes('DELETE FROM outbox')
      );
      expect(outboxDelete).toBeDefined();
    });
  });

  test('서버 전송 실패 시 outbox에 항목이 남는다', async () => {
    (expensesApi.create as jest.Mock).mockRejectedValueOnce(new Error('network error'));

    const { result } = await renderHook(() => useCreateExpense(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(expenseData);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await act(async () => {});

    const outboxDelete = mockDb.runAsync.mock.calls.find(([sql]: [string]) =>
      sql.includes('DELETE FROM outbox')
    );
    expect(outboxDelete).toBeUndefined();
  });
});
