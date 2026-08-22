import { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';

const BASE_SIZE = 45;
const SELECTED_SIZE = 55;
const TRIANGLE_HEIGHT = 10;
const TRIANGLE_HEIGHT_SELECTED = 13;
const CONTAINER_WIDTH = SELECTED_SIZE;
const CONTAINER_HEIGHT = SELECTED_SIZE + TRIANGLE_HEIGHT_SELECTED - 1;

interface PinMarkerProps {
  coordinate: { latitude: number; longitude: number };
  color: string;
  isSelected: boolean;

  onPress: () => void;
}

function darkenHex(hex: string, amount: number = 0.4): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const dr = Math.max(0, Math.round(r * (1 - amount)));
  const dg = Math.max(0, Math.round(g * (1 - amount)));
  const db = Math.max(0, Math.round(b * (1 - amount)));
  return `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`;
}

export default function PinMarker({ coordinate, color, isSelected, onPress }: PinMarkerProps) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    setTracksViewChanges(true);
    const timer = setTimeout(() => setTracksViewChanges(false), 100);
    return () => clearTimeout(timer);
  }, [isSelected]);

  return (
    <Marker
      coordinate={coordinate}
      tracksViewChanges={tracksViewChanges}
      onPress={onPress}
      anchor={{ x: 0.5, y: 1.0 }}
    >
      <View style={styles.container}>
        <View style={styles.pinContent}>
          <View
            style={[
              styles.circle,
              { backgroundColor: color, borderColor: darkenHex(color, 0.35) },
              isSelected && styles.circleSelected,
            ]}
          >
            <Image
              source={require('@/assets/icon.png')}
              style={styles.icon}
              resizeMode="cover"
              onLoad={() => {
                hasLoadedRef.current = true;
                setTracksViewChanges(false);
              }}
            />
          </View>
          <View
            style={[
              styles.triangle,
              { borderTopColor: darkenHex(color, 0.35) },
              isSelected && styles.triangleSelected,
            ]}
          />
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CONTAINER_WIDTH,
    height: CONTAINER_HEIGHT,
  },
  pinContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  circle: {
    width: BASE_SIZE,
    height: BASE_SIZE,
    borderRadius: BASE_SIZE / 2,
    borderWidth: 6,
    overflow: 'hidden',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 8,
  },
  circleSelected: {
    width: SELECTED_SIZE,
    height: SELECTED_SIZE,
    borderRadius: SELECTED_SIZE / 2,
  },
  icon: {
    width: '100%',
    height: '100%',
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: TRIANGLE_HEIGHT,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  triangleSelected: {
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderTopWidth: TRIANGLE_HEIGHT_SELECTED,
  },
});
