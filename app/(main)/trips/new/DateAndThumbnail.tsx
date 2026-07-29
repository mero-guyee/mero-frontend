import TripCoverImagePicker from '@/components/trips/TripCoverImagePicker';
import { Input } from '@/components/ui';
import DatePickerInput from '@/components/ui/DatePickerInput';
import FadeWrapper from '@/components/ui/FadeWrapper';
import ErrorText from '@/components/ui/form/ErrorText';
import FormLabel from '@/components/ui/form/FormLabel';
import PrevNextButtons from '@/components/ui/form/multiStepForm/PrevNextButtons';
import { paddingHorizontalGeneral } from '@/constants/theme';
import { useTrips } from '@/contexts';
import { useNewTripForm } from '@/contexts/MultiStepForm/NewTripFormContext';
import {
  validateEndDate,
  validateStartDate,
  validateTitle,
} from '@/contexts/MultiStepForm/newTripValidation';
import { Asset } from 'expo-asset';
import { router } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { XStack, YStack } from 'tamagui';

const DEFAULT_IMAGE = Asset.fromModule(require('../../../../assets/images/mountain.jpg')).uri;

export default function NewTripFormDate() {
  const insets = useSafeAreaInsets();
  const { newTrip, setNewTrip, initNewTripForm } = useNewTripForm();
  const { addTrip } = useTrips();
  const [titleError, setTitleError] = useState<string | null>(null);
  const [startDateError, setStartDateError] = useState<string | null>(null);
  const [endDateError, setEndDateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    const titleErr = validateTitle(newTrip.title);
    const startErr = validateStartDate(newTrip.startDate);
    const endErr = validateEndDate(newTrip.endDate, newTrip.startDate);
    setTitleError(titleErr);
    setStartDateError(startErr);
    setEndDateError(endErr);
    if (titleErr || startErr || endErr) return;

    setIsSubmitting(true);
    addTrip(
      {
        title: newTrip.title.trim(),
        startDate: newTrip.startDate,
        endDate: newTrip.endDate,
        imageUrl: newTrip.imageUrl?.trim() ? newTrip.imageUrl : DEFAULT_IMAGE,
        countries: newTrip.countries,
      },
      (id) => {
        initNewTripForm();
        router.push(`/(main)/trips?created=${id}`);
      },
      () => {
        setIsSubmitting(false);
        Toast.show({
          type: 'error',
          text1: '오류',
          text2: '여행을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.',
        });
      }
    );
  };

  return (
    <FadeWrapper>
      <YStack flex={1} backgroundColor="$background">
        <YStack height={insets.top} />
        <TripCoverImagePicker
          imageUrl={newTrip.imageUrl}
          onChange={(uri) => setNewTrip({ ...newTrip, imageUrl: uri })}
          onRemove={() => setNewTrip({ ...newTrip, imageUrl: '' })}
        />

        <YStack
          flex={1}
          paddingHorizontal={paddingHorizontalGeneral}
          paddingVertical={24}
          justifyContent="space-between"
        >
          <YStack>
            <YStack marginBottom="$4">
              <FormLabel marginBottom="$2">모험의 이름</FormLabel>
              <Input
                placeholder="예: 2026 남미 여행"
                placeholderTextColor="$placeholderForeground"
                value={newTrip.title}
                onChangeText={(text) => {
                  setNewTrip({ ...newTrip, title: text });
                  if (titleError) setTitleError(null);
                }}
                color="$foreground"
              />
              <ErrorText error={titleError} />
            </YStack>

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
                  minimumDate={newTrip.startDate ? new Date(newTrip.startDate) : undefined}
                />
                <ErrorText error={endDateError} />
              </YStack>
            </XStack>
          </YStack>

          <PrevNextButtons
            isLast
            onNext={handleSubmit}
            isNextLoading={isSubmitting}
            nextDisabled={
              !newTrip.title.trim() ||
              !!validateStartDate(newTrip.startDate) ||
              !!validateEndDate(newTrip.endDate, newTrip.startDate)
            }
          />
        </YStack>
      </YStack>
    </FadeWrapper>
  );
}
