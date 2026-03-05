import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDb } from '../../providers/DatabaseProvider';
import { NoteRepository, TripRepository } from '../../repositories';
import { Note, Trip } from '../../types';

export const tripKeys = {
  all: ['trips'] as const,
  detail: (id: string) => ['trips', id] as const,
  notes: (tripId: string) => ['trips', tripId, 'notes'] as const,
};

export function useTripsQuery() {
  const db = useDb();
  return useQuery({
    queryKey: tripKeys.all,
    queryFn: () => new TripRepository(db).getAllTrips(),
  });
}

export function useTripQuery(id: string) {
  const db = useDb();
  return useQuery({
    queryKey: tripKeys.detail(id),
    queryFn: () => new TripRepository(db).getTripById(id),
    enabled: !!id,
  });
}

export function useNotesQuery(tripId: string) {
  const db = useDb();
  return useQuery({
    queryKey: tripKeys.notes(tripId),
    queryFn: () => new NoteRepository(db).getNotesByTripId(tripId),
    enabled: !!tripId,
  });
}

export function useAllNotesQuery() {
  const db = useDb();
  return useQuery({
    queryKey: ['notes', 'all'],
    queryFn: () => new NoteRepository(db).getAllNotes(),
  });
}

export function useCreateTrip() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Trip, 'id'>) => new TripRepository(db).createTrip(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.all }),
  });
}

export function useUpdateTrip() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (trip: Trip) => new TripRepository(db).updateTrip(trip),
    onSuccess: (_, trip) => {
      qc.invalidateQueries({ queryKey: tripKeys.all });
      qc.invalidateQueries({ queryKey: tripKeys.detail(trip.id) });
    },
  });
}

export function useDeleteTrip() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tripId: string) => {
      const repo = new TripRepository(db);
      const noteRepo = new NoteRepository(db);
      await repo.deleteTrip(tripId);
      await noteRepo.deleteByTripId(tripId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.all }),
  });
}

export function useCreateNote() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) =>
      new NoteRepository(db).createNote(data),
    onSuccess: (note) => qc.invalidateQueries({ queryKey: tripKeys.notes(note.tripId) }),
  });
}

export function useUpdateNote() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (note: Note) => new NoteRepository(db).updateNote(note),
    onSuccess: (_, note) => qc.invalidateQueries({ queryKey: tripKeys.notes(note.tripId) }),
  });
}

export function useDeleteNote() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, tripId }: { id: string; tripId: string }) => {
      await new NoteRepository(db).deleteNote(id);
      return tripId;
    },
    onSuccess: (tripId) => qc.invalidateQueries({ queryKey: tripKeys.notes(tripId) }),
  });
}
