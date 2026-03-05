import { Plus, Search } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, SectionList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Image, Input, Text, XStack, YStack } from 'tamagui';
import { useDiaries, useExpenses, useTrips } from '../../../contexts';
import { Memo } from '../../../types';

interface MemoSection {
  title: string;
  data: Memo[];
}

export default function DiaryListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { trips, activeTrip } = useTrips();
  const { diaries } = useDiaries();
  const { expenses } = useExpenses();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const activeTripData = activeTrip ? trips.find((t) => t.id === activeTrip) : null;

  const filteredDiaries = useMemo(() => {
    return diaries
      .filter((d) => !activeTrip || d.tripId === activeTrip)
      .filter(
        (d) =>
          searchQuery === '' ||
          d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [diaries, activeTrip, searchQuery]);

  const diariesByMonth = useMemo(() => {
    const grouped = filteredDiaries.reduce((acc, diary) => {
      const monthKey = new Date(diary.date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
      });
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(diary);
      return acc;
    }, {} as Record<string, Memo[]>);

    return Object.entries(grouped).map(([title, data]) => ({
      title,
      data,
    }));
  }, [filteredDiaries]);

  const getDiaryExpense = (diaryId: string) => {
    const diaryExpenses = expenses.filter((e) => e.diaryId === diaryId);
    const total = diaryExpenses.reduce((sum, e) => sum + e.amount, 0);
    const currency = diaryExpenses[0]?.currency || 'USD';
    return { total, currency };
  };

  const handleCreateDiary = () => {
    router.push('/diary/new');
  };

  const handleSelectDiary = (diaryId: string) => {
    router.push(`/diary/${diaryId}`);
  };

  const renderDiaryItem = ({ item: diary }: { item: Diary }) => {
    const expense = getDiaryExpense(diary.id);
    return (
      <Pressable onPress={() => handleSelectDiary(diary.id)}>
        <XStack
          backgroundColor="$card"
          borderRadius="$6"
          padding="$4"
          gap="$3"
          marginBottom="$3"
          borderWidth={2}
          borderColor="$border"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          {diary.photos[0] && (
            <Image
              source={{ uri: diary.photos[0] }}
              width={96}
              height={96}
              borderRadius="$4"
              resizeMode="cover"
            />
          )}
          <YStack flex={1}>
            <Text color="$mutedForeground" fontSize={14}>
              {new Date(diary.date).toLocaleDateString('ko-KR', {
                month: 'long',
                day: 'numeric',
              })}{' '}
              · {diary.location}
            </Text>
            <Text color="$foreground" fontWeight="500" marginTop="$1" numberOfLines={1}>
              {diary.title}
            </Text>
            <Text color="$mutedForeground" fontSize={14} marginTop="$1" numberOfLines={1}>
              {diary.content}
            </Text>
          </YStack>
        </XStack>
      </Pressable>
    );
  };

  const renderSectionHeader = ({ section }: { section: MemoSection }) => (
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
    <YStack flex={1} alignItems="center" justifyContent="center" paddingVertical={80} paddingHorizontal="$4">
      <Text fontSize={48} marginBottom="$4">📔</Text>
      <Text color="$foreground" marginBottom="$1">아직 일기가 없습니다</Text>
      <Text color="$mutedForeground">새 일기를 작성해보세요</Text>
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
          <XStack alignItems="center" gap="$2">
            <Button
              size="$4"
              circular
              backgroundColor="transparent"
              pressStyle={{ backgroundColor: '$accent' }}
              onPress={() => setShowSearch(!showSearch)}
            >
              <Search size={20} color="$foreground" />
            </Button>
            <Button
              size="$4"
              circular
              backgroundColor="$accent"
              pressStyle={{ backgroundColor: '$accentHover' }}
              onPress={handleCreateDiary}
            >
              <Plus size={20} color="$foreground" />
            </Button>
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
              placeholder="일기 검색..."
              placeholderTextColor="$mutedForeground"
              value={searchQuery}
              onChangeText={setSearchQuery}
              color="$foreground"
            />
          </XStack>
        )}
      </YStack>

      {/* Diary List */}
      <SectionList
        sections={diariesByMonth}
        keyExtractor={(item) => item.id}
        renderItem={renderDiaryItem}
        renderSectionHeader={renderSectionHeader}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 100,
          flexGrow: filteredDiaries.length === 0 ? 1 : undefined,
        }}
        stickySectionHeadersEnabled={true}
      />
    </YStack>
  );
}
