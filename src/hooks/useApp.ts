import { useContext } from 'react';
import { AppContext } from '../context/appStore';
import type { AppContextType } from '../context/appStore';

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
