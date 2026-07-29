import FloatingActionButton from '@/components/ui/button/FloatingActionButton';
import { useAppModal, useMemos } from '@/contexts';
import { Memo } from '@/types';
import { Plus } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import MemoCard from './MemoCard';
import { MemoEmpty } from './MemoEmpty';

export default function MemoTab({ memos, tripId }: { memos: Memo[]; tripId: string }) {
  const { deleteMemo } = useMemos();
  const { showConfirm } = useAppModal();
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

  const handleDeleteMemo = async (memoId: string) => {
    const confirmed = await showConfirm('메모 삭제', '이 메모를 삭제하시겠습니까?', {
      confirmText: '삭제',
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await deleteMemo(memoId);
    } catch {
      Toast.show({
        type: 'error',
        text1: '오류',
        text2: '메모를 삭제하는 중 오류가 발생했습니다. 다시 시도해주세요.',
      });
    }
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
