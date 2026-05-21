import { Trip } from '@/types';
import { Calendar, Globe } from '@tamagui/lucide-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, XStack, YStack } from 'tamagui';

type Props = {
  trip: Trip;
};

function formatDateRange(start: string, end: string) {
  const [sy, sm, sd] = start.split('-');
  const [ey, em, ed] = end.split('-');
  if (sy === ey) return `${sy}.${sm}.${sd} — ${em}.${ed}`;
  return `${sy}.${sm}.${sd} — ${ey}.${em}.${ed}`;
}

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

        <XStack gap="$4" alignItems="center">
          <XStack alignItems="center" gap="$1">
            <Calendar size={11} color="rgba(255,255,255,0.7)" />
            <Text color="rgba(255,255,255,0.8)" fontSize={12}>
              {dateLabel}
            </Text>
          </XStack>

          {countriesLabel.length > 0 && (
            <XStack alignItems="center" gap="$1">
              <Globe size={11} color="rgba(255,255,255,0.7)" />
              <Text color="rgba(255,255,255,0.8)" fontSize={12} numberOfLines={1}>
                {countriesLabel}
              </Text>
            </XStack>
          )}
        </XStack>
      </YStack>
    </LinearGradient>
  );
}
