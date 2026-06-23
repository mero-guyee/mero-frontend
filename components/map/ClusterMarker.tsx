import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';

const CLUSTER_COLOR = '#6A9FB5';
const CLUSTER_BORDER_COLOR = '#3D6E82';

interface ClusterMarkerProps {
  coordinate: { latitude: number; longitude: number };
  count: number;
  onPress: () => void;
}

export default function ClusterMarker({ coordinate, count, onPress }: ClusterMarkerProps) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setTracksViewChanges(false), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Marker
      coordinate={coordinate}
      tracksViewChanges={tracksViewChanges}
      onPress={onPress}
      anchor={{ x: 0.5, y: 1.0 }}
      onLayout={() => setTracksViewChanges(false)}
    >
      <View style={styles.container}>
        <View style={styles.circle}>
          <Text style={styles.count}>{count}</Text>
        </View>
        <View style={styles.triangle} />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CLUSTER_COLOR,
    borderWidth: 2,
    borderColor: CLUSTER_BORDER_COLOR,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 8,
  },
  count: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderTopWidth: 13,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: CLUSTER_BORDER_COLOR,
    marginTop: -1,
  },
});
