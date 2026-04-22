import { CircularButton } from '@/components/ui';
import { Footprint } from '@/types';
import { BookOpen, Calendar, MapPin, X } from '@tamagui/lucide-icons';
import { Modal, Pressable, ScrollView } from 'react-native';
import { Image, Text, XStack, YStack } from 'tamagui';

interface TimelineModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCountry: string | null;
  selectedLocation: string | null;
  timelineMemos: Footprint[];
  onViewFootprint: (footprintId: string) => void;
}

export default function TimelineModal({
  visible,
  onClose,
  selectedCountry,
  selectedLocation,
  timelineMemos,
  onViewFootprint,
}: TimelineModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable
        style={{
          flex: 1,
          // backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()} style={{ height: '45%' }}>
          <YStack
            backgroundColor="$card"
            borderTopLeftRadius="$6"
            borderTopRightRadius="$6"
            flex={1}
          >
            {/* Modal Header */}
            <XStack
              alignItems="center"
              justifyContent="space-between"
              padding="$5"
              borderBottomWidth={2}
              borderBottomColor="$border"
              style={{ borderBottomColor: 'rgba(155, 196, 209, 0.25)' }}
            >
              <YStack>
                <XStack alignItems="center" gap="$2">
                  <BookOpen size={20} color="$foreground" />
                  <Text color="$foreground" fontSize={18} fontWeight="600">
                    {selectedLocation || selectedCountry}
                  </Text>
                </XStack>
                <Text color="$mutedForeground" fontSize={14} marginTop="$1">
                  {timelineMemos.length}개의 기록
                </Text>
              </YStack>
              <CircularButton size="$3" onPress={onClose}>
                <X size={20} color="$foreground" />
              </CircularButton>
            </XStack>

            {/* Timeline Content */}
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
              {timelineMemos.length === 0 ? (
                <YStack alignItems="center" paddingVertical={48}>
                  <Text color="$mutedForeground">기록이 없습니다</Text>
                </YStack>
              ) : (
                <YStack gap="$4">
                  {timelineMemos.map((memo, index) => (
                    <YStack key={memo.id} position="relative">
                      {/* Timeline Line */}
                      {index < timelineMemos.length - 1 && (
                        <YStack
                          position="absolute"
                          left={19}
                          top={50}
                          width={2}
                          height="100%"
                          backgroundColor="$primary"
                          opacity={0.3}
                        />
                      )}

                      <Pressable onPress={() => onViewFootprint(memo.id)}>
                        <XStack>
                          {/* Timeline Dot */}
                          <YStack
                            width={40}
                            height={40}
                            backgroundColor="$primary"
                            borderRadius={20}
                            alignItems="center"
                            justifyContent="center"
                            marginRight="$3"
                          >
                            <MapPin size={20} color="white" />
                          </YStack>

                          {/* Memo Card */}
                          <YStack
                            flex={1}
                            backgroundColor="$card"
                            borderRadius="$4"
                            padding="$4"
                            borderWidth={2}
                            borderColor="$border"
                          >
                            <XStack
                              alignItems="flex-start"
                              justifyContent="space-between"
                              marginBottom="$2"
                            >
                              <Text color="$foreground" fontWeight="500" flex={1}>
                                {memo.title}
                              </Text>
                              <XStack alignItems="center" gap="$1" marginLeft="$2">
                                <Calendar size={14} color="$mutedForeground" />
                                <Text color="$mutedForeground" fontSize={12}>
                                  {new Date(memo.date).toLocaleDateString('ko-KR', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </Text>
                              </XStack>
                            </XStack>

                            {memo.locations[0]?.placeName && (
                              <XStack alignItems="center" gap="$1" marginBottom="$2">
                                <MapPin size={14} color="$mutedForeground" />
                                <Text color="$mutedForeground" fontSize={14}>
                                  {memo.locations[0].placeName}
                                </Text>
                              </XStack>
                            )}

                            {memo.content && (
                              <Text color="$mutedForeground" fontSize={14} numberOfLines={2}>
                                {memo.content}
                              </Text>
                            )}

                            {memo.photoUrls && memo.photoUrls.length > 0 && (
                              <XStack gap="$2" marginTop="$3">
                                {memo.photoUrls.slice(0, 3).map((photo, i) => (
                                  <YStack
                                    key={i}
                                    width={64}
                                    height={64}
                                    borderRadius="$3"
                                    overflow="hidden"
                                    borderWidth={2}
                                    borderColor="$border"
                                  >
                                    <Image
                                      source={{ uri: photo }}
                                      width="100%"
                                      height="100%"
                                      resizeMode="cover"
                                    />
                                  </YStack>
                                ))}
                                {memo.photoUrls.length > 3 && (
                                  <YStack
                                    width={64}
                                    height={64}
                                    borderRadius="$3"
                                    backgroundColor="$accent"
                                    alignItems="center"
                                    justifyContent="center"
                                    opacity={0.3}
                                  >
                                    <Text color="$foreground" fontSize={14}>
                                      +{memo.photoUrls.length - 3}
                                    </Text>
                                  </YStack>
                                )}
                              </XStack>
                            )}
                          </YStack>
                        </XStack>
                      </Pressable>
                    </YStack>
                  ))}
                </YStack>
              )}
            </ScrollView>
          </YStack>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
