import TripCountrySearch from '@/components/trips/TripCountrySearch';
import FadeWrapper from '@/components/ui/FadeWrapper';
import FormLabel from '@/components/ui/multiStepForm/FormLabel';
import PrevNextButtons from '@/components/ui/multiStepForm/PrevNextButtons';
import { paddingHorizontalGeneral } from '@/constants/theme';
import { useNewTripForm } from '@/contexts/MultiStepForm/NewTripFormContext';
import { validateCountries } from '@/contexts/MultiStepForm/newTripValidation';
import { router } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { YStack } from 'tamagui';

export default function NewInputCountryStep() {
  const { newTrip, setNewTrip } = useNewTripForm();
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const handleNext = () => {
    const err = validateCountries(newTrip.countries);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    router.push('/(main)/trips/new/DateAndThumbnail');
  };

  return (
    <FadeWrapper>
      <YStack
        flex={1}
        backgroundColor="$background"
        paddingVertical={24 + insets.top}
        paddingHorizontal={paddingHorizontalGeneral}
        justifyContent="flex-end"
      >
        <YStack flex={1}>
          <FormLabel marginBottom="$2">거쳐갈 땅</FormLabel>
          <TripCountrySearch
            selectedCountries={newTrip.countries}
            onAdd={(country) => {
              if (!newTrip.countries.includes(country)) {
                setNewTrip({ ...newTrip, countries: [...newTrip.countries, country] });
                setError(null);
              }
            }}
            onRemove={(country) =>
              setNewTrip({ ...newTrip, countries: newTrip.countries.filter((c) => c !== country) })
            }
            error={error}
          />
        </YStack>

        <PrevNextButtons isFirst onNext={handleNext} />
      </YStack>
    </FadeWrapper>
  );
}
