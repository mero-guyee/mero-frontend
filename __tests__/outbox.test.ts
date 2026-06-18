import { BaseEntity, BaseRepository } from '../repositories/base';
import { mockDb } from '../test-utils/mockDb';

jest.mock('expo-crypto');

interface TestEntity extends BaseEntity {
  name: string;
}

class TestRepo extends BaseRepository<TestEntity> {
  constructor(db: any) {
    super(db, 'test_table');
  }
  protected getDataName(entity: TestEntity): string {
    return entity.name;
  }
}

describe('outbox 기본 동작', () => {
  test('데이터 생성시 outbox에 추가된다', async () => {
    const repo = new TestRepo(mockDb as any);

    await repo.create({ name: 'test item' });

    const outboxInsert = mockDb.runAsync.mock.calls.find(([sql]: [string]) =>
      sql.includes('INSERT INTO outbox')
    );

    expect(outboxInsert).toBeDefined();

    const [sql, params] = outboxInsert;
    expect(params[1]).toBe('test_table');
    expect(sql).toContain("'create'");
    expect(params[2]).toBeTruthy();
    expect(params[3]).toBe('test item');
  });
});
