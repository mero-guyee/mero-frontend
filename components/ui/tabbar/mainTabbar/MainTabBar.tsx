import { paddingHorizontalGeneral } from '@/constants/theme';
import { useTrips } from '@/contexts';
import { getDaysUntilTripStart } from '@/data/utils';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { ArrowLeft } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Text, useTheme, View } from 'tamagui';
import TabLockBadge from './TabLockBadge';
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
  const theme = useTheme();
  const foregroundColor = theme.foreground.val;
  const mutedColor = theme.muted.val;
  const mutedForegroundColor = theme.mutedForeground.val;

  const { activeTrip, getTripById } = useTrips();
  const trip = activeTrip ? getTripById(activeTrip) : undefined;
  const daysUntilStart = trip ? getDaysUntilTripStart(trip.startDate) : 0;
  const tripNotStarted = daysUntilStart > 0;

  function handlePress(
    index: number,
    route: (typeof state.routes)[number],
    isFocused: boolean,
    isDisabled: boolean
  ) {
    if (isDisabled) {
      Toast.show({
        type: 'info',
        text1: '여행 시작 후 이용할 수 있어요',
        text2: `D-${daysUntilStart} 남았어요`,
        bottomOffset: 100,
      });
      return;
    }
    playPressAnimation(index);
    navigateToTab(route, isFocused);
  }

  if (hideTabBar) return null;

  return (
    <View
      flexDirection="row"
      backgroundColor="$card"
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
      <Pressable
        style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.6 : 1 }]}
        onPress={() => router.navigate('/(main)/trips')}
        accessibilityRole="button"
        accessibilityLabel="여행으로 나가기"
      >
        <View
          width={40}
          height={40}
          borderRadius={20}
          backgroundColor="$muted"
          alignItems="center"
          justifyContent="center"
        >
          <ArrowLeft size={20} color={foregroundColor} />
        </View>
      </Pressable>

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        if (options.tabBarLabel === '여행') return null;
        if (options.tabBarLabel === '설정') return null;

        const isFocused = state.index === index;
        const label = options.tabBarLabel as string;
        const isDisabled = label === '일지' && tripNotStarted;
        const tabColor = isDisabled ? mutedForegroundColor : foregroundColor;

        return (
          <Pressable
            key={route.key}
            style={styles.tab}
            onPress={() => handlePress(index, route, isFocused, isDisabled)}
            accessibilityRole="button"
            accessibilityState={{ selected: isFocused, disabled: isDisabled }}
            accessibilityLabel={options.tabBarAccessibilityLabel}
          >
            <Animated.View
              style={{
                transform: [{ scaleX: animsX[index] }, { scaleY: animsY[index] }],
                height: 24,
                opacity: isDisabled ? 0.5 : 1,
                position: 'relative',
              }}
            >
              <Animated.View
                style={[
                  styles.ripple,
                  { backgroundColor: mutedColor, opacity: animsOpacity[index] },
                ]}
              />
              {options.tabBarIcon?.({ focused: isFocused, color: tabColor, size: 24 })}
              {isDisabled && <TabLockBadge color={tabColor} />}
            </Animated.View>
            <Text
              fontWeight="300"
              opacity={isDisabled ? 0.5 : 1}
              style={[styles.label, { color: tabColor }]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    alignSelf: 'center',
    top: -1,
  },
});
