import { useRef } from 'react';
import { Animated } from 'react-native';

export function useClickAnimation() {
  const springX = useRef(new Animated.Value(0)).current;
  const springWidth = useRef(new Animated.Value(0)).current;
  const pressBlend = useRef(new Animated.Value(0)).current;
  const springAnim = useRef<Animated.CompositeAnimation | null>(null);

  const initSpring = (activeLayout: { x: number; width: number }) => {
    springX.setValue(activeLayout.x);
    springWidth.setValue(activeLayout.width);
  };

  const animateTo = (
    target: { x: number; width: number },
    current: { x: number; width: number } | undefined,
    hasSwipe: boolean,
    swipePillBlend: Animated.Value
  ) => {
    if (hasSwipe && current) {
      swipePillBlend.setValue(0);
      springX.setValue(current.x);
      springWidth.setValue(current.width);
      pressBlend.setValue(1);

      springAnim.current?.stop();
      springAnim.current = Animated.parallel([
        Animated.spring(springX, { toValue: target.x, useNativeDriver: false, tension: 120, friction: 12 }),
        Animated.spring(springWidth, { toValue: target.width, useNativeDriver: false, tension: 120, friction: 12 }),
      ]);
      springAnim.current.start(({ finished }) => {
        if (finished) {
          Animated.parallel([
            Animated.timing(pressBlend, { toValue: 0, duration: 120, useNativeDriver: false }),
            Animated.timing(swipePillBlend, { toValue: 1, duration: 120, useNativeDriver: true }),
          ]).start();
        }
      });
    } else {
      springAnim.current?.stop();
      springAnim.current = Animated.parallel([
        Animated.spring(springX, { toValue: target.x, useNativeDriver: false, tension: 120, friction: 12 }),
        Animated.spring(springWidth, { toValue: target.width, useNativeDriver: false, tension: 120, friction: 12 }),
      ]);
      springAnim.current.start();
    }
  };

  return { springX, springWidth, pressBlend, initSpring, animateTo };
}
