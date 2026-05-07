import useLocation from '@/hooks/useLocation';
import { ArrowLeft, Plane } from '@tamagui/lucide-icons';
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
import Toast from 'react-native-toast-message';
import { Stack, XStack, YStack } from 'tamagui';
import LocationSearch from './LocationSearch';
import LocationView from './LocationView';

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
  const [isMapSuccessfullyLoaded, setIsMapSuccessfullyLoaded] = useState(false);
  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();

  const { status: locationPermissionStatus, getCurrentPositionWithRetry } = useLocation();

  useEffect(() => {
    if (locationPermissionStatus === null) return;

    (async () => {
      try {
        if (locationPermissionStatus !== 'granted') {
          await Location.requestForegroundPermissionsAsync();
          return;
        }
        const loc = await getCurrentPositionWithRetry({ accuracy: Location.Accuracy.Balanced });

        setInitialLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setIsMapSuccessfullyLoaded(true);
        Toast.show({ type: 'success', text1: '현재 위치를 불러왔어요' });
      } catch {
        setIsMapSuccessfullyLoaded(false);
        Toast.show({ type: 'error', text1: '위치를 불러오지 못했어요' });
        (async () => {
          const loc = await Location.getLastKnownPositionAsync();
          if (loc)
            setInitialLocation({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
        })();
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <View style={styles.fullscreen}>
      <View style={styles.modalContainer}>
        <View style={styles.container}>
          {loading ? (
            <YStack flex={1} position="relative">
              <SkeletonBox width="100%" height="100%" borderRadius={0} />
              <YStack position="absolute" top={16} width="90%" alignSelf="center">
                <Text>지도를 가져오는 중</Text>
                <Plane width={24} height={24} color="#A0A0A0" />
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
            </>
          )}
        </View>
      </View>
      <Toast />
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
