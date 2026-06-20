import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

import { budgetsApi } from '../api/budgets';
import { SyncProvider } from '../contexts/SyncContext';
import { useCreateBudget } from '../hooks/queries/useBudgets';
import { mockDb } from '../test-utils/mockDb';

jest.mock('expo-crypto');

jest.mock('../api/budgets', () => ({
  budgetsApi: { create: jest.fn() },
}));

jest.mock('../providers/DatabaseProvider', () => ({
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

const budgetData = {
  tripId: 'trip-1',
  currency: 'KRW',
  amount: 100000,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockDb.runAsync.mockResolvedValue(undefined);
  mockDb.withTransactionAsync.mockImplementation(async (fn: () => Promise<void>) => fn());
  mockDb.getFirstAsync.mockResolvedValue({ serverId: '123' });
});

describe('useCreateBudget - outbox', () => {
  test('서버 전송 성공 시 outbox에서 제거된다', async () => {
    (budgetsApi.create as jest.Mock).mockResolvedValueOnce({ id: 555 });

    const { result } = await renderHook(() => useCreateBudget(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(budgetData);
    });

    await waitFor(() => {
      const outboxDelete = mockDb.runAsync.mock.calls.find(([sql]: [string]) =>
        sql.includes('DELETE FROM outbox')
      );
      expect(outboxDelete).toBeDefined();
    });
  });

  test('서버 전송 실패 시 outbox에 항목이 남는다', async () => {
    (budgetsApi.create as jest.Mock).mockRejectedValueOnce(new Error('network error'));

    const { result } = await renderHook(() => useCreateBudget(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(budgetData);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await act(async () => {});

    const outboxDelete = mockDb.runAsync.mock.calls.find(([sql]: [string]) =>
      sql.includes('DELETE FROM outbox')
    );
    expect(outboxDelete).toBeUndefined();
  });
});
