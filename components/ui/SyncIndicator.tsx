import { CloudUpload } from '@tamagui/lucide-icons';
import { Text, XStack } from 'tamagui';
import type { SyncStatus } from '../../repositories/base';

interface SyncIndicatorProps {
  status: SyncStatus;
  onImage?: boolean;
}

const textShadow = {
  textShadowColor: 'rgba(0,0,0,0.3)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 3,
} as const;

export function SyncIndicator({ status, onImage = false }: SyncIndicatorProps) {
  if (status !== 'pending') return null;

  return (
    <XStack alignItems="center" gap="$1">
      <CloudUpload size={12} color="$destructiveText" />
      <Text
        fontSize={11}
        fontWeight="700"
        color="$destructiveText"
        {...(onImage ? textShadow : undefined)}
      >
        미동기화
      </Text>
    </XStack>
  );
}
