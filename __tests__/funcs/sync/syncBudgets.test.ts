import { syncBudgets } from '@/hooks/sync/syncBudgets';
import { budgetsApi } from '@/api/budgets';
import { runCommonSyncTests } from '@/test-utils/syncTestFactory';

jest.mock('@/api/budgets');
jest.mock('expo-crypto');

const api = {
  create: budgetsApi.create as jest.Mock,
  update: budgetsApi.update as jest.Mock,
  delete: budgetsApi.delete as jest.Mock,
};

runCommonSyncTests({
  syncFn: syncBudgets,
  domain: 'budgets',
  api,
  makeEntity: (attrs = {}) => ({
    id: 'budget-1',
    tripId: 'trip-1',
    amount: 100000,
    currency: 'KRW',
    exchangeRate: null,
    ...attrs,
  }),
  makeTrip: (attrs = {}) => ({
    id: 'trip-1',
    serverId: 'server-trip-1',
    ...attrs,
  }),
});
