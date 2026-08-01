import { YCard } from '@/components/ui/Card';
import { useTrips } from '@/contexts';
import {
  TripsByStatus,
  UnrecordedTarget,
  UnrecordedTrip,
  useTripsWithoutRecordsQuery,
} from '@/hooks/queries/useTrips';
import { ChevronRight } from '@tamagui/lucide-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { AnimatePresence, Text, XStack, YStack } from 'tamagui';

interface UnrecordedTripsBannerProps {
  tripsByStatus: TripsByStatus;
}

function navigateToTarget(router: ReturnType<typeof useRouter>, target: UnrecordedTarget) {
  switch (target) {
    case 'footprint':
      router.push('/(main)/footprint');
      break;
    case 'memo':
      router.push({ pathname: '/(main)/backpack', params: { tab: 'memos' } });
      break;
    case 'document':
      router.push({ pathname: '/(main)/backpack', params: { tab: 'files' } });
      break;
    case 'budget':
      router.push('/(main)/expense');
      break;
  }
}

export function UnrecordedTripsBanner({ tripsByStatus }: UnrecordedTripsBannerProps) {
  const router = useRouter();
  const { setActiveTrip } = useTrips();
  const { data: unrecordedTrips = [] } = useTripsWithoutRecordsQuery(tripsByStatus);
  const representative = unrecordedTrips[0];

  return (
    <AnimatePresence>
      {representative && (
        <BannerCard
          key={representative.trip.id}
          representative={representative}
          extraCount={unrecordedTrips.length - 1}
          onPress={() => {
            setActiveTrip(representative.trip.id);
            navigateToTarget(router, representative.target);
          }}
        />
      )}
    </AnimatePresence>
  );
}

function BannerCard({
  representative,
  extraCount,
  onPress,
}: {
  representative: UnrecordedTrip;
  extraCount: number;
  onPress: () => void;
}) {
  const { trip, status } = representative;

  const title =
    status === 'planned'
      ? `${trip.title} 여행, 아직 준비 전이에요`
      : `${trip.title} 여행에 아직 기록이 없어요`;

  const subtitle =
    extraCount > 0
      ? `외 ${extraCount}개 여행도 ${status === 'planned' ? '준비가' : '기록이'} 필요해요`
      : status === 'planned'
        ? '탭해서 서류·예산을 준비해보세요'
        : '탭해서 기록을 남겨보세요';

  return (
    <YCard
      marginBottom="$4"
      padding="$3.5"
      backgroundColor="$accent"
      onPress={onPress}
      animation="fast"
      enterStyle={{ opacity: 0, scale: 0.95 }}
      exitStyle={{ opacity: 0, scale: 0.95 }}
      pressStyle={{ scale: 0.97, backgroundColor: '$accentPress' }}
    >
      <XStack alignItems="center" gap="$3">
        <YStack>
          <Image source={require('@/assets/icon.png')} style={{ width: 38, height: 38 }} />
        </YStack>
        <YStack flex={1} gap="$0.5">
          <Text fontSize={14.5} fontWeight="600" color="$foreground">
            {title}
          </Text>
          <Text fontSize={12.5} color="$mutedForeground">
            {subtitle}
          </Text>
        </YStack>
        <ChevronRight size={18} color="$mutedForeground" />
      </XStack>
    </YCard>
  );
}
