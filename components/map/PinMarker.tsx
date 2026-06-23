import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';

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

export default function PinMarker({
  coordinate,
  color,
  isSelected,
  onPress,
}: PinMarkerProps) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  useEffect(() => {
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
      onLayout={() => setTracksViewChanges(false)}
    >
      <View style={styles.container}>
        <View
          style={[
            styles.circle,
            { backgroundColor: color, borderColor: darkenHex(color, 0.65) },
            isSelected && {
              borderWidth: 3.5,
              shadowColor: color,
              shadowOpacity: 0.9,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 0 },
              elevation: 14,
            },
          ]}
        >
          <Image source={require('@/assets/icon.png')} style={styles.icon} resizeMode="cover" />
        </View>
        <View style={[styles.triangle, { borderTopColor: darkenHex(color, 0.65) }]} />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  circle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 8,
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
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
});
