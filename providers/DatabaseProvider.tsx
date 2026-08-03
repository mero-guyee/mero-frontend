import * as SQLite from 'expo-sqlite';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Button, Text, YStack } from 'tamagui';
import { getDatabase } from '../db';

interface DatabaseContextType {
  db: SQLite.SQLiteDatabase | null;
  isReady: boolean;
}

const DatabaseContext = createContext<DatabaseContextType>({ db: null, isReady: false });

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const initDatabase = useCallback(() => {
    setError(null);
    setIsReady(false);
    getDatabase()
      .then((database) => {
        setDb(database);
        setIsReady(true);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsReady(true);
      });
  }, []);

  useEffect(() => {
    initDatabase();
  }, [initDatabase]);

  if (error) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" gap="$3" padding="$4">
        <Text fontSize="$5" fontWeight="600" textAlign="center">
          데이터베이스를 불러오지 못했습니다
        </Text>
        <Text fontSize="$3" color="$color10" textAlign="center">
          {error.message}
        </Text>
        <Button onPress={initDatabase}>다시 시도</Button>
      </YStack>
    );
  }

  return <DatabaseContext.Provider value={{ db, isReady }}>{children}</DatabaseContext.Provider>;
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
