import FloatingActionButton from '@/components/ui/button/FloatingActionButton';
import { Memo } from '@/types';
import { Plus } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import MemoCard from './MemoCard';
import { MemoEmpty } from './MemoEmpty';

export default function MemoTab({ memos, tripId }: { memos: Memo[]; tripId: string }) {
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

  return (
    <>
      <ScrollView>
        <YStack gap="$3" px="$4" pt="$3" pb="$24">
          {memos.length === 0 ? (
            <MemoEmpty />
          ) : (
            <YStack gap="$2">
              {memos.map((note) => (
                <MemoCard key={note.id} memo={note} onPress={handleEditMemo} />
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
