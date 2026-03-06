import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
    queryFn: () => new TripRepository(db).getAllTrips(),
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
    queryFn: () => new MemoRepository(db).getMemosByTripId(tripId),
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
    mutationFn: (data: Omit<Trip, 'id'>) => new TripRepository(db).createTrip(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.all }),
  });
}

export function useUpdateTrip() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (trip: Trip) => new TripRepository(db).updateTrip(trip),
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
      await repo.deleteTrip(tripId);
      await memoRepo.deleteByTripId(tripId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.all }),
  });
}

export function useCreateMemo() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Memo, 'id' | 'createdAt' | 'updatedAt'>) =>
      new MemoRepository(db).createMemo(data),
    onSuccess: (memo) => qc.invalidateQueries({ queryKey: tripKeys.memos(memo.tripId) }),
  });
}

export function useUpdateMemo() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memo: Memo) => new MemoRepository(db).updateMemo(memo),
    onSuccess: (_, memo) => qc.invalidateQueries({ queryKey: tripKeys.memos(memo.tripId) }),
  });
}

export function useDeleteMemo() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, tripId }: { id: string; tripId: string }) => {
      await new MemoRepository(db).deleteMemo(id);
      return tripId;
    },
    onSuccess: (tripId) => qc.invalidateQueries({ queryKey: tripKeys.memos(tripId) }),
  });
}
