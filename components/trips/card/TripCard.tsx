import { YCard } from '@/components/ui/Card';
import { MapPin } from '@tamagui/lucide-icons';
import { Pressable } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { Trip } from '../../../types';
import TripCoverImage from '../TripCoverImage';
import TripProgress from './TripProgress';

interface TripCardProps {
  trip: Trip;
  onPress: () => void;
}

export function TripCard({ trip, onPress }: TripCardProps) {
  return (
    <Pressable onPress={onPress}>
      <YCard marginBottom="$4">
        {/* Cover Image */}
        <YStack height={180} overflow="hidden">
          <TripCoverImage uri={trip.imageUrl} />
        </YStack>

        {/* Content */}
        <YStack padding="$5" gap="$3">
          <Text fontSize={18} fontWeight="600" color="$foreground">
            {trip.title}
          </Text>

          <TripProgress tripStartDate={trip.startDate} tripEndDate={trip.endDate} />

          <Text color="$mutedForeground" fontSize={14}>
            {trip.startDate} - {trip.endDate}
          </Text>

          <XStack alignItems="center" gap="$1.5">
            <MapPin size={16} color="$mutedForeground" />
            <Text color="$mutedForeground" fontSize={14}>
              {trip.countries.length > 0 ? trip.countries.join(', ') : '아직 정해지지 않았어요.'}
            </Text>
          </XStack>
        </YStack>
      </YCard>
    </Pressable>
  );
}
