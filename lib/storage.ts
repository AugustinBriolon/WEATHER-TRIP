import { HikingDay } from '@/types/weather';

const STORAGE_KEY = 'hiking-trip-planner-data';

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
      // Corriger le décalage de date en ajustant l'heure
      const originalDate = new Date(day.date);
      // Créer une nouvelle date à midi pour éviter les problèmes de fuseau horaire
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
    return [];
  }
}

export function clearHikingDays(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Données supprimées du localStorage');
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
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
    return null;
  }
}

export function isWeatherDataValid(lastUpdated: number): boolean {
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  return now - lastUpdated < twentyFourHours;
}
