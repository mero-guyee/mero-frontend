import { XStack } from 'tamagui';
import type { SyncStatus } from '../../repositories/base';
import { SyncingResultBadge } from './SyncingResultBadge';
import { UnsyncedBadge } from './UnsyncedBadge';

interface SyncStatusIndicatorProps {
  id: string;
  status: SyncStatus;
  showSyncBadge?: boolean;
  onImage?: boolean;
}

export function SyncStatusIndicator({
  id,
  status,
  showSyncBadge = false,
  onImage = false,
}: SyncStatusIndicatorProps) {
  return (
    <>
      {showSyncBadge && <SyncingResultBadge id={id} />}
      {onImage ? (
        <XStack position="absolute" top="$3" left="$3" zIndex={2}>
          <UnsyncedBadge id={id} status={status} onImage />
        </XStack>
      ) : (
        <UnsyncedBadge id={id} status={status} />
      )}
    </>
  );
}
