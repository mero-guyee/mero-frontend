import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Trip, Note } from '../types';
import {
  useTripsQuery,
  useAllNotesQuery,
  useCreateTrip,
  useUpdateTrip,
  useDeleteTrip,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
} from '../hooks/queries/useTrips';

interface TripContextType {
  trips: Trip[];
  notes: Note[];
  activeTrip: string | null;
  currentTab: 'home' | 'diary' | 'map' | 'expense';
  setCurrentTab: (tab: 'home' | 'diary' | 'map' | 'expense') => void;
  setActiveTrip: (tripId: string | null) => void;
  addTrip: (trip: Omit<Trip, 'id'>) => void;
  updateTrip: (trip: Trip) => void;
  deleteTrip: (tripId: string) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (note: Note) => void;
  deleteNote: (noteId: string) => void;
  getTripById: (tripId: string) => Trip | undefined;
  getNotesByTripId: (tripId: string) => Note[];
}

const TripUIContext = createContext<{
  activeTrip: string | null;
  currentTab: 'home' | 'diary' | 'map' | 'expense';
  setActiveTrip: (id: string | null) => void;
  setCurrentTab: (tab: 'home' | 'diary' | 'map' | 'expense') => void;
} | null>(null);

export function TripProvider({ children }: { children: ReactNode }) {
  const [activeTrip, setActiveTrip] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'home' | 'diary' | 'map' | 'expense'>('home');

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
  const { data: notes = [] } = useAllNotesQuery();

  const createTrip = useCreateTrip();
  const updateTripMut = useUpdateTrip();
  const deleteTripMut = useDeleteTrip();
  const createNote = useCreateNote();
  const updateNoteMut = useUpdateNote();
  const deleteNoteMut = useDeleteNote();

  return {
    trips,
    notes,
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
    addNote: (note) => createNote.mutate(note),
    updateNote: (note) => updateNoteMut.mutate(note),
    deleteNote: (noteId) => {
      const note = notes.find((n) => n.id === noteId);
      if (note) deleteNoteMut.mutate({ id: noteId, tripId: note.tripId });
    },
    getTripById: (tripId) => trips.find((t) => t.id === tripId),
    getNotesByTripId: (tripId) => notes.filter((n) => n.tripId === tripId),
  };
}

export default TripUIContext;
