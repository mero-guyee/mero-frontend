import { expensesApi } from '@/api/expenses';
import { syncExpenses } from '@/hooks/sync/syncExpenses';
import { mockDb } from '@/test-utils/mockDb';
import {
  expectMarkFailed,
  expectOutboxNotRemoved,
  expectOutboxRemoved,
  setupOutbox,
} from '@/test-utils/syncTestFactory';

jest.mock('@/api/expenses');
jest.mock('expo-crypto');

const apiCreate = expensesApi.create as jest.Mock;
const apiUpdate = expensesApi.update as jest.Mock;
const apiDelete = expensesApi.delete as jest.Mock;

function makeExpense(attrs: Record<string, any> = {}) {
  return {
    id: 'expense-1',
    tripId: 'trip-1',
    categoryId: 'cat-1',
    footprintId: null,
    amount: 10000,
    currency: 'KRW',
    date: '2024-01-01',
    description: null,
    location: null,
    ...attrs,
  };
}
function makeTrip(attrs: Record<string, any> = {}) {
  return { id: 'trip-1', serverId: 'server-trip-1', ...attrs };
}
function makeCategory(attrs: Record<string, any> = {}) {
  return { id: 'cat-1', serverId: 'server-cat-1', ...attrs };
}
function makeFootprint(attrs: Record<string, any> = {}) {
  return { id: 'footprint-1', serverId: 'server-footprint-1', ...attrs };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockDb.getAllAsync.mockResolvedValue([]);
  mockDb.getFirstAsync.mockResolvedValue(null);
  mockDb.runAsync.mockResolvedValue(undefined);
  mockDb.withTransactionAsync.mockImplementation(async (fn: () => Promise<void>) => fn());
  apiCreate.mockResolvedValue({ id: 999 });
  apiUpdate.mockResolvedValue(undefined);
  apiDelete.mockResolvedValue(undefined);
});

// ─── create ─────────────────────────────────────────────────────

describe('expenses - create', () => {
  test('서버 전송 성공 시 outbox에서 제거된다', async () => {
    const expense = makeExpense();
    setupOutbox('expenses', 'create', expense.id);
    mockDb.getFirstAsync
      .mockResolvedValueOnce(expense)
      .mockResolvedValueOnce(makeTrip())
      .mockResolvedValueOnce(makeCategory());

    await syncExpenses(mockDb as any);

    expect(apiCreate).toHaveBeenCalled();
    expectOutboxRemoved();
  });

  test('부모 trip의 serverId 없으면 API 호출 안 하고 outbox에 남는다', async () => {
    const expense = makeExpense();
    setupOutbox('expenses', 'create', expense.id);
    mockDb.getFirstAsync
      .mockResolvedValueOnce(expense)
      .mockResolvedValueOnce(makeTrip({ serverId: null }));

    await syncExpenses(mockDb as any);

    expect(apiCreate).not.toHaveBeenCalled();
    expectOutboxNotRemoved();
  });

  test('category의 serverId 없으면 API 호출 안 하고 outbox에 남는다', async () => {
    const expense = makeExpense();
    setupOutbox('expenses', 'create', expense.id);
    mockDb.getFirstAsync
      .mockResolvedValueOnce(expense)
      .mockResolvedValueOnce(makeTrip())
      .mockResolvedValueOnce(makeCategory({ serverId: null }));

    await syncExpenses(mockDb as any);

    expect(apiCreate).not.toHaveBeenCalled();
    expectOutboxNotRemoved();
  });

  test('footprint의 serverId 없으면 API 호출 안 하고 outbox에 남는다', async () => {
    const expense = makeExpense({ footprintId: 'footprint-1' });
    setupOutbox('expenses', 'create', expense.id);
    mockDb.getFirstAsync
      .mockResolvedValueOnce(expense)
      .mockResolvedValueOnce(makeTrip())
      .mockResolvedValueOnce(makeCategory())
      .mockResolvedValueOnce(makeFootprint({ serverId: null }));

    await syncExpenses(mockDb as any);

    expect(apiCreate).not.toHaveBeenCalled();
    expectOutboxNotRemoved();
  });

  test('서버 전송 실패 시 outbox가 failed로 표시된다', async () => {
    const expense = makeExpense();
    setupOutbox('expenses', 'create', expense.id);
    mockDb.getFirstAsync
      .mockResolvedValueOnce(expense)
      .mockResolvedValueOnce(makeTrip())
      .mockResolvedValueOnce(makeCategory());
    apiCreate.mockRejectedValueOnce(new Error('network error'));

    await syncExpenses(mockDb as any);

    expect(apiCreate).toHaveBeenCalled();
    expectMarkFailed();
  });
});

