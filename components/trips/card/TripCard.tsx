import { YCard } from '@/components/ui/Card';
import { pressFeedbackStyle } from '@/components/ui/pressFeedback';
import { SyncIndicator } from '@/components/ui/SyncIndicator';
import { SyncingResultBadge } from '@/components/ui/SyncingResultBadge';
import { useSyncContext } from '@/contexts';
import { MapPin } from '@tamagui/lucide-icons';
import { Text, XStack, YStack } from 'tamagui';
import { Trip } from '../../../types';
import TripCoverImage from '../TripCoverImage';
import TripProgress from './TripProgress';

interface TripCardProps {
  trip: Trip;
  onPress: () => void;
  showSyncBadge?: boolean;
}

export function TripCard({ trip, onPress, showSyncBadge = false }: TripCardProps) {
  const { isSyncing } = useSyncContext();
  return (
    <YCard marginBottom="$4" onPress={onPress} {...pressFeedbackStyle}>
      {/* Cover Image */}
      <YStack height={180} overflow="hidden">
        <TripCoverImage uri={trip.imageUrl} />
        {showSyncBadge && <SyncingResultBadge id={trip.id} />}
      </YStack>

      {/* Content */}
      <YStack padding="$5" gap="$3">
        <XStack justifyContent="space-between" alignItems="center" gap="$2">
          <Text flex={1} numberOfLines={1} fontSize={18} fontWeight="600" color="$foreground">
            {trip.title}
          </Text>
          <SyncIndicator status={trip.syncStatus ?? 'pending'} syncing={isSyncing(trip.id)} />
        </XStack>

        <TripProgress tripStartDate={trip.startDate} tripEndDate={trip.endDate} />

        <Text color="$mutedForeground" fontSize={14}>
          {trip.startDate} - {trip.endDate}
        </Text>

        <XStack alignItems="center" gap="$1.5">
          <MapPin size={16} color="$mutedForeground" />
          <Text flex={1} color="$mutedForeground" fontSize={14}>
            {trip.countries.length > 0 ? trip.countries.join(', ') : '아직 정해지지 않았어요.'}
          </Text>
        </XStack>
      </YStack>
    </YCard>
  );
}
