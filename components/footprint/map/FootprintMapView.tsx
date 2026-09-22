import { useFootprintMapData } from '@/hooks/map/useFootprintMapData';
import { useIsOffline } from '@/hooks/network/useIsOffline';
import { Footprint } from '@/types';
import { Plane } from '@tamagui/lucide-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ClusteredMapView from 'react-native-map-clustering';
import MapView from 'react-native-maps';
import { Text } from 'tamagui';
import { useTheme as useAppTheme } from '../../../contexts';
import ClusterMarker from '../../map/ClusterMarker';
import { darkMapStyle } from '../../map/darkMapStyle';
import MapOfflineFallback from '../../map/MapOfflineFallback';
import PinMarker from '../../map/PinMarker';
import FadeWrapper from '../../ui/FadeWrapper';
import FootprintMapModal from './FootprintMapModal';

const PIN_COLOR = '#9BC4D1';

interface FootprintMapViewProps {
  isLoading: boolean;
  footprints: Footprint[];
}

export default function FootprintMapView({ isLoading, footprints }: FootprintMapViewProps) {
  const mapRef = useRef<MapView>(null);
  const isSelectingRef = useRef(false);
  const [selectedFootprint, setSelectedFootprint] = useState<Footprint | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const isOffline = useIsOffline();
  const { theme } = useAppTheme();

  const { points, allCoords } = useFootprintMapData(footprints);

  const initialRegion = useMemo(() => {
    const target = allCoords[allCoords.length - 1];
    return {
      latitude: target?.latitude ?? 37.5665,
      longitude: target?.longitude ?? 126.978,
      latitudeDelta: 6,
      longitudeDelta: 6,
    };
  }, [allCoords]);

  const hasFocusedRef = useRef(false);

  useEffect(() => {
    if (hasFocusedRef.current || !isMapReady || allCoords.length === 0) return;
    hasFocusedRef.current = true;
    const target = allCoords[allCoords.length - 1];
    mapRef.current?.animateToRegion(
      {
        latitude: target.latitude,
        longitude: target.longitude,
        latitudeDelta: 6,
        longitudeDelta: 6,
      },
      300
    );
  }, [allCoords, isMapReady]);

  const handleSelectFootprint = (footprint: Footprint, latitude: number, longitude: number) => {
    isSelectingRef.current = true;
    setSelectedFootprint(footprint);
    setSelectedPoint({ latitude, longitude });
    setShowModal(true);
  };

  const handleDeselect = () => {
    if (isSelectingRef.current) {
      isSelectingRef.current = false;
      return;
    }
    setSelectedFootprint(null);
    setSelectedPoint(null);
  };

  const handleCloseModal = () => {
    setSelectedFootprint(null);
    setSelectedPoint(null);
    setShowModal(false);
  };

  const pinMarkers = useMemo(
    () =>
      points.map((p, i) => (
        <PinMarker
          key={`${p.footprint.id}-${i}`}
          coordinate={{ latitude: p.latitude, longitude: p.longitude }}
          color={PIN_COLOR}
          isSelected={
            selectedPoint?.latitude === p.latitude && selectedPoint?.longitude === p.longitude
          }
          onPress={() => handleSelectFootprint(p.footprint, p.latitude, p.longitude)}
        />
      )),
    [points, selectedPoint]
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Plane size={48} color="#C0B8B0" />
      </View>
    );
  }

  if (footprints.length === 0 || !footprints) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text>일지가 없습니다.</Text>
      </View>
    );
  }

  if (isOffline) {
    return <MapOfflineFallback />;
  }

  return (
    <FadeWrapper>
      <View style={styles.container}>
        <ClusteredMapView
          mapRef={(ref: React.Ref<MapView>) => {
            mapRef.current = ref as MapView | null;
          }}
          initialRegion={initialRegion}
          radius={60}
          maxZoom={16}
          renderCluster={({
            geometry,
            properties,
            onPress,
          }: {
            geometry: { coordinates: [number, number] };
            properties: { cluster_id: number; point_count: number };
            onPress: () => void;
          }) => (
            <ClusterMarker
              key={`cluster-${properties.cluster_id}`}
              coordinate={{
                latitude: geometry.coordinates[1],
                longitude: geometry.coordinates[0],
              }}
              count={properties.point_count}
              onPress={onPress}
            />
          )}
          showsPointsOfInterest={false}
          style={StyleSheet.absoluteFillObject}
          onMapReady={() => setIsMapReady(true)}
          onPress={handleDeselect}
          userInterfaceStyle={theme}
          customMapStyle={theme === 'dark' ? darkMapStyle : []}
        >
          {pinMarkers}
        </ClusteredMapView>

        <FootprintMapModal
          visible={showModal}
          onClose={handleCloseModal}
          footprint={selectedFootprint}
        />
      </View>
    </FadeWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
