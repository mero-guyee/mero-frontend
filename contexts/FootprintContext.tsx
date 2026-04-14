import {
  useCreateFootprint,
  useDeleteFootprint,
  useFootprintsByTripQuery,
  useUpdateFootprint,
} from '../hooks/queries/useFootprints';
import { Footprint } from '../types';
import { useTrips } from './TripContext';

interface FootprintContextType {
  footprints: Footprint[];
  addFootprint: (footprint: Omit<Footprint, 'id' | 'serverId'>) => void;
  updateFootprint: (footprint: Footprint) => void;
  deleteFootprint: (footprintId: string) => void;
  getFootprintsByTripId: (tripId: string) => Footprint[];
  isFoorPrintLoading: boolean;
}

export function useFootprints(): FootprintContextType {
  const { activeTrip } = useTrips();
  const { data: footprints = [], isLoading: isFoorPrintLoading } = useFootprintsByTripQuery(
    activeTrip ?? ''
  );

  const createFootprint = useCreateFootprint();
  const updateFootprintMut = useUpdateFootprint();
  const deleteFootprintMut = useDeleteFootprint();

  return {
    footprints,
    addFootprint: (footprint) => createFootprint.mutate(footprint),
    updateFootprint: (footprint) => updateFootprintMut.mutate(footprint),
    deleteFootprint: (footprintId) => {
      const footprint = footprints.find((f) => f.id === footprintId);
      if (footprint) deleteFootprintMut.mutate({ id: footprintId, tripId: footprint.tripId });
    },
    getFootprintsByTripId: (tripId) => footprints.filter((f) => f.tripId === tripId),
    isFoorPrintLoading,
  };
}
