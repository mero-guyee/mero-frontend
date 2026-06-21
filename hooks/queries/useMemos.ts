import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { memosApi } from '../../api/memos';
import { useSyncContext } from '../../contexts/SyncContext';
import { useDb } from '../../providers/DatabaseProvider';
import { MemoRepository, TripRepository } from '../../repositories';
import { Memo } from '../../types';
import { memoKeys } from './queryKeys';

export function useMemosQuery(tripId: string) {
  const db = useDb();
  const qc = useQueryClient();
  return useQuery({
    queryKey: memoKeys.byTrip(tripId),
    queryFn: async () => {
      const tripRepo = new TripRepository(db);
      const memoRepo = new MemoRepository(db);

      (async () => {
        try {
          const trip = await tripRepo.getTripById(tripId);
          if (trip?.serverId) {
            const serverMemos = await memosApi.getAll(parseInt(trip.serverId));
            await Promise.all(serverMemos.map((m) => memoRepo.upsertFromServer(m, tripId)));
            const fresh = await memoRepo.getMemosByTripId(tripId);
            qc.setQueryData(memoKeys.byTrip(tripId), fresh);
          }
        } catch {
          // offline — use local cache
        }
      })();

      return memoRepo.getMemosByTripId(tripId);
    },
    enabled: !!tripId,
  });
}

export function useCreateMemo() {
  const db = useDb();
  const qc = useQueryClient();
  const { markSyncing, unmarkSyncing, markJustSynced } = useSyncContext();
  return useMutation({
    mutationFn: async (data: Omit<Memo, 'id' | 'createdAt' | 'updatedAt'>) => {
      const tripRepo = new TripRepository(db);
      const memoRepo = new MemoRepository(db);
      const localMemo = await memoRepo.createMemo(data);

      (async () => {
        markSyncing(localMemo.id);
        try {
          const trip = await tripRepo.getTripById(data.tripId);
          if (trip?.serverId) {
            const serverMemo = await memosApi.create(parseInt(trip.serverId), {
              clientId: localMemo.id,
              title: data.title,
              content: data.content,
            });
            await memoRepo.setServerId(localMemo.id, String(serverMemo.id));
            markJustSynced(localMemo.id);
            qc.invalidateQueries({ queryKey: memoKeys.all });
          }
        } catch {
          // stays pending
        } finally {
          unmarkSyncing(localMemo.id);
        }
      })();

      return localMemo;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: memoKeys.all }),
  });
}

export function useUpdateMemo() {
  const db = useDb();
  const qc = useQueryClient();
  const { markSyncing, unmarkSyncing, markJustSynced } = useSyncContext();
  return useMutation({
    mutationFn: async (memo: Memo) => {
      const tripRepo = new TripRepository(db);
      const memoRepo = new MemoRepository(db);
      const updated = await memoRepo.updateMemo(memo);

      (async () => {
        markSyncing(memo.id);
        try {
          if (memo.serverId) {
            const trip = await tripRepo.getTripById(memo.tripId);
            if (trip?.serverId) {
              await memosApi.update(parseInt(trip.serverId), parseInt(memo.serverId), {
                title: memo.title,
                content: memo.content,
              });
              await memoRepo.markSynced(memo.id);
              markJustSynced(memo.id);
              qc.invalidateQueries({ queryKey: memoKeys.all });
            }
          }
        } catch {
          // stays pending
        } finally {
          unmarkSyncing(memo.id);
        }
      })();

      return updated;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: memoKeys.all }),
  });
}

export function useDeleteMemo() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, tripId }: { id: string; tripId: string }) => {
      const tripRepo = new TripRepository(db);
      const memoRepo = new MemoRepository(db);
      const memoRow = await memoRepo.findById(id);
      await memoRepo.deleteMemo(id);

      (async () => {
        try {
          if (memoRow?.serverId) {
            const trip = await tripRepo.getTripById(tripId);
            if (trip?.serverId) {
              await memosApi.delete(parseInt(trip.serverId), parseInt(memoRow.serverId));
              await memoRepo.removeFromOutbox(id);
            }
          }
        } catch {
          // stays soft-deleted with pending status
        }
      })();

      return tripId;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: memoKeys.all }),
  });
}
