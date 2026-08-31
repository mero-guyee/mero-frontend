import { useDb } from '@/providers/DatabaseProvider';
import { useDomainSync } from './useDomainSync';
import { useNetworkAppStateEvents } from './useNetworkAppStateEvents';

export function usePendingSync() {
  const db = useDb();
  const syncAndInvalidate = useDomainSync(db);
  useNetworkAppStateEvents(syncAndInvalidate);
}
