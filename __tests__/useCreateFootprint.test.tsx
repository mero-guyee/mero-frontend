import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

import { footprintsApi } from '../api/footprints';
import { SyncProvider } from '../contexts/SyncContext';
import { useCreateFootprint } from '../hooks/queries/useFootprints';
import { mockDb } from '../test-utils/mockDb';

jest.mock('expo-crypto');

jest.mock('../api/footprints', () => ({
  footprintsApi: { create: jest.fn() },
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

const footprintData = {
  tripId: 'trip-1',
  title: '테스트 발자국',
  content: '',
  date: '2024-01-01',
  locations: [],
  photoUrls: [],
  syncStatus: 'pending' as const,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockDb.runAsync.mockResolvedValue(undefined);
  mockDb.withTransactionAsync.mockImplementation(async (fn: () => Promise<void>) => fn());
  mockDb.getFirstAsync.mockResolvedValue({ serverId: '123' });
});

describe('useCreateFootprint - outbox', () => {
  test('서버 전송 성공 시 outbox에서 제거된다', async () => {
    (footprintsApi.create as jest.Mock).mockResolvedValueOnce({ id: 888 });

    const { result } = await renderHook(() => useCreateFootprint(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(footprintData);
    });

    await waitFor(() => {
      const outboxDelete = mockDb.runAsync.mock.calls.find(([sql]: [string]) =>
        sql.includes('DELETE FROM outbox')
      );
      expect(outboxDelete).toBeDefined();
    });
  });

  test('서버 전송 실패 시 outbox에 항목이 남는다', async () => {
    (footprintsApi.create as jest.Mock).mockRejectedValueOnce(new Error('network error'));

    const { result } = await renderHook(() => useCreateFootprint(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(footprintData);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await act(async () => {});

    const outboxDelete = mockDb.runAsync.mock.calls.find(([sql]: [string]) =>
      sql.includes('DELETE FROM outbox')
    );
    expect(outboxDelete).toBeUndefined();
  });
});
