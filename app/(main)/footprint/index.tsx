import PlusButton from '@/components/ui/button/PlusButton';
import { Plus, Search } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, SectionList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image, Text, XStack, YStack } from 'tamagui';
import { CircularButton, Input } from '../../../components/ui';
import { useExpenses, useFootprints, useTrips } from '../../../contexts';
import { Footprint } from '../../../types';

interface FootprintSection {
  title: string;
  data: Footprint[];
}

export default function FootprintListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { trips, activeTrip } = useTrips();
  const { footprints } = useFootprints();
  const { expenses } = useExpenses();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const activeTripData = activeTrip ? trips.find((t) => t.id === activeTrip) : null;

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
        if (!acc[monthKey]) {
          acc[monthKey] = [];
        }
        acc[monthKey].push(footprint);
        return acc;
      },
      {} as Record<string, Footprint[]>
    );

    return Object.entries(grouped).map(([title, data]) => ({ title, data }));
  }, [filteredFootprints]);

  const getFootprintExpense = (footprintId: string) => {
    const footprintExpenses = expenses.filter((e) => e.footprintId === footprintId);
    const total = footprintExpenses.reduce((sum, e) => sum + e.amount, 0);
    const currency = footprintExpenses[0]?.currency || 'USD';
    return { total, currency };
  };

  const handleCreateFootprint = () => {
    router.push('/(main)/footprint/new');
  };

  const handleSelectFootprint = (footprintId: string) => {
    router.push(`/(main)/footprint/${footprintId}`);
  };

  const renderFootprintItem = ({ item: footprint }: { item: Footprint }) => {
    const firstLocation = footprint.locations[0];
    return (
      <Pressable onPress={() => handleSelectFootprint(footprint.id)}>
        <XStack
          backgroundColor="$card"
          borderRadius="$6"
          padding="$4"
          gap="$3"
          marginBottom="$3"
          borderWidth={2}
          borderColor="$border"
        >
          {footprint.photoUrls[0] && (
            <Image
              source={{ uri: footprint.photoUrls[0] }}
              width={96}
              height={96}
              borderRadius="$4"
              resizeMode="cover"
            />
          )}
          <YStack flex={1}>
            <Text color="$mutedForeground" fontSize={14}>
              {new Date(footprint.date).toLocaleDateString('ko-KR', {
                month: 'long',
                day: 'numeric',
              })}{' '}
              {firstLocation ? `· ${firstLocation.placeName || firstLocation.country || ''}` : ''}
            </Text>
            <Text color="$foreground" fontWeight="500" marginTop="$1" numberOfLines={1}>
              {footprint.title}
            </Text>
            <Text color="$mutedForeground" fontSize={14} marginTop="$1" numberOfLines={1}>
              {footprint.content}
            </Text>
          </YStack>
        </XStack>
      </Pressable>
    );
  };

  const renderSectionHeader = ({ section }: { section: FootprintSection }) => (
    <YStack
      backgroundColor="$card"
      paddingHorizontal="$5"
      paddingVertical="$3"
      borderBottomWidth={2}
      borderBottomColor="$border"
      style={{ borderBottomColor: 'rgba(155, 196, 209, 0.2)' }}
    >
      <Text color="$foreground">📅 {section.title}</Text>
    </YStack>
  );

  const renderEmptyList = () => (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      paddingVertical={80}
      paddingHorizontal="$4"
    >
      <Text fontSize={48} marginBottom="$4">
        📔
      </Text>
      <Text color="$foreground" marginBottom="$1">
        아직 일지가 없습니다
      </Text>
      <Text color="$mutedForeground">새 일지를 작성해보세요</Text>
    </YStack>
  );

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* App Bar */}
      <YStack
        backgroundColor="$card"
        paddingTop={insets.top}
        paddingHorizontal="$4"
        paddingBottom="$3"
        borderBottomWidth={2}
        borderBottomColor="$primary"
        style={{ borderBottomColor: 'rgba(155, 196, 209, 0.25)' }}
      >
        <XStack alignItems="center" justifyContent="space-between">
          <YStack flex={1}>
            <Text color="$foreground" fontSize={18} fontWeight="600">
              📜 일지
            </Text>
            {activeTripData && (
              <Text color="$mutedForeground" fontSize={14} marginTop="$0.5">
                {activeTripData.title}
              </Text>
            )}
          </YStack>
          <XStack alignItems="center" gap="$4">
            <CircularButton
              pressStyle={{ backgroundColor: '$muted' }}
              onPress={() => setShowSearch(!showSearch)}
            >
              <Search size="$7" color="$foreground" />
            </CircularButton>
            <PlusButton onPress={handleCreateFootprint}>
              <Plus size={20} color="$foreground" />
            </PlusButton>
          </XStack>
        </XStack>

        {showSearch && (
          <XStack marginTop="$3">
            <Input
              flex={1}
              backgroundColor="$muted"
              borderWidth={1}
              borderColor="$border"
              borderRadius="$4"
              paddingHorizontal="$4"
              paddingVertical="$2"
              placeholder="일지 검색..."
              placeholderTextColor="$mutedForeground"
              value={searchQuery}
              onChangeText={setSearchQuery}
              color="$foreground"
            />
          </XStack>
        )}
      </YStack>

      {/* Footprint List */}
      <SectionList
        sections={footprintsByMonth}
        keyExtractor={(item) => item.id}
        renderItem={renderFootprintItem}
        renderSectionHeader={renderSectionHeader}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 100,
          flexGrow: filteredFootprints.length === 0 ? 1 : undefined,
        }}
        stickySectionHeadersEnabled={true}
      />
    </YStack>
  );
}
