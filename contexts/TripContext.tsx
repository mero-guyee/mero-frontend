import React, { createContext, ReactNode, useContext, useState } from 'react';
import {
  useAllMemosQuery,
  useCreateMemo,
  useCreateTrip,
  useDeleteMemo,
  useDeleteTrip,
  useTripsQuery,
  useUpdateMemo,
  useUpdateTrip,
} from '../hooks/queries/useTrips';
import { Memo, Trip } from '../types';

interface TripContextType {
  trips: Trip[];
  memos: Memo[];
  activeTrip: string | null;
  currentTab: 'home' | 'footprint' | 'map' | 'expense';
  setCurrentTab: (tab: 'home' | 'footprint' | 'map' | 'expense') => void;
  setActiveTrip: (tripId: string | null) => void;
  addTrip: (trip: Omit<Trip, 'id'>) => void;
  updateTrip: (trip: Trip) => void;
  deleteTrip: (tripId: string) => void;
  addMemo: (memo: Omit<Memo, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMemo: (memo: Memo) => void;
  deleteMemo: (memoId: string) => void;
  getTripById: (tripId: string) => Trip | undefined;
  getMemosByTripId: (tripId: string) => Memo[];
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
  const { data: memos = [] } = useAllMemosQuery();

  const createTrip = useCreateTrip();
  const updateTripMut = useUpdateTrip();
  const deleteTripMut = useDeleteTrip();
  const createMemo = useCreateMemo();
  const updateMemoMut = useUpdateMemo();
  const deleteMemoMut = useDeleteMemo();

  return {
    trips,
    memos,
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
    addMemo: (memo) => createMemo.mutate(memo),
    updateMemo: (memo) => updateMemoMut.mutate(memo),
    deleteMemo: (memoId) => {
      const memo = memos.find((n) => n.id === memoId);
      if (memo) deleteMemoMut.mutate({ id: memoId, tripId: memo.tripId });
    },
    getTripById: (tripId) => trips.find((t) => t.id === tripId),
    getMemosByTripId: (tripId) => memos.filter((n) => n.tripId === tripId),
  };
}

export default TripUIContext;
