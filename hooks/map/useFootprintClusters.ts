import { Footprint } from '@/types';
import { useEffect, useRef, useState } from 'react';
import MapView, { Region } from 'react-native-maps';
import Supercluster from 'supercluster';

type FootprintPoint = Supercluster.PointFeature<{ footprintId: string }>;

const JITTER_RADIUS_DEG = 0.00008;

export function useFootprintClusters(
  mapRef: React.RefObject<MapView | null>,
  validFootprints: Footprint[]
) {
  const scRef = useRef(new Supercluster<{ footprintId: string }>({ radius: 60, maxZoom: 16 }));
  const currentRegionRef = useRef<Region | null>(null);
  const [clusters, setClusters] = useState<ReturnType<typeof scRef.current.getClusters>>([]);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateClusters = (region: Region) => {
    const zoom = Math.min(20, Math.round(Math.log(360 / region.longitudeDelta) / Math.LN2));
    const bbox: [number, number, number, number] = [
      region.longitude - region.longitudeDelta / 2,
      region.latitude - region.latitudeDelta / 2,
      region.longitude + region.longitudeDelta / 2,
      region.latitude + region.latitudeDelta / 2,
    ];
    setClusters(scRef.current.getClusters(bbox, zoom));
  };

  useEffect(() => {
    const rawPoints = validFootprints.flatMap((f) =>
      f.locations.map((loc) => ({
        footprintId: f.id,
        latitude: loc.latitude!,
        longitude: loc.longitude!,
      }))
    );

    const groups = new Map<string, typeof rawPoints>();
    rawPoints.forEach((p) => {
      const key = `${p.latitude},${p.longitude}`;
      const group = groups.get(key);
      if (group) group.push(p);
      else groups.set(key, [p]);
    });

    const points: FootprintPoint[] = [];
    groups.forEach((group) => {
      group.forEach((p, i) => {
        let { latitude, longitude } = p;
        if (group.length > 1) {
          const angle = (2 * Math.PI * i) / group.length;
          latitude += JITTER_RADIUS_DEG * Math.sin(angle);
          longitude += (JITTER_RADIUS_DEG * Math.cos(angle)) / Math.cos((latitude * Math.PI) / 180);
        }
        points.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [longitude, latitude] },
          properties: { footprintId: p.footprintId },
        });
      });
    });

    scRef.current.load(points);
    if (currentRegionRef.current) updateClusters(currentRegionRef.current);
  }, [validFootprints]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleRegionChangeComplete = (region: Region) => {
    currentRegionRef.current = region;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => updateClusters(region), 150);
  };

  const handleClusterPress = (clusterId: number, latitude: number, longitude: number) => {
    const expansionZoom = scRef.current.getClusterExpansionZoom(clusterId);
    const delta = 360 / Math.pow(2, expansionZoom);
    mapRef.current?.animateToRegion(
      { latitude, longitude, latitudeDelta: delta, longitudeDelta: delta },
      300
    );
  };

  return { clusters, handleRegionChangeComplete, handleClusterPress, currentRegionRef };
}
