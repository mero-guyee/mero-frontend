import { syncFootprints } from '@/hooks/sync/syncFootprints';
import { footprintsApi } from '@/api/footprints';
import { runCommonSyncTests } from '@/test-utils/syncTestFactory';

jest.mock('@/api/footprints');
jest.mock('expo-crypto');

const api = {
  create: footprintsApi.create as jest.Mock,
  update: footprintsApi.update as jest.Mock,
  delete: footprintsApi.delete as jest.Mock,
};

runCommonSyncTests({
  syncFn: syncFootprints,
  domain: 'footprints',
  api,
  makeEntity: (attrs = {}) => ({
    id: 'footprint-1',
    tripId: 'trip-1',
    title: '테스트 발자국',
    content: '내용',
    date: '2024-01-01',
    locations: '[]',
    ...attrs,
  }),
  makeTrip: (attrs = {}) => ({
    id: 'trip-1',
    serverId: 'server-trip-1',
    ...attrs,
  }),
});
