import { Footprint } from '@/types';
import { useMemo } from 'react';

const FOOTPRINT_COLORS = [
  '#9BC4D1',
  '#C8E4C1',
  '#F5D5A8',
  '#D5B8E8',
  '#E89B8F',
  '#E8D5B7',
  '#C8DEE6',
  '#8B7355',
];

export function useFootprintMapData(footprints: Footprint[]) {
  const validFootprints = useMemo(
    () =>
      footprints
        .filter((f) => f.locations.length > 0)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [footprints]
  );

  const footprintColors = useMemo(() => {
    const colorMap: Record<string, string> = {};
    validFootprints.forEach((f, i) => {
      colorMap[f.id] = FOOTPRINT_COLORS[i % FOOTPRINT_COLORS.length];
    });
    return colorMap;
  }, [validFootprints]);

  const footprintCentroids = useMemo(() => {
    const centroidMap: Record<string, { latitude: number; longitude: number }> = {};
    validFootprints.forEach((f) => {
      const lats = f.locations.map((loc) => loc.latitude!);
      const lngs = f.locations.map((loc) => loc.longitude!);
      centroidMap[f.id] = {
        latitude: lats.reduce((sum, v) => sum + v, 0) / lats.length,
        longitude: lngs.reduce((sum, v) => sum + v, 0) / lngs.length,
      };
    });
    return centroidMap;
  }, [validFootprints]);

  const allCoords = useMemo(
    () =>
      validFootprints.flatMap((f) =>
        f.locations.map((loc) => ({ latitude: loc.latitude!, longitude: loc.longitude! }))
      ),
    [validFootprints]
  );

  return { validFootprints, footprintColors, footprintCentroids, allCoords };
}
