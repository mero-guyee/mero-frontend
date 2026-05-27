import { useEffect, useRef } from 'react';
import { Animated, DimensionValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, View, XStack, YStack } from 'tamagui';

function SkeletonBox({
  width,
  height,
  borderRadius = 6,
  opacity,
  color,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  opacity: Animated.Value;
  color: string;
}) {
  return (
    <Animated.View
      style={{
        width: width as DimensionValue,
        height,
        borderRadius,
        backgroundColor: color,
        opacity,
      }}
    />
  );
}

export default function BackpackSkeleton() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const skeletonColor = theme.secondary?.val ?? '#E8D5B7';

  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header */}
      <XStack
        backgroundColor="$background"
        paddingTop={insets.top}
        paddingBottom="$1"
        paddingHorizontal="$3"
        alignItems="center"
      >
        <View flex={1} height={48} justifyContent="center">
          <SkeletonBox
            width={28}
            height={28}
            borderRadius={8}
            opacity={opacity}
            color={skeletonColor}
          />
        </View>
        <View flex={1} height={48} alignItems="center" justifyContent="center">
          <SkeletonBox width={100} height={16} opacity={opacity} color={skeletonColor} />
        </View>
        <View flex={1} height={48} alignItems="flex-end" justifyContent="center">
          <SkeletonBox
            width={28}
            height={28}
            borderRadius={8}
            opacity={opacity}
            color={skeletonColor}
          />
        </View>
      </XStack>

      {/* Cover image */}
      <SkeletonBox
        width="100%"
        height={192}
        borderRadius={0}
        opacity={opacity}
        color={skeletonColor}
      />

      {/* Tab bar */}
      <XStack padding="$4" gap="$3">
        <SkeletonBox
          width={56}
          height={32}
          borderRadius={8}
          opacity={opacity}
          color={skeletonColor}
        />
        <SkeletonBox
          width={56}
          height={32}
          borderRadius={8}
          opacity={opacity}
          color={skeletonColor}
        />
      </XStack>

      {/* List items */}
      <YStack flex={1} paddingHorizontal="$4" gap="$3">
        {[72, 56, 72, 56, 72].map((h, i) => (
          <SkeletonBox
            key={i}
            width="100%"
            height={h}
            borderRadius={10}
            opacity={opacity}
            color={skeletonColor}
          />
        ))}
      </YStack>
    </YStack>
  );
}
