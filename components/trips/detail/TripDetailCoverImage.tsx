import { Trip } from '@/types';
import { Calendar, MapPin } from '@tamagui/lucide-icons';
import { useState } from 'react';
import { Image, Text, XStack, YStack } from 'tamagui';

const placeholderImage = require('@/assets/images/mountain.jpg');

export default function TripDetailCoverImage({ trip }: { trip: Trip }) {
  const [uri, setUri] = useState(trip.imageUrl || placeholderImage);

  return (
    <YStack height={192} position="relative" overflow="hidden">
      <Image
        source={{ uri }}
        onError={() => {
          setUri(placeholderImage);
        }}
        width="100%"
        height="100%"
        objectFit="cover"
      />
      <YStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        top={0}
        style={{
          background: 'linear-gradient(to top, rgba(92, 64, 51, 0.5), transparent)',
        }}
      />
      <YStack position="absolute" bottom={16} left={16} right={16}>
        <XStack alignItems="center" gap="$2" marginBottom="$1">
          <Calendar size={16} color="white" />
          <Text color="white" fontSize={14} opacity={0.9}>
            {trip.startDate} - {trip.endDate}
          </Text>
        </XStack>
        <XStack alignItems="center" gap="$1">
          <MapPin size={16} color="white" />
          <Text color="white" fontSize={14} opacity={0.9}>
            {trip.countries.join(', ')}
          </Text>
        </XStack>
      </YStack>
    </YStack>
  );
}
