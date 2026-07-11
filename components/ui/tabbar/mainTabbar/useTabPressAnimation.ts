import { useRef } from 'react';
import { Animated } from 'react-native';

export function useTabPressAnimation(routeCount: number) {
  const animsX = useRef(Array.from({ length: routeCount }, () => new Animated.Value(1))).current;
  const animsY = useRef(Array.from({ length: routeCount }, () => new Animated.Value(1))).current;
  const animsOpacity = useRef(
    Array.from({ length: routeCount }, () => new Animated.Value(0))
  ).current;

  function playPressAnimation(index: number) {
    const sx = animsX[index];
    const sy = animsY[index];
    const op = animsOpacity[index];
    const cfg = { useNativeDriver: true as const, speed: 5000, bounciness: 200 };

    Animated.parallel([
      Animated.sequence([
        Animated.parallel([
          Animated.spring(sx, { toValue: 1.1, ...cfg }),
          Animated.spring(sy, { toValue: 0.9, ...cfg }),
        ]),
        Animated.parallel([
          Animated.spring(sx, { toValue: 0.9, ...cfg }),
          Animated.spring(sy, { toValue: 1.1, ...cfg }),
        ]),
        Animated.parallel([
          Animated.spring(sx, { toValue: 1, useNativeDriver: true, speed: 200, bounciness: 8 }),
          Animated.spring(sy, { toValue: 1, useNativeDriver: true, speed: 200, bounciness: 8 }),
        ]),
      ]),
      Animated.sequence([
        Animated.timing(op, { toValue: 1, duration: 0, useNativeDriver: true }),
        Animated.delay(150),
        Animated.timing(op, { toValue: 0.2, duration: 200, useNativeDriver: true }),
        Animated.timing(op, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),
    ]).start();
  }

  return { animsX, animsY, animsOpacity, playPressAnimation };
}
