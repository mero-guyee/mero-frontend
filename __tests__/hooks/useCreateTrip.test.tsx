import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

import { tripsApi } from '../../api/trips';
import { SyncProvider } from '../../contexts/SyncContext';
import { useCreateTrip } from '../../hooks/queries/useTrips';
import { mockDb } from '../../test-utils/mockDb';

jest.mock('expo-crypto');

jest.mock('@/api/trips', () => ({
  tripsApi: { create: jest.fn() },
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

const tripData = {
  title: '테스트 여행',
  startDate: '2024-01-01',
  endDate: '2024-01-07',
  countries: ['KR'],
  imageUrl: '',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockDb.runAsync.mockResolvedValue(undefined);
  mockDb.withTransactionAsync.mockImplementation(async (fn: () => Promise<void>) => fn());
});

describe('useCreateTrip - outbox', () => {
  test('서버 전송 성공 시 outbox에서 제거된다', async () => {
    (tripsApi.create as jest.Mock).mockResolvedValueOnce({ id: 999 });

    const { result } = await renderHook(() => useCreateTrip(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(tripData);
    });

    await waitFor(() => {
      const outboxDelete = mockDb.runAsync.mock.calls.find(([sql]: [string]) =>
        sql.includes('DELETE FROM outbox')
      );
      expect(outboxDelete).toBeDefined();
    });
  });

  test('서버 전송 실패 시 outbox에 항목이 남는다', async () => {
    (tripsApi.create as jest.Mock).mockRejectedValueOnce(new Error('network error'));

    const { result } = await renderHook(() => useCreateTrip(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(tripData);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await act(async () => {});

    const outboxDelete = mockDb.runAsync.mock.calls.find(([sql]: [string]) =>
      sql.includes('DELETE FROM outbox')
    );
    expect(outboxDelete).toBeUndefined();
  });
});
