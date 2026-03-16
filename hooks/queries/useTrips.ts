import { ApiError } from '@/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { memosApi } from '../../api/memos';
import { tripsApi } from '../../api/trips';
import { useDb } from '../../providers/DatabaseProvider';
import { MemoRepository, TripRepository } from '../../repositories';
import { Memo, Trip } from '../../types';

export const tripKeys = {
  all: ['trips'] as const,
  detail: (id: string) => ['trips', id] as const,
  memos: (tripId: string) => ['trips', tripId, 'memos'] as const,
};

export function useTripsQuery() {
  const db = useDb();
  return useQuery({
    queryKey: tripKeys.all,
    queryFn: async () => {
      const repo = new TripRepository(db);
      try {
        const serverTrips = await tripsApi.getAll();
        await Promise.all(serverTrips.map((t) => repo.upsertFromServer(t)));
      } catch {
        // offline — use local cache
      }
      return repo.getAllTrips();
    },
  });
}

export function useTripQuery(id: string) {
  const db = useDb();
  return useQuery({
    queryKey: tripKeys.detail(id),
    queryFn: () => new TripRepository(db).getTripById(id),
    enabled: !!id,
  });
}

export function useMemosQuery(tripId: string) {
  const db = useDb();
  return useQuery({
    queryKey: tripKeys.memos(tripId),
    queryFn: async () => {
      const tripRepo = new TripRepository(db);
      const memoRepo = new MemoRepository(db);
      try {
        const trip = await tripRepo.getTripById(tripId);
        if (trip?.serverId) {
          const serverMemos = await memosApi.getAll(parseInt(trip.serverId));
          await Promise.all(serverMemos.map((m) => memoRepo.upsertFromServer(m, tripId)));
        }
      } catch {
        // offline — use local cache
      }
      return memoRepo.getMemosByTripId(tripId);
    },
    enabled: !!tripId,
  });
}

export function useAllMemosQuery() {
  const db = useDb();
  return useQuery({
    queryKey: ['memos', 'all'],
    queryFn: () => new MemoRepository(db).getAllMemos(),
  });
}

export function useCreateTrip() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Trip, 'id'>) => {
      const repo = new TripRepository(db);
      const localTrip = await repo.createTrip(data);
      try {
        const serverTrip = await tripsApi.create({
          clientId: localTrip.id,
          title: data.title,
          startDate: data.startDate,
          endDate: data.endDate,
          countries: data.countries,
          imageUrl: data.imageUrl,
        });
        
        await repo.setServerId(localTrip.id, String(serverTrip.id));
      } catch (e){
        if(e instanceof ApiError) {
          console.error('Failed to create trip on server:', e.status, e.message); 
        }
      }
      return localTrip;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.all }),
  });
}

export function useUpdateTrip() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (trip: Trip) => {
      const repo = new TripRepository(db);
      const updated = await repo.updateTrip(trip);
      try {
        if (trip.serverId) {
          await tripsApi.update(parseInt(trip.serverId), {
            title: trip.title,
            startDate: trip.startDate,
            endDate: trip.endDate,
            countries: trip.countries,
          });
          await repo.markSynced(trip.id);
        }
      } catch {
        // stays pending
      }
      return updated;
    },
    onSuccess: (_, trip) => {
      qc.invalidateQueries({ queryKey: tripKeys.all });
      qc.invalidateQueries({ queryKey: tripKeys.detail(trip.id) });
    },
  });
}

export function useDeleteTrip() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tripId: string) => {
      const repo = new TripRepository(db);
      const memoRepo = new MemoRepository(db);
      const trip = await repo.getTripById(tripId);
      await repo.deleteTrip(tripId);
      await memoRepo.deleteByTripId(tripId);
      try {
        if (trip?.serverId) {
          await tripsApi.delete(parseInt(trip.serverId));
        }
      } catch {
        // stays soft-deleted with pending status
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.all }),
  });
}

export function useCreateMemo() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Memo, 'id' | 'createdAt' | 'updatedAt'>) => {
      const tripRepo = new TripRepository(db);
      const memoRepo = new MemoRepository(db);
      const localMemo = await memoRepo.createMemo(data);
      try {
        const trip = await tripRepo.getTripById(data.tripId);
        if (trip?.serverId) {
          const serverMemo = await memosApi.create(parseInt(trip.serverId), {
            clientId: localMemo.id,
            title: data.title,
            content: data.content,
          });
          await memoRepo.setServerId(localMemo.id, String(serverMemo.id));
        }
      } catch {
        // stays pending
      }
      return localMemo;
    },
    onSuccess: (memo) => qc.invalidateQueries({ queryKey: tripKeys.memos(memo.tripId) }),
  });
}

export function useUpdateMemo() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (memo: Memo) => {
      const tripRepo = new TripRepository(db);
      const memoRepo = new MemoRepository(db);
      const updated = await memoRepo.updateMemo(memo);
      try {
        if (memo.serverId) {
          const trip = await tripRepo.getTripById(memo.tripId);
          if (trip?.serverId) {
            await memosApi.update(parseInt(trip.serverId), parseInt(memo.serverId), {
              title: memo.title,
              content: memo.content,
            });
            await memoRepo.markSynced(memo.id);
          }
        }
      } catch {
        // stays pending
      }
      return updated;
    },
    onSuccess: (_, memo) => qc.invalidateQueries({ queryKey: tripKeys.memos(memo.tripId) }),
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
      try {
        if (memoRow?.serverId) {
          const trip = await tripRepo.getTripById(tripId);
          if (trip?.serverId) {
            await memosApi.delete(parseInt(trip.serverId), parseInt(memoRow.serverId));
          }
        }
      } catch {
        // stays soft-deleted with pending status
      }
      return tripId;
    },
    onSuccess: (tripId) => qc.invalidateQueries({ queryKey: tripKeys.memos(tripId) }),
  });
}
