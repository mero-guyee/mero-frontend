import { useDb } from '@/providers/DatabaseProvider';
import { useQueryClient } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { syncBudgets } from './syncBudgets';
import { syncExpenses } from './syncExpenses';
import { syncFootprints } from './syncFootprints';
import { syncMemos } from './syncMemos';
import { syncTrips } from './syncTrips';

export function usePendingSync() {
  const db = useDb();
  const qc = useQueryClient();
  const prevConnected = useRef<boolean | null>(false);

  async function runSync() {
    await syncTrips(db);
    await Promise.all([syncMemos(db), syncFootprints(db), syncBudgets(db)]);
    await syncExpenses(db);
  }

  function invalidateAll() {
    qc.invalidateQueries({ queryKey: ['trips'] });
    qc.invalidateQueries({ queryKey: ['memos'] });
    qc.invalidateQueries({ queryKey: ['footprints'] });
    qc.invalidateQueries({ queryKey: ['expenses'] });
    qc.invalidateQueries({ queryKey: ['budgets'] });
  }

  useEffect(() => {
    const unsubscribeNet = NetInfo.addEventListener(async (state) => {
      const isConnected = state.isConnected ?? false;
      if (isConnected && prevConnected.current === false) {
        try {
          await runSync();
        } catch {} finally {
          invalidateAll();
        }
      }
      prevConnected.current = isConnected;
    });

    const handleAppState = async (next: AppStateStatus) => {
      if (next === 'active') {
        try {
          await runSync();
        } catch {} finally {
          invalidateAll();
        }
      }
    };
    const unsubscribeApp = AppState.addEventListener('change', handleAppState);

    return () => {
      unsubscribeNet();
      unsubscribeApp.remove();
    };
  }, [db]);
}
