import { CloudUpload } from '@tamagui/lucide-icons';
import { AnimatePresence, Text, XStack } from 'tamagui';
import { useSyncingContext } from '../../contexts/SyncingContext';
import type { SyncStatus } from '../../repositories/base';

interface UnsyncedBadgeProps {
  status: SyncStatus;
  id?: string;
  onImage?: boolean;
}

const textShadow = {
  textShadowColor: 'rgba(0,0,0,0.3)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 3,
} as const;

export function UnsyncedBadge({ status, id, onImage = false }: UnsyncedBadgeProps) {
  const { isSyncing } = useSyncingContext();
  const visible = status === 'pending' && !(id && isSyncing(id));

  return (
    <AnimatePresence>
      {visible && (
        <XStack
          key="unsynced"
          alignItems="center"
          gap="$1"
          animation="fast"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        >
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
      )}
    </AnimatePresence>
  );
}
