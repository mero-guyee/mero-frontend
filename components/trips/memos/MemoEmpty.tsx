import { StickyNote } from '@tamagui/lucide-icons';
import { Text, YStack } from 'tamagui';

export function MemoEmpty() {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" paddingVertical="$20" gap="$3">
      <YStack
        width={72}
        height={72}
        backgroundColor="$accent"
        borderRadius={36}
        alignItems="center"
        justifyContent="center"
        opacity={0.5}
      >
        <StickyNote size={32} color="$mutedForeground" />
      </YStack>
      <YStack alignItems="center" gap="$1">
        <Text fontSize={16} fontWeight="600" color="$foreground">
          메모가 없어요
        </Text>
        <Text fontSize={13} color="$mutedForeground" textAlign="center">
          여행 중 생각난 것들을 기록해보세요
        </Text>
      </YStack>
    </YStack>
  );
}
