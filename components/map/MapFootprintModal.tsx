import { CircularButton } from '@/components/ui';
import { useExpenses } from '@/contexts';
import { Footprint } from '@/types';
import { formattedLocation } from '@/utils/location/location';
import { BookOpen, Calendar, Cloud, MapPin, X } from '@tamagui/lucide-icons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView } from 'react-native';
import { Image, Text, XStack, YStack } from 'tamagui';

interface MapFootprintModalProps {
  visible: boolean;
  onClose: () => void;
  footprint: Footprint | null;
}

export default function MapFootprintModal({ visible, onClose, footprint }: MapFootprintModalProps) {
  const { getExpensesByFootprintId } = useExpenses();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const expenses = footprint ? getExpensesByFootprintId(footprint.id) : [];
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

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent>
        <Pressable style={{ flex: 1, justifyContent: 'flex-end' }} onPress={onClose}>
          <Pressable onPress={(e) => e.stopPropagation()} style={{ height: '85%' }}>
            <YStack
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.92,
                shadowRadius: 20,
                elevation: 24,
              }}
              backgroundColor="$card"
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
                    <BookOpen size={20} color="$foreground" />
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
                  <>
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
                              <Text color="$foreground">{expense.description || '지출'}</Text>
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
                    </YStack>
                  </>
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
