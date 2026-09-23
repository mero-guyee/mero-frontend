import { SyncingCallbacks, useSyncingContext } from '@/contexts/SyncingContext';
import { outboxKey } from '@/repositories/outbox';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
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

async function syncDomain(
  domain: keyof SyncResults,
  sync: () => Promise<boolean>,
  qc: QueryClient
): Promise<boolean> {
  const changed = await sync();
  if (changed) {
    const queryKey = domain === 'photos' ? 'footprints' : domain;
    qc.invalidateQueries({ queryKey: [queryKey] });
    qc.invalidateQueries({ queryKey: outboxKey });
  }
  return changed;
}

async function runSync(
  db: SQLite.SQLiteDatabase,
  maxAgeMinutes: number | undefined,
  syncing: SyncingCallbacks,
  qc: QueryClient
): Promise<SyncResults> {
  const trips = await syncDomain('trips', () => syncTrips(db, maxAgeMinutes, syncing), qc);

  const [memos, footprints, budgets, documents] = await Promise.all([
    syncDomain('memos', () => syncMemos(db, maxAgeMinutes, syncing), qc),
    syncDomain('footprints', () => syncFootprints(db, maxAgeMinutes, syncing), qc),
    syncDomain('budgets', () => syncBudgets(db, maxAgeMinutes, syncing), qc),
    syncDomain('documents', () => syncDocuments(db, maxAgeMinutes, syncing), qc),
  ]);

  const photos = await syncDomain('photos', () => syncPhotos(db, maxAgeMinutes, syncing), qc);
  const expenses = await syncDomain('expenses', () => syncExpenses(db, maxAgeMinutes, syncing), qc);

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
          const promise = runSync(
            db,
            maxAgeMinutes,
            {
              markSyncing,
              unmarkSyncing,
              markSyncingSucceeded,
              markSyncingFailed,
            },
            qc
          ).finally(() => {
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
