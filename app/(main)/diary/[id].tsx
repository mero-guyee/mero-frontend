import { useState, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Alert, Pressable, Modal } from 'react-native';
import { YStack, XStack, Text, Button, Image } from 'tamagui';
import { ArrowLeft, MoreVertical, MapPin, Cloud } from '@tamagui/lucide-icons';
import { useTrips, useDiaries, useExpenses } from '../../../contexts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../../../data/mockData';

export default function DiaryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getTripById } = useTrips();
  const { getDiaryById, deleteDiary } = useDiaries();
  const { getExpensesByDiaryId, deleteExpense } = useExpenses();

  const diary = getDiaryById(id || '');
  const trip = diary ? getTripById(diary.tripId) : undefined;
  const expenses = getExpensesByDiaryId(id || '');

  const [showMenu, setShowMenu] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (!diary) {
    return (
      <YStack flex={1} backgroundColor="$background" justifyContent="center" alignItems="center">
        <Text color="$foreground">일기를 찾을 수 없습니다</Text>
      </YStack>
    );
  }

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const currency = expenses[0]?.currency || 'USD';

  // Split content into paragraphs and intersperse with photos
  const contentWithPhotos = useMemo(() => {
    const paragraphs = diary.content.split('\n\n').filter((p) => p.trim());
    const result: Array<{ type: 'text' | 'photo'; content: string; index?: number }> = [];

    const photoInterval = Math.max(1, Math.floor(paragraphs.length / (diary.photos.length + 1)));
    let photoIndex = 0;

    paragraphs.forEach((paragraph, idx) => {
      result.push({ type: 'text', content: paragraph });

      if (photoIndex < diary.photos.length && (idx + 1) % photoInterval === 0) {
        result.push({
          type: 'photo',
          content: diary.photos[photoIndex],
          index: photoIndex,
        });
        photoIndex++;
      }
    });

    while (photoIndex < diary.photos.length) {
      result.push({
        type: 'photo',
        content: diary.photos[photoIndex],
        index: photoIndex,
      });
      photoIndex++;
    }

    return result;
  }, [diary]);

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    setShowMenu(false);
    router.push({
      pathname: '/diary/new',
      params: { diaryId: diary.id },
    });
  };

  const handleDelete = () => {
    Alert.alert('일기 삭제', '이 기록을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          deleteDiary(diary.id);
          router.back();
        },
      },
    ]);
  };

  const handleAddExpense = () => {
    router.push({
      pathname: '/expense/new',
      params: { diaryId: diary.id, tripId: diary.tripId },
    });
  };

  const handleDeleteExpense = (expenseId: string) => {
    Alert.alert('지출 삭제', '이 지출을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => deleteExpense(expenseId),
      },
    ]);
  };

  const handlePosting = (platform: string) => {
    Alert.alert('알림', `${platform} 포스팅 준비 중입니다!`);
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header */}
      <XStack
        backgroundColor="$card"
        paddingTop={insets.top}
        paddingHorizontal="$4"
        paddingBottom="$3"
        alignItems="center"
        justifyContent="space-between"
        borderBottomWidth={2}
        borderBottomColor="$primary"
        style={{ borderBottomColor: 'rgba(155, 196, 209, 0.25)' }}
      >
        <Button
          size="$4"
          circular
          backgroundColor="transparent"
          pressStyle={{ backgroundColor: '$accent' }}
          onPress={handleBack}
        >
          <ArrowLeft size={20} color="$foreground" />
        </Button>
        <Text flex={1} textAlign="center" color="$foreground" fontSize={16} fontWeight="500">
          {new Date(diary.date).toLocaleDateString('ko-KR', {
            month: 'long',
            day: 'numeric',
          })}
        </Text>
        <YStack position="relative">
          <Button
            size="$4"
            circular
            backgroundColor="transparent"
            pressStyle={{ backgroundColor: '$accent' }}
            onPress={() => setShowMenu(!showMenu)}
          >
            <MoreVertical size={20} color="$foreground" />
          </Button>
          {showMenu && (
            <YStack
              position="absolute"
              top={44}
              right={0}
              width={180}
              backgroundColor="$card"
              borderRadius="$4"
              overflow="hidden"
              zIndex={100}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Pressable onPress={handleEdit}>
                <XStack padding="$3">
                  <Text color="$foreground">수정</Text>
                </XStack>
              </Pressable>
              <Pressable
                onPress={() => {
                  setShowMenu(false);
                  handleDelete();
                }}
              >
                <XStack padding="$3">
                  <Text color="$destructive">삭제</Text>
                </XStack>
              </Pressable>
            </YStack>
          )}
        </YStack>
      </XStack>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
        {/* Title */}
        <YStack marginBottom="$6">
          <Text color="$foreground" fontSize={20} fontWeight="600" marginBottom="$2">
            {diary.title}
          </Text>
          <YStack height={1} backgroundColor="$border" opacity={0.3} />
        </YStack>

        {/* Location & Weather */}
        <YStack gap="$2" marginBottom="$6">
          <XStack alignItems="center" gap="$2">
            <MapPin size={16} color="$foreground" />
            <Text color="$foreground">
              {diary.location}, {diary.country}
            </Text>
          </XStack>
          {diary.weather && (
            <XStack alignItems="center" gap="$2">
              <Cloud size={16} color="$foreground" />
              <Text color="$foreground">
                {diary.weather} {diary.temperature}°C
              </Text>
            </XStack>
          )}
          <XStack alignItems="center" gap="$2">
            <Text color="$foreground">🕐 {diary.time}</Text>
          </XStack>
        </YStack>

        <YStack height={1} backgroundColor="$border" opacity={0.3} marginBottom="$6" />

        {/* Content with Photos */}
        <YStack gap="$4" marginBottom="$6">
          {contentWithPhotos.map((item, idx) => (
            <YStack key={idx}>
              {item.type === 'text' ? (
                <Text color="$foreground" lineHeight={24}>
                  {item.content}
                </Text>
              ) : (
                <Pressable onPress={() => setSelectedPhoto(item.content)}>
                  <YStack
                    aspectRatio={4 / 3}
                    overflow="hidden"
                    borderRadius="$4"
                    borderWidth={2}
                    borderColor="$border"
                    marginVertical="$4"
                  >
                    <Image
                      source={{ uri: item.content }}
                      width="100%"
                      height="100%"
                      resizeMode="cover"
                    />
                  </YStack>
                </Pressable>
              )}
            </YStack>
          ))}
        </YStack>

        <YStack height={1} backgroundColor="$border" opacity={0.3} marginBottom="$6" />

        {/* Expenses */}
        <YStack marginBottom="$6">
          <Text color="$foreground" fontSize={16} fontWeight="600" marginBottom="$3">
            💰 사용한 돈
          </Text>
          {expenses.length > 0 ? (
            <YStack
              backgroundColor="$card"
              borderRadius="$4"
              borderWidth={1}
              borderColor="$border"
              overflow="hidden"
            >
              {expenses.map((expense, index) => (
                <YStack
                  key={expense.id}
                  padding="$4"
                  borderBottomWidth={index < expenses.length - 1 ? 1 : 0}
                  borderBottomColor="$border"
                >
                  <XStack alignItems="flex-start" justifyContent="space-between" marginBottom="$1">
                    <XStack alignItems="center" gap="$2">
                      <Text>{CATEGORY_ICONS[expense.category] || '📦'}</Text>
                      <Text color="$foreground">{CATEGORY_LABELS[expense.category] || '기타'}</Text>
                    </XStack>
                    <Pressable onPress={() => handleDeleteExpense(expense.id)}>
                      <Text color="$destructive" fontSize={14}>
                        삭제
                      </Text>
                    </Pressable>
                  </XStack>
                  <Text color="$mutedForeground" marginLeft={28}>
                    {expense.memo}
                  </Text>
                  <Text color="$foreground" marginLeft={28}>
                    {expense.currency} {expense.amount.toLocaleString()}
                  </Text>
                </YStack>
              ))}
              <YStack padding="$4" borderTopWidth={1} borderTopColor="$border">
                <XStack justifyContent="space-between">
                  <Text color="$foreground" fontWeight="500">
                    합계
                  </Text>
                  <Text color="$foreground" fontWeight="500">
                    {currency} {totalExpense.toLocaleString()}
                  </Text>
                </XStack>
              </YStack>
            </YStack>
          ) : (
            <YStack
              backgroundColor="$card"
              borderRadius="$4"
              padding="$4"
              alignItems="center"
              borderWidth={1}
              borderColor="$border"
            >
              <Text color="$mutedForeground">지출 기록이 없습니다</Text>
            </YStack>
          )}
          <Button
            marginTop="$3"
            backgroundColor="$accent"
            pressStyle={{ backgroundColor: '$accentHover' }}
            borderRadius="$4"
            height={48}
            onPress={handleAddExpense}
          >
            <Text color="$foreground" fontWeight="500">
              + 지출 남기기
            </Text>
          </Button>
        </YStack>

        <YStack height={1} backgroundColor="$border" opacity={0.3} marginBottom="$6" />

        {/* Social Posting */}
        <YStack marginBottom="$6">
          <Text color="$foreground" fontSize={16} fontWeight="600" marginBottom="$3">
            📝 포스팅하기
          </Text>
          <XStack alignItems="center" justifyContent="center" gap="$3">
            <Pressable onPress={() => handlePosting('네이버 블로그')}>
              <YStack
                width={40}
                height={40}
                borderRadius={20}
                backgroundColor="#03C75A"
                alignItems="center"
                justifyContent="center"
              >
                <Text color="white" fontWeight="700" fontSize={16}>
                  N
                </Text>
              </YStack>
            </Pressable>
            <Pressable onPress={() => handlePosting('인스타그램')}>
              <YStack
                width={40}
                height={40}
                borderRadius={20}
                alignItems="center"
                justifyContent="center"
                style={{
                  backgroundColor: '#E1306C',
                }}
              >
                <Text color="white" fontWeight="700" fontSize={14}>
                  IG
                </Text>
              </YStack>
            </Pressable>
            <Pressable onPress={() => handlePosting('티스토리')}>
              <YStack
                width={40}
                height={40}
                borderRadius={20}
                backgroundColor="#FF5544"
                alignItems="center"
                justifyContent="center"
              >
                <Text color="white" fontWeight="700" fontSize={16}>
                  T
                </Text>
              </YStack>
            </Pressable>
          </XStack>
        </YStack>
      </ScrollView>

      {/* Photo Modal */}
      <Modal visible={!!selectedPhoto} transparent animationType="fade">
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.9)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => setSelectedPhoto(null)}
        >
          {selectedPhoto && (
            <Image
              source={{ uri: selectedPhoto }}
              style={{ width: '100%', height: '80%' }}
              resizeMode="contain"
            />
          )}
        </Pressable>
      </Modal>

      {/* Close menu overlay */}
      {showMenu && (
        <Pressable
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 50,
          }}
          onPress={() => setShowMenu(false)}
        />
      )}
    </YStack>
  );
}
