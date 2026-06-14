import { TripRepository } from '../repositories/trips';

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => 'mock-uuid'),
}));

jest.mock('../api/trips', () => ({
  tripsApi: {
    create: jest.fn(),
  },
}));

function createMockDb() {
  return {
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    runAsync: jest.fn().mockResolvedValue(undefined),
    withTransactionAsync: jest.fn().mockImplementation(async (fn: () => Promise<void>) => fn()),
  };
}

const tripData = {
  title: '테스트 여행',
  imageUrl: '',
  startDate: '2024-01-01',
  endDate: '2024-01-07',
  countries: ['KR'],
};

const tripRow = {
  id: 'trip-1',
  title: '테스트 여행',
  serverId: null,
  deletedAt: null,
  startDate: '2024-01-01',
  endDate: '2024-01-07',
  countries: '["KR"]',
  imageUrl: '',
  syncStatus: 'pending',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('outbox 기본 동작', () => {
  test('데이터 생성시 outbox에 추가된다', async () => {
    const mockDb = createMockDb();
    const repo = new TripRepository(mockDb as any);

    await repo.createTrip(tripData);

    const outboxInsert = mockDb.runAsync.mock.calls.find(([sql]: [string]) =>
      sql.includes('INSERT INTO outbox')
    );

    expect(outboxInsert).toBeDefined();

    const [sql, params] = outboxInsert;

    expect(params[1]).toBe('trips');
    expect(sql).toContain("'create'");
    expect(params[2]).toBeTruthy();
    expect(params[3]).toBe('테스트 여행');
  });

  test('서버에 등록된 데이터 삭제 시 outbox에 delete operation이 추가된다', async () => {
    const mockDb = createMockDb();
    const repo = new TripRepository(mockDb as any);

    mockDb.getFirstAsync.mockResolvedValueOnce({ ...tripRow, serverId: '999' });

    await repo.deleteTrip('trip-1');

    const outboxInsert = mockDb.runAsync.mock.calls.find(
      ([sql]: [string]) => sql.includes('INSERT OR REPLACE INTO outbox') && sql.includes("'delete'")
    );

    expect(outboxInsert).toBeDefined();

    const [, params] = outboxInsert;
    expect(params[1]).toBe('trips');
    expect(params[2]).toBe('trip-1');
  });

  test('서버 미등록 데이터 삭제 시 outbox에서 해당 항목이 제거된다', async () => {
    const mockDb = createMockDb();
    const repo = new TripRepository(mockDb as any);

    mockDb.getFirstAsync.mockResolvedValueOnce({ ...tripRow, serverId: null });

    await repo.deleteTrip('trip-1');

    const outboxDelete = mockDb.runAsync.mock.calls.find(([sql]: [string]) =>
      sql.includes('DELETE FROM outbox')
    );

    expect(outboxDelete).toBeDefined();

    const [, params] = outboxDelete;
    expect(params).toEqual(['trips', 'trip-1']);
  });
});
