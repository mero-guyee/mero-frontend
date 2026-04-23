import FloatingActionButton from '@/components/ui/button/FloatingActionButton';

import { YCard } from '@/components/ui/Card';
import FadeWrapper from '@/components/ui/FadeWrapper';
import TabScreenHeader from '@/components/ui/header/TabScreenHeader';
import Loading from '@/components/ui/Loading';
import { Plus } from '@tamagui/lucide-icons';
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

  const { activeTrip } = useTrips();
  const { footprints, isFoorPrintLoading } = useFootprints();
  const { expenses } = useExpenses();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

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

  const renderFootprintItem = ({
    item: footprint,
    index,
    section,
  }: {
    item: Footprint;
    index: number;
    section: FootprintSection;
  }) => {
    const firstLocation = footprint.locations[0];
    const badge = firstLocation?.placeName || footprint.serverId;
    const date = new Date(footprint.date);
    const dateLabel = date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
    const { total, currency } = getFootprintExpense(footprint.id);
    const isLast = index === section.data.length - 1;

    return (
      <XStack marginBottom="$3">
        {/* 타임라인 스트립 */}
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

        {/* 카드 */}
        <Pressable style={{ flex: 1 }} onPress={() => handleSelectFootprint(footprint.id)}>
          <YCard paddingHorizontal="$4" paddingVertical="$4" gap="$2">
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
  };

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

  if (isFoorPrintLoading) {
    return <Loading />;
  }

  return (
    <YStack flex={1} backgroundColor="$background" position="relative">
      {/* App Bar */}
      <TabScreenHeader label="일지">
        <XStack alignItems="center" gap="$4">
          <CircularButton
            pressStyle={{ backgroundColor: '$muted' }}
            onPress={() => setShowSearch(!showSearch)}
          >
            {/* <Search size="$7" color="$foreground" /> */}
          </CircularButton>
        </XStack>
      </TabScreenHeader>
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
      {/* Footprint List */}
      <FadeWrapper>
        <SectionList
          sections={footprintsByMonth}
          keyExtractor={(item) => item.id}
          renderItem={renderFootprintItem}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 100,
            flexGrow: filteredFootprints.length === 0 ? 1 : undefined,
          }}
          stickySectionHeadersEnabled={true}
        />
        <FloatingActionButton onPress={handleCreateFootprint}>
          <XStack alignItems="center" gap="$2">
            <Plus />
            <Text>새 일지</Text>
          </XStack>
        </FloatingActionButton>
      </FadeWrapper>
    </YStack>
  );
}
