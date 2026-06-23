import { CloudOff } from '@tamagui/lucide-icons';
import { Text, XStack } from 'tamagui';
import type { SyncStatus } from '../../repositories/base';

interface SyncIndicatorProps {
  status: SyncStatus;
  syncing?: boolean;
}

export function SyncIndicator({ status, syncing }: SyncIndicatorProps) {
  if (status === 'synced' || syncing) return null;

  return (
    <XStack alignItems="center" gap="$1">
      <CloudOff size={12} color="$red9" />
      <Text fontSize={11} color="$red9">
        미동기화
      </Text>
    </XStack>
  );
}
