import { useTrips } from '@/contexts';
import { Memo } from '@/types';
import { router } from 'expo-router';
import { Alert, Pressable } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import MemoCard from './MemoCard';
import { MemoEmptyState } from './MemoEmptyState';

export default function MemoTab({ memos, tripId }: { memos: Memo[]; tripId: string }) {
  const { deleteMemo } = useTrips();
  const handleCreateMemo = () => {
    router.push({
      pathname: '/trips/memo-form',
      params: { tripId },
    } as any);
  };

  const handleEditMemo = (memoId: string) => {
    router.push({
      pathname: '/trips/memo-form',
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
    <YStack gap="$3">
      <XStack alignItems="center" justifyContent="space-between" marginBottom="$1">
        <Text color="$foreground" fontSize={14}>
          {memos.length > 0 ? `총 ${memos.length}개의 메모` : '메모'}
        </Text>
        <Pressable onPress={handleCreateMemo}>
          <Text color="$primary" fontSize={14}>
            + 새 메모
          </Text>
        </Pressable>
      </XStack>

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
