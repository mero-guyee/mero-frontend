import TripCoverMeta from '@/components/trips/TripCoverMeta';
import { Trip } from '@/types';
import { Edit3 } from '@tamagui/lucide-icons';
import { Asset } from 'expo-asset';
import { Image } from 'expo-image';
import { useState } from 'react';
import { YStack } from 'tamagui';

const DEFAULT_IMAGE = Asset.fromModule(require('@/assets/images/mountain.jpg')).uri;
const TRIP_DETAIL_IMAGE_THUMBHASH = 'a8cVJYh4h3iPiHd3iHd3h4iPifiY';

export default function TripDetailCoverImage({
  uri,
  trip,
  onEdit,
}: {
  uri?: string;
  trip?: Trip;
  onEdit?: () => void;
}) {
  const [localUri, setLocalUri] = useState<string>(uri ?? DEFAULT_IMAGE);
  return (
    <YStack height={192} position="relative" overflow="hidden">
      <Image
        source={{ uri: localUri }}
        placeholder={{ thumbhash: TRIP_DETAIL_IMAGE_THUMBHASH }}
        contentFit="cover"
        cachePolicy="memory-disk"
        style={{ width: '100%', height: 192 }}
        onError={() => setLocalUri(DEFAULT_IMAGE)}
      />
      {trip && <TripCoverMeta trip={trip} />}
      {onEdit && (
        <YStack
          position="absolute"
          bottom={10}
          right={10}
          backgroundColor="rgba(0,0,0,0.6)"
          padding="$2"
          borderRadius="$4"
          onPress={onEdit}
        >
          <Edit3 color="#fff" size={16} />
        </YStack>
      )}
    </YStack>
  );
}
