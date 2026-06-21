import { YCard } from '@/components/ui/Card';
import Chip from '@/components/ui/Chip';
import FadeWrapper from '@/components/ui/FadeWrapper';
import BackActionHeader from '@/components/ui/header/BackActionHeader';
import MoreEditDelete from '@/components/ui/MoreEditDelete';
import { formattedLocation } from '@/utils/location/location';
import { ChevronDown, Cloud, MapPin } from '@tamagui/lucide-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { Image, Text, XStack, YStack } from 'tamagui';
import { FilledButton } from '../../../components/ui';
import { useExpenses, useFootprints } from '../../../contexts';

export default function FootprintDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string; from?: string }>();
  const router = useRouter();
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  const { footprints, deleteFootprint } = useFootprints();
  const { getExpensesByFootprintId, deleteExpense } = useExpenses();

  const footprint = footprints.find((f) => f.id === (id || ''));
  const expenses = getExpensesByFootprintId(id || '');

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [expenseOpen, setExpenseOpen] = useState(false);

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const currency = expenses[0]?.currency || 'KRW';

  const paragraphs = footprint?.content.split('\n\n').filter((p) => p.trim()) ?? [];

  if (!footprint) {
    return (
      <YStack flex={1} backgroundColor="$background" justifyContent="center" alignItems="center">
        <Text color="$foreground">일지를 찾을 수 없습니다</Text>
      </YStack>
    );
  }

  const handleEdit = () => {
    router.push({ pathname: '/(main)/footprint/new', params: { footprintId: footprint.id } });
  };

  const handleDelete = () => {
    Alert.alert('일지 삭제', '이 기록을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          await deleteFootprint(footprint.id);
          router.push('/(main)/footprint');
        },
      },
    ]);
  };

  const handleAddExpense = () => {
    router.push({
      pathname: '/(main)/expense/edit',
      params: { footprintId: footprint.id, tripId: footprint.tripId },
    });
  };

  const handleDeleteExpense = (expenseId: string) => {
    Alert.alert('지출 삭제', '이 지출을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => deleteExpense(expenseId) },
    ]);
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <BackActionHeader label={footprint.title} onBack={() => router.back()}>
        <MoreEditDelete onEdit={handleEdit} onDelete={handleDelete} />
      </BackActionHeader>

      <FadeWrapper>
        <ScrollView style={{ flex: 1 }}>
          <YStack padding="$6" gap="$6">
            {/* Location & Weather chips */}
            {(footprint.locations.length > 0 || footprint.weatherInfo) && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {footprint.locations.map((loc, i) => (
                  <Chip
                    key={i}
                    label={formattedLocation(loc)}
                    icon={<MapPin size={12} color="$mutedForeground" />}
                  />
                ))}
                {footprint.weatherInfo && (
                  <Chip
                    label={footprint.weatherInfo}
                    icon={<Cloud size={12} color="$mutedForeground" />}
                  />
                )}
              </ScrollView>
            )}

            {/* Text Content */}
            {paragraphs.length > 0 && (
              <YCard gap="$4" padding="$3">
                {paragraphs.map((p, i) => (
                  <Text key={i} color="$foreground" lineHeight={26} fontSize={15}>
                    {p}
                  </Text>
                ))}
              </YCard>
            )}

            {/* Photo Slider */}
            {footprint.photoUrls.length > 0 && (
              <YCard
                height={SCREEN_WIDTH * 0.75}
                borderRadius="$4"
                borderWidth={1}
                borderColor="$border"
                overflow="hidden"
                style={{ position: 'relative' }}
              >
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  style={{ width: SCREEN_WIDTH - 48 }}
                  onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 48));
                    setCurrentPhotoIndex(index);
                  }}
                >
                  {footprint.photoUrls.map((url, i) => (
                    <Pressable
                      key={i}
                      style={{ width: SCREEN_WIDTH - 48, height: SCREEN_WIDTH * 0.75 }}
                      onPress={() => setSelectedPhoto(url)}
                    >
                      <Image source={{ uri: url }} width="100%" height="100%" resizeMode="cover" />
                    </Pressable>
                  ))}
                </ScrollView>

                {footprint.photoUrls.length > 1 && (
                  <XStack
                    position="absolute"
                    bottom="$3"
                    left={0}
                    right={0}
                    justifyContent="center"
                    gap="$1.5"
                  >
                    {footprint.photoUrls.map((_, i) => (
                      <YStack
                        key={i}
                        width={i === currentPhotoIndex ? 8 : 6}
                        height={i === currentPhotoIndex ? 8 : 6}
                        borderRadius={4}
                        backgroundColor={
                          i === currentPhotoIndex ? 'white' : 'rgba(255,255,255,0.5)'
                        }
                      />
                    ))}
                  </XStack>
                )}
              </YCard>
            )}

            {/* Expenses Accordion */}
            <YStack>
              <Pressable onPress={() => setExpenseOpen((v) => !v)}>
                <XStack justifyContent="space-between" alignItems="center" paddingVertical="$1">
                  <Text color="$foreground" fontSize={16} fontWeight="600">
                    사용한 돈
                  </Text>
                  <XStack alignItems="center" gap="$2">
                    {!expenseOpen && expenses.length > 0 && (
                      <Text color="$mutedForeground" fontSize={13}>
                        {currency} {totalExpense.toLocaleString()}
                      </Text>
                    )}
                    <ChevronDown
                      size={18}
                      color="$mutedForeground"
                      style={{
                        transform: [{ rotate: expenseOpen ? '180deg' : '0deg' }],
                      }}
                    />
                  </XStack>
                </XStack>
              </Pressable>

              {expenseOpen && (
                <YStack gap="$3" marginTop="$3">
                  {expenses.length > 0 ? (
                    <YCard backgroundColor="$card" overflow="hidden">
                      {expenses.map((expense, index) => (
                        <XStack
                          key={expense.id}
                          padding="$4"
                          alignItems="center"
                          justifyContent="space-between"
                          borderBottomWidth={index < expenses.length - 1 ? 1 : 0}
                          borderBottomColor="$border"
                        >
                          <XStack alignItems="center" gap="$3" flex={1}>
                            {expense.categoryIcon ? (
                              <Text fontSize={20}>{expense.categoryIcon}</Text>
                            ) : (
                              <YStack
                                width={8}
                                height={8}
                                borderRadius={4}
                                backgroundColor={expense.categoryColor ?? '$muted'}
                              />
                            )}
                            <YStack flex={1}>
                              <Text color="$foreground" fontSize={14}>
                                {expense.description || expense.categoryName || '지출'}
                              </Text>
                              {expense.description && expense.categoryName && (
                                <Text color="$mutedForeground" fontSize={12}>
                                  {expense.categoryName}
                                </Text>
                              )}
                            </YStack>
                          </XStack>
                          <XStack alignItems="center" gap="$3">
                            <Text color="$foreground" fontWeight="500">
                              {expense.currency} {expense.amount.toLocaleString()}
                            </Text>
                            <Pressable onPress={() => handleDeleteExpense(expense.id)}>
                              <Text color="$destructive" fontSize={13}>
                                삭제
                              </Text>
                            </Pressable>
                          </XStack>
                        </XStack>
                      ))}
                      <XStack
                        padding="$4"
                        justifyContent="space-between"
                        borderTopWidth={1}
                        borderTopColor="$border"
                      >
                        <Text color="$foreground" fontWeight="500">
                          합계
                        </Text>
                        <Text color="$foreground" fontWeight="500">
                          {currency} {totalExpense.toLocaleString()}
                        </Text>
                      </XStack>
                    </YCard>
                  ) : (
                    <YCard
                      backgroundColor="$card"
                      borderRadius="$4"
                      padding="$4"
                      alignItems="center"
                      borderWidth={1}
                      borderColor="$border"
                    >
                      <Text color="$mutedForeground">지출 기록이 없습니다</Text>
                    </YCard>
                  )}
                  <FilledButton onPress={handleAddExpense}>
                    <Text color="$foreground" fontWeight="500">
                      + 지출 남기기
                    </Text>
                  </FilledButton>
                </YStack>
              )}
            </YStack>
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
