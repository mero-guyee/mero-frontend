import { paddingHorizontalGeneral } from '@/constants/theme';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { StackActions } from '@react-navigation/native';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'tamagui';

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const tabBarPadding = state.index === 5 ? 0 : insets.bottom;
  const animsX = useRef(state.routes.map(() => new Animated.Value(1))).current;
  const animsY = useRef(state.routes.map(() => new Animated.Value(1))).current;
  const animsOpacity = useRef(state.routes.map(() => new Animated.Value(0))).current;

  const prevIndexRef = useRef(state.index);

  useEffect(() => {
    const prevIndex = prevIndexRef.current;

    if (prevIndex !== state.index) {
      const prevRoute = state.routes[prevIndex];
      if (prevRoute.state?.key)
        navigation.dispatch({
          ...StackActions.popToTop(),
          target: prevRoute.state?.key,
        });
      prevIndexRef.current = state.index;
    }
  }, [state.index, navigation, state.routes]);

  function handlePress(index: number, route: (typeof state.routes)[number], isFocused: boolean) {
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

    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  }

  if (state.index === 5) return null;

  return (
    <View style={{ ...styles.container, paddingBottom: tabBarPadding }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        if (options.tabBarLabel === '여행') return null;

        const isFocused = state.index === index;
        const color = isFocused ? '#9BC4D1' : '#8B7355';
        const label =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : typeof options.title === 'string'
              ? options.title
              : route.name;

        return (
          <Pressable
            key={route.key}
            style={styles.tab}
            onPress={() => handlePress(index, route, isFocused)}
            accessibilityRole="button"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={options.tabBarAccessibilityLabel}
          >
            <Animated.View
              style={{
                transform: [{ scaleX: animsX[index] }, { scaleY: animsY[index] }],
                height: 20,
              }}
            >
              <Animated.View style={[styles.ripple, { opacity: animsOpacity[index] }]} />
              {options.tabBarIcon?.({ focused: isFocused, color, size: 24 })}
            </Animated.View>
            <Text style={[styles.label, { color }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFBF0',
    paddingTop: 8,
    paddingHorizontal: paddingHorizontalGeneral,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  ripple: {
    position: 'absolute',
    width: 51,
    height: 38,
    borderRadius: 16,
    backgroundColor: '#C8E4C1',
    alignSelf: 'center',
    top: -1,
  },
});
