import { YCard } from '@/components/ui/Card';
import { SyncBadge } from '@/components/ui/SyncBadge';
import { Pressable } from 'react-native';
import { Image, Text, XStack, YStack } from 'tamagui';
import { Footprint } from '../../types';

interface Props {
  footprint: Footprint;
  isLast: boolean;
  expense: { total: number; currency: string };
  onPress: () => void;
  showSyncBadge?: boolean;
}

export default function FootprintItem({
  footprint,
  isLast,
  expense,
  onPress,
  showSyncBadge = false,
}: Props) {
  const firstLocation = footprint.locations[0];
  const badge = firstLocation?.placeName;
  const date = new Date(footprint.date);
  const dateLabel = date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
  const { total, currency } = expense;

  return (
    <XStack marginBottom="$3">
      <YStack alignItems="center" width={20} marginRight="$3">
        <YStack
          width={8}
          height={8}
          borderRadius={4}
          backgroundColor="$mutedForeground"
          marginTop={18}
        />
        {!isLast && <YStack flex={1} width={1} backgroundColor="$border" marginTop="$1" />}
      </YStack>

      <Pressable style={{ flex: 1 }} onPress={onPress}>
        <YCard paddingHorizontal="$4" paddingVertical="$4" gap="$2" position="relative">
          {showSyncBadge && <SyncBadge synced={footprint.syncStatus === 'synced'} />}
          <XStack gap="$3">
            <YStack flex={1} gap="$2">
              <XStack alignItems="center" gap="$3">
                <Text color="$mutedForeground" fontSize={14}>
                  {dateLabel}
                </Text>
                {badge && (
                  <Text color="$mutedForeground" fontSize={14}>
                    {badge}
                  </Text>
                )}
              </XStack>
              <Text color="$foreground" fontSize={20} fontWeight="700" numberOfLines={1}>
                {footprint.title}
              </Text>
              <Text color="$mutedForeground" fontSize={14} numberOfLines={1}>
                {footprint.content}
              </Text>
              <XStack gap="$2" marginTop="$1">
                {total > 0 && (
                  <YStack
                    backgroundColor="$muted"
                    borderRadius="$2"
                    paddingHorizontal="$2"
                    paddingVertical="$1"
                  >
                    <Text color="$mutedForeground" fontSize={12}>
                      {currency === 'KRW' ? '₩' : currency}
                      {total.toLocaleString()}
                    </Text>
                  </YStack>
                )}
              </XStack>
            </YStack>
            {footprint.photoUrls[0] && (
              <Image
                source={{ uri: footprint.photoUrls[0] }}
                width={72}
                height={72}
                borderRadius="$3"
                objectFit="cover"
                alignSelf="center"
              />
            )}
          </XStack>
        </YCard>
      </Pressable>
    </XStack>
  );
}
