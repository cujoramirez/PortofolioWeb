import { useContext } from 'react';

import { LenisContext } from '../components/LenisContext';

export const useLenis = () => useContext(LenisContext);
