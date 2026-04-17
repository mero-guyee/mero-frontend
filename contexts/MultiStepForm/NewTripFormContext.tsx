import { Trip } from '@/types';
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';

interface NewTripFormContextProviderType {
  newTrip: Omit<Trip, 'id'>;
  setNewTrip: Dispatch<SetStateAction<Omit<Trip, 'id'>>>;
}

interface NewTripFormContextType extends NewTripFormContextProviderType {
  initNewTripForm: () => void;
}

const NewTripFormContext = createContext<NewTripFormContextProviderType | null>(null);

export function NewTripFormProvider({ children }: { children: ReactNode }) {
  const [newTrip, setNewTrip] = useState<Omit<Trip, 'id'>>({
    title: '',
    startDate: '',
    endDate: '',
    countries: [],
    imageUrl: '',
  });

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

  const initNewTripForm = () => {
    setNewTrip({
      title: '',
      startDate: '',
      endDate: '',
      countries: [],
      imageUrl: '',
    });
  };

  return {
    newTrip,
    setNewTrip,
    initNewTripForm,
  };
}
