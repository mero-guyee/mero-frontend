import MapView, { MapPressEvent, Marker } from 'react-native-maps';
import { View } from 'tamagui';

export default function LocationView({
  mapRef,
  initialLocation,
  onMapPress,
  selected,
}: {
  mapRef: React.RefObject<MapView | null>;
  initialLocation: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null;
  onMapPress: (e: MapPressEvent) => void;
  selected: { latitude: number; longitude: number } | null;
}) {
  return (
    <View
      style={{
        flex: 1,
        position: 'relative',
        backgroundColor: '#EDF6F9',
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      <View style={{ flex: 1, width: '100%', height: '100%', position: 'absolute' }}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={initialLocation!}
          onPress={onMapPress}
          zoomEnabled
          scrollEnabled
          rotateEnabled
          pointerEvents="box-none"
        >
          {selected && <Marker coordinate={selected} />}
        </MapView>
      </View>
    </View>
  );
}
