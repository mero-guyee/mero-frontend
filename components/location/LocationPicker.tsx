import useLocation from '@/hooks/useLocation';
import { ArrowLeft } from '@tamagui/lucide-icons';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { MapPressEvent } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, XStack, YStack } from 'tamagui';
import LocationSearch from './LocationSearch';
import LocationView from './LocationView';

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
  visible: boolean;
  onClose: () => void;
  onConfirm: (coord: Coordinate) => void;
};

export default function LocationPicker({ visible, onClose, onConfirm }: Props) {
  const [initialLocation, setInitialLocation] = useState<null | {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }>(null);
  const [selected, setSelected] = useState<Coordinate | null>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();
  const [showHint, setShowHint] = useState(false);

  const { status: locationPermissionStatus } = useLocation();

  useEffect(() => {
    if (locationPermissionStatus === null) return;

    (async () => {
      try {
        if (locationPermissionStatus !== 'granted') {
          await Location.requestForegroundPermissionsAsync();
          return;
        }

        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 1000)
        );

        const loc = (await Promise.race([
          Location.getCurrentPositionAsync({
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
      } catch (e) {
        console.warn('Failed to get location, using default. Error:', e);
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
  }, [locationPermissionStatus]);

  useEffect(() => {
    if (!visible) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [visible, onClose]);

  const handleMapPress = (e: MapPressEvent) => {
    setSelected(e.nativeEvent.coordinate);
  };

  if (!visible) return null;

  return (
    <View
      style={styles.fullscreen}
      onTouchStart={() => {
        setShowHint((prev) => !prev);
      }}
      onTouchEnd={() => {
        setShowHint((prev) => !prev);
      }}
    >
      <View style={styles.modalContainer}>
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
              <LocationView
                mapRef={mapRef}
                initialLocation={initialLocation}
                onMapPress={handleMapPress}
                selected={selected}
              />
              <Stack position="absolute" width="100%">
                <XStack
                  flex={1}
                  alignItems="flex-start"
                  justifyContent="space-between"
                  gap="$3.5"
                  paddingHorizontal={16}
                  paddingTop={insets.top + 8}
                >
                  <View style={{ height: 44, justifyContent: 'center' }}>
                    <Pressable onPress={() => onClose()} hitSlop={16}>
                      <ArrowLeft />
                    </Pressable>
                  </View>
                  <LocationSearch mapRef={mapRef} setSelected={setSelected} />
                </XStack>
              </Stack>

              {selected && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    onConfirm(selected);
                    onClose();
                  }}
                >
                  <Text style={styles.buttonText} pointerEvents="none">
                    이 위치로 선택
                  </Text>
                </TouchableOpacity>
              )}
              {!selected && showHint && (
                <View style={{ ...styles.hint, bottom: insets.bottom + 16 }} pointerEvents="none">
                  <Text style={styles.hintText}>지도를 탭해서 위치를 선택하세요</Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    zIndex: 999,
    backgroundColor: '#fff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  closeButton: {
    width: 48,
  },
  closeText: {
    // position: 'absolute',

    color: '#007AFF',
  },
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#EDF6F9',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hint: {
    position: 'absolute',
    bottom: 16,
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
