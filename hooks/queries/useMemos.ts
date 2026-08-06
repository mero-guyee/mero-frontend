import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { memosApi } from '../../api/memos';
import { useSyncContext } from '../../contexts/SyncContext';
import { useDb } from '../../providers/DatabaseProvider';
import { MemoRepository, TripRepository } from '../../repositories';
import { Memo } from '../../types';
import { enqueueMutation } from './mutationQueue';
import { memoKeys, unrecordedTripsKeys } from './queryKeys';

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
  const { markSyncing, unmarkSyncing, markSyncSucceeded, markSyncFailed } = useSyncContext();
  return useMutation({
    mutationFn: async (data: Omit<Memo, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => {
      const tripRepo = new TripRepository(db);
      const memoRepo = new MemoRepository(db);
      const localMemo = await memoRepo.createMemo(data);

      enqueueMutation(localMemo.id, async () => {
        markSyncing(localMemo.id);
        try {
          const fresh = await memoRepo.getMemoById(localMemo.id);
          if (!fresh || fresh.serverId) return;
          const trip = await tripRepo.getTripById(fresh.tripId);
          if (trip?.serverId) {
            const serverMemo = await memosApi.create(parseInt(trip.serverId), {
              clientId: fresh.id,
              title: fresh.title,
              content: fresh.content,
            });
            await memoRepo.setServerId(fresh.id, String(serverMemo.id));
            markSyncSucceeded(localMemo.id);
            qc.invalidateQueries({ queryKey: memoKeys.all });
          }
        } catch {
          markSyncFailed(localMemo.id);
        } finally {
          unmarkSyncing(localMemo.id);
        }
      });

      return localMemo;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: memoKeys.all });
      qc.invalidateQueries({ queryKey: unrecordedTripsKeys.all });
    },
  });
}

export function useUpdateMemo() {
  const db = useDb();
  const qc = useQueryClient();
  const { markSyncing, unmarkSyncing, markSyncSucceeded, markSyncFailed } = useSyncContext();
  return useMutation({
    mutationFn: async (memo: Memo) => {
      const tripRepo = new TripRepository(db);
      const memoRepo = new MemoRepository(db);
      const updated = await memoRepo.updateMemo(memo);

      enqueueMutation(memo.id, async () => {
        markSyncing(memo.id);
        try {
          const fresh = await memoRepo.getMemoById(memo.id);
          if (fresh?.serverId) {
            const trip = await tripRepo.getTripById(fresh.tripId);
            if (trip?.serverId) {
              await memosApi.update(parseInt(trip.serverId), parseInt(fresh.serverId), {
                title: fresh.title,
                content: fresh.content,
              });
              await memoRepo.markSynced(memo.id);
              markSyncSucceeded(memo.id);
              qc.invalidateQueries({ queryKey: memoKeys.all });
            }
          }
        } catch {
          markSyncFailed(memo.id);
        } finally {
          unmarkSyncing(memo.id);
        }
      });

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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: memoKeys.all });
      qc.invalidateQueries({ queryKey: unrecordedTripsKeys.all });
    },
  });
}
