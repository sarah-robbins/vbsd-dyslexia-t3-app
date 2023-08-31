import { createContext } from 'react';

// export const routingContext = createContext<string>('');

export interface RoutingContextType {
  setRouting: (path: string) => void;
}

export const routingContext = createContext<RoutingContextType | null>(null);
