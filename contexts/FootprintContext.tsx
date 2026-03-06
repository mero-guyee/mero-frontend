import React, { ReactNode } from 'react';
import { Footprint } from '../types';
import {
  useFootprintsQuery,
  useCreateFootprint,
  useUpdateFootprint,
  useDeleteFootprint,
} from '../hooks/queries/useFootprints';

interface FootprintContextType {
  footprints: Footprint[];
  addFootprint: (footprint: Omit<Footprint, 'id' | 'serverId'>) => void;
  updateFootprint: (footprint: Footprint) => void;
  deleteFootprint: (footprintId: string) => void;
  getFootprintById: (footprintId: string) => Footprint | undefined;
  getFootprintsByTripId: (tripId: string) => Footprint[];
}

export function FootprintProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useFootprints(): FootprintContextType {
  const { data: footprints = [] } = useFootprintsQuery();
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
    getFootprintById: (footprintId) => footprints.find((f) => f.id === footprintId),
    getFootprintsByTripId: (tripId) => footprints.filter((f) => f.tripId === tripId),
  };
}
