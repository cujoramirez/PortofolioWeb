import { createContext } from 'react';
import Lenis from 'lenis';

export type LenisInstance = InstanceType<typeof Lenis> | null;

export interface LenisContextValue {
  lenis: LenisInstance;
  stop: () => void;
  start: () => void;
}

export const LenisContext = createContext<LenisContextValue>({
  lenis: null,
  stop: () => {},
  start: () => {},
});
