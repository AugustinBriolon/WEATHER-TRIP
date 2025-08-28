import { HikingDay } from '@/types/weather';
import { toast } from 'sonner';

const STORAGE_KEY = 'hiking-trip-planner-data';
const VIEW_MODE_KEY = 'hiking-trip-planner-view-mode';

export type ViewMode = 'list' | 'calendar' | 'map';

export interface StoredData {
  hikingDays: HikingDay[];
  lastUpdated: number;
}

export function saveHikingDays(hikingDays: HikingDay[]): void {
  try {
    const data: StoredData = {
      hikingDays,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('Données sauvegardées dans le localStorage');
  } catch (error) {
    toast.error('Erreur lors de la sauvegarde des données');
    console.error('Erreur lors de la sauvegarde:', error);
  }
}

export function loadHikingDays(): HikingDay[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const data: StoredData = JSON.parse(stored);

    const hikingDays = data.hikingDays.map((day) => {
      const originalDate = new Date(day.date);
      const correctedDate = new Date(
        originalDate.getFullYear(),
        originalDate.getMonth(),
        originalDate.getDate(),
        12,
        0,
        0,
        0
      );

      return {
        ...day,
        date: correctedDate,
      };
    });

    console.log(
      'Données chargées depuis le localStorage:',
      hikingDays.length,
      'jours'
    );
    return hikingDays;
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
    toast.error('Erreur lors du chargement des données');
    return [];
  }
}

export function clearHikingDays(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Données supprimées du localStorage');
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    toast.error('Erreur lors de la suppression des données');
  }
}

export function getLastUpdated(): number | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const data: StoredData = JSON.parse(stored);
    return data.lastUpdated;
  } catch (error) {
    console.error('Erreur lors de la récupération de la date:', error);
    toast.error('Erreur lors de la récupération de la date');
    return null;
  }
}

export function isWeatherDataValid(lastUpdated: number): boolean {
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  return now - lastUpdated < twentyFourHours;
}

export function saveViewMode(viewMode: ViewMode): void {
  try {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
    console.log('Mode de vue sauvegardé dans le localStorage:', viewMode);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du mode de vue:', error);
    toast.error('Erreur lors de la sauvegarde du mode de vue');
  }
}

export function loadViewMode(): ViewMode {
  try {
    const stored = localStorage.getItem(VIEW_MODE_KEY);
    if (!stored) {
      return 'list';
    }

    const viewMode = stored as ViewMode;
    if (['list', 'calendar', 'map'].includes(viewMode)) {
      console.log('Mode de vue chargé depuis le localStorage:', viewMode);
      return viewMode;
    } else {
      console.warn(
        'Mode de vue invalide dans le localStorage, utilisation de la valeur par défaut'
      );
      return 'list';
    }
  } catch (error) {
    console.error('Erreur lors du chargement du mode de vue:', error);
    return 'list';
  }
}
