import {
  useCreateFootprint,
  useDeleteFootprint,
  useFootprintsQuery,
  useUpdateFootprint,
} from '../hooks/queries/useFootprints';
import { Footprint } from '../types';
import { useTrips } from './TripContext';

interface FootprintContextType {
  footprints: Footprint[];
  addFootprint: (footprint: Omit<Footprint, 'id' | 'serverId'>) => Promise<Footprint>;
  updateFootprint: (footprint: Footprint) => void;
  deleteFootprint: (footprintId: string) => Promise<void>;
  getFootprintsByTripId: (tripId: string) => Footprint[];
  isFootPrintLoading: boolean;
}

export function useFootprints(): FootprintContextType {
  const { activeTrip } = useTrips();
  const { data: footprints = [], isLoading: isFootPrintLoading } = useFootprintsQuery(
    activeTrip ?? ''
  );

  const createFootprint = useCreateFootprint();
  const updateFootprintMut = useUpdateFootprint();
  const deleteFootprintMut = useDeleteFootprint();

  return {
    footprints,
    addFootprint: (footprint) => createFootprint.mutateAsync(footprint),
    updateFootprint: (footprint) => updateFootprintMut.mutate(footprint),
    deleteFootprint: async (footprintId) => {
      const footprint = footprints.find((f) => f.id === footprintId);
      if (footprint) {
        await deleteFootprintMut.mutateAsync({ id: footprintId, tripId: footprint.tripId });
      }
    },
    getFootprintsByTripId: (tripId) => footprints.filter((f) => f.tripId === tripId),
    isFootPrintLoading,
  };
}
