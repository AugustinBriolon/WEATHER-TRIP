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

    // Convertir les dates string en objets Date
    const hikingDays = data.hikingDays.map((day) => ({
      ...day,
      date: new Date(day.date),
    }));

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

// Fonction pour vérifier si les données météo sont encore valides (24h)
export function isWeatherDataValid(lastUpdated: number): boolean {
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000; // 24 heures en millisecondes
  return now - lastUpdated < twentyFourHours;
}
