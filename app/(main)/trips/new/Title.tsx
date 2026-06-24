import { Input } from '@/components/ui';
import FadeWrapper from '@/components/ui/FadeWrapper';
import FormLabel from '@/components/ui/form/FormLabel';
import PrevNextButtons from '@/components/ui/form/multiStepForm/PrevNextButtons';
import { paddingHorizontalGeneral } from '@/constants/theme';
import { useTrips } from '@/contexts';
import { useNewTripForm } from '@/contexts/MultiStepForm/NewTripFormContext';
import { validateTitle } from '@/contexts/MultiStepForm/newTripValidation';
import { useCreateTrip } from '@/hooks/queries/useTrips';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, YStack } from 'tamagui';

export default function Title() {
  const insets = useSafeAreaInsets();
  const { setActiveTrip, addTrip } = useTrips();
  const { newTrip, setNewTrip, initNewTripForm } = useNewTripForm();
  const [titleError, setTitleError] = useState<string | null>(null);
  const createTrip = useCreateTrip();

  const handleSubmit = () => {
    const err = validateTitle(newTrip.title);
    setTitleError(err);
    if (err) return;

    addTrip(
      {
        title: newTrip.title.trim(),
        startDate: newTrip.startDate,
        endDate: newTrip.endDate,
        imageUrl: newTrip.imageUrl,
        countries: newTrip.countries,
      },
      (id) => {
        initNewTripForm();
        router.push(`/(main)/trips?created=${id}`);
      },
      () => {
        Alert.alert('오류', '여행을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    );
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
        <YStack>
          <FormLabel marginBottom="$2">모험의 이름</FormLabel>
          <Input
            testID="title-input"
            borderColor={titleError ? '$destructive' : '$foreground'}
            paddingHorizontal="$4"
            paddingVertical="$3"
            placeholder="예: 2026 남미 여행"
            placeholderTextColor="$placeholderForeground"
            value={newTrip.title}
            onChangeText={(text) => {
              setNewTrip({ ...newTrip, title: text });
              if (titleError) setTitleError(null);
            }}
            color="$foreground"
          />
          <Text color="$destructive" fontSize={13} marginTop="$1" minHeight={14}>
            {titleError ?? ''}
          </Text>
        </YStack>
        <PrevNextButtons isLast onNext={handleSubmit} isNextLoading={createTrip.isPending} />
      </YStack>
    </FadeWrapper>
  );
}
