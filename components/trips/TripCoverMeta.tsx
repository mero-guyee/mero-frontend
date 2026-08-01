import { Trip } from '@/types';
import { formatDateRange } from '@/utils/date';
import { Calendar, MapPin } from '@tamagui/lucide-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { Text, XStack, YStack } from 'tamagui';

const textShadow = {
  textShadowColor: 'rgba(0,0,0,0.5)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 4,
} as const;

function getTripProgressLabel(tripStartDate: string, tripEndDate: string) {
  const startDate = new Date(tripStartDate);
  const endDate = new Date(tripEndDate);
  const today = new Date();

  if (today > endDate) return null;

  if (today < startDate) {
    const daysRemaining = Math.ceil(
      (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return `D-${daysRemaining}`;
  }

  const totalDays =
    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const daysPassed = Math.max(
    0,
    Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  );
  return `${daysPassed}/${totalDays}일`;
}

type Props = {
  trip: Trip;
  rightSlot?: ReactNode;
  showProgress?: boolean;
};

export default function TripCoverMeta({ trip, rightSlot, showProgress = false }: Props) {
  const dateLabel = formatDateRange(trip.startDate, trip.endDate);
  const progressLabel = showProgress ? getTripProgressLabel(trip.startDate, trip.endDate) : null;

  return (
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.85)']}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingTop: 64,
        paddingBottom: 14,
      }}
    >
      <YStack gap="$1.5">
        <XStack justifyContent="space-between" alignItems="center" gap="$2">
          <Text flex={1} numberOfLines={1} fontSize={19} fontWeight="700" color="white" {...textShadow}>
            {trip.title}
          </Text>
          {rightSlot}
        </XStack>

        <XStack alignItems="center" gap="$1.5">
          <Calendar size={12} color="rgba(255,255,255,0.85)" />
          <Text color="rgba(255,255,255,0.92)" fontSize={13} fontWeight="500" {...textShadow}>
            {progressLabel ? `${dateLabel} · ${progressLabel}` : dateLabel}
          </Text>
        </XStack>

        <XStack alignItems="center" gap="$1.5">
          <MapPin size={12} color="rgba(255,255,255,0.85)" />
          <Text
            flex={1}
            numberOfLines={1}
            color="rgba(255,255,255,0.92)"
            fontSize={13}
            fontWeight="500"
            {...textShadow}
          >
            {trip.countries.length > 0 ? trip.countries.join(', ') : '아직 정해지지 않았어요.'}
          </Text>
        </XStack>
      </YStack>
    </LinearGradient>
  );
}