// ─── update ─────────────────────────────────────────────────────

describe('expenses - update', () => {
  test('서버 전송 성공 시 outbox에서 제거된다', async () => {
    const expense = makeExpense({ serverId: '42' });
    setupOutbox('expenses', 'update', expense.id);
    mockDb.getFirstAsync
      .mockResolvedValueOnce(expense)
      .mockResolvedValueOnce(makeTrip())
      .mockResolvedValueOnce(makeCategory());

    await syncExpenses(mockDb as any);

    expect(apiUpdate).toHaveBeenCalled();
    expectOutboxRemoved();
  });

  test('entity의 serverId 없으면 API 호출 없이 outbox 제거된다', async () => {
    const expense = makeExpense();
    setupOutbox('expenses', 'update', expense.id);
    mockDb.getFirstAsync.mockResolvedValueOnce(expense);

    await syncExpenses(mockDb as any);

    expect(apiUpdate).not.toHaveBeenCalled();
    expectOutboxRemoved();
  });

  test('부모 trip의 serverId 없으면 API 호출 안 하고 outbox에 남는다', async () => {
    const expense = makeExpense({ serverId: '42' });
    setupOutbox('expenses', 'update', expense.id);
    mockDb.getFirstAsync
      .mockResolvedValueOnce(expense)
      .mockResolvedValueOnce(makeTrip({ serverId: null }));

    await syncExpenses(mockDb as any);

    expect(apiUpdate).not.toHaveBeenCalled();
    expectOutboxNotRemoved();
  });

  test('category의 serverId 없으면 API 호출 안 하고 outbox에 남는다', async () => {
    const expense = makeExpense({ serverId: '42' });
    setupOutbox('expenses', 'update', expense.id);
    mockDb.getFirstAsync
      .mockResolvedValueOnce(expense)
      .mockResolvedValueOnce(makeTrip())
      .mockResolvedValueOnce(makeCategory({ serverId: null }));

    await syncExpenses(mockDb as any);

    expect(apiUpdate).not.toHaveBeenCalled();
    expectOutboxNotRemoved();
  });

  test('서버 전송 실패 시 outbox가 failed로 표시된다', async () => {
    const expense = makeExpense({ serverId: '42' });
    setupOutbox('expenses', 'update', expense.id);
    mockDb.getFirstAsync
      .mockResolvedValueOnce(expense)
      .mockResolvedValueOnce(makeTrip())
      .mockResolvedValueOnce(makeCategory());
    apiUpdate.mockRejectedValueOnce(new Error('network error'));

    await syncExpenses(mockDb as any);

    expect(apiUpdate).toHaveBeenCalled();
    expectMarkFailed();
  });
});

// ─── delete ─────────────────────────────────────────────────────

describe('expenses - delete', () => {
  test('서버 전송 성공 시 outbox에서 제거된다', async () => {
    const expense = makeExpense({ serverId: '42' });
    setupOutbox('expenses', 'delete', expense.id);
    mockDb.getFirstAsync.mockResolvedValueOnce(expense).mockResolvedValueOnce(makeTrip());

    await syncExpenses(mockDb as any);

    expect(apiDelete).toHaveBeenCalled();
    expectOutboxRemoved();
  });

  test('entity의 serverId 없으면 API 호출 없이 outbox 제거된다', async () => {
    const expense = makeExpense();
    setupOutbox('expenses', 'delete', expense.id);
    mockDb.getFirstAsync.mockResolvedValueOnce(expense);

    await syncExpenses(mockDb as any);

    expect(apiDelete).not.toHaveBeenCalled();
    expectOutboxRemoved();
  });

  test('부모 trip의 serverId 없으면 API 호출 안 하고 outbox에 남는다', async () => {
    const expense = makeExpense({ serverId: '42' });
    setupOutbox('expenses', 'delete', expense.id);
    mockDb.getFirstAsync
      .mockResolvedValueOnce(expense)
      .mockResolvedValueOnce(makeTrip({ serverId: null }));

    await syncExpenses(mockDb as any);

    expect(apiDelete).not.toHaveBeenCalled();
    expectOutboxNotRemoved();
  });

  test('서버 전송 실패 시 outbox가 failed로 표시된다', async () => {
    const expense = makeExpense({ serverId: '42' });
    setupOutbox('expenses', 'delete', expense.id);
    mockDb.getFirstAsync.mockResolvedValueOnce(expense).mockResolvedValueOnce(makeTrip());
    apiDelete.mockRejectedValueOnce(new Error('network error'));

    await syncExpenses(mockDb as any);

    expect(apiDelete).toHaveBeenCalled();
    expectMarkFailed();
  });
});
