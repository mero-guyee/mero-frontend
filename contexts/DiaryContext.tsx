import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Diary } from '../types';
import { MOCK_DIARIES } from '../data/mockData';

interface DiaryContextType {
  // 상태
  diaries: Diary[];

  // Diary CRUD
  addDiary: (diary: Omit<Diary, 'id'>) => void;
  updateDiary: (diary: Diary) => void;
  deleteDiary: (diaryId: string) => void;

  // 헬퍼 함수
  getDiaryById: (diaryId: string) => Diary | undefined;
  getDiariesByTripId: (tripId: string) => Diary[];
}

const DiaryContext = createContext<DiaryContextType | null>(null);

export function DiaryProvider({ children }: { children: ReactNode }) {
  const [diaries, setDiaries] = useState<Diary[]>(MOCK_DIARIES);

  // Diary CRUD
  const addDiary = (diary: Omit<Diary, 'id'>) => {
    const newDiary = { ...diary, id: Date.now().toString() };
    setDiaries([newDiary, ...diaries]);
  };

  const updateDiary = (diary: Diary) => {
    setDiaries(diaries.map((d) => (d.id === diary.id ? diary : d)));
  };

  const deleteDiary = (diaryId: string) => {
    setDiaries(diaries.filter((d) => d.id !== diaryId));
  };

  // 헬퍼 함수
  const getDiaryById = (diaryId: string) => diaries.find((d) => d.id === diaryId);
  const getDiariesByTripId = (tripId: string) => diaries.filter((d) => d.tripId === tripId);

  const value: DiaryContextType = {
    diaries,
    addDiary,
    updateDiary,
    deleteDiary,
    getDiaryById,
    getDiariesByTripId,
  };

  return <DiaryContext.Provider value={value}>{children}</DiaryContext.Provider>;
}

export function useDiaries() {
  const context = useContext(DiaryContext);
  if (!context) {
    throw new Error('useDiaries must be used within a DiaryProvider');
  }
  return context;
}

export default DiaryContext;
