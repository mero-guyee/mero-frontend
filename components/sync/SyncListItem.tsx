import { IconButton } from '@/components/ui/button/BaseButton';
import type { OutboxEntry } from '@/repositories/outbox';
import { RefreshCw } from '@tamagui/lucide-icons';
import { Text, XStack } from 'tamagui';

const OPERATION_LABELS: Record<string, string> = {
  create: '생성',
  update: '수정',
  delete: '삭제',
};

interface SyncListItemProps {
  entry: OutboxEntry;
  isLast: boolean;
  isRetrying: boolean;
  onRetry: () => void;
}

export function SyncListItem({ entry, isLast, isRetrying, onRetry }: SyncListItemProps) {
  const isFailed = entry.status === 'failed';

  return (
    <XStack
      padding="$4"
      alignItems="center"
      gap="$3"
      borderBottomWidth={isLast ? 0 : 1}
      borderBottomColor="$border"
      style={{ borderBottomColor: 'rgba(155, 196, 209, 0.2)' }}
    >
      <Text flex={1} color={isFailed ? '$destructive' : '$foreground'} fontSize={14}>
        {entry.dataName || '-'}
      </Text>
      <Text color="$mutedForeground" fontSize={12}>
        {OPERATION_LABELS[entry.operation] ?? entry.operation}
      </Text>

      <IconButton onPress={onRetry} disabled={isRetrying}>
        <RefreshCw size={16} color={isRetrying ? '$mutedForeground' : '$destructive'} />
      </IconButton>
    </XStack>
  );
}
