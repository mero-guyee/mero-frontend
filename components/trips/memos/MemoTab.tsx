import { useMemos } from '@/contexts';
import { Memo } from '@/types';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { YStack } from 'tamagui';
import MemoCard from './MemoCard';
import { MemoEmptyState } from './MemoEmptyState';

export default function MemoTab({ memos, tripId }: { memos: Memo[]; tripId: string }) {
  const { deleteMemo } = useMemos();
  const handleCreateMemo = () => {
    router.push({
      pathname: '/backpack/memo-form',
      params: { tripId },
    } as any);
  };

  const handleEditMemo = (memoId: string) => {
    router.push({
      pathname: '/backpack/memo-form',
      params: { tripId, memoId },
    } as any);
  };

  const handleDeleteMemo = (memoId: string) => {
    Alert.alert('메모 삭제', '이 메모를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => deleteMemo(memoId),
      },
    ]);
  };
  return (
    <YStack gap="$3" marginTop="$4">
      {memos.length === 0 ? (
        <MemoEmptyState onPress={handleCreateMemo} />
      ) : (
        <YStack gap="$2">
          {memos.map((note) => (
            <MemoCard
              key={note.id}
              memo={note}
              onPress={handleEditMemo}
              onDelete={handleDeleteMemo}
            />
          ))}
        </YStack>
      )}
    </YStack>
  );
}
