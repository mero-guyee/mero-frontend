import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

interface SyncContextType {
  isSyncing: (id: string) => boolean;
  markSyncing: (id: string) => void;
  unmarkSyncing: (id: string) => void;
  isJustSynced: (id: string) => boolean;
  markJustSynced: (id: string) => void;
  clearJustSynced: (id: string) => void;
}

const SyncContext = createContext<SyncContextType | null>(null);

export function SyncProvider({ children }: { children: ReactNode }) {
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [justSyncedIds, setJustSyncedIds] = useState<Set<string>>(new Set());

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

  return (
    <SyncContext.Provider
      value={{ isSyncing, markSyncing, unmarkSyncing, isJustSynced, markJustSynced, clearJustSynced }}
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
