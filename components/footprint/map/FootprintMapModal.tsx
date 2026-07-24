import { CategoryIcon } from '@/components/expense/CategoryIcon';
import { WEATHER_ICON_MAP } from '@/components/footprint/new/WeatherSheet';
import { CircularButton } from '@/components/ui';
import { YCard } from '@/components/ui/Card';
import Chip from '@/components/ui/Chip';
import { useExpenses } from '@/contexts';
import { getCurrencyCode } from '@/data/constants';
import { groupExpensesByCurrency } from '@/data/utils';
import { useFootprintPhotosQuery } from '@/hooks/queries/useFootprints';
import { Footprint } from '@/types';
import { formattedLocation } from '@/utils/location/location';
import { Calendar, ChevronDown, ChevronUp, Cloud, MapPin, X } from '@tamagui/lucide-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { Image, Text, XStack, YStack } from 'tamagui';

interface FootprintMapModalProps {
  visible: boolean;
  onClose: () => void;
  footprint: Footprint | null;
}

export default function FootprintMapModal({ visible, onClose, footprint }: FootprintMapModalProps) {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const { getExpensesByFootprintId } = useExpenses();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const { data: photos = [] } = useFootprintPhotosQuery(footprint?.id ?? '');

  const expenses = footprint ? getExpensesByFootprintId(footprint.id) : [];
  const expensesByCurrency = groupExpensesByCurrency(expenses);
  const [expenseOpen, setExpenseOpen] = useState(expenses.length > 0);

  const paragraphs = footprint?.content.split('\n\n').filter((p) => p.trim()) ?? [];

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <Pressable style={{ flex: 1, justifyContent: 'flex-end' }} onPress={onClose}>
          <Pressable onPress={(e) => e.stopPropagation()} style={{ height: '50%' }}>
            <YStack
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.92,
                shadowRadius: 20,
                elevation: 24,
              }}
              backgroundColor="$background"
              borderTopLeftRadius="$6"
              borderTopRightRadius="$6"
              flex={1}
            >
              {/* Header */}
              <XStack
                alignItems="flex-start"
                justifyContent="space-between"
                padding="$5"
                borderBottomWidth={2}
                borderBottomColor="$border"
                style={{ borderBottomColor: 'rgba(155, 196, 209, 0.25)' }}
              >
                <YStack alignItems="flex-start">
                  <XStack alignItems="center" gap="$2">
                    <Text color="$foreground" fontSize={18} fontWeight="600">
                      {footprint?.title}
                    </Text>
                  </XStack>
                  {footprint?.date && (
                    <XStack alignItems="center" gap="$1" marginTop="$1">
                      <Calendar size={14} color="$mutedForeground" />
                      <Text color="$mutedForeground" fontSize={14}>
                        {new Date(footprint.date).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Text>
                    </XStack>
                  )}
                </YStack>
                <CircularButton size="$3" onPress={onClose}>
                  <X size={28} color="$foreground" />
                </CircularButton>
              </XStack>

              {/* Content */}
              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
                {footprint && (
                  <YStack gap="$6">
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
                        {footprint.weatherInfo &&
                          (() => {
                            const [key, ...rest] = footprint.weatherInfo.split(' ');
                            const WeatherIcon = WEATHER_ICON_MAP[key] ?? Cloud;
                            return (
                              <Chip
                                icon={<WeatherIcon size={12} color="$mutedForeground" />}
                                label={rest.join(' ')}
                              />
                            );
                          })()}
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
                    {photos.length > 0 && (
                      <YCard
                        height={SCREEN_WIDTH * 0.75}
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
                            const index = Math.round(
                              e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 48)
                            );
                            setCurrentPhotoIndex(index);
                          }}
                        >
                          {photos.map((photo) => {
                            const uri = photo.s3Url || photo.localUri;
                            return (
                              <Pressable
                                key={photo.id}
                                style={{ width: SCREEN_WIDTH - 48, height: SCREEN_WIDTH * 0.75 }}
                                onPress={() => setSelectedPhoto(uri)}
                              >
                                <Image
                                  source={{ uri }}
                                  width="100%"
                                  height="100%"
                                  resizeMode="cover"
                                />
                              </Pressable>
                            );
                          })}
                        </ScrollView>

                        {photos.length > 1 && (
                          <XStack
                            position="absolute"
                            bottom="$3"
                            left={0}
                            right={0}
                            justifyContent="center"
                            gap="$1.5"
                          >
                            {photos.map((_, i) => (
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
                        <XStack
                          justifyContent="space-between"
                          alignItems="center"
                          paddingVertical="$1"
                        >
                          <Text color="$foreground" fontSize={16} fontWeight="600">
                            사용한 돈
                          </Text>
                          <XStack alignItems="center" gap="$2">
                            {!expenseOpen && expensesByCurrency.length > 0 && (
                              <XStack gap="$2">
                                {expensesByCurrency.map(({ currency, amount }) => (
                                  <YStack
                                    key={currency}
                                    backgroundColor="$muted"
                                    borderRadius="$2"
                                    paddingHorizontal="$2"
                                    paddingVertical="$1"
                                  >
                                    <Text color="$mutedForeground" fontSize={12}>
                                      {getCurrencyCode(currency)} {amount.toLocaleString()}
                                    </Text>
                                  </YStack>
                                ))}
                              </XStack>
                            )}
                            {expenseOpen ? (
                              <ChevronUp size={18} color="$mutedForeground" />
                            ) : (
                              <ChevronDown size={18} color="$mutedForeground" />
                            )}
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
                                    <CategoryIcon name={expense.categoryName!} size={18} />
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
                                  <Text color="$foreground" fontWeight="500">
                                    {expense.currency} {expense.amount.toLocaleString()}
                                  </Text>
                                </XStack>
                              ))}
                              <XStack
                                padding="$4"
                                alignItems="center"
                                justifyContent="space-between"
                                borderTopWidth={1}
                                borderTopColor="$border"
                              >
                                <Text color="$foreground" fontWeight="500">
                                  합계
                                </Text>
                                <XStack gap="$2">
                                  {expensesByCurrency.map(({ currency, amount }) => (
                                    <YStack
                                      key={currency}
                                      backgroundColor="$muted"
                                      borderRadius="$2"
                                      paddingHorizontal="$2"
                                      paddingVertical="$1"
                                    >
                                      <Text color="$foreground" fontSize={13} fontWeight="500">
                                        {getCurrencyCode(currency)} {amount.toLocaleString()}
                                      </Text>
                                    </YStack>
                                  ))}
                                </XStack>
                              </XStack>
                            </YCard>
                          ) : (
                            <YCard
                              backgroundColor="$card"
                              padding="$4"
                              alignItems="center"
                              borderColor="$border"
                            >
                              <Text color="$mutedForeground">지출 기록이 없습니다</Text>
                            </YCard>
                          )}
                        </YStack>
                      )}
                    </YStack>
                  </YStack>
                )}
              </ScrollView>
            </YStack>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Photo fullscreen modal */}
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
    </>
  );
}
