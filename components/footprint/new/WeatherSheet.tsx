import { FilledButton, Input } from '@/components/ui';
import {
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Cloudy,
  Sun,
  Wind,
} from '@tamagui/lucide-icons';
import { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sheet, Text, XStack, YStack } from 'tamagui';

export const WEATHER_ICON_MAP: Record<
  string,
  React.ComponentType<{ size?: number; color?: string }>
> = {
  sunny: Sun,
  partly_cloudy: CloudSun,
  cloudy: Cloudy,
  rain: CloudRain,
  thunder: CloudLightning,
  snow: CloudSnow,
  wind: Wind,
  fog: CloudFog,
};

const WEATHER_OPTIONS = [
  { key: 'sunny', Icon: Sun, label: '맑음' },
  { key: 'partly_cloudy', Icon: CloudSun, label: '구름 조금' },
  { key: 'cloudy', Icon: Cloudy, label: '흐림' },
  { key: 'rain', Icon: CloudRain, label: '비' },
  { key: 'thunder', Icon: CloudLightning, label: '천둥' },
  { key: 'snow', Icon: CloudSnow, label: '눈' },
  { key: 'wind', Icon: Wind, label: '바람' },
  { key: 'fog', Icon: CloudFog, label: '안개' },
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
  const [keyDraft, setKeyDraft] = useState('');
  const [tempDraft, setTempDraft] = useState('');

  useEffect(() => {
    if (open) {
      const parts = initialWeatherInfo.split(' ');
      setKeyDraft(parts[0] || '');
      setTempDraft(parts[1]?.replace('°C', '') || '');
    }
  }, [open]);

  const handleConfirm = () => {
    if (!keyDraft) {
      onConfirm('');
    } else {
      onConfirm(tempDraft.trim() ? `${keyDraft} ${tempDraft.trim()}°C` : keyDraft);
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
            <Pressable key={opt.key} onPress={() => setKeyDraft(opt.key)}>
              <YStack
                alignItems="center"
                justifyContent="center"
                width={42}
                height={42}
                borderRadius={8}
                backgroundColor={keyDraft === opt.key ? '$accent' : 'transparent'}
              >
                <opt.Icon size={22} color="$foreground" />
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
