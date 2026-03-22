import {
  useCreateMemo,
  useDeleteMemo,
  useMemosQuery,
  useUpdateMemo,
} from '../hooks/queries/useMemos';
import { Memo } from '../types';
import { useTrips } from './TripContext';

interface MemoContextType {
  memos: Memo[];
  addMemo: (memo: Omit<Memo, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMemo: (memo: Memo) => void;
  deleteMemo: (memoId: string) => void;
}

export function useMemos(): MemoContextType {
  const { activeTrip } = useTrips();
  const { data: memos = [] } = useMemosQuery(activeTrip ?? '');

  const createMemo = useCreateMemo();
  const updateMemoMut = useUpdateMemo();
  const deleteMemoMut = useDeleteMemo();

  return {
    memos,
    addMemo: (memo) => createMemo.mutate(memo),
    updateMemo: (memo) => updateMemoMut.mutate(memo),
    deleteMemo: (memoId) => {
      const memo = memos.find((n) => n.id === memoId);
      if (memo) deleteMemoMut.mutate({ id: memoId, tripId: memo.tripId });
    },
  };
}
