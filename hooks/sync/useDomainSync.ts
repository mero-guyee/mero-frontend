import { SyncingCallbacks, useSyncingContext } from '@/contexts/SyncingContext';
import { outboxKey } from '@/repositories/outbox';
import { useQueryClient } from '@tanstack/react-query';
import * as SQLite from 'expo-sqlite';
import { useCallback, useRef } from 'react';
import { syncBudgets } from './syncBudgets';
import { syncDocuments } from './syncDocuments';
import { syncExpenses } from './syncExpenses';
import { syncFootprints } from './syncFootprints';
import { syncMemos } from './syncMemos';
import { syncPhotos } from './syncPhotos';
import { syncTrips } from './syncTrips';

interface SyncResults {
  trips: boolean;
  memos: boolean;
  footprints: boolean;
  budgets: boolean;
  documents: boolean;
  photos: boolean;
  expenses: boolean;
}

function getTouchedDomains(results: SyncResults): Set<string> {
  const touched = new Set<string>();
  for (const [key, changed] of Object.entries(results) as [keyof SyncResults, boolean][]) {
    if (changed) touched.add(key === 'photos' ? 'footprints' : key);
  }
  return touched;
}

async function runSync(
  db: SQLite.SQLiteDatabase,
  maxAgeMinutes: number | undefined,
  syncing: SyncingCallbacks
): Promise<SyncResults> {
  const trips = await syncTrips(db, maxAgeMinutes, syncing);

  const [memos, footprints, budgets, documents] = await Promise.all([
    syncMemos(db, maxAgeMinutes, syncing),
    syncFootprints(db, maxAgeMinutes, syncing),
    syncBudgets(db, maxAgeMinutes, syncing),
    syncDocuments(db, maxAgeMinutes, syncing),
  ]);

  const photos = await syncPhotos(db, maxAgeMinutes, syncing);
  const expenses = await syncExpenses(db, maxAgeMinutes, syncing);

  return { trips, memos, footprints, budgets, documents, photos, expenses };
}

interface InFlightSync {
  maxAgeMinutes: number | undefined;
  promise: Promise<SyncResults>;
}

export function useDomainSync(db: SQLite.SQLiteDatabase) {
  const qc = useQueryClient();
  const { markSyncing, unmarkSyncing, markSyncingSucceeded, markSyncingFailed } =
    useSyncingContext();
  const inFlightSync = useRef<InFlightSync | null>(null);

  return useCallback(
    async (maxAgeMinutes?: number) => {
      try {
        const isIdle = !inFlightSync.current;
        const isCurrentSyncImmediately = maxAgeMinutes === undefined;
        const isInFlightPolling = inFlightSync.current?.maxAgeMinutes !== undefined;

        if (isIdle || (isInFlightPolling && isCurrentSyncImmediately)) {
          const promise = runSync(db, maxAgeMinutes, {
            markSyncing,
            unmarkSyncing,
            markSyncingSucceeded,
            markSyncingFailed,
          })
            .then((results) => {
              const touched = getTouchedDomains(results);
              if (touched.size > 0) {
                for (const domain of touched) {
                  qc.invalidateQueries({ queryKey: [domain] });
                }
                qc.invalidateQueries({ queryKey: outboxKey });
              }
              return results;
            })
            .finally(() => {
              if (inFlightSync.current?.promise === promise) {
                inFlightSync.current = null;
              }
            });
          inFlightSync.current = { maxAgeMinutes, promise };
        }
        await inFlightSync.current!.promise;
      } catch {
        // sync errors are surfaced per-item via outbox status; nothing to do here
      }
    },
    [db, qc, markSyncing, unmarkSyncing, markSyncingSucceeded, markSyncingFailed]
  );
}
