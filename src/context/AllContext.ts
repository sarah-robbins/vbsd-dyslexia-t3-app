import { createContext } from 'react';

// export const routingContext = createContext<string>('');

export interface RoutingContextType {
  setRouting: (path: string) => void;
}
const defaultContext = {} as RoutingContextType;

export const routingContext = createContext<RoutingContextType>(defaultContext);
