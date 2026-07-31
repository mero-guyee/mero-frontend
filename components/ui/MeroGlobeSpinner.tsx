import { Accelerometer } from 'expo-sensors';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, ViewStyle } from 'react-native';
import Svg, { Circle, ClipPath, Defs, Line, Path } from 'react-native-svg';

const TILT_MAX_TRANSLATE = 15;
const TILT_SMOOTHING = 0.2;

type MeroGlobeSpinnerProps = {
  size?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
};

export default function MeroGlobeSpinner({
  size = 96,
  duration = 9000,
  style,
}: MeroGlobeSpinnerProps) {
  const spin = useRef(new Animated.Value(0)).current;
  const tiltVertical = useRef(new Animated.Value(0)).current;
  const tiltHorizontal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [spin, duration]);

  useEffect(() => {
    let smoothedVertical = 0;
    let smoothedHorizontal = 0;

    Accelerometer.setUpdateInterval(50);
    const subscription = Accelerometer.addListener(({ x, y }) => {
      smoothedVertical += (y - smoothedVertical) * TILT_SMOOTHING;
      smoothedHorizontal += (x - smoothedHorizontal) * TILT_SMOOTHING;

      const clampedVertical = Math.max(-1, Math.min(1, smoothedVertical));
      const clampedHorizontal = Math.max(-1, Math.min(1, smoothedHorizontal));

      tiltVertical.setValue(-clampedVertical * TILT_MAX_TRANSLATE);
      tiltHorizontal.setValue(clampedHorizontal * TILT_MAX_TRANSLATE);
    });

    return () => subscription.remove();
  }, [tiltVertical, tiltHorizontal]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          transform: [{ translateX: tiltHorizontal }, { translateY: tiltVertical }],
        },
        style,
      ]}
    >
      <Animated.View style={{ width: size, height: size, transform: [{ rotate }] }}>
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <Defs>
            <ClipPath id="globeClip">
              <Circle cx="100" cy="100" r="94" />
            </ClipPath>
          </Defs>

          <Circle cx="100" cy="100" r="94" fill="#CBE0E5" stroke="#5C93A0" strokeWidth="3" />

          <Path
            d="M118,20 C132,18 144,28 142,42 C140,54 124,58 114,50 C106,44 106,26 118,20 Z"
            fill="#8FCB84"
            clipPath="url(#globeClip)"
          />
          <Path
            d="M40,68 C56,60 78,66 80,84 C82,100 66,112 50,106 C36,100 30,78 40,68 Z"
            fill="#8FCB84"
            clipPath="url(#globeClip)"
          />
          <Path
            d="M132,76 C158,70 182,88 180,112 C178,136 152,150 132,138 C114,128 112,92 132,76 Z"
            fill="#8FCB84"
            clipPath="url(#globeClip)"
          />
          <Path
            d="M72,146 C86,140 102,146 104,160 C106,172 92,182 78,178 C66,174 62,154 72,146 Z"
            fill="#8FCB84"
            clipPath="url(#globeClip)"
          />

          <Line
            x1="100"
            y1="6"
            x2="100"
            y2="194"
            stroke="#6FA3AE"
            strokeWidth="1.6"
            strokeDasharray="6 5"
            clipPath="url(#globeClip)"
          />
          <Line
            x1="10"
            y1="72"
            x2="190"
            y2="72"
            stroke="#6FA3AE"
            strokeWidth="1.6"
            strokeDasharray="6 5"
            clipPath="url(#globeClip)"
          />
          <Line
            x1="6"
            y1="100"
            x2="194"
            y2="100"
            stroke="#6FA3AE"
            strokeWidth="1.6"
            strokeDasharray="6 5"
            clipPath="url(#globeClip)"
          />
          <Line
            x1="14"
            y1="136"
            x2="186"
            y2="136"
            stroke="#6FA3AE"
            strokeWidth="1.6"
            strokeDasharray="6 5"
            clipPath="url(#globeClip)"
          />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}
