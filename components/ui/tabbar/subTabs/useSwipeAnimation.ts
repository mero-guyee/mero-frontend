import { useRef } from 'react';
import { Animated } from 'react-native';

export function useSwipeAnimation() {
  const swipePillBlend = useRef(new Animated.Value(1)).current;
  const swipeTX = useRef<Animated.AnimatedInterpolation<number> | null>(null);
  const swipeRefWidth = useRef(0);

  const initSwipe = (
    tabValues: string[],
    tabLayouts: Record<string, { x: number; width: number }>,
    swipePosition: Animated.AnimatedInterpolation<number>
  ) => {
    const inputRange = tabValues.map((_, i) => i);
    const refWidth = tabLayouts[tabValues[0]]?.width ?? 1;
    swipeRefWidth.current = refWidth;

    swipeTX.current = swipePosition.interpolate({
      inputRange,
      outputRange: tabValues.map((v) => {
        const { x, width } = tabLayouts[v] ?? { x: 0, width: refWidth };
        return x + width / 2 - refWidth / 2;
      }),
    });
  };

  return { swipePillBlend, swipeTX, swipeRefWidth, initSwipe };
}
