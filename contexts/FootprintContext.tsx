import {
  useCreateFootprint,
  useDeleteFootprint,
  useFootprintDraftsQuery,
  useFootprintsQuery,
  useUpdateFootprint,
} from '../hooks/queries/useFootprints';
import { Footprint, FootprintDraft } from '../types';
import { useTrips } from './TripContext';

interface FootprintContextType {
  footprints: Footprint[];
  drafts: FootprintDraft[];
  addFootprint: (footprint: Omit<Footprint, 'id' | 'serverId'> & { photoUris: string[] }) => Promise<Footprint>;
  updateFootprint: (footprint: Footprint & { photoUris: string[] }) => void;
  deleteFootprint: (footprintId: string) => Promise<void>;
  getFootprintsByTripId: (tripId: string) => Footprint[];
  isFootPrintLoading: boolean;
}

export function useFootprints(): FootprintContextType {
  const { activeTrip } = useTrips();
  const { data: footprints = [], isLoading: isFootPrintLoading } = useFootprintsQuery(
    activeTrip ?? ''
  );
  const { data: drafts = [] } = useFootprintDraftsQuery(activeTrip ?? '');

  const createFootprint = useCreateFootprint();
  const updateFootprintMut = useUpdateFootprint();
  const deleteFootprintMut = useDeleteFootprint();

  return {
    footprints,
    drafts,
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
