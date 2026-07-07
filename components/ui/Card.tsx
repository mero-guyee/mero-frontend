import { useState } from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { cardScaleStyle, PressFeedbackBackdrop } from './pressFeedback';

export function XCard({ children, ...rest }: React.ComponentProps<typeof XStack>) {
  return (
    <XStack
      backgroundColor="$card"
      borderRadius="$4"
      borderWidth={0}
      boxShadow="0 1px 4px rgba(0,0,0,0.08)"
      overflow="hidden"
      {...rest}
    >
      {children}
    </XStack>
  );
}

export function YCard({ children, ...rest }: React.ComponentProps<typeof YStack>) {
  return (
    <YStack
      backgroundColor="$card"
      borderRadius="$4"
      borderWidth={0}
      boxShadow="0 1px 4px rgba(0,0,0,0.08)"
      overflow="hidden"
      {...rest}
    >
      {children}
    </YStack>
  );
}

export function PressableXCard({
  children,
  onPress,
  containerStyle,
  ...rest
}: React.ComponentProps<typeof XCard> & {
  onPress: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      style={containerStyle}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      <XCard {...cardScaleStyle(pressed)} {...rest}>
        <PressFeedbackBackdrop pressed={pressed} />
        {children}
      </XCard>
    </Pressable>
  );
}

export function PressableYCard({
  children,
  onPress,
  containerStyle,
  ...rest
}: React.ComponentProps<typeof YCard> & {
  onPress: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      style={containerStyle}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      <YCard {...cardScaleStyle(pressed)} {...rest}>
        <PressFeedbackBackdrop pressed={pressed} />
        {children}
      </YCard>
    </Pressable>
  );
}
