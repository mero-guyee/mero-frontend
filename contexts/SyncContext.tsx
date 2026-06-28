import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

interface SyncContextType {
  isSyncing: (id: string) => boolean;
  markSyncing: (id: string) => void;
  unmarkSyncing: (id: string) => void;
  clearAllSyncing: () => void;
  clearTransientState: () => void;
  isJustSynced: (id: string) => boolean;
  markJustSynced: (id: string) => void;
  clearJustSynced: (id: string) => void;
  isFailed: (id: string) => boolean;
  markFailed: (id: string) => void;
  clearFailed: (id: string) => void;
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

  const markJustSynced = useCallback((id: string) => {
    setJustSyncedIds((prev) => new Set(prev).add(id));
  }, []);

  const clearJustSynced = useCallback((id: string) => {
    setJustSyncedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const isJustSynced = useCallback((id: string) => justSyncedIds.has(id), [justSyncedIds]);

  const markFailed = useCallback((id: string) => {
    setFailedIds((prev) => new Set(prev).add(id));
  }, []);

  const clearFailed = useCallback((id: string) => {
    setFailedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const isFailed = useCallback((id: string) => failedIds.has(id), [failedIds]);

  return (
    <SyncContext.Provider
      value={{
        isSyncing,
        markSyncing,
        unmarkSyncing,
        clearAllSyncing,
        clearTransientState,
        isJustSynced,
        markJustSynced,
        clearJustSynced,
        isFailed,
        markFailed,
        clearFailed,
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
