import React, { ReactNode } from 'react';
import { Diary } from '../types';
import {
  useDiariesQuery,
  useCreateDiary,
  useUpdateDiary,
  useDeleteDiary,
} from '../hooks/queries/useDiaries';

interface DiaryContextType {
  diaries: Diary[];
  addDiary: (diary: Omit<Diary, 'id'>) => void;
  updateDiary: (diary: Diary) => void;
  deleteDiary: (diaryId: string) => void;
  getDiaryById: (diaryId: string) => Diary | undefined;
  getDiariesByTripId: (tripId: string) => Diary[];
}

export function DiaryProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useDiaries(): DiaryContextType {
  const { data: diaries = [] } = useDiariesQuery();
  const createDiary = useCreateDiary();
  const updateDiaryMut = useUpdateDiary();
  const deleteDiaryMut = useDeleteDiary();

  return {
    diaries,
    addDiary: (diary) => createDiary.mutate(diary),
    updateDiary: (diary) => updateDiaryMut.mutate(diary),
    deleteDiary: (diaryId) => {
      const diary = diaries.find((d) => d.id === diaryId);
      if (diary) deleteDiaryMut.mutate({ id: diaryId, tripId: diary.tripId });
    },
    getDiaryById: (diaryId) => diaries.find((d) => d.id === diaryId),
    getDiariesByTripId: (tripId) => diaries.filter((d) => d.tripId === tripId),
  };
}
