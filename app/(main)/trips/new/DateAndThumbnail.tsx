import DatePickerInput from '@/components/ui/DatePickerInput';
import FadeWrapper from '@/components/ui/FadeWrapper';
import ImagePickerSheet from '@/components/ui/ImagePickerSheet';
import ErrorText from '@/components/ui/form/ErrorText';
import FormLabel from '@/components/ui/form/FormLabel';
import PrevNextButtons from '@/components/ui/form/multiStepForm/PrevNextButtons';
import { paddingHorizontalGeneral } from '@/constants/theme';
import { useNewTripForm } from '@/contexts/MultiStepForm/NewTripFormContext';
import { validateEndDate, validateStartDate } from '@/contexts/MultiStepForm/newTripValidation';
import { Image as ImageIcon, X } from '@tamagui/lucide-icons';
import { Asset } from 'expo-asset';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image, Text, XStack, YStack } from 'tamagui';

export default function NewTripFormDate() {
  const { newTrip, setNewTrip } = useNewTripForm();
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [startDateError, setStartDateError] = useState<string | null>(null);
  const [endDateError, setEndDateError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const handleNext = () => {
    const startErr = validateStartDate(newTrip.startDate);
    const endErr = validateEndDate(newTrip.endDate, newTrip.startDate);
    setStartDateError(startErr);
    setEndDateError(endErr);
    if (startErr || endErr) return;

    (async () => {
      if (!newTrip.imageUrl?.trim()) {
        const asset = Asset.fromModule(require('../../../../assets/images/mountain.jpg'));
        await asset.downloadAsync();
      }
    })();
    router.push('/(main)/trips/new/Title');
  };

  return (
    <FadeWrapper>
      <YStack
        flex={1}
        backgroundColor="$background"
        paddingVertical={24 + insets.top}
        paddingHorizontal={paddingHorizontalGeneral}
        justifyContent="space-between"
      >
        <YStack flex={1}>
          <XStack gap="$3">
            <YStack flex={1}>
              <FormLabel marginBottom="$2">출발일</FormLabel>
              <DatePickerInput
                value={newTrip.startDate}
                onChange={(date) => setNewTrip({ ...newTrip, startDate: date })}
              />
              <ErrorText error={startDateError} />
            </YStack>
            <YStack flex={1}>
              <FormLabel marginBottom="$2">귀환일</FormLabel>
              <DatePickerInput
                value={newTrip.endDate}
                onChange={(date) => setNewTrip({ ...newTrip, endDate: date })}
              />
              <ErrorText error={endDateError} />
            </YStack>
          </XStack>
          <YStack>
            <FormLabel marginBottom="$2">풍경</FormLabel>
            <Pressable onPress={() => setShowImagePicker(true)}>
              <YStack
                backgroundColor="$muted"
                borderWidth={2}
                borderColor="$border"
                borderRadius="$4"
                overflow="hidden"
                minHeight={newTrip.imageUrl ? undefined : 192}
              >
                {newTrip.imageUrl ? (
                  <YStack position="relative" aspectRatio={16 / 9}>
                    <Image
                      source={{ uri: newTrip.imageUrl }}
                      width="100%"
                      height="100%"
                      resizeMode="cover"
                    />
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        setNewTrip({ ...newTrip, imageUrl: '' });
                      }}
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        backgroundColor: '#E89B8F',
                        borderRadius: 12,
                        padding: 8,
                      }}
                    >
                      <X size={16} color="white" />
                    </Pressable>
                  </YStack>
                ) : (
                  <YStack
                    flex={1}
                    alignItems="center"
                    justifyContent="center"
                    padding="$6"
                    minHeight={192}
                  >
                    <YStack
                      width={64}
                      height={64}
                      backgroundColor="$accent"
                      borderRadius={32}
                      alignItems="center"
                      justifyContent="center"
                      marginBottom="$3"
                      opacity={0.4}
                    >
                      <ImageIcon size={32} color="$primary" />
                    </YStack>
                    <Text color="$foreground" marginBottom="$1">
                      이미지를 탭하여 업로드
                    </Text>
                    <Text color="$mutedForeground" fontSize={14}>
                      PNG, JPG, WEBP 파일 지원
                    </Text>
                  </YStack>
                )}
              </YStack>
            </Pressable>
          </YStack>
        </YStack>
        <PrevNextButtons onNext={handleNext} />
      </YStack>
      <ImagePickerSheet
        open={showImagePicker}
        onOpenChange={setShowImagePicker}
        onSelect={(uri) => setNewTrip({ ...newTrip, imageUrl: uri })}
      />
    </FadeWrapper>
  );
}
