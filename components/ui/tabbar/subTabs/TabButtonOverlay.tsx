import { Animated } from 'react-native';
import { useTheme } from 'tamagui';

const PILL_HEIGHT = 32;
const PILL_RADIUS = 8;

export namespace TabButtonOverlay {
  export const Click = ClickTabButtonOverlay;
  export const Swipe = SwipeTabButtonOverlay;
}

function ClickTabButtonOverlay({
  springWidth,
  springX,
  pressBlend,
  swipePosition,
  allLayoutsReady,
}: {
  springWidth: Animated.Value;
  springX: Animated.Value;
  pressBlend: Animated.Value;
  swipePosition?: Animated.AnimatedInterpolation<number>;
  allLayoutsReady: boolean;
}) {
  const theme = useTheme();
  const pillColor = theme.mutedStrong.val;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: PILL_HEIGHT,
        width: springWidth,
        borderRadius: PILL_RADIUS,
        backgroundColor: pillColor,
        opacity: swipePosition ? pressBlend : allLayoutsReady ? 1 : 0,
        transform: [{ translateX: springX }],
      }}
    />
  );
}

function SwipeTabButtonOverlay({
  swipePillBlend,
  swipeTX,
  swipeRefWidth,
}: {
  swipeTX: React.RefObject<Animated.AnimatedInterpolation<number> | null>;
  swipePillBlend: Animated.Value;
  swipeRefWidth: React.MutableRefObject<number>;
}) {
  const theme = useTheme();
  const pillColor = theme.mutedStrong.val;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: PILL_HEIGHT,
        width: swipeRefWidth.current,
        borderRadius: PILL_RADIUS,
        backgroundColor: pillColor,
        opacity: swipePillBlend,
        transform: [{ translateX: swipeTX.current! }],
      }}
    />
  );
}
