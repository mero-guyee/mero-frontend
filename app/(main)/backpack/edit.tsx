import TripCountrySearch from '@/components/trips/TripCountrySearch';
import TripCountrySearchChip from '@/components/trips/TripCountrySearchChip';
import { FilledButton, Input } from '@/components/ui';
import SubmitButton from '@/components/ui/button/SubmitButton';
import { YCard } from '@/components/ui/Card';
import BackActionHeader from '@/components/ui/header/BackActionHeader';
import ImagePickerSheet from '@/components/ui/ImagePickerSheet';
import { inputStyle } from '@/components/ui/Input';
import { useTrips } from '@/contexts';
import { useTripQuery } from '@/hooks/queries/useTrips';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image as ImageIcon, Plus, X } from '@tamagui/lucide-icons';
import { Asset } from 'expo-asset';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image, Sheet, Text, XStack, YStack } from 'tamagui';

const DEFAULT_IMAGE = Asset.fromModule(require('@/assets/images/mountain.jpg')).uri;
export default function EditBackPackScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { activeTrip, updateTrip } = useTrips();
  const { data: trip } = useTripQuery(activeTrip || '');

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>('');
  const [countries, setCountries] = useState<string[]>([]);
  const [showCountrySheet, setShowCountrySheet] = useState(false);
  const [draftCountries, setDraftCountries] = useState<string[]>([]);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

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
    if (!title.trim() || !startDate || !endDate) {
      Alert.alert('오류', '제목, 시작일, 종료일을 입력해주세요.');
      return;
    }

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

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(formatDate(selectedDate));
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(formatDate(selectedDate));
    }
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header */}
      <BackActionHeader label={trip.title} onBack={() => router.back()}>
        <SubmitButton onPress={handleSubmit} />
      </BackActionHeader>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
        <YStack marginBottom="$6">
          <Text color="$foreground" marginBottom="$2" fontWeight="500">
            모험의 이름
          </Text>
          <Input
            placeholder="예: 2026 남미 여행"
            placeholderTextColor="$mutedForeground"
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
            <Pressable onPress={() => setShowStartPicker(true)}>
              <XStack {...inputStyle} alignItems="center">
                <Text color={startDate ? '$foreground' : '$mutedForeground'}>
                  {startDate || 'YYYY-MM-DD'}
                </Text>
              </XStack>
            </Pressable>
          </YStack>
          <YStack flex={1}>
            <Text color="$foreground" marginBottom="$2" fontWeight="500">
              귀환일
            </Text>
            <Pressable onPress={() => setShowEndPicker(true)}>
              <XStack {...inputStyle} alignItems="center">
                <Text color={endDate ? '$foreground' : '$mutedForeground'}>
                  {endDate || 'YYYY-MM-DD'}
                </Text>
              </XStack>
            </Pressable>
          </YStack>
        </XStack>

        {showStartPicker && (
          <DateTimePicker
            value={startDate ? new Date(startDate) : new Date()}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={endDate ? new Date(endDate) : new Date()}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
          />
        )}

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

        {/* Cover Image */}
        <YStack marginBottom="$6">
          <Text color="$foreground" marginBottom="$2" fontWeight="500">
            대표 풍경
          </Text>
          <Pressable onPress={() => setShowImagePicker(true)}>
            <YCard overflow="hidden" minHeight={imageUrl ? undefined : 192}>
              {imageUrl ? (
                <YStack position="relative" aspectRatio={16 / 9}>
                  <Image source={{ uri: imageUrl }} width="100%" height="100%" resizeMode="cover" />
                  <YStack
                    position="absolute"
                    top={0}
                    left={0}
                    width="100%"
                    height="100%"
                    backgroundColor="rgba(0,0,0,0.3)"
                    opacity={1}
                    hoverStyle={{ opacity: 1 }}
                    justifyContent="center"
                    alignItems="center"
                    zIndex={1}
                  >
                    <Text>이미지를 탭하여 업로드</Text>
                  </YStack>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      setImageUrl('');
                    }}
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      backgroundColor: '#E89B8F',
                      borderRadius: 12,
                      padding: 8,
                      zIndex: 2,
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
            </YCard>
          </Pressable>
        </YStack>
      </ScrollView>
      <ImagePickerSheet
        open={showImagePicker}
        onOpenChange={setShowImagePicker}
        onSelect={setImageUrl}
      />
      <Sheet
        modal
        open={showCountrySheet}
        onOpenChange={setShowCountrySheet}
        snapPoints={[85]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay
          animation="lazy"
          bg="rgba(0,0,0,0.6)"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Handle />
        <Sheet.Frame padding="$4" paddingBottom={insets.bottom || 8}>
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
            error={null}
          />
        </Sheet.Frame>
      </Sheet>
    </YStack>
  );
}
