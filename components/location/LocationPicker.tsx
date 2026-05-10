import useLocation from '@/hooks/useLocation';
import { ArrowLeft, Clock, MapPin, Plane } from '@tamagui/lucide-icons';
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
  const [locationSource, setLocationSource] = useState<'current' | 'lastKnown' | 'fallback'>(
    'current'
  );
  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();

  const {
    status: locationPermissionStatus,
    getCurrentPositionWithRetry,
    getLastKnownPositionWithRetry,
  } = useLocation();

  useEffect(() => {
    if (locationPermissionStatus === null) return;

    (async () => {
      try {
        if (locationPermissionStatus !== 'granted') {
          await Location.requestForegroundPermissionsAsync();
          return;
        }
        const loc = await getCurrentPositionWithRetry(
          { accuracy: Location.Accuracy.Balanced },
          { timeoutMs: 600 }
        );

        setInitialLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setLocationSource('current');
      } catch {
        const loc = await getLastKnownPositionWithRetry({}, { timeoutMs: 600 });
        if (loc) {
          setInitialLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
          setLocationSource('lastKnown');
        } else {
          setInitialLocation({
            latitude: 37.5,
            longitude: 127.0,
            latitudeDelta: 5.0,
            longitudeDelta: 5.0,
          });
          setLocationSource('fallback');
        }
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

  useEffect(() => {
    if (!visible) return;
    if (locationSource === 'lastKnown') {
      Toast.show({
        type: 'info',
        text1: '실시간 위치를 가져올 수 없어요',
        text2: '이전 위치를 기준으로 지도가 열립니다',
        position: 'bottom',
        visibilityTime: 3000,
      });
    }
    if (locationSource === 'fallback') {
      Toast.show({
        type: 'error',
        text1: '위치를 가져올 수 없어요',
        text2: '지도가 서울 중심으로 열립니다',
        position: 'bottom',
        visibilityTime: 3000,
      });
    }
  }, [visible, locationSource]);

  const handleMapPress = (e: MapPressEvent) => {
    setSelected(e.nativeEvent.coordinate);
  };

  if (!visible) return null;

  return (
    <View style={styles.fullscreen}>
      <View style={styles.modalContainer}>
        <View style={styles.container}>
          {loading ? (
            <YStack flex={1} justifyContent="center" alignItems="center">
              <Plane width={24} height={24} color="#A0A0A0" />
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
                {locationSource === 'lastKnown' && (
                  <View style={styles.amberChip}>
                    <Clock size={12} color="#92400E" />
                    <Text style={styles.amberChipText}>이전 위치 기준</Text>
                  </View>
                )}
              </Stack>

              {locationSource === 'fallback' && !selected && (
                <View style={styles.fallbackCard}>
                  <MapPin size={20} color="#6B7280" />
                  <Text style={styles.fallbackCardTitle}>위치를 가져올 수 없어요</Text>
                  <Text style={styles.fallbackCardSub}>
                    검색하거나 지도를 탭해서 직접 선택해 주세요
                  </Text>
                </View>
              )}

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
  amberChip: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },
  amberChipText: { color: '#92400E', fontSize: 12, fontWeight: '500' },
  fallbackCard: {
    position: 'absolute',
    top: '30%',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  fallbackCardTitle: { color: '#374151', fontSize: 15, fontWeight: '600' },
  fallbackCardSub: { color: '#6B7280', fontSize: 13, textAlign: 'center' },
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
