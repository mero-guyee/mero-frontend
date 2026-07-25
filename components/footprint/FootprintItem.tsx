import { PressableYCard } from '@/components/ui/Card';
import { SyncIndicator } from '@/components/ui/SyncIndicator';
import { SyncingResultBadge } from '@/components/ui/SyncingResultBadge';
import { WEATHER_ICON_MAP } from '@/components/footprint/new/WeatherSheet';
import { useSyncContext } from '@/contexts';
import { useFootprintPhotosQuery } from '@/hooks/queries/useFootprints';
import { Calendar, Camera, Cloud, MapPin } from '@tamagui/lucide-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Text, XStack, YStack } from 'tamagui';
import { Footprint } from '../../types';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

interface Props {
  footprint: Footprint;
  onPress: () => void;
  showSyncBadge?: boolean;
}

export default function FootprintItem({ footprint, onPress, showSyncBadge = false }: Props) {
  const { isSyncing } = useSyncContext();
  const { data: photos = [] } = useFootprintPhotosQuery(footprint.id);
  const thumbnailUri = photos[0] ? photos[0].s3Url || photos[0].localUri : undefined;

  const firstLocation = footprint.locations[0];
  const extraLocationCount = footprint.locations.length - 1;
  const locationLabel = firstLocation?.placeName
    ? `${firstLocation.placeName}${extraLocationCount > 0 ? ` 외 ${extraLocationCount}곳` : ''}`
    : undefined;

  const [year, month, day] = footprint.date.split('-').map(Number);
  const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()];
  const dateLabel = `${month}월 ${day}일 (${weekday})`;

  const [weatherKey, ...weatherLabelParts] = footprint.weatherInfo?.split(' ') ?? [];
  const WeatherIcon = weatherKey ? WEATHER_ICON_MAP[weatherKey] ?? Cloud : undefined;
  const weatherLabel = weatherLabelParts.join(' ');

  return (
    <PressableYCard
      onPress={onPress}
      padding={0}
      marginBottom="$4"
      position="relative"
    >
      {showSyncBadge && <SyncingResultBadge id={footprint.id} />}

      {thumbnailUri ? (
        <YStack position="relative" width="100%" aspectRatio={4 / 3}>
          <Image source={{ uri: thumbnailUri }} width="100%" height="100%" objectFit="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(20,14,10,0.08)', 'rgba(20,14,10,0.78)']}
            locations={[0, 0.45, 1]}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              padding: 14,
              justifyContent: 'space-between',
            }}
          >
            {locationLabel ? (
              <XStack
                alignSelf="flex-start"
                alignItems="center"
                gap="$1.5"
                backgroundColor="rgba(0,0,0,0.5)"
                borderWidth={1}
                borderColor="rgba(255,255,255,0.2)"
                borderRadius={999}
                paddingHorizontal="$2.5"
                paddingVertical="$1.5"
              >
                <MapPin size={12} color="white" />
                <Text color="white" fontSize={12} fontWeight="600" numberOfLines={1}>
                  {locationLabel}
                </Text>
              </XStack>
            ) : (
              <XStack />
            )}
            <XStack justifyContent="space-between" alignItems="flex-end" gap="$2">
              <Text flex={1} color="white" fontSize={18} fontWeight="600" numberOfLines={2}>
                {footprint.title}
              </Text>
              <SyncIndicator
                status={footprint.syncStatus ?? 'pending'}
                syncing={isSyncing(footprint.id)}
              />
            </XStack>
          </LinearGradient>
          {photos.length > 1 && (
            <XStack
              position="absolute"
              bottom={12}
              right={12}
              backgroundColor="rgba(0,0,0,0.5)"
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

      <YStack padding="$5" gap="$3">
        {!thumbnailUri && (
          <YStack gap="$1">
            <XStack justifyContent="space-between" alignItems="center" gap="$2">
              <Text flex={1} color="$foreground" fontSize={18} fontWeight="600" numberOfLines={1}>
                {footprint.title}
              </Text>
              <SyncIndicator
                status={footprint.syncStatus ?? 'pending'}
                syncing={isSyncing(footprint.id)}
              />
            </XStack>
            {locationLabel && (
              <XStack alignItems="center" gap="$1">
                <MapPin size={13} color="$foreground" />
                <Text color="$foreground" fontSize={13} fontWeight="600" numberOfLines={1}>
                  {locationLabel}
                </Text>
              </XStack>
            )}
          </YStack>
        )}

        <Text color="$mutedForeground" fontSize={13} lineHeight={19} numberOfLines={2}>
          {footprint.content}
        </Text>

        <XStack alignItems="center" gap="$1.5" flexWrap="wrap">
          <Calendar size={12} color="$mutedForeground" />
          <Text color="$mutedForeground" fontSize={12}>
            {dateLabel}
          </Text>
          {WeatherIcon && (
            <>
              <Text color="$mutedForeground" fontSize={12} opacity={0.5}>
                ·
              </Text>
              <XStack alignItems="center" gap="$1">
                <WeatherIcon size={12} color="$mutedForeground" />
                {weatherLabel.length > 0 && (
                  <Text color="$mutedForeground" fontSize={12}>
                    {weatherLabel}
                  </Text>
                )}
              </XStack>
            </>
          )}
        </XStack>
      </YStack>
    </PressableYCard>
  );
}
