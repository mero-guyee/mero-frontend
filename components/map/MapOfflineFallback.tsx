import { WifiOff } from '@tamagui/lucide-icons';
import { StyleSheet, View } from 'react-native';
import { Text, YStack } from 'tamagui';

interface MapOfflineFallbackProps {
  message?: string;
}

export default function MapOfflineFallback({
  message = '오프라인 상태에서는 지도를 표시할 수 없어요',
}: MapOfflineFallbackProps) {
  return (
    <View style={styles.container}>
      <YStack alignItems="center" gap="$2">
        <WifiOff size={32} color="#C0B8B0" />
        <Text color="$mutedForeground">{message}</Text>
      </YStack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
