import { Footprint } from '@/types';
import { Plane } from '@tamagui/lucide-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import MapView from 'react-native-maps';
import { Text } from 'tamagui';
import FadeWrapper from '../ui/FadeWrapper';
import CustomPolyline from './CustomPolyline';
import FootprintMarker from './FootprintMarker';
import MapFootprintModal from './MapFootprintModal';

const { width, height } = Dimensions.get('window');
const MAP_PADDING = Math.min(width, height) * 0.1;

const FOOTPRINT_COLORS = [
  '#9BC4D1', // primary
  '#C8E4C1', // chart3
  '#F5D5A8', // chart4
  '#D5B8E8', // chart5
  '#E89B8F', // destructive
  '#E8D5B7', // secondary
  '#C8DEE6', // accent
  '#8B7355', // mutedForeground
];

interface PathMapViewProps {
  isLoading: boolean;
  footprints: Footprint[];
}

const toDateKey = (date: string) => date.split('T')[0];

export default function PathMapView({ isLoading, footprints }: PathMapViewProps) {
  const mapRef = useRef<MapView>(null);
  const [selectedFootprint, setSelectedFootprint] = useState<Footprint | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [focusedDateIndex, setFocusedDateIndex] = useState(0);

  const validFootprints = useMemo(
    () =>
      footprints
        .filter((f) => f.locations.length > 0)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [footprints]
  );

  // 중복 제거된 날짜 배열 (오래된 순)
  const uniqueDates = useMemo(() => {
    const seen = new Set<string>();
    return validFootprints
      .map((f) => toDateKey(f.date))
      .filter((date) => {
        if (seen.has(date)) return false;
        seen.add(date);
        return true;
      });
  }, [validFootprints]);

  const footprintColors = useMemo(() => {
    const colorMap: Record<string, string> = {};
    validFootprints.forEach((f, i) => {
      colorMap[f.id] = FOOTPRINT_COLORS[i % FOOTPRINT_COLORS.length];
    });
    return colorMap;
  }, [validFootprints]);

  const allCoords = useMemo(
    () =>
      validFootprints.flatMap((f) =>
        f.locations.map((loc) => ({ latitude: loc.latitude!, longitude: loc.longitude! }))
      ),
    [validFootprints]
  );

  const focusOnDate = (dateIndex: number, animated: boolean = true) => {
    const date = uniqueDates[dateIndex];
    if (!date) return;
    const coords = validFootprints
      .filter((f) => toDateKey(f.date) === date)
      .flatMap((f) =>
        f.locations.map((loc) => ({ latitude: loc.latitude!, longitude: loc.longitude! }))
      );
    if (coords.length === 0) return;
    mapRef.current?.fitToCoordinates(coords, {
      edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
      animated,
    });
  };

  useEffect(() => {
    if (allCoords.length === 0) return;
    setTimeout(() => {
      mapRef.current?.fitToCoordinates(allCoords, {
        edgePadding: {
          top: MAP_PADDING,
          right: MAP_PADDING,
          bottom: MAP_PADDING,
          left: MAP_PADDING,
        },
        animated: false,
      });
    }, 300);
  }, [allCoords]);

  const handleSelectFootprint = (footprint: Footprint) => {
    setSelectedFootprint(footprint);
    setShowModal(true);

    const coords = footprint.locations.map((loc) => ({
      latitude: loc.latitude!,
      longitude: loc.longitude!,
    }));
    mapRef.current?.fitToCoordinates(coords, {
      edgePadding: { top: 80, right: 80, bottom: 320, left: 80 },
      animated: true,
    });
  };

  const handleDeselect = () => {
    setSelectedFootprint(null);
  };

  const handleCloseModal = () => {
    setSelectedFootprint(null);
    setShowModal(false);
  };

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

  return (
    <FadeWrapper>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          showsPointsOfInterest={false} // ← 이거 추가 후 테스트
          style={StyleSheet.absoluteFillObject}
          onPress={() => {
            handleDeselect();
          }}
        >
          {/* 1. non-selected polylines */}
          {validFootprints
            .filter((f) => f.id !== selectedFootprint?.id)
            .map((footprint) => {
              const color = footprintColors[footprint.id];
              const coords = footprint.locations.map((loc) => ({
                latitude: loc.latitude!,
                longitude: loc.longitude!,
              }));
              return (
                <CustomPolyline
                  key={`${footprint.id}-${selectedFootprint !== null ? 'dim' : 'normal'}`}
                  coordinates={coords}
                  color={color}
                  isSelected={false}
                  isDeselected={selectedFootprint !== null}
                  onPress={() => {
                    handleSelectFootprint(footprint);
                  }}
                />
              );
            })}

          {/* 2. dim overlay */}
          {/* <MapDimOverlay visible={selectedFootprint !== null} onPress={handleDeselect} /> */}

          {/* 3. selected polyline (above dim overlay) */}
          {selectedFootprint &&
            (() => {
              const color = footprintColors[selectedFootprint.id];
              const coords = selectedFootprint.locations.map((loc) => ({
                latitude: loc.latitude!,
                longitude: loc.longitude!,
              }));
              return (
                <CustomPolyline
                  key={selectedFootprint.id}
                  coordinates={coords}
                  color={color}
                  isSelected={true}
                  isDeselected={false}
                  onPress={() => {
                    if (selectedFootprint) {
                      handleDeselect();
                    }
                    handleSelectFootprint(selectedFootprint);
                  }}
                />
              );
            })()}

          {/* 4. markers (always on top) */}
          {validFootprints.map((footprint) => {
            const color = footprintColors[footprint.id];
            const isSelected = selectedFootprint?.id === footprint.id;

            return footprint.locations.map((loc, index) => (
              <FootprintMarker
                key={`${footprint.id}-${index}`}
                coordinate={{ latitude: loc.latitude!, longitude: loc.longitude! }}
                color={color}
                isSelected={isSelected}
                index={index}
                onPress={() => {
                  handleSelectFootprint(footprint);
                }}
              />
            ));
          })}
        </MapView>

        <MapFootprintModal
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
  navOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  navButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navCounter: {
    fontSize: 14,
    color: '#30221B',
    fontWeight: '600',
  },
});
