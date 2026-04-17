import { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from 'tamagui';

export default function TabScreenHeader({
  label,
  labelAlign = 'left',
  children,
}: {
  label: string;
  labelAlign?: 'left' | 'center';
  children?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <YStack
      backgroundColor="$card"
      paddingTop={insets.top}
      paddingHorizontal="$4"
      paddingBottom="$1"
      borderBottomWidth={2}
      borderBottomColor="$primary"
      style={{ borderBottomColor: 'rgba(155, 196, 209, 0.25)' }}
    >
      <XStack alignItems="center" justifyContent="space-between">
        <YStack flex={1}>
          <Text color="$foreground" fontSize={'$6'} fontWeight="500">
            {label}
          </Text>
        </YStack>
        <XStack height="$12">{children}</XStack>
      </XStack>
    </YStack>
  );
}
