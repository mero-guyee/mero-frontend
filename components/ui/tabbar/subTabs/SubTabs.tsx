import { useRef, useState } from 'react';
import { Animated } from 'react-native';
import { Text, XStack, YStack, type YStackProps } from 'tamagui';

import { TabButtonOverlay } from './TabButtonOverlay';
import { useClickAnimation } from './useClickAnimation';
import { useSwipeAnimation } from './useSwipeAnimation';

interface Tab<T extends string> {
  value: T;
  label: string;
}

interface SubTabsProps<T extends string> extends Omit<YStackProps, 'children'> {
  tabs: Tab<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  swipePosition?: Animated.AnimatedInterpolation<number>;
}

const PILL_HEIGHT = 32;

export function SubTabs<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  swipePosition,
  ...containerProps
}: SubTabsProps<T>) {
  const { swipePillBlend, swipeTX, swipeRefWidth, initSwipe } = useSwipeAnimation();
  const { springX, springWidth, pressBlend, initSpring, animateTo } = useClickAnimation();

  const tabLayouts = useRef<Record<string, { x: number; width: number }>>({});
  const initialized = useRef(false);
  const [allLayoutsReady, setAllLayoutsReady] = useState(false);

  const handleLayout = (value: string, x: number, width: number) => {
    tabLayouts.current[value] = { x, width };

    const allMeasured = tabs.every((t) => tabLayouts.current[t.value]);
    if (!allMeasured || initialized.current) return;

    const activeLayout = tabLayouts.current[activeTab];
    if (activeLayout) initSpring(activeLayout);

    if (swipePosition) {
      initSwipe(
        tabs.map((t) => t.value),
        tabLayouts.current,
        swipePosition
      );
    }

    initialized.current = true;
    setAllLayoutsReady(true);
  };

  const handleTabChange = (tab: T) => {
    const target = tabLayouts.current[tab];
    const current = tabLayouts.current[activeTab];

    if (target) {
      animateTo(target, current, !!swipePosition, swipePillBlend);
    }

    onTabChange(tab);
  };

  return (
    <YStack padding="$4" {...containerProps}>
      <XStack columnGap="$3" position="relative">
        {allLayoutsReady && swipePosition && (
          <TabButtonOverlay.Swipe
            swipePillBlend={swipePillBlend}
            swipeTX={swipeTX}
            swipeRefWidth={swipeRefWidth}
          />
        )}

        <TabButtonOverlay.Click
          springWidth={springWidth}
          springX={springX}
          pressBlend={pressBlend}
          swipePosition={swipePosition}
          allLayoutsReady={allLayoutsReady}
        />

        {tabs.map((tab) => (
          <XStack
            key={tab.value}
            onLayout={(e) => {
              const { x, width } = e.nativeEvent.layout;
              handleLayout(tab.value, x, width);
            }}
            borderRadius="$3"
            h={PILL_HEIGHT}
            paddingHorizontal="$3"
            alignItems="center"
            pressStyle={{ opacity: 0.7 }}
            onPress={() => handleTabChange(tab.value)}
            zIndex={1}
          >
            <Text
              color={activeTab === tab.value ? '$foreground' : '$mutedForeground'}
              fontSize={14}
              fontWeight="500"
            >
              {tab.label}
            </Text>
          </XStack>
        ))}
      </XStack>
    </YStack>
  );
}
