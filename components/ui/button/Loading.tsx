import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, ViewStyle } from 'react-native';

type LoadingDotsProps = {
  color?: string;
  size?: number;
  spacing?: number;
  style?: ViewStyle;
};

export default function LoadingDots({
  color = '#FFFFFF',
  size = 8,
  spacing = 6,
  style,
}: LoadingDotsProps) {
  const animations = useRef(Array.from({ length: 3 }, () => new Animated.Value(0.35))).current;

  useEffect(() => {
    const loops = animations.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 120),
          Animated.timing(value, {
            toValue: 1,
            duration: 360,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0.35,
            duration: 360,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      )
    );

    loops.forEach((loop) => loop.start());

    return () => {
      loops.forEach((loop) => loop.stop());
    };
  }, [animations]);

  return (
    <View style={[styles.container, style]}>
      {animations.map((value, index) => (
        <Animated.View
          key={index}
          style={[
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
              opacity: value,
              marginRight: index === animations.length - 1 ? 0 : spacing,
              transform: [
                {
                  scale: value.interpolate({
                    inputRange: [0.35, 1],
                    outputRange: [0.9, 1.15],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
