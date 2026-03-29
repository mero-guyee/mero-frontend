import { QueryClient } from '@tanstack/react-query';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import {
  tripKeys,
  useCreateDocument,
  useCreateTrip,
  useDeleteTrip,
  useTripsQuery,
  useUpdateTrip,
} from '../hooks/queries/useTrips';
import { Trip, TripDocumentFile } from '../types';

interface TripContextType {
  trips: Trip[];
  activeTrip: string | null;
  currentTab: 'home' | 'footprint' | 'map' | 'expense';
  setCurrentTab: (tab: 'home' | 'footprint' | 'map' | 'expense') => void;
  setActiveTrip: (tripId: string | null) => void;
  addTrip: (trip: Omit<Trip, 'id'>) => void;
  updateTrip: (trip: Trip) => void;
  deleteTrip: (tripId: string) => void;
  getTripById: (tripId: string) => Trip | undefined;
  createDocument: (tripId: string, document: TripDocumentFile) => void;
}

const TripUIContext = createContext<{
  activeTrip: string | null;
  currentTab: 'home' | 'footprint' | 'map' | 'expense';
  setActiveTrip: (id: string | null) => void;
  setCurrentTab: (tab: 'home' | 'footprint' | 'map' | 'expense') => void;
} | null>(null);

export function TripProvider({ children }: { children: ReactNode }) {
  const [activeTrip, setActiveTrip] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'home' | 'footprint' | 'map' | 'expense'>('home');

  return (
    <TripUIContext.Provider value={{ activeTrip, currentTab, setActiveTrip, setCurrentTab }}>
      {children}
    </TripUIContext.Provider>
  );
}

export function useTrips(): TripContextType {
  const ui = useContext(TripUIContext);
  if (!ui) throw new Error('useTrips must be used within a TripProvider');

  const { data: trips = [] } = useTripsQuery();

  const createTrip = useCreateTrip();
  const updateTripMut = useUpdateTrip();
  const deleteTripMut = useDeleteTrip();
  const createDocumentMut = useCreateDocument();

  return {
    trips,
    activeTrip: ui.activeTrip,
    currentTab: ui.currentTab,
    setCurrentTab: ui.setCurrentTab,
    setActiveTrip: ui.setActiveTrip,
    addTrip: (trip) => {
      createTrip.mutate(trip, {
        onSuccess: (newTrip) => ui.setActiveTrip(newTrip.id),
      });
    },
    updateTrip: (trip) => updateTripMut.mutate(trip),
    deleteTrip: (tripId) => {
      deleteTripMut.mutate(tripId, {
        onSuccess: () => {
          if (ui.activeTrip === tripId) {
            ui.setActiveTrip(trips.find((t) => t.id !== tripId)?.id ?? null);
          }
        },
      });
    },
    getTripById: (tripId) => trips.find((t) => t.id === tripId),
    createDocument: async (tripId: string, document: TripDocumentFile) => {
      createDocumentMut.mutate(
        { tripId, data: document },
        {
          onSuccess: () => {
            const qc = new QueryClient();
            qc.invalidateQueries({ queryKey: tripKeys.detail(tripId) });
          },
        }
      );
    },
  };
}

export default TripUIContext;
