import { PressableYCard } from '@/components/ui/Card';
import { FootprintDraft } from '@/types';
import { formatDateLabel, formatRelativeTime } from '@/utils/date';
import { Text, XStack, YStack } from 'tamagui';

interface Props {
  draft: FootprintDraft;
  onPress: () => void;
}

export default function FootprintDraftItem({ draft, onPress }: Props) {
  return (
    <PressableYCard onPress={onPress} padding="$4" marginBottom="$2" backgroundColor="$muted">
      <XStack alignItems="center" justifyContent="space-between" marginBottom="$1.5">
        <XStack alignItems="center" gap="$1">
          <Text fontSize={11} fontWeight="600" color="$mutedForeground">
            {formatDateLabel(draft.date)}
          </Text>
        </XStack>
        <Text fontSize={11} color="$mutedForeground">
          {formatRelativeTime(draft.updatedAt)}
        </Text>
      </XStack>
      <YStack gap="$0.5">
        <Text color="$foreground" fontSize={14} fontWeight="500" numberOfLines={1}>
          {draft.title.trim() || '제목 없음'}
        </Text>
      </YStack>
    </PressableYCard>
  );
}
