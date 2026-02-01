import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Trip, Note } from '../types';
import { MOCK_TRIPS, MOCK_NOTES } from '../data/mockData';

interface TripContextType {
  // 상태
  trips: Trip[];
  notes: Note[];
  activeTrip: string | null;
  currentTab: 'home' | 'diary' | 'map' | 'expense';

  // 탭/활성 여행 관리
  setCurrentTab: (tab: 'home' | 'diary' | 'map' | 'expense') => void;
  setActiveTrip: (tripId: string | null) => void;

  // Trip CRUD
  addTrip: (trip: Omit<Trip, 'id'>) => void;
  updateTrip: (trip: Trip) => void;
  deleteTrip: (tripId: string) => void;

  // Note CRUD
  addNote: (note: Omit<Note, 'id'>) => void;
  updateNote: (note: Note) => void;
  deleteNote: (noteId: string) => void;

  // 헬퍼 함수
  getTripById: (tripId: string) => Trip | undefined;
  getNotesByTripId: (tripId: string) => Note[];
}

const TripContext = createContext<TripContextType | null>(null);

export function TripProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>(MOCK_TRIPS);
  const [notes, setNotes] = useState<Note[]>(MOCK_NOTES);
  const [activeTrip, setActiveTrip] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'home' | 'diary' | 'map' | 'expense'>('home');

  // Trip CRUD
  const addTrip = (trip: Omit<Trip, 'id'>) => {
    const newTrip = { ...trip, id: Date.now().toString() };
    setTrips([newTrip, ...trips]);
    setActiveTrip(newTrip.id);
  };

  const updateTrip = (trip: Trip) => {
    setTrips(trips.map((t) => (t.id === trip.id ? trip : t)));
  };

  const deleteTrip = (tripId: string) => {
    setTrips(trips.filter((t) => t.id !== tripId));
    setNotes(notes.filter((n) => n.tripId !== tripId));
    if (activeTrip === tripId) {
      setActiveTrip(trips[0]?.id || null);
    }
  };

  // Note CRUD
  const addNote = (note: Omit<Note, 'id'>) => {
    const newNote = { ...note, id: Date.now().toString() };
    setNotes([newNote, ...notes]);
  };

  const updateNote = (note: Note) => {
    setNotes(notes.map((n) => (n.id === note.id ? note : n)));
  };

  const deleteNote = (noteId: string) => {
    setNotes(notes.filter((n) => n.id !== noteId));
  };

  // 헬퍼 함수
  const getTripById = (tripId: string) => trips.find((t) => t.id === tripId);
  const getNotesByTripId = (tripId: string) => notes.filter((n) => n.tripId === tripId);

  const value: TripContextType = {
    trips,
    notes,
    activeTrip,
    currentTab,
    setCurrentTab,
    setActiveTrip,
    addTrip,
    updateTrip,
    deleteTrip,
    addNote,
    updateNote,
    deleteNote,
    getTripById,
    getNotesByTripId,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrips() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrips must be used within a TripProvider');
  }
  return context;
}

export default TripContext;
