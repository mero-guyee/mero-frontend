import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

import { documentsApi } from '../../api/documents';
import { SyncProvider } from '../../contexts/SyncContext';
import { useCreateDocument } from '../../hooks/queries/useDocuments';
import { mockDb } from '../../test-utils/mockDb';

jest.mock('expo-crypto');

jest.mock('expo-file-system', () => {
  class MockFile {
    uri: string;
    name: string;
    constructor(...args: any[]) {
      const last = String(args[args.length - 1] ?? 'file');
      this.uri = `file:///mock/${last}`;
      this.name = last;
    }
    copy() {}
  }
  class MockDirectory {
    exists = true;
    constructor(..._args: any[]) {}
    create() {}
  }
  return {
    Directory: MockDirectory,
    File: MockFile,
    Paths: { document: 'file:///mock-documents/' },
  };
});

jest.mock('@/api/documents', () => ({
  documentsApi: { upload: jest.fn() },
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

const documentInput = {
  tripId: 'trip-1',
  data: {
    fileName: '테스트서류.pdf',
    fileUri: 'file:///test/서류.pdf',
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockDb.runAsync.mockResolvedValue(undefined);
  mockDb.withTransactionAsync.mockImplementation(async (fn: () => Promise<void>) => fn());
  mockDb.getFirstAsync.mockImplementation(async (sql: string) => {
    if (sql.includes('FROM trips')) return { serverId: '123' };
    if (sql.includes('FROM documents')) {
      return { id: 'document-1', serverId: null, tripId: documentInput.tripId, ...documentInput.data };
    }
    return null;
  });
});

describe('useCreateDocument - outbox', () => {
  test('서버 전송 성공 시 outbox에서 제거된다', async () => {
    (documentsApi.upload as jest.Mock).mockResolvedValueOnce({ id: 777 });

    const { result } = await renderHook(() => useCreateDocument(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(documentInput);
    });

    await waitFor(() => {
      const outboxDelete = mockDb.runAsync.mock.calls.find(([sql]: [string]) =>
        sql.includes('DELETE FROM outbox')
      );
      expect(outboxDelete).toBeDefined();
    });
  });

  test('서버 전송 실패 시 outbox에 항목이 남는다', async () => {
    (documentsApi.upload as jest.Mock).mockRejectedValueOnce(new Error('network error'));

    const { result } = await renderHook(() => useCreateDocument(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(documentInput);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await act(async () => {});

    const outboxDelete = mockDb.runAsync.mock.calls.find(([sql]: [string]) =>
      sql.includes('DELETE FROM outbox')
    );
    expect(outboxDelete).toBeUndefined();
  });
});
