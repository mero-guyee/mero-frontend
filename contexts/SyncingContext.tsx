import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

interface SyncingContextType {
  isSyncing: (id: string) => boolean;
  markSyncing: (id: string) => void;
  unmarkSyncing: (id: string) => void;
  clearAllSyncing: () => void;
  clearStaleSyncingResults: () => void;
  isSyncingSucceeded: (id: string) => boolean;
  markSyncingSucceeded: (id: string) => void;
  clearSyncingSucceeded: (id: string) => void;
  isSyncingFailed: (id: string) => boolean;
  markSyncingFailed: (id: string) => void;
  clearSyncingFailed: (id: string) => void;
}

const SyncingContext = createContext<SyncingContextType | null>(null);

export function SyncingProvider({ children }: { children: ReactNode }) {
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [syncingSucceededIds, setSyncingSucceededIds] = useState<Set<string>>(new Set());
  const [syncingFailedIds, setSyncingFailedIds] = useState<Set<string>>(new Set());

  const markSyncing = useCallback((id: string) => {
    setSyncingIds((prev) => new Set(prev).add(id));
  }, []);

  const unmarkSyncing = useCallback((id: string) => {
    setSyncingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const isSyncing = useCallback((id: string) => syncingIds.has(id), [syncingIds]);

  const clearAllSyncing = useCallback(() => {
    setSyncingIds(new Set());
  }, []);

  const clearStaleSyncingResults = useCallback(() => {
    setSyncingSucceededIds(new Set());
    setSyncingFailedIds(new Set());
  }, []);

  const markSyncingSucceeded = useCallback((id: string) => {
    setSyncingSucceededIds((prev) => new Set(prev).add(id));
  }, []);

  const clearSyncingSucceeded = useCallback((id: string) => {
    setSyncingSucceededIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const isSyncingSucceeded = useCallback(
    (id: string) => syncingSucceededIds.has(id),
    [syncingSucceededIds]
  );

  const markSyncingFailed = useCallback((id: string) => {
    setSyncingFailedIds((prev) => new Set(prev).add(id));
  }, []);

  const clearSyncingFailed = useCallback((id: string) => {
    setSyncingFailedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const isSyncingFailed = useCallback((id: string) => syncingFailedIds.has(id), [syncingFailedIds]);

  return (
    <SyncingContext.Provider
      value={{
        isSyncing,
        markSyncing,
        unmarkSyncing,
        clearAllSyncing,
        clearStaleSyncingResults,
        isSyncingSucceeded,
        markSyncingSucceeded,
        clearSyncingSucceeded,
        isSyncingFailed,
        markSyncingFailed,
        clearSyncingFailed,
      }}
    >
      {children}
    </SyncingContext.Provider>
  );
}

export function useSyncingContext() {
  const ctx = useContext(SyncingContext);
  if (!ctx) throw new Error('useSyncingContext must be used within a SyncingProvider');
  return ctx;
}
