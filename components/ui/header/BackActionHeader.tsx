import { ArrowLeft } from '@tamagui/lucide-icons';
import { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, View, XStack } from 'tamagui';
import { IconButton } from '../button/BaseButton';

export default function BackActionHeader({
  onBack,
  label = '',
  children,
  icon = <ArrowLeft size="6.5" color="$foreground" />,
}: {
  onBack: () => void;
  label?: string;
  children?: ReactNode;
  icon?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <XStack
      backgroundColor="$background"
      paddingTop={insets.top}
      paddingBottom="$1"
      paddingHorizontal="$3"
    >
      <View height={48} alignItems="flex-start" justifyContent="center">
        <IconButton onPress={onBack}>{icon}</IconButton>
      </View>
      <View flex={1} height={48} alignItems="center" justifyContent="center" paddingHorizontal="$2">
        {label && (
          <Text
            textAlign="center"
            color="$foreground"
            fontSize="$5"
            fontWeight="500"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {label}
          </Text>
        )}
      </View>
      <View height={48} alignItems="flex-end" justifyContent="center">
        {children}
      </View>
    </XStack>
  );
}
