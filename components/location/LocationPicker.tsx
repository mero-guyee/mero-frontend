import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { MapPressEvent, Marker } from 'react-native-maps';

type Coordinate = {
  latitude: number;
  longitude: number;
};

type Props = {
  onConfirm: (coord: Coordinate) => void;
};

export default function LocationPicker({ onConfirm }: Props) {
  const [initialRegion, setInitialRegion] = useState<null | {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }>(null);
  const [selected, setSelected] = useState<Coordinate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setInitialRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } else {
        // 권한 거부 시 서울 기본값
        setInitialRegion({
          latitude: 37.5665,
          longitude: 126.978,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
      setLoading(false);
    })();
  }, []);

  const handleMapPress = (e: MapPressEvent) => {
    setSelected(e.nativeEvent.coordinate);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion!} onPress={handleMapPress}>
        {selected && <Marker coordinate={selected} />}
      </MapView>

      {!selected && (
        <View style={styles.hint}>
          <Text style={styles.hintText}>지도를 탭해서 위치를 선택하세요</Text>
        </View>
      )}

      {selected && (
        <TouchableOpacity style={styles.button} onPress={() => onConfirm(selected)}>
          <Text style={styles.buttonText}>이 위치로 선택</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hint: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  hintText: { color: '#fff', fontSize: 14 },
  button: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
