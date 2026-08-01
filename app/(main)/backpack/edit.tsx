import TripCountrySearch from '@/components/trips/TripCountrySearch';
import TripCountrySearchChip from '@/components/trips/TripCountrySearchChip';
import TripCoverImagePicker from '@/components/trips/TripCoverImagePicker';
import { FilledButton, Input } from '@/components/ui';
import AppBottomSheet from '@/components/ui/AppBottomSheet';
import SubmitButton from '@/components/ui/button/SubmitButton';
import DatePickerInput from '@/components/ui/DatePickerInput';
import BackActionHeader from '@/components/ui/header/BackActionHeader';
import { useTrips } from '@/contexts';
import { useTripQuery } from '@/hooks/queries/useTrips';
import { Plus } from '@tamagui/lucide-icons';
import { Asset } from 'expo-asset';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

const DEFAULT_IMAGE = Asset.fromModule(require('@/assets/images/mountain.jpg')).uri;
export default function EditBackPackScreen() {
  const router = useRouter();

  const { activeTrip, updateTrip } = useTrips();
  const { data: trip } = useTripQuery(activeTrip || '');

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>('');
  const [countries, setCountries] = useState<string[]>([]);
  const [showCountrySheet, setShowCountrySheet] = useState(false);
  const [draftCountries, setDraftCountries] = useState<string[]>([]);

  useEffect(() => {
    if (trip) {
      setTitle(trip.title);
      setStartDate(trip.startDate);
      setEndDate(trip.endDate);
      setImageUrl(trip.imageUrl || DEFAULT_IMAGE);
      setCountries(trip.countries);
    }
  }, [trip]);

  if (!trip) {
    return (
      <YStack flex={1} backgroundColor="$background" justifyContent="center" alignItems="center">
        <Text color="$foreground">여행을 찾을 수 없습니다</Text>
      </YStack>
    );
  }

  const handleSubmit = () => {
    updateTrip({
      ...trip,
      title: title.trim(),
      startDate,
      endDate,
      countries,
      imageUrl,
    });

    router.back();
  };

  const handleRemoveCountry = (country: string) => {
    setCountries(countries.filter((c) => c !== country));
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header */}
      <BackActionHeader label={trip.title} onBack={() => router.back()}>
        <SubmitButton
          onPress={handleSubmit}
          disabled={!title.trim() || !startDate || !endDate}
          opacity={title.trim() && startDate && endDate ? 1 : 0.5}
        />
      </BackActionHeader>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <TripCoverImagePicker
          imageUrl={imageUrl}
          onChange={setImageUrl}
          onRemove={() => setImageUrl('')}
        />

        <YStack padding={24}>
          <YStack marginBottom="$6">
            <Text color="$foreground" marginBottom="$2" fontWeight="500">
              모험의 이름
            </Text>
            <Input
              placeholder="예: 2026 남미 여행"
              placeholderTextColor="$placeholderForeground"
              value={title}
              onChangeText={setTitle}
              color="$foreground"
            />
          </YStack>

          {/* Dates */}
          <XStack gap="$4" marginBottom="$6">
            <YStack flex={1}>
              <Text color="$foreground" marginBottom="$2" fontWeight="500">
                출발일
              </Text>
              <DatePickerInput value={startDate} onChange={setStartDate} />
            </YStack>
            <YStack flex={1}>
              <Text color="$foreground" marginBottom="$2" fontWeight="500">
                귀환일
              </Text>
              <DatePickerInput
                value={endDate}
                onChange={setEndDate}
                minimumDate={startDate ? new Date(startDate) : undefined}
              />
            </YStack>
          </XStack>

          {/* Countries */}
          <YStack marginBottom="$6">
            <Text color="$foreground" marginBottom="$2" fontWeight="500">
              거쳐갈 땅
            </Text>

            <XStack flex={1} flexWrap="wrap" gap="$2" alignItems="center">
              {countries.map((country) => (
                <TripCountrySearchChip
                  key={country}
                  country={country}
                  onRemove={handleRemoveCountry}
                />
              ))}

              <FilledButton
                backgroundColor={'$accent'}
                height={'$40'}
                borderRadius={'$3'}
                aspectRatio={1}
                hitSlop={8}
                onPress={() => {
                  setDraftCountries([...countries]);
                  setShowCountrySheet(true);
                }}
              >
                <Plus size={'$5'} color="$foreground" />
              </FilledButton>
            </XStack>
          </YStack>
        </YStack>
      </ScrollView>
      <AppBottomSheet
        open={showCountrySheet}
        onOpenChange={setShowCountrySheet}
        snapPoints={[85]}
        frameProps={{ padding: '$4' }}
      >
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
          <Text color="$foreground" fontWeight="600" fontSize={16}>
            국가 선택
          </Text>
          <FilledButton
            paddingHorizontal="$4"
            paddingVertical="$2"
            onPress={() => {
              setCountries(draftCountries);
              setShowCountrySheet(false);
            }}
          >
            <Text color="$foreground" fontWeight="500">
              확인
            </Text>
          </FilledButton>
        </XStack>
        <TripCountrySearch
          selectedCountries={draftCountries}
          onAdd={(c) => setDraftCountries((prev) => [...prev, c])}
          onRemove={(c) => setDraftCountries((prev) => prev.filter((x) => x !== c))}
          onClearAll={() => setDraftCountries([])}
          error={null}
        />
      </AppBottomSheet>
    </YStack>
  );
}
