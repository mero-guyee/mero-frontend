import { useState } from 'react';
import { Image, YStack } from 'tamagui';

const placeholderImage = require('@/assets/images/mountain.jpg');

export default function TripDetailCoverImage({ uri }: { uri?: string }) {
  const [localUri, setLocalUri] = useState(uri || placeholderImage);

  return (
    <YStack height={192} position="relative" overflow="hidden">
      <Image
        source={{ uri: localUri }}
        onError={() => {
          setLocalUri(placeholderImage);
        }}
        width="100%"
        height="100%"
        objectFit="cover"
      />
    </YStack>
  );
}
