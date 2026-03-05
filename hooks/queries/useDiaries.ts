import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Diary } from '../../types';
import { DiaryRepository } from '../../repositories';
import { useDb } from '../../providers/DatabaseProvider';

export const diaryKeys = {
  all: ['diaries'] as const,
  byTrip: (tripId: string) => ['diaries', 'trip', tripId] as const,
  detail: (id: string) => ['diaries', id] as const,
};

export function useDiariesQuery() {
  const db = useDb();
  return useQuery({
    queryKey: diaryKeys.all,
    queryFn: () => new DiaryRepository(db).getAllDiaries(),
  });
}

export function useDiariesByTripQuery(tripId: string) {
  const db = useDb();
  return useQuery({
    queryKey: diaryKeys.byTrip(tripId),
    queryFn: () => new DiaryRepository(db).getDiariesByTripId(tripId),
    enabled: !!tripId,
  });
}

export function useDiaryQuery(id: string) {
  const db = useDb();
  return useQuery({
    queryKey: diaryKeys.detail(id),
    queryFn: () => new DiaryRepository(db).getDiaryById(id),
    enabled: !!id,
  });
}

export function useCreateDiary() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Diary, 'id'>) => new DiaryRepository(db).createDiary(data),
    onSuccess: (diary) => {
      qc.invalidateQueries({ queryKey: diaryKeys.all });
      qc.invalidateQueries({ queryKey: diaryKeys.byTrip(diary.tripId) });
    },
  });
}

export function useUpdateDiary() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (diary: Diary) => new DiaryRepository(db).updateDiary(diary),
    onSuccess: (_, diary) => {
      qc.invalidateQueries({ queryKey: diaryKeys.all });
      qc.invalidateQueries({ queryKey: diaryKeys.byTrip(diary.tripId) });
      qc.invalidateQueries({ queryKey: diaryKeys.detail(diary.id) });
    },
  });
}

export function useDeleteDiary() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, tripId }: { id: string; tripId: string }) => {
      await new DiaryRepository(db).deleteDiary(id);
      return tripId;
    },
    onSuccess: (tripId) => {
      qc.invalidateQueries({ queryKey: diaryKeys.all });
      qc.invalidateQueries({ queryKey: diaryKeys.byTrip(tripId) });
    },
  });
}
