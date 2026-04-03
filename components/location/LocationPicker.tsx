import useLocation from '@/hooks/useLocation';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { MapPressEvent, Marker } from 'react-native-maps';
import { YStack } from 'tamagui';

function SkeletonBox({
  width,
  height,
  borderRadius = 8,
}: {
  width: number | `${number}%`;
  height: number | `${number}%`;
  borderRadius?: number;
}) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View style={{ width, height, borderRadius, backgroundColor: '#D0D0D0', opacity }} />
  );
}

type Coordinate = {
  latitude: number;
  longitude: number;
};

type Props = {
  onConfirm: (coord: Coordinate) => void;
};

export default function LocationPicker({ onConfirm }: Props) {
  const [initialLocation, setInitialLocation] = useState<null | {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }>(null);
  const [selected, setSelected] = useState<Coordinate | null>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView>(null);

  const { status: locationPermissionStatus } = useLocation();

  useEffect(() => {
    (async () => {
      try {
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 1000)
        );

        if (locationPermissionStatus === 'granted') {
          const loc = (await Promise.race([
            await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            }),
            timeout,
          ])) as Location.LocationObject;

          setInitialLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        } else {
          await Location.requestForegroundPermissionsAsync();
        }
      } catch (e) {
        setInitialLocation({
          latitude: 37.5665,
          longitude: 126.978,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleMapPress = (e: MapPressEvent) => {
    setSelected(e.nativeEvent.coordinate);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <YStack flex={1} position="relative">
          <SkeletonBox width="100%" height="100%" borderRadius={0} />
          <YStack position="absolute" top={16} width="90%" alignSelf="center">
            <SkeletonBox width="100%" height={44} />
          </YStack>
        </YStack>
      ) : (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={initialLocation!}
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

                listView: {
                  maxHeight: 200, // 이 값이 없으면 리스트가 무한 늘어나서 스크롤이 안 생김
                },
              },
              textInput: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12 },
            }}
            placeholder="장소 검색"
            query={{
              key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!,
              language: ['ko', 'en'],
            }}
            onPress={(_, details = null) => {
              const lat = details?.geometry?.location.lat;
              const lng = details?.geometry?.location.lng;

              mapRef.current?.animateToRegion({
                latitude: lat!,
                longitude: lng!,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              });

              setSelected({ latitude: lat!, longitude: lng! });
            }}
            fetchDetails={true}
            renderRow={(rowData) => (
              <View style={{ padding: 12 }}>
                <Text>{rowData.structured_formatting.main_text}</Text>
                <Text style={{ color: '#666', fontSize: 12 }}>
                  {rowData.structured_formatting.secondary_text}
                </Text>
              </View>
            )}
          />
          {!selected && (
            <View style={styles.hint}>
              <Text style={styles.hintText}>지도를 탭해서 위치를 선택하세요</Text>
            </View>
          )}
          {selected && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                onConfirm(selected);
              }}
            >
              <Text style={styles.buttonText}>이 위치로 선택</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    aspectRatio: 1,
    position: 'relative',
    backgroundColor: '#EDF6F9',
    borderRadius: 16,
    overflow: 'hidden',
  },
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
