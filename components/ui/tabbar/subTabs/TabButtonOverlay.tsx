import { Animated } from 'react-native';

const PILL_HEIGHT = 32;
const PILL_RADIUS = 8;
const PILL_COLOR = '#C8DEE6';

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
        backgroundColor: PILL_COLOR,
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
        backgroundColor: PILL_COLOR,
        opacity: swipePillBlend,
        transform: [{ translateX: swipeTX.current! }],
      }}
    />
  );
}
