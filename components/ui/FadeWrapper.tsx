import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';
import { Animated } from 'react-native';

interface FadeWrapperProps {
  children: React.ReactNode;
  duration?: number;
}

export default function FadeWrapper({ children, duration = 200 }: FadeWrapperProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: duration * 0.2,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: duration * 0.8,
          useNativeDriver: true,
        }),
      ]).start();

      return () => {
        opacity.setValue(0);
      };
    }, [duration])
  );

  return <Animated.View style={{ flex: 1, opacity }}>{children}</Animated.View>;
}
