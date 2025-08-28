import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRefreshAllWeather, useRefreshWeather } from '@/hooks/use-weather';
import {
  clearHikingDays,
  getLastUpdated,
  isWeatherDataValid,
  loadHikingDays,
  saveHikingDays,
} from '@/lib/storage';
import { HikingDay, LocationSearchResult } from '@/types/weather';
import {
  Grid,
  List,
  Loader2,
  MapPin,
  Mountain,
  RefreshCw,
  Trash2,
  Upload,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CalendarView } from './CalendarView';
import { ListView } from './ListView';
import { MapView } from './MapView';
import { TripForm } from './TripForm';

type ViewMode = 'list' | 'calendar' | 'map';

export function TripPlanner() {
  const [hikingDays, setHikingDays] = useState<HikingDay[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const refreshWeatherMutation = useRefreshWeather();
  const refreshAllWeatherMutation = useRefreshAllWeather();

  console.log(hikingDays);

  useEffect(() => {
    const loadSavedData = async () => {
      const savedDays = loadHikingDays();
      const lastUpdated = getLastUpdated();

      if (savedDays.length > 0) {
        setHikingDays(savedDays);

        if (lastUpdated && !isWeatherDataValid(lastUpdated)) {
          console.log('Données météo expirées, actualisation nécessaire');
          await refreshMissingWeatherData();
        } else {
          await refreshMissingWeatherData();
        }
      }

      setIsInitialized(true);
    };

    loadSavedData();
  }, []);

  const refreshMissingWeatherData = async () => {
    const daysWithoutWeather = hikingDays.filter((day) => !day.weather);

    for (const day of daysWithoutWeather) {
      await handleRefreshWeather(day);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  };

  useEffect(() => {
    if (isInitialized) {
      saveHikingDays(hikingDays);
    }
  }, [hikingDays, isInitialized]);

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
              // Mettre à jour l'ID avec la nouvelle date
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

  if (!isInitialized) {
    return (
      <div className='container mx-auto p-6 max-w-7xl'>
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='h-8 w-8 animate-spin' />
          <span className='ml-2'>Chargement de vos données...</span>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-2 sm:p-6 max-w-7xl'>
      <div className='my-6 sm:mb-8'>
        <h1 className='text-2xl sm:text-3xl font-bold text-center mb-2 flex items-center justify-center gap-2'>
          <Mountain className='h-6 w-6 sm:h-8 sm:w-8 text-green-600' />
          <span className='hidden sm:inline'>
            Planificateur Météo Randonnée
          </span>
          <span className='sm:hidden'>Planificateur Randonnée</span>
        </h1>
        <p className='text-center text-muted-foreground text-sm sm:text-base'>
          Planifiez vos randonnées avec les prévisions météo
        </p>
      </div>

      <div className='flex flex-col gap-4 sm:gap-6'>
        <TripForm
          onAddHikingDay={handleAddHikingDay}
          isLoading={refreshWeatherMutation.isPending}
        />

        <Card className='gap-4'>
          <CardHeader>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
              <CardTitle className='text-lg sm:text-xl'>
                <span className='sm:hidden'>Mon Voyage</span>
              </CardTitle>
              <div className='flex items-center justify-between gap-2 flex-wrap'>
                <div className='flex items-center gap-1 border rounded-md'>
                  <Button
                    size='sm'
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('list')}
                  >
                    <List className='h-4 w-4' />
                  </Button>
                  <Button
                    size='sm'
                    variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('calendar')}
                  >
                    <Grid className='h-4 w-4' />
                  </Button>
                  <Button
                    size='sm'
                    variant={viewMode === 'map' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('map')}
                  >
                    <MapPin className='h-4 w-4' />
                  </Button>
                </div>

                {hikingDays.length > 0 && (
                  <div className='flex gap-1'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleImportHikingData}
                      className='text-sm h-8 px-3'
                    >
                      <Upload className='h-4 w-4' />
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={handleRefreshAllWeather}
                      disabled={refreshAllWeatherMutation.isPending}
                      className='text-sm h-8 px-3'
                    >
                      {refreshAllWeatherMutation.isPending ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <RefreshCw className='h-4 w-4' />
                      )}
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={handleClearAll}
                      className='text-sm h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className='pt-0'>
            {viewMode === 'calendar' ? (
              <CalendarView
                hikingDays={hikingDays}
                onAddHikingDay={handleAddHikingDay}
                onRemoveDay={handleRemoveDay}
              />
            ) : viewMode === 'map' ? (
              <MapView />
            ) : (
              <ListView
                hikingDays={hikingDays}
                onRemoveDay={handleRemoveDay}
                onRefreshWeather={handleRefreshWeather}
                loadingDayId={
                  refreshWeatherMutation.isPending ? 'loading' : null
                }
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
