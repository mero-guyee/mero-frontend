import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { YStack } from 'tamagui';
import { TripCard } from '../../../components/trips/TripCard';
import { TripEmptyState } from '../../../components/trips/TripEmptyState';
import { TripHeader } from '../../../components/trips/TripHeader';
import { useTrips } from '../../../contexts';

export default function TripListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { trips, setActiveTrip } = useTrips();

  const [filter, setFilter] = useState<'all' | 'ongoing' | 'completed'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

  const filteredTrips = trips
    .filter(() => filter === 'all')
    .sort((a, b) => {
      if (sort === 'newest') {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      } else {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      }
    });

  const handleSelectTrip = (tripId: string) => {
    setActiveTrip(tripId);
    router.push(`/(main)/trips/${tripId}`);
  };

  const handleCreateTrip = () => {
    router.push('/(main)/trips/new');
  };

  const handleSettings = () => {
    router.push('/(main)/settings');
  };

  return (
    <YStack flex={1} backgroundColor="$background" paddingTop={insets.top}>
      <TripHeader
        onSettings={handleSettings}
        onCreateTrip={handleCreateTrip}
        filter={filter}
        sort={sort}
        onFilterChange={setFilter}
        onSortChange={setSort}
      />

      <FlatList
        data={filteredTrips}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TripCard trip={item} onPress={() => handleSelectTrip(item.id)} />
        )}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<TripEmptyState onCreateTrip={handleCreateTrip} />}
        showsVerticalScrollIndicator={false}
      />
    </YStack>
  );
}
