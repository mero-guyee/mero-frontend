import { memosApi } from '@/api/memos';
import { syncMemos } from '@/hooks/sync/syncMemos';
import { runCommonSyncTests } from '@/test-utils/syncTestFactory';

jest.mock('@/api/memos');
jest.mock('expo-crypto');

const api = {
  create: memosApi.create as jest.Mock,
  update: memosApi.update as jest.Mock,
  delete: memosApi.delete as jest.Mock,
};

runCommonSyncTests({
  syncFn: syncMemos,
  domain: 'memos',
  api,
  makeEntity: (attrs = {}) => ({
    id: 'memo-1',
    tripId: 'trip-1',
    title: '테스트 메모',
    content: '내용',
    ...attrs,
  }),
  makeTrip: (attrs = {}) => ({
    id: 'trip-1',
    serverId: 'server-trip-1',
    ...attrs,
  }),
});
