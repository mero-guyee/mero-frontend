import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

interface SyncContextType {
  isSyncing: (id: string) => boolean;
  markSyncing: (id: string) => void;
  unmarkSyncing: (id: string) => void;
  clearAllSyncing: () => void;
  clearTransientState: () => void;
  isSyncSucceeded: (id: string) => boolean;
  markSyncSucceeded: (id: string) => void;
  clearSyncSucceeded: (id: string) => void;
  isSyncFailed: (id: string) => boolean;
  markSyncFailed: (id: string) => void;
  clearSyncFailed: (id: string) => void;
}

const SyncContext = createContext<SyncContextType | null>(null);

export function SyncProvider({ children }: { children: ReactNode }) {
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [justSyncedIds, setJustSyncedIds] = useState<Set<string>>(new Set());
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());

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

  const clearTransientState = useCallback(() => {
    setJustSyncedIds(new Set());
    setFailedIds(new Set());
  }, []);

  const markSyncSucceeded = useCallback((id: string) => {
    setJustSyncedIds((prev) => new Set(prev).add(id));
  }, []);

  const clearSyncSucceeded = useCallback((id: string) => {
    setJustSyncedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const isSyncSucceeded = useCallback((id: string) => justSyncedIds.has(id), [justSyncedIds]);

  const markSyncFailed = useCallback((id: string) => {
    setFailedIds((prev) => new Set(prev).add(id));
  }, []);

  const clearSyncFailed = useCallback((id: string) => {
    setFailedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const isSyncFailed = useCallback((id: string) => failedIds.has(id), [failedIds]);

  return (
    <SyncContext.Provider
      value={{
        isSyncing,
        markSyncing,
        unmarkSyncing,
        clearAllSyncing,
        clearTransientState,
        isSyncSucceeded,
        markSyncSucceeded,
        clearSyncSucceeded,
        isSyncFailed,
        markSyncFailed,
        clearSyncFailed,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}

export function useSyncContext() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSyncContext must be used within a SyncProvider');
  return ctx;
}
