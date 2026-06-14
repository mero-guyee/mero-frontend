import { paddingHorizontalGeneral } from '@/constants/theme';
import { Trip } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SectionList } from 'react-native';

import FloatingActionButton from '@/components/ui/button/FloatingActionButton';
import FadeWrapper from '@/components/ui/FadeWrapper';
import { useIsFocused } from '@react-navigation/native';
import { Plane } from '@tamagui/lucide-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, View, YStack } from 'tamagui';
import { TripCard } from '../../../components/trips/card/TripCard';
import { TripEmptyState } from '../../../components/trips/TripEmptyState';
import { TripHeader } from '../../../components/trips/TripHeader';
import { useTrips } from '../../../contexts';

export default function TripListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const { created } = useLocalSearchParams<{ created?: string }>();
  const { tripsByProgress, trips, setActiveTrip, isTripsLoading } = useTrips();

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

  if (!isFocused) {
    return (
      <View flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
        <Plane size={44} color="$mutedForeground" />
      </View>
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
            <YStack flex={1} alignItems="center" justifyContent="center">
              <TripEmptyState onCreateTrip={handleCreateTrip} />
            </YStack>
          ) : (
            <SectionList
              sections={sections}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: paddingHorizontalGeneral, paddingTop: 0 }}
              renderSectionHeader={({ section }) => (
                <Text fontSize={20} fontWeight="600" color="$input" paddingVertical="$2">
                  {section.title}
                </Text>
              )}
              renderItem={({ item }) => (
                <FadeWrapper>
                  <TripCard
                    trip={item}
                    onPress={() => handleSelectTrip(item.id)}
                    showSyncBadge={created === item.id}
                  />
                </FadeWrapper>
              )}
              showsVerticalScrollIndicator={false}
            />
          )}
          <FloatingActionButton onPress={handleCreateTrip} noBottomTabBar testID="new-trip-fab">
            <Plane size={44} strokeWidth={1} />
          </FloatingActionButton>
        </FadeWrapper>
      )}
    </YStack>
  );
}
