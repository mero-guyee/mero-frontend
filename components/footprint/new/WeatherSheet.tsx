import { FilledButton, Input } from '@/components/ui';
import { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sheet, Text, XStack, YStack } from 'tamagui';

const WEATHER_OPTIONS = [
  { emoji: '☀️', label: '맑음' },
  { emoji: '⛅', label: '구름 조금' },
  { emoji: '☁️', label: '흐림' },
  { emoji: '🌧', label: '비' },
  { emoji: '⛈', label: '천둥' },
  { emoji: '❄️', label: '눈' },
  { emoji: '🌬', label: '바람' },
  { emoji: '🌫', label: '안개' },
];

interface WeatherSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialWeatherInfo: string;
  onConfirm: (weatherInfo: string) => void;
}

export default function WeatherSheet({
  open,
  onOpenChange,
  initialWeatherInfo,
  onConfirm,
}: WeatherSheetProps) {
  const insets = useSafeAreaInsets();
  const [iconDraft, setIconDraft] = useState('');
  const [tempDraft, setTempDraft] = useState('');

  useEffect(() => {
    if (open) {
      const parts = initialWeatherInfo.split(' ');
      setIconDraft(parts[0] || '');
      setTempDraft(parts[1]?.replace('°C', '') || '');
    }
  }, [open]);

  const handleConfirm = () => {
    if (!iconDraft) {
      onConfirm('');
    } else {
      onConfirm(tempDraft.trim() ? `${iconDraft} ${tempDraft.trim()}°C` : iconDraft);
    }
    onOpenChange(false);
  };

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[insets.bottom]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay
        animation="lazy"
        bg="rgba(0,0,0,0.6)"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Handle />
      <Sheet.Frame padding="$5" gap="$4" h="$16">
        <Text fontSize={16} fontWeight="600" color="$foreground">
          날씨
        </Text>
        <XStack flexWrap="wrap" gap="$2">
          {WEATHER_OPTIONS.map((opt) => (
            <Pressable key={opt.emoji} onPress={() => setIconDraft(opt.emoji)}>
              <YStack
                alignItems="center"
                justifyContent="center"
                width={42}
                height={42}
                borderWidth={0}
                borderRadius={8}
                backgroundColor={iconDraft === opt.emoji ? '$accent' : 'transparent'}
              >
                <Text fontSize={22}>{opt.emoji}</Text>
              </YStack>
            </Pressable>
          ))}
        </XStack>
        <XStack alignItems="center" gap="$2">
          <Input
            flex={1}
            placeholder="온도"
            value={tempDraft}
            onChangeText={setTempDraft}
            keyboardType="numeric"
            onSubmitEditing={handleConfirm}
            inputMode="numeric"
          />
          <Text fontSize={15} color="$foreground">
            °C
          </Text>
        </XStack>
        <FilledButton onPress={handleConfirm}>확인</FilledButton>
      </Sheet.Frame>
    </Sheet>
  );
}
