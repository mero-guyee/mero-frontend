import FootprintList from '@/components/footprint/FootprintList';
import FootprintSkeleton from '@/components/footprint/FootprintSkeleton';
import FootprintMapView from '@/components/footprint/map/FootprintMapView';
import FadeWrapper from '@/components/ui/FadeWrapper';
import TabScreenHeader from '@/components/ui/header/TabScreenHeader';
import { formatDateLabel, getTripDayNumber } from '@/utils/date';
import { List, Map } from '@tamagui/lucide-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable } from 'react-native';
import { Stack, YStack } from 'tamagui';
import { useFootprints, useTrips } from '../../../contexts';

export default function FootprintListScreen() {
  const router = useRouter();
  const { created } = useLocalSearchParams<{ created?: string }>();

  const { activeTrip, getTripById } = useTrips();
  const { footprints, isFootPrintLoading } = useFootprints();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const filteredFootprints = useMemo(() => {
    return footprints
      .filter((f) => !activeTrip || f.tripId === activeTrip)
      .filter(
        (f) =>
          searchQuery === '' ||
          f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [footprints, activeTrip, searchQuery]);

  const footprintsByDate = useMemo(() => {
    const grouped = filteredFootprints.reduce(
      (acc, footprint) => {
        if (!acc[footprint.date]) acc[footprint.date] = [];
        acc[footprint.date].push(footprint);
        return acc;
      },
      {} as Record<string, typeof filteredFootprints>
    );
    return Object.entries(grouped).map(([date, data]) => {
      const trip = getTripById(data[0].tripId);
      return {
        title: formatDateLabel(date),
        dayLabel: trip ? `${getTripDayNumber(trip.startDate, date)}일차` : undefined,
        data,
      };
    });
  }, [filteredFootprints, getTripById]);

  if (isFootPrintLoading) {
    return <FootprintSkeleton />;
  }

  return (
    <YStack flex={1} backgroundColor="$background" position="relative">
      <TabScreenHeader label="일지">
        {filteredFootprints.length > 0 && (
          <Pressable onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}>
            <YStack alignItems="center" justifyContent="center" flex={1} paddingHorizontal="$2">
              {viewMode === 'list' ? (
                <Map size={22} color="$foreground" />
              ) : (
                <List size={22} color="$foreground" />
              )}
            </YStack>
          </Pressable>
        )}
      </TabScreenHeader>

      <FadeWrapper>
        {viewMode === 'map' ? (
          <FootprintMapView footprints={filteredFootprints} isLoading={isFootPrintLoading} />
        ) : (
          <Stack mt="$4">
            <FootprintList
              sections={footprintsByDate}
              showSearch={showSearch}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onCreateFootprint={() => router.push('/(main)/footprint/new')}
              onSelectFootprint={(id) => router.push(`/(main)/footprint/${id}`)}
              isEmpty={filteredFootprints.length === 0}
              createdId={created}
            />
          </Stack>
        )}
      </FadeWrapper>
    </YStack>
  );
}
