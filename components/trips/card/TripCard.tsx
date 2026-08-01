import { YCard } from '@/components/ui/Card';
import { pressFeedbackStyle } from '@/components/ui/pressFeedback';
import { SyncIndicator } from '@/components/ui/SyncIndicator';
import { SyncingResultBadge } from '@/components/ui/SyncingResultBadge';
import { useSyncContext } from '@/contexts';
import { YStack } from 'tamagui';
import { Trip } from '../../../types';
import TripCoverImage from '../TripCoverImage';
import TripCoverMeta from '../TripCoverMeta';

interface TripCardProps {
  trip: Trip;
  onPress: () => void;
  showSyncBadge?: boolean;
}

export function TripCard({ trip, onPress, showSyncBadge = false }: TripCardProps) {
  const { isSyncing } = useSyncContext();

  return (
    <YCard marginBottom="$4" onPress={onPress} {...pressFeedbackStyle}>
      <YStack height={180} overflow="hidden" position="relative">
        <TripCoverImage uri={trip.imageUrl} />
        {showSyncBadge && <SyncingResultBadge id={trip.id} />}

        <TripCoverMeta
          trip={trip}
          showProgress
          rightSlot={<SyncIndicator status={trip.syncStatus ?? 'pending'} syncing={isSyncing(trip.id)} />}
        />
      </YStack>
    </YCard>
  );
}
