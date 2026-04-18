import { ArrowLeft } from '@tamagui/lucide-icons';
import { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, View, XStack } from 'tamagui';
import { IconButton } from '../button/BaseButton';

export default function BackActionHeader({
  onBack,
  label,
  children,
}: {
  onBack: () => void;
  label: string;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <XStack
      backgroundColor="$background"
      paddingTop={insets.top}
      paddingBottom="$1"
      paddingHorizontal="$3"
    >
      <View flex={1} height={48} alignItems="flex-start" justifyContent="center">
        <IconButton onPress={onBack}>
          <ArrowLeft size="$7" color="$foreground" />
        </IconButton>
      </View>
      <View flex={1} height={48} alignItems="center" justifyContent="center">
        <Text textAlign="center" color="$foreground" fontSize="$5" fontWeight="500">
          {label}
        </Text>
      </View>
      <View flex={1} height={48} alignItems="flex-end" justifyContent="center">
        {children}
      </View>
    </XStack>
  );
}
