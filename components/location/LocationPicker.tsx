import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
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
  const mapRef = useRef<MapView>(null);
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
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion!}
        onPress={handleMapPress}
      >
        {selected && <Marker coordinate={selected} />}
      </MapView>
      <GooglePlacesAutocomplete
        listViewDisplayed="auto"
        styles={{
          container: {
            position: 'absolute',
            top: 16,
            width: '90%',
            alignSelf: 'center',
            zIndex: 1,
          },
          textInput: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12 },
        }}
        placeholder="장소 검색"
        query={{
          key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!,
          language: ['ko', 'en'],
        }}
        onPress={(data, details = null) => {
          const lat = details?.geometry?.location.lat;
          const lng = details?.geometry?.location.lng;

          console.log(lat, lng);
          mapRef.current?.animateToRegion({
            latitude: lat!,
            longitude: lng!,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }}
        fetchDetails={true} // 좌표 받으려면 필수
      />
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
  container: { flex: 1, position: 'relative' },
  map: { flex: 1, aspectRatio: 1 },
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
