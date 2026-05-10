import FootprintList from '@/components/footprint/FootprintList';
import PathMapView from '@/components/map/PathMapView';
import FadeWrapper from '@/components/ui/FadeWrapper';
import TabScreenHeader from '@/components/ui/header/TabScreenHeader';
import Loading from '@/components/ui/Loading';
import { List, Map } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable } from 'react-native';
import { YStack } from 'tamagui';
import { useExpenses, useFootprints, useTrips } from '../../../contexts';

export default function FootprintListScreen() {
  const router = useRouter();

  const { activeTrip } = useTrips();
  const { footprints, isFootPrintLoading } = useFootprints();
  const { expenses } = useExpenses();

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

  const footprintsByMonth = useMemo(() => {
    const grouped = filteredFootprints.reduce(
      (acc, footprint) => {
        const monthKey = new Date(footprint.date).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
        });
        if (!acc[monthKey]) acc[monthKey] = [];
        acc[monthKey].push(footprint);
        return acc;
      },
      {} as Record<string, typeof filteredFootprints>
    );
    return Object.entries(grouped).map(([title, data]) => ({ title, data }));
  }, [filteredFootprints]);

  const getFootprintExpense = (footprintId: string) => {
    const footprintExpenses = expenses.filter((e) => e.footprintId === footprintId);
    const total = footprintExpenses.reduce((sum, e) => sum + e.amount, 0);
    const currency = footprintExpenses[0]?.currency || 'USD';
    return { total, currency };
  };

  if (isFootPrintLoading) {
    return <Loading />;
  }

  return (
    <YStack flex={1} backgroundColor="$background" position="relative">
      <TabScreenHeader label="일지">
        <Pressable onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}>
          <YStack alignItems="center" justifyContent="center" flex={1} paddingHorizontal="$2">
            {viewMode === 'list' ? (
              <Map size={22} color="$foreground" />
            ) : (
              <List size={22} color="$foreground" />
            )}
          </YStack>
        </Pressable>
      </TabScreenHeader>

      <FadeWrapper>
        {viewMode === 'map' ? (
          <PathMapView footprints={filteredFootprints} isLoading={isFootPrintLoading} />
        ) : (
          <FootprintList
            sections={footprintsByMonth}
            showSearch={showSearch}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onCreateFootprint={() => router.push('/(main)/footprint/new')}
            onSelectFootprint={(id) => router.push(`/(main)/footprint/${id}`)}
            getFootprintExpense={getFootprintExpense}
            isEmpty={filteredFootprints.length === 0}
          />
        )}
      </FadeWrapper>
    </YStack>
  );
}
