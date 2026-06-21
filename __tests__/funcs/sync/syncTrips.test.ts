import { tripsApi } from '@/api/trips';
import { syncTrips } from '@/hooks/sync/syncTrips';
import { runCommonSyncTests } from '@/test-utils/syncTestFactory';

jest.mock('@/api/trips');
jest.mock('expo-crypto');

const api = {
  create: tripsApi.create as jest.Mock,
  update: tripsApi.update as jest.Mock,
  delete: tripsApi.delete as jest.Mock,
};

runCommonSyncTests({
  syncFn: syncTrips,
  domain: 'trips',
  api,
  makeEntity: (attrs = {}) => ({
    id: 'trip-1',
    title: '테스트 여행',
    startDate: '2024-01-01',
    endDate: '2024-01-07',
    countries: '["KR"]',
    imageUrl: null,
    ...attrs,
  }),
});
