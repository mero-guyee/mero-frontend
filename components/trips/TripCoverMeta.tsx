import { Trip } from '@/types';
import { formatDateRange } from '@/utils/date';
import { Calendar, Globe } from '@tamagui/lucide-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, XStack, YStack } from 'tamagui';

type Props = {
  trip: Trip;
};

export default function TripCoverMeta({ trip }: Props) {
  const dateLabel = formatDateRange(trip.startDate, trip.endDate);
  const countriesLabel = trip.countries.join(' · ');

  return (
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.72)']}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingTop: 40,
        paddingBottom: 12,
      }}
    >
      <YStack gap={4}>
        <Text color="white" fontSize={18} fontWeight="700" numberOfLines={1}>
          {trip.title}
        </Text>

        <XStack alignItems="center" gap="$1">
          <Calendar size={11} color="rgba(255,255,255,0.7)" />
          <Text color="rgba(255,255,255,0.8)" fontSize={12}>
            {dateLabel}
          </Text>
        </XStack>

        {countriesLabel.length > 0 && (
          <XStack alignItems="flex-start" gap="$1">
            <YStack width={11} height={16} alignItems="center" justifyContent="center">
              <Globe size={11} color="rgba(255,255,255,0.7)" />
            </YStack>
            <Text flex={1} color="rgba(255,255,255,0.8)" fontSize={12}>
              {countriesLabel}
            </Text>
          </XStack>
        )}
      </YStack>
    </LinearGradient>
  );
}
