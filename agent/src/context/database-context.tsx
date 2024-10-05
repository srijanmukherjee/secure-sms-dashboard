import React, {createContext, useContext, useEffect, useState} from 'react';
import {Text} from 'react-native';
import {Database} from 'src/database';

type Props = {
  provider: () => Promise<Database>;
  children: React.ReactNode;
};

const DatabaseContext = createContext<Database | undefined>(undefined);

export function useRepository<T extends keyof Database>(repository: T): Database[T] {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useRepository called outside of database context');
  }

  return context[repository];
}

export function DatabaseContextProvider({provider, children}: Props) {
  const [loading, setLoading] = useState(true);
  const [database, setDatabase] = useState<Database>();
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    provider()
      .then(setDatabase)
      .catch(err => {
        console.debug(err);
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [provider]);

  if (loading) {
    return null;
  }

  if (error) {
    return <Text>Failed to load database</Text>;
  }

  return <DatabaseContext.Provider value={database}>{children}</DatabaseContext.Provider>;
}
