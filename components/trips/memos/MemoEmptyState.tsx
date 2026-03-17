import { BookOpen, Pencil } from '@tamagui/lucide-icons';
import { Text, XStack, YStack } from 'tamagui';
import { FilledButton } from '../../ui';

export function MemoEmptyState({ onPress }: { onPress: () => void }) {
  return (
    <YStack
      backgroundColor="$card"
      borderRadius="$6"
      padding="$8"
      alignItems="center"
      borderWidth={1}
      borderColor="$border"
    >
      <YStack
        width={64}
        height={64}
        backgroundColor="$accent"
        borderRadius="$4"
        alignItems="center"
        justifyContent="center"
        marginBottom="$3"
        opacity={0.3}
      >
        <BookOpen size={32} color="$primary" />
      </YStack>
      <Text color="$mutedForeground" fontSize={14} marginBottom="$3">
        자유롭게 메모하세요
      </Text>
      <FilledButton paddingHorizontal="$6" paddingVertical="$3" onPress={onPress}>
        <XStack alignItems="center" gap="$2">
          <Pencil size={16} color="$foreground" />
          <Text color="$foreground" fontWeight="500">
            첫 노트 작성하기
          </Text>
        </XStack>
      </FilledButton>
    </YStack>
  );
}
