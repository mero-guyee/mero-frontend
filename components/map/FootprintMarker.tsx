import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { darkenHex } from './CustomPolyline';

interface FootprintMarkerProps {
  coordinate: { latitude: number; longitude: number };
  color: string;
  isSelected: boolean;
  index: number;
  onPress: () => void;
}

export default function FootprintMarker({
  coordinate,
  color,
  isSelected,
  index,
  onPress,
}: FootprintMarkerProps) {
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
            borderWidth: 3.5,
            shadowColor: color,
            shadowOpacity: 0.8,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 0 },
            elevation: 12,
          },
        ]}
      >
        <Text style={[styles.markerText, { color: darkenHex(color, 0.7) }]}>{index + 1}</Text>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  marker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: 'black',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  markerText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
