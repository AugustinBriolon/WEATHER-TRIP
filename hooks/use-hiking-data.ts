import {
  clearHikingDays,
  getLastUpdated,
  isWeatherDataValid,
  loadHikingDays,
  saveHikingDays,
} from '@/lib/storage';
import { HikingDay, LocationSearchResult } from '@/types/weather';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRefreshAllWeather, useRefreshWeather } from './use-weather';

export function useHikingData() {
  const [hikingDays, setHikingDays] = useState<HikingDay[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const refreshWeatherMutation = useRefreshWeather();
  const refreshAllWeatherMutation = useRefreshAllWeather();

  // Charger les données au démarrage
  useEffect(() => {
    const loadSavedData = async () => {
      const savedDays = loadHikingDays();
      const lastUpdated = getLastUpdated();

      if (savedDays.length > 0) {
        setHikingDays(savedDays);

        if (lastUpdated && !isWeatherDataValid(lastUpdated)) {
          console.log('Données météo expirées, actualisation nécessaire');
          await refreshMissingWeatherData(savedDays);
        } else {
          await refreshMissingWeatherData(savedDays);
        }
      }

      setIsInitialized(true);
    };

    loadSavedData();
  }, []);

  // Sauvegarder les données à chaque changement
  useEffect(() => {
    if (isInitialized) {
      saveHikingDays(hikingDays);
    }
  }, [hikingDays, isInitialized]);

  const refreshMissingWeatherData = async (days: HikingDay[]) => {
    const daysWithoutWeather = days.filter((day) => !day.weather);

    for (const day of daysWithoutWeather) {
      await handleRefreshWeather(day);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  };

  const handleAddHikingDay = async (
    date: Date,
    location: LocationSearchResult
  ) => {
    const newDay: HikingDay = {
      id: `${date.getTime()}-${location.lat}-${location.lon}`,
      date,
      location: {
        name: `${location.name}, ${location.country}`,
        coordinates: {
          lat: location.lat,
          lon: location.lon,
        },
      },
      weather: undefined,
    };

    setHikingDays((prev) => [...prev, newDay]);
    await handleRefreshWeather(newDay);
  };

  const handleRefreshWeather = async (day: HikingDay) => {
    if (!day.location.coordinates) {
      toast.error('Coordonnées manquantes', {
        description: `Impossible de récupérer la météo pour ${day.location.name}`,
      });
      return;
    }

    try {
      const weatherData = await refreshWeatherMutation.mutateAsync({
        lat: day.location.coordinates.lat,
        lon: day.location.coordinates.lon,
        targetDate: day.date,
      });

      if (weatherData) {
        setHikingDays((prev) =>
          prev.map((d) =>
            d.id === day.id ? { ...d, weather: weatherData } : d
          )
        );
      }
    } catch (error) {
      console.error('Error fetching weather for day:', error);
    }
  };

  const handleRemoveDay = (dayId: string) => {
    setHikingDays((prev) => prev.filter((day) => day.id !== dayId));
    toast.success('Journée supprimée');
  };

  const handleClearAll = () => {
    setHikingDays([]);
    clearHikingDays();
    toast.success('Toutes les données ont été supprimées');
  };

  const handleRefreshAllWeather = async () => {
    const daysWithCoordinates = hikingDays.filter(
      (day) => day.location.coordinates
    );

    if (daysWithCoordinates.length === 0) {
      toast.info('Aucune donnée à actualiser');
      return;
    }

    try {
      const updatedWeatherData = await refreshAllWeatherMutation.mutateAsync(
        daysWithCoordinates.map((day) => ({
          lat: day.location.coordinates!.lat,
          lon: day.location.coordinates!.lon,
          date: day.date,
        }))
      );

      setHikingDays((prev) =>
        prev.map((day, _) => {
          const dayIndex = daysWithCoordinates.findIndex(
            (d) => d.id === day.id
          );
          if (dayIndex !== -1 && updatedWeatherData[dayIndex]) {
            return { ...day, weather: updatedWeatherData[dayIndex] };
          }
          return day;
        })
      );
    } catch (error) {
      console.error("Erreur lors de l'actualisation des données météo:", error);
    }
  };

  const handleImportHikingData = async () => {
    try {
      const response = await fetch('/hiking.json');
      if (!response.ok) {
        throw new Error('Impossible de charger le fichier hiking.json');
      }

      const data = await response.json();

      if (data.hikingDays && Array.isArray(data.hikingDays)) {
        const importedDays: HikingDay[] = data.hikingDays.map(
          (day: HikingDay & { date: string }) => {
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
              id: `${correctedDate.getTime()}-${
                day.location.coordinates?.lat
              }-${day.location.coordinates?.lon}`,
            };
          }
        );

        setHikingDays((prev) => {
          const existingIds = new Set(prev.map((d) => d.id));
          const newDays = importedDays.filter(
            (day) => !existingIds.has(day.id)
          );
          return [...prev, ...newDays];
        });

        toast.success('Import réussi', {
          description: `${importedDays.length} jours de randonnée importés`,
        });
      } else {
        throw new Error('Format de données invalide dans hiking.json');
      }
    } catch (error) {
      console.error("Erreur lors de l'import du fichier hiking.json:", error);
      toast.error("Erreur lors de l'import", {
        description: 'Impossible de charger le fichier hiking.json',
      });
    }
  };

  return {
    hikingDays,
    isInitialized,
    isLoading: refreshWeatherMutation.isPending,
    isRefreshingAll: refreshAllWeatherMutation.isPending,
    handleAddHikingDay,
    handleRemoveDay,
    handleClearAll,
    handleRefreshWeather,
    handleRefreshAllWeather,
    handleImportHikingData,
  };
}
