import { paddingHorizontalGeneral } from '@/constants/theme';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, View } from 'tamagui';
import { useTabBarNavigation } from './useTabBarNavigation';
import { useTabPressAnimation } from './useTabPressAnimation';

export default function MainTabBar(props: BottomTabBarProps) {
  const { state, descriptors } = props;
  const insets = useSafeAreaInsets();
  const tabBarPadding = insets.bottom;
  const { hideTabBar, navigateToTab } = useTabBarNavigation(props);
  const { animsX, animsY, animsOpacity, playPressAnimation } = useTabPressAnimation(
    state.routes.length
  );

  function handlePress(index: number, route: (typeof state.routes)[number], isFocused: boolean) {
    playPressAnimation(index);
    navigateToTab(route, isFocused);
  }

  if (hideTabBar) return null;

  return (
    <View
      flexDirection="row"
      backgroundColor="#ffffff"
      paddingTop={8}
      paddingHorizontal={paddingHorizontalGeneral}
      borderTopLeftRadius={16}
      borderTopRightRadius={16}
      shadowColor="rgba(0,0,0,0.08)"
      shadowOffset={{ width: 0, height: 1 }}
      shadowOpacity={0.08}
      shadowRadius={4}
      style={{ elevation: 2 }}
      paddingBottom={tabBarPadding}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        if (options.tabBarLabel === '여행') return null;
        if (options.tabBarLabel === '설정') return null;

        const isFocused = state.index === index;
        const color = '$foreground';
        const label = options.tabBarLabel as string;

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
                height: 24,
              }}
            >
              <Animated.View style={[styles.ripple, { opacity: animsOpacity[index] }]} />
              {options.tabBarIcon?.({ focused: isFocused, color, size: 24 })}
            </Animated.View>
            <Text fontWeight="300" style={[styles.label, { color }]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    fontSize: 12,
    lineHeight: 14,
  },
  ripple: {
    position: 'absolute',
    width: 51,
    height: 38,
    borderRadius: 16,
    backgroundColor: '#F5EFE0',
    alignSelf: 'center',
    top: -1,
  },
});
