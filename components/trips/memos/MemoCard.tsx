import { PressableYCard } from '@/components/ui/Card';
import { SyncIndicator } from '@/components/ui/SyncIndicator';
import { SyncingResultBadge } from '@/components/ui/SyncingResultBadge';
import { Memo } from '@/types';
import { Text, XStack } from 'tamagui';

export default function MemoCard({ memo, onPress }: { memo: Memo; onPress: (id: string) => void }) {
  const { id, title, content, syncStatus } = memo;
  return (
    <PressableYCard
      key={id}
      padding="$4"
      position="relative"
      animation="lazy"
      enterStyle={{ opacity: 0 }}
      onPress={() => onPress(memo.id)}
    >
      <SyncingResultBadge id={id} />
      <XStack alignItems="flex-start" justifyContent="space-between" marginBottom="$2">
        <Text flex={1} paddingRight="$2" color="$foreground" fontWeight="500">
          {title}
        </Text>
        <SyncIndicator status={syncStatus} />
      </XStack>
      <Text color="$mutedForeground" fontSize={14} numberOfLines={2} marginBottom="$2">
        {content}
      </Text>
    </PressableYCard>
  );
}
