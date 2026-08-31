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

async function runSync(db: SQLite.SQLiteDatabase, maxAgeMinutes?: number): Promise<SyncResults> {
  const trips = await syncTrips(db, maxAgeMinutes);

  const [memos, footprints, budgets, documents] = await Promise.all([
    syncMemos(db, maxAgeMinutes),
    syncFootprints(db, maxAgeMinutes),
    syncBudgets(db, maxAgeMinutes),
    syncDocuments(db, maxAgeMinutes),
  ]);

  const photos = await syncPhotos(db, maxAgeMinutes);
  const expenses = await syncExpenses(db, maxAgeMinutes);

  return { trips, memos, footprints, budgets, documents, photos, expenses };
}

interface InFlightSync {
  maxAgeMinutes: number | undefined;
  promise: Promise<SyncResults>;
}

export function useDomainSync(db: SQLite.SQLiteDatabase) {
  const qc = useQueryClient();
  const prevSyncResult = useRef<InFlightSync | null>(null);

  return useCallback(
    async (maxAgeMinutes?: number) => {
      let touched = new Set<string>();
      try {
        const isIdle = !prevSyncResult.current;
        const isCurrentSyncImmediately = maxAgeMinutes === undefined;
        const isPrevSyncPolling = prevSyncResult.current?.maxAgeMinutes !== undefined;

        if (isIdle || (isPrevSyncPolling && isCurrentSyncImmediately)) {
          const promise = runSync(db, maxAgeMinutes).finally(() => {
            if (prevSyncResult.current?.promise === promise) {
              prevSyncResult.current = null;
            }
          });
          prevSyncResult.current = { maxAgeMinutes, promise };
        }
        touched = getTouchedDomains(await prevSyncResult.current!.promise);
      } catch {
      } finally {
        if (touched.size > 0) {
          for (const domain of touched) {
            qc.invalidateQueries({ queryKey: [domain] });
          }
          qc.invalidateQueries({ queryKey: outboxKey });
        }
      }
    },
    [db, qc]
  );
}
