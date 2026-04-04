import { MapPin } from '@tamagui/lucide-icons';
import { Pressable } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { Trip } from '../../types';
import TripDetailCoverImage from './detail/TripDetailCoverImage';

interface TripCardProps {
  trip: Trip;
  onPress: () => void;
}

export function TripCard({ trip, onPress }: TripCardProps) {
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const today = new Date();
  const totalDays =
    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const daysPassed = Math.max(
    0,
    Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  );
  const progress = Math.min(100, (daysPassed / totalDays) * 100);

  return (
    <Pressable onPress={onPress}>
      <YStack
        backgroundColor="$card"
        borderRadius="$6"
        borderWidth={2}
        borderColor="$border"
        overflow="hidden"
        marginBottom="$4"
        style={{
          shadowColor: '#5C4033',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        {/* Cover Image */}
        <YStack height={180} overflow="hidden">
          <TripDetailCoverImage trip={trip} />
        </YStack>

        {/* Content */}
        <YStack padding="$5" gap="$3">
          <Text fontSize={18} fontWeight="600" color="$foreground">
            {trip.title}
          </Text>

          {trip.startDate < trip.endDate && (
            <YStack backgroundColor="$muted" borderRadius="$4" padding="$3">
              <XStack justifyContent="space-between" marginBottom="$2">
                <Text color="$mutedForeground" fontSize={14}>
                  진행 중 ✨
                </Text>
                <Text color="$mutedForeground" fontSize={14}>
                  D+{daysPassed} / {totalDays}일
                </Text>
              </XStack>
              <YStack height={10} backgroundColor="$secondary" borderRadius={5} overflow="hidden">
                <YStack
                  height={10}
                  backgroundColor="$primary"
                  borderRadius={5}
                  width={`${progress}%`}
                />
              </YStack>
            </YStack>
          )}

          <Text color="$mutedForeground" fontSize={14}>
            {trip.startDate} - {trip.endDate}
          </Text>

          <XStack alignItems="center" gap="$1.5">
            <MapPin size={16} color="$mutedForeground" />
            <Text color="$mutedForeground" fontSize={14}>
              {trip.countries.join(', ')}
            </Text>
          </XStack>
        </YStack>
      </YStack>
    </Pressable>
  );
}
