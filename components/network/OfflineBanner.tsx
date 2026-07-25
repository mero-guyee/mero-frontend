import { useIsOffline } from '@/hooks/network/useIsOffline';
import { WifiOff } from '@tamagui/lucide-icons';
import { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, View, XStack } from 'tamagui';

export default function OfflineBanner() {
  const isOffline = useIsOffline();
  const insets = useSafeAreaInsets();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isOffline) setDismissed(false);
  }, [isOffline]);

  if (!isOffline || dismissed) return null;

  return (
    <XStack
      position="absolute"
      bottom={insets.bottom + 72}
      left="$4"
      right="$4"
      zIndex={100}
      backgroundColor="$destructive"
      borderRadius="$6"
      paddingVertical="$2.5"
      paddingHorizontal="$2.5"
      alignItems="center"
      gap="$2.5"
      shadowColor="$foreground"
      shadowOpacity={0.18}
      shadowRadius={16}
      shadowOffset={{ width: 0, height: 6 }}
      elevation={5}
    >
      <View
        width={28}
        height={28}
        borderRadius={999}
        backgroundColor="rgba(255,255,255,0.25)"
        alignItems="center"
        justifyContent="center"
      >
        <WifiOff size={14} color="$destructiveForeground" />
      </View>
      <Text color="$destructiveForeground" fontSize={13} fontWeight="600" flex={1}>
        오프라인 상태예요{'\n'}
        <Text color="$destructiveForeground" fontSize={11} fontWeight="400" opacity={0.85}>
          저장한 내용은 다시 연결되면 동기화돼요
        </Text>
      </Text>
      <Pressable onPress={() => setDismissed(true)} hitSlop={8}>
        <View
          backgroundColor="rgba(255,255,255,0.25)"
          borderRadius={999}
          paddingVertical="$1.5"
          paddingHorizontal="$3"
        >
          <Text color="$destructiveForeground" fontSize={12} fontWeight="600">
            확인
          </Text>
        </View>
      </Pressable>
    </XStack>
  );
}
