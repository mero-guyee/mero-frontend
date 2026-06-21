import { mockDb } from './mockDb';

export function setupOutbox(domain: string, operation: 'create' | 'update' | 'delete', dataId = 'entity-1') {
  mockDb.getAllAsync.mockResolvedValueOnce([{ dataId, operation, domain }]);
}

export function expectOutboxRemoved() {
  const call = mockDb.runAsync.mock.calls.find(([sql]: [string]) =>
    sql.includes('DELETE FROM outbox')
  );
  expect(call).toBeDefined();
}

export function expectOutboxNotRemoved() {
  const call = mockDb.runAsync.mock.calls.find(([sql]: [string]) =>
    sql.includes('DELETE FROM outbox')
  );
  expect(call).toBeUndefined();
}

export function expectMarkFailed() {
  const call = mockDb.runAsync.mock.calls.find(([sql]: [string]) =>
    sql.includes("status = 'failed'")
  );
  expect(call).toBeDefined();
}

export interface SyncTestConfig {
  syncFn: (db: any) => Promise<void>;
  domain: string;
  api: { create: jest.Mock; update: jest.Mock; delete: jest.Mock };
  makeEntity: (attributes?: Record<string, any>) => Record<string, any>;
  makeTrip?: (attributes?: Record<string, any>) => Record<string, any>;
}

export function runCommonSyncTests({ syncFn, domain, api, makeEntity, makeTrip }: SyncTestConfig) {
  const dependsOnTrip = !!makeTrip;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.getAllAsync.mockResolvedValue([]);
    mockDb.getFirstAsync.mockResolvedValue(null);
    mockDb.runAsync.mockResolvedValue(undefined);
    mockDb.withTransactionAsync.mockImplementation(async (fn: () => Promise<void>) => fn());
    api.create.mockResolvedValue({ id: 999 });
    api.update.mockResolvedValue(undefined);
    api.delete.mockResolvedValue(undefined);
  });

  function setupEntityAndTrip(entity: Record<string, any>, tripAttributes?: Record<string, any>) {
    if (dependsOnTrip) {
      mockDb.getFirstAsync
        .mockResolvedValueOnce(entity)
        .mockResolvedValueOnce(makeTrip!(tripAttributes));
    } else {
      mockDb.getFirstAsync.mockResolvedValueOnce(entity);
    }
  }

  // ─── create ─────────────────────────────────────────────────────

  describe(`${domain} - create`, () => {
    test('서버 전송 성공 시 outbox에서 제거된다', async () => {
      const entity = makeEntity();
      setupOutbox(domain, 'create', entity.id);
      setupEntityAndTrip(entity);

      await syncFn(mockDb as any);

      expect(api.create).toHaveBeenCalled();
      expectOutboxRemoved();
    });

    if (dependsOnTrip) {
      test('trip의 serverId 없으면 API 호출 안 하고 outbox에 남는다', async () => {
        const entity = makeEntity();
        setupOutbox(domain, 'create', entity.id);
        setupEntityAndTrip(entity, { serverId: null });

        await syncFn(mockDb as any);

        expect(api.create).not.toHaveBeenCalled();
        expectOutboxNotRemoved();
      });
    }

    test('서버 전송 실패 시 outbox가 failed로 표시된다', async () => {
      const entity = makeEntity();
      setupOutbox(domain, 'create', entity.id);
      setupEntityAndTrip(entity);
      api.create.mockRejectedValueOnce(new Error('network error'));

      await syncFn(mockDb as any);

      expect(api.create).toHaveBeenCalled();
      expectMarkFailed();
    });
  });

  // ─── update ─────────────────────────────────────────────────────

  describe(`${domain} - update`, () => {
    test('서버 전송 성공 시 outbox에서 제거된다', async () => {
      const entity = makeEntity({ serverId: '42' });
      setupOutbox(domain, 'update', entity.id);
      setupEntityAndTrip(entity);

      await syncFn(mockDb as any);

      expect(api.update).toHaveBeenCalled();
      expectOutboxRemoved();
    });

    test('entity의 serverId 없으면 API 호출 없이 outbox 제거된다', async () => {
      const entity = makeEntity();
      setupOutbox(domain, 'update', entity.id);
      mockDb.getFirstAsync.mockResolvedValueOnce(entity);

      await syncFn(mockDb as any);

      expect(api.update).not.toHaveBeenCalled();
      expectOutboxRemoved();
    });

    if (dependsOnTrip) {
      test('trip의 serverId 없으면 API 호출 안 하고 outbox에 남는다', async () => {
        const entity = makeEntity({ serverId: '42' });
        setupOutbox(domain, 'update', entity.id);
        setupEntityAndTrip(entity, { serverId: null });

        await syncFn(mockDb as any);

        expect(api.update).not.toHaveBeenCalled();
        expectOutboxNotRemoved();
      });
    }

    test('서버 전송 실패 시 outbox가 failed로 표시된다', async () => {
      const entity = makeEntity({ serverId: '42' });
      setupOutbox(domain, 'update', entity.id);
      setupEntityAndTrip(entity);
      api.update.mockRejectedValueOnce(new Error('network error'));

      await syncFn(mockDb as any);

      expectMarkFailed();
    });
  });

  // ─── delete ─────────────────────────────────────────────────────

  describe(`${domain} - delete`, () => {
    test('서버 전송 성공 시 outbox에서 제거된다', async () => {
      const entity = makeEntity({ serverId: '42' });
      setupOutbox(domain, 'delete', entity.id);
      setupEntityAndTrip(entity);

      await syncFn(mockDb as any);

      expect(api.delete).toHaveBeenCalled();
      expectOutboxRemoved();
    });

    test('entity의 serverId 없으면 API 호출 없이 outbox 제거된다', async () => {
      const entity = makeEntity();
      setupOutbox(domain, 'delete', entity.id);
      mockDb.getFirstAsync.mockResolvedValueOnce(entity);

      await syncFn(mockDb as any);

      expect(api.delete).not.toHaveBeenCalled();
      expectOutboxRemoved();
    });

    if (dependsOnTrip) {
      test('trip의 serverId 없으면 API 호출 안 하고 outbox에 남는다', async () => {
        const entity = makeEntity({ serverId: '42' });
        setupOutbox(domain, 'delete', entity.id);
        setupEntityAndTrip(entity, { serverId: null });

        await syncFn(mockDb as any);

        expect(api.delete).not.toHaveBeenCalled();
        expectOutboxNotRemoved();
      });
    }

    test('서버 전송 실패 시 outbox가 failed로 표시된다', async () => {
      const entity = makeEntity({ serverId: '42' });
      setupOutbox(domain, 'delete', entity.id);
      setupEntityAndTrip(entity);
      api.delete.mockRejectedValueOnce(new Error('network error'));

      await syncFn(mockDb as any);

      expectMarkFailed();
    });
  });
}
