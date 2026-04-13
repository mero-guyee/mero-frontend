import { XStack, YStack } from 'tamagui';

export function XCard({ children, ...rest }: React.ComponentProps<typeof XStack>) {
  return (
    <XStack backgroundColor="$card" borderRadius="$6" borderWidth={0} overflow="hidden" {...rest}>
      {children}
    </XStack>
  );
}

export function YCard({ children, ...rest }: React.ComponentProps<typeof YStack>) {
  return (
    <YStack backgroundColor="$card" borderRadius="$6" borderWidth={0} overflow="hidden" {...rest}>
      {children}
    </YStack>
  );
}
