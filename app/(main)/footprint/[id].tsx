import { IconButton } from '@/components/ui/button/BaseButton';
import FadeWrapper from '@/components/ui/FadeWrapper';
import More from '@/components/ui/More';
import { formattedLocation } from '@/utils/location/location';
import { ArrowLeft, Cloud, MapPin } from '@tamagui/lucide-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image, Text, XStack, YStack } from 'tamagui';
import { FilledButton } from '../../../components/ui';
import { useExpenses, useFootprints, useTrips } from '../../../contexts';

export default function FootprintDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getTripById } = useTrips();
  const { footprints, deleteFootprint } = useFootprints();
  const { getExpensesByFootprintId, deleteExpense } = useExpenses();

  const footprint = footprints.find((f) => f.id === (id || ''));
  const trip = footprint ? getTripById(footprint.tripId) : undefined;
  const expenses = getExpensesByFootprintId(id || '');

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const currency = expenses[0]?.currency || 'KRW';

  const contentWithPhotos = useMemo(() => {
    if (!footprint) return [];
    const paragraphs = footprint.content.split('\n\n').filter((p) => p.trim());
    const result: { type: 'text' | 'photo'; content: string }[] = [];

    const photoInterval = Math.max(
      1,
      Math.floor(paragraphs.length / (footprint.photoUrls.length + 1))
    );
    let photoIndex = 0;

    paragraphs.forEach((paragraph, idx) => {
      result.push({ type: 'text', content: paragraph });
      if (photoIndex < footprint.photoUrls.length && (idx + 1) % photoInterval === 0) {
        result.push({ type: 'photo', content: footprint.photoUrls[photoIndex] });
        photoIndex++;
      }
    });

    while (photoIndex < footprint.photoUrls.length) {
      result.push({ type: 'photo', content: footprint.photoUrls[photoIndex] });
      photoIndex++;
    }

    return result;
  }, [footprint]);

  if (!footprint) {
    return (
      <YStack flex={1} backgroundColor="$background" justifyContent="center" alignItems="center">
        <Text color="$foreground">일지를 찾을 수 없습니다</Text>
      </YStack>
    );
  }

  const handleEdit = () => {
    router.push({
      pathname: '/(main)/footprint/new',
      params: { footprintId: footprint.id },
    });
  };

  const handleDelete = () => {
    Alert.alert('일지 삭제', '이 기록을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          deleteFootprint(footprint.id);
          router.back();
        },
      },
    ]);
  };

  const handleAddExpense = () => {
    router.push({
      pathname: '/(main)/expense/new',
      params: { footprintId: footprint.id, tripId: footprint.tripId },
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
        <IconButton onPress={() => router.back()}>
          <ArrowLeft size={20} color="$foreground" />
        </IconButton>
        <Text flex={1} textAlign="center" color="$foreground" fontSize={16} fontWeight="500">
          {new Date(footprint.date).toLocaleDateString('ko-KR', {
            month: 'long',
            day: 'numeric',
          })}
        </Text>
        <More>
          <Pressable onPress={handleEdit}>
            <XStack padding="$3">
              <Text color="$foreground">수정</Text>
            </XStack>
          </Pressable>
          <Pressable
            onPress={() => {
              handleDelete();
            }}
          >
            <XStack padding="$3">
              <Text color="$destructive">삭제</Text>
            </XStack>
          </Pressable>
        </More>
      </XStack>

      <FadeWrapper>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
          {/* Title */}
          <YStack marginBottom="$6">
            <Text color="$foreground" fontSize={20} fontWeight="600" marginBottom="$2">
              {footprint.title}
            </Text>
            <YStack height={1} backgroundColor="$border" opacity={0.3} />
          </YStack>

          {/* Location & Weather */}
          <YStack gap="$2" marginBottom="$6">
            {footprint.locations.map((loc, i) => (
              <XStack key={i} alignItems="center" gap="$2">
                <MapPin size={16} color="$foreground" />
                <Text color="$foreground">{formattedLocation(loc)}</Text>
              </XStack>
            ))}
            {footprint.weatherInfo && (
              <XStack alignItems="center" gap="$2">
                <Cloud size={16} color="$foreground" />
                <Text color="$foreground">{footprint.weatherInfo}</Text>
              </XStack>
            )}
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
                    <XStack
                      alignItems="flex-start"
                      justifyContent="space-between"
                      marginBottom="$1"
                    >
                      <Text color="$foreground">{expense.description || '지출'}</Text>
                      <Pressable onPress={() => handleDeleteExpense(expense.id)}>
                        <Text color="$destructive" fontSize={14}>
                          삭제
                        </Text>
                      </Pressable>
                    </XStack>
                    <Text color="$foreground">
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
            <FilledButton marginTop="$3" onPress={handleAddExpense}>
              <Text color="$foreground" fontWeight="500">
                + 지출 남기기
              </Text>
            </FilledButton>
          </YStack>
        </ScrollView>
      </FadeWrapper>
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
    </YStack>
  );
}
