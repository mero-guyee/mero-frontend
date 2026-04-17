import { ComponentProps, useRef } from 'react';
import { Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'tamagui';
import { FilledButton } from './BaseButton';

export default function FloatingActionButton({
  children,
  onPressIn,
  onPressOut,
  noBottomTabBar,
  ...props
}: ComponentProps<typeof FilledButton> & { noBottomTabBar?: boolean }) {
  const translate = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const shadowOpacity = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();

  const handlePressIn = (e: any) => {
    Animated.parallel([
      Animated.timing(translate, {
        toValue: { x: 2, y: 2 },
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(shadowOpacity, {
        toValue: 0,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    Animated.parallel([
      Animated.timing(translate, {
        toValue: { x: 0, y: 0 },
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(shadowOpacity, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
    onPressOut?.(e);
  };

  return (
    <Stack
      position="absolute"
      bottom={noBottomTabBar ? insets.bottom + 10 : 10}
      right={noBottomTabBar ? insets.right + 16 : 10}
    >
      <Animated.View
        style={{
          opacity: shadowOpacity,
          position: 'absolute',
          top: 2,
          left: 1,
          width: '100%',
          height: '100%',
        }}
      >
        <Stack
          position="absolute"
          top={2}
          left={1}
          width="100%"
          height="100%"
          backgroundColor="$accentHover"
          borderRadius="$4"
        />
      </Animated.View>
      <Animated.View style={{ transform: translate.getTranslateTransform() }}>
        <FilledButton
          backgroundColor="#C8DEE6"
          borderRadius="$4"
          alignItems="center"
          justifyContent="center"
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          {...props}
        >
          {children}
        </FilledButton>
      </Animated.View>
    </Stack>
  );
}
