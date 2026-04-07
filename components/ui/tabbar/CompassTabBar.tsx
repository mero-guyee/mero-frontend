import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Backpack, BookOpen, Map, Settings, Wallet } from '@tamagui/lucide-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

const TABS = [
  { name: 'backpack', label: '배낭', Icon: Backpack },
  { name: 'footprint', label: '일지', Icon: BookOpen },
  { name: 'map', label: '지도', Icon: Map },
  { name: 'expense', label: '지갑', Icon: Wallet },
  { name: 'settings', label: '설정', Icon: Settings },
];

const { width: WIDTH } = Dimensions.get('window');
const RADIUS = WIDTH * 0.23;
const TAB_SIZE = 56;
const COMPASS_SIZE = 62;
const BOTTOM_INSET = 16;
const CONTAINER_HEIGHT = RADIUS + COMPASS_SIZE + BOTTOM_INSET;
const COMPASS_CY = CONTAINER_HEIGHT - BOTTOM_INSET - COMPASS_SIZE / 2;

const ANGLES_DEG = [-180, -135, -90, -45, 0];
const ANGLES_RAD = ANGLES_DEG.map((d) => (d * Math.PI) / 180);

function getTabPos(i: number) {
  const a = ANGLES_RAD[i];
  return {
    left: WIDTH / 2 + RADIUS * Math.cos(a) - TAB_SIZE / 2,
    top: COMPASS_CY + RADIUS * Math.sin(a) - TAB_SIZE / 2,
  };
}

function getNeedleRot(idx: number) {
  return 90 + ANGLES_DEG[idx];
}

export default function CompassTabBar({ state, navigation }: BottomTabBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeIdx = Math.max(
    0,
    TABS.findIndex((t) => t.name === state.routes[state.index]?.name)
  );

  const tabAnims = useRef(TABS.map(() => new Animated.Value(0))).current;
  const needleRot = useRef(new Animated.Value(getNeedleRot(activeIdx))).current;
  const compassRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const forward = tabAnims.map((anim) =>
      Animated.spring(anim, {
        toValue: isOpen ? 1 : 0,
        useNativeDriver: true,
        speed: isOpen ? 14 : 20,
        bounciness: isOpen ? 10 : 2,
      })
    );
    const reversed = [...forward].reverse();

    Animated.spring(compassRotate, {
      toValue: isOpen ? 1 : 0,
      useNativeDriver: true,
      speed: 14,
      bounciness: 6,
    }).start();

    if (isOpen) {
      Animated.stagger(55, forward).start();
    } else {
      Animated.stagger(35, reversed).start();
    }
  }, [isOpen, compassRotate, tabAnims]);

  useEffect(() => {
    const idx = Math.max(
      0,
      TABS.findIndex((t) => t.name === state.routes[state.index]?.name)
    );
    Animated.spring(needleRot, {
      toValue: getNeedleRot(idx),
      useNativeDriver: true,
      speed: 12,
      bounciness: 8,
    }).start();
  }, [state.index, state.routes, needleRot]);

  const needleDeg = needleRot.interpolate({
    inputRange: [-180, 180],
    outputRange: ['-180deg', '180deg'],
  });

  const compassDeg = compassRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  if (state.index === 5) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {TABS.map((tab, i) => {
        const route = state.routes.find((r) => r.name === tab.name);
        if (!route) return null;
        const isFocused = state.index === i;
        const color = isFocused ? '#9BC4D1' : '#8B7355';
        const pos = getTabPos(i);
        const anim = tabAnims[i];

        return (
          <Animated.View
            key={tab.name}
            pointerEvents={isOpen ? 'auto' : 'none'}
            style={[
              styles.tabDot,
              { left: pos.left, top: pos.top },
              {
                opacity: anim,
                transform: [
                  {
                    scale: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Pressable
              style={styles.tabPressable}
              onPress={() => {
                if (!isFocused) navigation.navigate(route.name);
              }}
            >
              <View style={[styles.tabCircle, isFocused && styles.tabCircleActive]}>
                <tab.Icon size={18} color={color} />
              </View>
              <Text style={[styles.label, { color }]}>{tab.label}</Text>
            </Pressable>
          </Animated.View>
        );
      })}

      <View style={{ ...styles.compassWrapper }}>
        <Pressable onPress={() => setIsOpen((p) => !p)} style={styles.compassButton}>
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View style={[styles.tick, styles.tickN]} />
            <View style={[styles.tick, styles.tickS]} />
            <View style={[styles.tickH, styles.tickE]} />
            <View style={[styles.tickH, styles.tickW]} />
          </View>
          <Animated.View style={[styles.needleContainer, { transform: [{ rotate: needleDeg }] }]}>
            <View style={styles.needleTop} />
            <View style={styles.needleBottom} />
          </Animated.View>
          <View style={styles.needleCap} />
          <Animated.View style={[styles.openRing, { transform: [{ rotate: compassDeg }] }]} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    height: CONTAINER_HEIGHT,
    backgroundColor: 'transparent',
  },
  compassWrapper: {
    position: 'absolute',
    bottom: BOTTOM_INSET,
    left: WIDTH / 2 - COMPASS_SIZE / 2,
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    zIndex: 20,
  },
  compassButton: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    borderRadius: COMPASS_SIZE / 2,
    backgroundColor: '#FFFBF0',
    borderWidth: 2,
    borderColor: '#D4B896',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B7355',
    shadowOffset: { width: 12, height: 12 },
    shadowOpacity: 1.92,
    shadowRadius: 17,
    elevation: 2,
  },
  tick: {
    position: 'absolute',
    width: 2,
    height: 6,
    backgroundColor: '#C4A882',
    borderRadius: 1,
    left: COMPASS_SIZE / 2 - 1,
  },
  tickN: { top: 5 },
  tickS: { bottom: 5 },
  tickH: {
    position: 'absolute',
    width: 6,
    height: 2,
    backgroundColor: '#C4A882',
    borderRadius: 1,
    top: COMPASS_SIZE / 2 - 1,
  },
  tickE: { right: 5 },
  tickW: { left: 5 },
  needleContainer: {
    position: 'absolute',
    alignItems: 'center',
    width: 4,
    height: 30,
  },
  needleTop: {
    width: 3,
    height: 13,
    backgroundColor: '#9BC4D1',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  needleBottom: {
    width: 3,
    height: 13,
    backgroundColor: '#D4A96A',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  needleCap: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B7355',
  },
  openRing: {
    position: 'absolute',
    width: COMPASS_SIZE - 8,
    height: COMPASS_SIZE - 8,
    borderRadius: (COMPASS_SIZE - 8) / 2,
    borderWidth: 1,
    borderColor: 'transparent',
    borderTopColor: '#9BC4D1',
    borderRightColor: '#9BC4D1',
  },
  tabDot: {
    position: 'absolute',
    width: TAB_SIZE,
    height: TAB_SIZE,
    zIndex: 10,
  },
  tabPressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFBF0',
    borderWidth: 0,
    borderColor: '#D4B896',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B7355',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  tabCircleActive: {
    backgroundColor: '#E8F4F8',
    borderColor: '#9BC4D1',
    shadowColor: '#9BC4D1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 7,
  },
  label: {
    fontSize: 9,
    fontFamily: 'ui-serif',
    marginTop: 2,
    textAlign: 'center',
  },
});
