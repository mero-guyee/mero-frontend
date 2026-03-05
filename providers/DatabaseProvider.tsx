import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SQLite from 'expo-sqlite';
import { getDatabase } from '../db';

interface DatabaseContextType {
  db: SQLite.SQLiteDatabase | null;
  isReady: boolean;
}

const DatabaseContext = createContext<DatabaseContextType>({ db: null, isReady: false });

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    getDatabase().then((database) => {
      setDb(database);
      setIsReady(true);
    });
  }, []);

  return (
    <DatabaseContext.Provider value={{ db, isReady }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDb(): SQLite.SQLiteDatabase {
  const { db, isReady } = useContext(DatabaseContext);
  if (!isReady || !db) {
    throw new Error('Database is not ready yet');
  }
  return db;
}

export function useDbReady(): boolean {
  return useContext(DatabaseContext).isReady;
}
