import { loadViewMode, saveViewMode, ViewMode } from '@/lib/storage';
import { useEffect, useState } from 'react';

export function useViewMode() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isInitialized, setIsInitialized] = useState(false);

  // Charger le mode de vue au démarrage
  useEffect(() => {
    const savedViewMode = loadViewMode();
    setViewMode(savedViewMode);
    setIsInitialized(true);
  }, []);

  // Sauvegarder le mode de vue à chaque changement
  useEffect(() => {
    if (isInitialized) {
      saveViewMode(viewMode);
    }
  }, [viewMode, isInitialized]);

  const changeViewMode = (newViewMode: ViewMode) => {
    setViewMode(newViewMode);
  };

  return {
    viewMode,
    changeViewMode,
  };
}
