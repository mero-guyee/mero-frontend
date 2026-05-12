import FloatingActionButton from '@/components/ui/button/FloatingActionButton';
import { useMemos } from '@/contexts';
import { Memo } from '@/types';
import { Plus } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import MemoCard from './MemoCard';
import { MemoEmpty } from './MemoEmpty';

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
    <>
      <ScrollView>
        <YStack gap="$3" px="$4" pt="$3" pb="$24">
          {memos.length === 0 ? (
            <MemoEmpty />
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
      </ScrollView>
      <FloatingActionButton onPress={handleCreateMemo}>
        <XStack alignItems="center" gap="$2">
          <Plus />
          <Text>새 메모</Text>
        </XStack>
      </FloatingActionButton>
    </>
  );
}
