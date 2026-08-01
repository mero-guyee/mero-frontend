import { paddingHorizontalGeneral } from '@/constants/theme';
import { Trip } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SectionList } from 'react-native';
import Toast from 'react-native-toast-message';
import Animated, { LinearTransition } from 'react-native-reanimated';

import FloatingActionButton from '@/components/ui/button/FloatingActionButton';
import FadeWrapper from '@/components/ui/FadeWrapper';
import { useIsFocused } from '@react-navigation/native';
import { Plane } from '@tamagui/lucide-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, View, YStack } from 'tamagui';
import { TripCard } from '../../../components/trips/card/TripCard';
import { TripEmptyState } from '../../../components/trips/TripEmptyState';
import { TripHeader } from '../../../components/trips/TripHeader';
import { UnrecordedTripsBanner } from '../../../components/trips/UnrecordedTripsBanner';
import { useAppModal, useTrips } from '../../../contexts';

export default function TripListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { showConfirm } = useAppModal();

  const { created } = useLocalSearchParams<{ created?: string }>();
  const { tripsByProgress, trips, setActiveTrip, deleteTrip, isTripsLoading } = useTrips();

  const sections: { title: string; data: Trip[] }[] = [
    { title: '여행 중', data: tripsByProgress.ongoing },
    { title: '곧 갈 여행', data: tripsByProgress.planned },
    { title: '다녀온 여행', data: tripsByProgress.completed },
  ].filter((s) => s.data.length > 0);

  const handleSelectTrip = (tripId: string) => {
    setActiveTrip(tripId);
    router.push('/(main)/backpack');
  };

  const handleCreateTrip = () => {
    router.push('/(main)/trips/new/Country');
  };

  const handleEditTrip = (tripId: string) => {
    setActiveTrip(tripId);
    router.push('/backpack/edit');
  };

  const handleDeleteTrip = async (trip: Trip) => {
    const confirmed = await showConfirm(
      '여행 삭제',
      '이 여행과 관련된 모든 일기와 경비가 삭제됩니다. 정말 삭제하시겠습니까?',
      { confirmText: '삭제', destructive: true }
    );
    if (!confirmed) return;
    try {
      await deleteTrip(trip.id);
    } catch {
      Toast.show({
        type: 'error',
        text1: '오류',
        text2: '여행을 삭제하는 중 오류가 발생했습니다. 다시 시도해주세요.',
      });
    }
  };

  if (!isFocused) {
    return (
      <View
        flex={1}
        alignItems="center"
        justifyContent="center"
        backgroundColor="$background"
      ></View>
    );
  }

  return (
    <YStack flex={1} backgroundColor="$background" paddingTop={insets.top}>
      <TripHeader onSettings={() => router.push('/(main)/settings')} />
      {isTripsLoading ? (
        <View flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
          <Plane size={44} color="$mutedForeground" />
        </View>
      ) : (
        <FadeWrapper>
          {trips.length === 0 ? (
            <YStack flex={1} alignItems="center" justifyContent="flex-start" mt="-200">
              <TripEmptyState onCreateTrip={handleCreateTrip} />
            </YStack>
          ) : (
            <SectionList
              sections={sections}
              keyExtractor={(item) => item.id}
              stickySectionHeadersEnabled={false}
              contentContainerStyle={{ padding: paddingHorizontalGeneral, paddingTop: 0 }}
              ListHeaderComponent={<UnrecordedTripsBanner tripsByStatus={tripsByProgress} />}
              renderSectionHeader={({ section }) => (
                <Animated.View layout={LinearTransition.springify().damping(70).stiffness(350)}>
                  <Text fontSize={20} fontWeight="600" color="$foreground" paddingVertical="$2">
                    {section.title}
                  </Text>
                </Animated.View>
              )}
              renderItem={({ item }) => (
                <Animated.View layout={LinearTransition.springify().damping(70).stiffness(350)}>
                  <FadeWrapper>
                    <TripCard
                      trip={item}
                      onPress={() => handleSelectTrip(item.id)}
                      onEdit={() => handleEditTrip(item.id)}
                      onDelete={() => handleDeleteTrip(item)}
                      showSyncBadge={created === item.id}
                    />
                  </FadeWrapper>
                </Animated.View>
              )}
              showsVerticalScrollIndicator={false}
            />
          )}
          {trips.length > 0 && (
            <FloatingActionButton onPress={handleCreateTrip} noBottomTabBar testID="new-trip-fab">
              <Plane size={44} strokeWidth={1} />
            </FloatingActionButton>
          )}
        </FadeWrapper>
      )}
    </YStack>
  );
}
