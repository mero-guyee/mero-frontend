import { Trip } from '@/types';
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';

interface NewTripFormContextType {
  newTrip: Omit<Trip, 'id'>;
  setNewTrip: Dispatch<SetStateAction<Omit<Trip, 'id'>>>;
}

const NewTripFormContext = createContext<NewTripFormContextType | null>(null);

export function NewTripFormProvider({ children }: { children: ReactNode }) {
  const [newTrip, setNewTrip] = useState<Omit<Trip, 'id'>>({
    title: '',
    startDate: '',
    endDate: '',
    countries: [],
    imageUrl: '',
  });

  console.log('NewTripFormProvider rendered with newTrip:', newTrip);

  return (
    <NewTripFormContext.Provider value={{ newTrip, setNewTrip }}>
      {children}
    </NewTripFormContext.Provider>
  );
}

export function useNewTripForm(): NewTripFormContextType {
  const ctx = useContext(NewTripFormContext);
  if (!ctx) throw new Error('useNewTripForm must be used within a NewTripFormProvider');
  const { newTrip, setNewTrip } = ctx;

  return {
    newTrip,
    setNewTrip,
  };
}
