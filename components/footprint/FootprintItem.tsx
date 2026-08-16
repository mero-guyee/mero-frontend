import { WEATHER_ICON_MAP } from '@/components/footprint/new/WeatherSheet';
import { PressableYCard } from '@/components/ui/Card';
import { SyncIndicator } from '@/components/ui/SyncIndicator';
import { SyncingResultBadge } from '@/components/ui/SyncingResultBadge';
import { DEFAULT_THUMBHASH_PLACEHOLDER } from '@/constants/image';
import { useSyncContext } from '@/contexts';
import { useFootprintPhotosQuery } from '@/hooks/queries/useFootprints';
import { Camera, Cloud, MapPin } from '@tamagui/lucide-icons';
import { Image } from 'expo-image';
import { Text, XStack, YStack } from 'tamagui';
import { Footprint } from '../../types';

interface Props {
  footprint: Footprint;
  onPress: () => void;
  showSyncBadge?: boolean;
}

export default function FootprintItem({ footprint, onPress, showSyncBadge = false }: Props) {
  const { isSyncing } = useSyncContext();
  const { data: photos = [] } = useFootprintPhotosQuery(footprint.id);
  const thumbnailUri = photos[0] ? photos[0].s3Url || photos[0].localUri : undefined;
  const thumbnailHash = photos[0]?.thumbhash ?? DEFAULT_THUMBHASH_PLACEHOLDER;

  const firstLocation = footprint.locations[0];
  const extraLocationCount = footprint.locations.length - 1;
  const locationLabel = firstLocation?.placeName
    ? `${firstLocation.placeName}${extraLocationCount > 0 ? ` 외 ${extraLocationCount}곳` : ''}`
    : undefined;

  const [weatherKey, ...weatherLabelParts] = footprint.weatherInfo?.split(' ') ?? [];
  const WeatherIcon = weatherKey ? (WEATHER_ICON_MAP[weatherKey] ?? Cloud) : undefined;
  const weatherLabel = weatherLabelParts.join(' ');

  return (
    <PressableYCard onPress={onPress} padding={0} marginBottom="$2" position="relative">
      {showSyncBadge && <SyncingResultBadge id={footprint.id} />}

      {thumbnailUri ? (
        <YStack height={180} overflow="hidden" position="relative">
          <Image
            source={{ uri: thumbnailUri }}
            placeholder={{ thumbhash: thumbnailHash }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {photos.length > 1 && (
            <XStack
              position="absolute"
              top={10}
              right={10}
              backgroundColor="rgba(0,0,0,0.35)"
              borderRadius={999}
              paddingHorizontal="$2"
              paddingVertical="$1"
              alignItems="center"
              gap="$1"
            >
              <Camera size={10} color="white" />
              <Text color="white" fontSize={10} fontWeight="700">
                {photos.length}
              </Text>
            </XStack>
          )}
        </YStack>
      ) : null}

      <YStack padding="$5" gap="$1.5">
        <XStack justifyContent="space-between" alignItems="center" gap="$2">
          <XStack flex={1} alignItems="center" gap="$1.5">
            <MapPin size={14} color="$foreground" />
            <Text flex={1} numberOfLines={1} color="$foreground" fontSize={16} fontWeight="700">
              {locationLabel ?? '위치 정보가 없어요'}
            </Text>
            {WeatherIcon && (
              <XStack alignItems="center" gap="$1">
                <WeatherIcon size={13} color="$mutedForeground" />
                {weatherLabel.length > 0 && (
                  <Text color="$mutedForeground" fontSize={12}>
                    {weatherLabel}
                  </Text>
                )}
              </XStack>
            )}
          </XStack>
          <SyncIndicator
            status={footprint.syncStatus ?? 'pending'}
            syncing={isSyncing(footprint.id)}
          />
        </XStack>

        <Text color="$foreground" fontSize={14} fontWeight="500" numberOfLines={1}>
          {footprint.title}
        </Text>

        <Text color="$mutedForeground" fontSize={13} lineHeight={19} numberOfLines={2}>
          {footprint.content}
        </Text>
      </YStack>
    </PressableYCard>
  );
}
