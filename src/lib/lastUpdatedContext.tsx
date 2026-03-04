'use client';

import { createContext, useContext, useState, useCallback } from 'react';

interface LastUpdatedContextValue {
  lastUpdated: Date | null;
  setLastUpdated: (date: Date) => void;
}

const LastUpdatedContext = createContext<LastUpdatedContextValue>({
  lastUpdated: null,
  setLastUpdated: () => {},
});

export function LastUpdatedProvider({ children }: { children: React.ReactNode }) {
  const [lastUpdated, setLastUpdatedState] = useState<Date | null>(null);
  const setLastUpdated = useCallback((date: Date) => setLastUpdatedState(date), []);

  return (
    <LastUpdatedContext.Provider value={{ lastUpdated, setLastUpdated }}>
      {children}
    </LastUpdatedContext.Provider>
  );
}

export function useLastUpdated() {
  return useContext(LastUpdatedContext);
}
