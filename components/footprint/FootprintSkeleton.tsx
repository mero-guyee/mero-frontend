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

function FootprintItemSkeleton({
  opacity,
  color,
  showImage,
  isLast,
}: {
  opacity: Animated.Value;
  color: string;
  showImage: boolean;
  isLast: boolean;
}) {
  return (
    <XStack marginBottom="$3">
      {/* Timeline dot + line */}
      <YStack alignItems="center" width={20} marginRight="$3">
        <SkeletonBox width={8} height={8} borderRadius={4} opacity={opacity} color={color} />
        {!isLast && (
          <Animated.View
            style={{ flex: 1, width: 1, backgroundColor: color, opacity, marginTop: 4 }}
          />
        )}
      </YStack>

      {/* Card */}
      <YStack
        flex={1}
        backgroundColor="$card"
        borderRadius="$4"
        paddingHorizontal="$4"
        paddingVertical="$4"
        gap="$2"
        marginTop={14}
      >
        <XStack gap="$3">
          <YStack flex={1} gap="$2">
            <XStack gap="$3">
              <SkeletonBox width={72} height={13} opacity={opacity} color={color} />
              <SkeletonBox width={60} height={13} opacity={opacity} color={color} />
            </XStack>
            <SkeletonBox width={180} height={20} opacity={opacity} color={color} />
            <SkeletonBox width={140} height={13} opacity={opacity} color={color} />
            <SkeletonBox width={60} height={22} borderRadius={4} opacity={opacity} color={color} />
          </YStack>
          {showImage && (
            <SkeletonBox width={72} height={72} borderRadius={12} opacity={opacity} color={color} />
          )}
        </XStack>
      </YStack>
    </XStack>
  );
}

const ITEMS: { showImage: boolean }[] = [
  { showImage: true },
  { showImage: false },
  { showImage: true },
  { showImage: false },
];

export default function FootprintSkeleton() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const color = theme.secondary?.val ?? '#E8D5B7';

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
      <YStack
        backgroundColor="$background"
        paddingTop={insets.top}
        paddingHorizontal="$4"
        paddingBottom="$1"
      >
        <XStack alignItems="center" justifyContent="space-between">
          <View flex={1} height={48} justifyContent="center">
            <SkeletonBox width={60} height={22} opacity={opacity} color={color} />
          </View>
          <View height={48} justifyContent="center" alignItems="center" paddingHorizontal="$2">
            <SkeletonBox width={22} height={22} borderRadius={6} opacity={opacity} color={color} />
          </View>
        </XStack>
      </YStack>

      {/* List */}
      <YStack flex={1} paddingHorizontal="$4" paddingTop="$4">
        {/* Month section header */}
        <SkeletonBox width={80} height={14} opacity={opacity} color={color} />

        <YStack marginTop="$3">
          {ITEMS.map((item, i) => (
            <FootprintItemSkeleton
              key={i}
              opacity={opacity}
              color={color}
              showImage={item.showImage}
              isLast={i === ITEMS.length - 1}
            />
          ))}
        </YStack>
      </YStack>
    </YStack>
  );
}
