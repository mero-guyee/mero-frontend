import FadeWrapper from '@/components/ui/FadeWrapper';
import { inputStyle } from '@/components/ui/Input';
import ErrorText from '@/components/ui/form/ErrorText';
import FormLabel from '@/components/ui/form/FormLabel';
import PrevNextButtons from '@/components/ui/form/multiStepForm/PrevNextButtons';
import { paddingHorizontalGeneral } from '@/constants/theme';
import { useNewTripForm } from '@/contexts/MultiStepForm/NewTripFormContext';
import { validateEndDate, validateStartDate } from '@/contexts/MultiStepForm/newTripValidation';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image as ImageIcon, X } from '@tamagui/lucide-icons';
import { Asset } from 'expo-asset';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image, Text, XStack, YStack } from 'tamagui';

export default function NewTripFormDate() {
  const { newTrip, setNewTrip } = useNewTripForm();
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
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

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setNewTrip({ ...newTrip, startDate: formatDate(selectedDate) });
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setNewTrip({ ...newTrip, endDate: formatDate(selectedDate) });
    }
  };

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('권한 필요', '이미지를 선택하려면 갤러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setNewTrip({ ...newTrip, imageUrl: result.assets[0].uri });
    }
  };

  return (
    <FadeWrapper>
      {showStartPicker && (
        <DateTimePicker
          value={newTrip.startDate ? new Date(newTrip.startDate) : new Date()}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={newTrip.endDate ? new Date(newTrip.endDate) : new Date()}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
        />
      )}
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
              <Pressable onPress={() => setShowStartPicker(true)}>
                <XStack
                  paddingHorizontal="$4"
                  paddingVertical="$3"
                  minHeight={48}
                  alignItems="center"
                  {...inputStyle}
                >
                  <Text color={newTrip.startDate ? '$foreground' : '$mutedForeground'}>
                    {newTrip.startDate || 'YYYY-MM-DD'}
                  </Text>
                </XStack>
              </Pressable>
              <ErrorText error={startDateError} />
            </YStack>
            <YStack flex={1}>
              <FormLabel marginBottom="$2">귀환일</FormLabel>
              <Pressable onPress={() => setShowEndPicker(true)}>
                <XStack
                  paddingHorizontal="$4"
                  paddingVertical="$3"
                  minHeight={48}
                  alignItems="center"
                  {...inputStyle}
                >
                  <Text color={newTrip.endDate ? '$foreground' : '$mutedForeground'}>
                    {newTrip.endDate || 'YYYY-MM-DD'}
                  </Text>
                </XStack>
              </Pressable>
              <ErrorText error={endDateError} />
            </YStack>
          </XStack>
          <YStack>
            <FormLabel marginBottom="$2">풍경</FormLabel>
            <Pressable onPress={handleImagePick}>
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
    </FadeWrapper>
  );
}
