import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { darkenHex } from './CustomPolyline';

interface FootprintClusterMarkerProps {
  coordinate: { latitude: number; longitude: number };
  color: string;
  isSelected: boolean;
  label: string;
  onPress: () => void;
}

export default function FootprintClusterMarker({
  coordinate,
  color,
  isSelected,
  label,
  onPress,
}: FootprintClusterMarkerProps) {
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
      anchor={{ x: 0.5, y: 0.5 }}
      onLayout={() => setTracksViewChanges(false)}
    >
      <View
        style={[
          styles.marker,
          { backgroundColor: color, borderColor: darkenHex(color, 0.65) },
          isSelected && {
            borderWidth: 3,
            shadowColor: color,
            shadowOpacity: 0.8,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 0 },
            elevation: 12,
          },
        ]}
      >
        <Text style={[styles.label, { color: darkenHex(color, 0.7) }]}>{label}</Text>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: 'black',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
});
