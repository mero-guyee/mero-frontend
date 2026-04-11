import { paddingHorizontalGeneral } from '@/constants/theme';
import { TripStatus } from '@/types';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { useIsFocused } from '@react-navigation/native';
import { Plane } from '@tamagui/lucide-icons';
import { FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, YStack } from 'tamagui';
import { TripCard } from '../../../components/trips/card/TripCard';
import { TripEmptyState } from '../../../components/trips/TripEmptyState';
import { TripHeader } from '../../../components/trips/TripHeader';
import { useTrips } from '../../../contexts';

export default function TripListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const { tripsByProgress, trips, setActiveTrip } = useTrips();

  const [filter, setFilter] = useState<'all' | TripStatus>('all');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

  const filteredTrips = [...(filter === 'all' ? trips : tripsByProgress[filter])];
  const filteredAndSortedTrips = filteredTrips.sort((a, b) => {
    if (sort === 'newest') {
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    } else {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    }
  });

  const handleSelectTrip = (tripId: string) => {
    setActiveTrip(tripId);
    router.push('/(main)/backpack');
  };

  const handleCreateTrip = () => {
    router.push('/(main)/trips/new');
  };

  const handleSettings = () => {
    router.push('/(main)/settings');
  };

  if (!isFocused) {
    return (
      <View flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
        <Plane size={44} color="$mutedForeground" />
      </View>
    ); // 화면이 포커스되지 않았을 때는 아무것도 렌더링하지 않음
  }
  return (
    <YStack flex={1} backgroundColor="$background" paddingTop={insets.top}>
      <TripHeader
        filter={filter}
        setFilter={setFilter}
        sort={sort}
        setSort={setSort}
        onSettings={handleSettings}
        onCreateTrip={handleCreateTrip}
      />
      <FlatList
        data={filteredAndSortedTrips}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: paddingHorizontalGeneral }}
        renderItem={({ item }) => (
          <TripCard trip={item} onPress={() => handleSelectTrip(item.id)} />
        )}
        ListEmptyComponent={<TripEmptyState onCreateTrip={handleCreateTrip} />}
        showsVerticalScrollIndicator={false}
      />
    </YStack>
  );
}
