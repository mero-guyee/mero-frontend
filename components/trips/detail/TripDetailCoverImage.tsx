import { Asset } from 'expo-asset';
import { Image } from 'expo-image';
import { useState } from 'react';
import { YStack } from 'tamagui';

const DEFAULT_IMAGE = Asset.fromModule(require('@/assets/images/mountain.jpg')).uri;
const TRIP_DETAIL_IMAGE_THUMBHASH = 'a8cVJYh4h3iPiHd3iHd3h4iPifiY';

export default function TripDetailCoverImage({ uri }: { uri?: string }) {
  const [localUri, setLocalUri] = useState<string>(DEFAULT_IMAGE);
  return (
    <YStack height={192} position="relative" overflow="hidden">
      <Image
        source={{ uri: localUri }}
        placeholder={{ thumbhash: TRIP_DETAIL_IMAGE_THUMBHASH }}
        contentFit="cover"
        cachePolicy="memory-disk"
        style={{ width: '100%', height: 192 }}
        onError={(e) => {
          setLocalUri(DEFAULT_IMAGE);
        }}
      />
    </YStack>
  );
}
