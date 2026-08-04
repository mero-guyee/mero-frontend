import { useDb } from '@/providers/DatabaseProvider';
import { outboxKey } from '@/repositories/outbox';
import NetInfo from '@react-native-community/netinfo';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { syncBudgets } from './syncBudgets';
import { syncDocuments } from './syncDocuments';
import { syncExpenses } from './syncExpenses';
import { syncFootprints } from './syncFootprints';
import { syncMemos } from './syncMemos';
import { syncPhotos } from './syncPhotos';
import { syncTrips } from './syncTrips';

const PERIODIC_INTERVAL_MS = 60_000;
const PERIODIC_MAX_AGE_MINUTES = 7;

export function usePendingSync() {
  const db = useDb();
  const qc = useQueryClient();
  const prevConnected = useRef<boolean | null>(false);

  async function runSync(maxAgeMinutes?: number) {
    await syncTrips(db, maxAgeMinutes);
    await Promise.all([
      syncMemos(db, maxAgeMinutes),
      syncFootprints(db, maxAgeMinutes),
      syncBudgets(db, maxAgeMinutes),
      syncDocuments(db, maxAgeMinutes),
    ]);
    await syncPhotos(db, maxAgeMinutes);
    await syncExpenses(db, maxAgeMinutes);
  }

  function invalidateAll() {
    qc.invalidateQueries({ queryKey: ['trips'] });
    qc.invalidateQueries({ queryKey: ['memos'] });
    qc.invalidateQueries({ queryKey: ['footprints'] });
    qc.invalidateQueries({ queryKey: ['expenses'] });
    qc.invalidateQueries({ queryKey: ['budgets'] });
    qc.invalidateQueries({ queryKey: ['documents'] });
    qc.invalidateQueries({ queryKey: outboxKey });
  }

  useEffect(() => {
    const unsubscribeNet = NetInfo.addEventListener(async (state) => {
      const isConnected = state.isConnected ?? false;
      if (isConnected && prevConnected.current === false) {
        try {
          await runSync();
        } catch {
        } finally {
          invalidateAll();
        }
      }
      prevConnected.current = isConnected;
    });

    const handleAppState = async (next: AppStateStatus) => {
      if (next === 'active') {
        try {
          await runSync();
        } catch {
        } finally {
          invalidateAll();
        }
      }
    };
    const unsubscribeApp = AppState.addEventListener('change', handleAppState);

    const interval = setInterval(async () => {
      try {
        await runSync(PERIODIC_MAX_AGE_MINUTES);
      } catch {
      } finally {
        invalidateAll();
      }
    }, PERIODIC_INTERVAL_MS);

    return () => {
      unsubscribeNet();
      unsubscribeApp.remove();
      clearInterval(interval);
    };
  }, [db]);
}
