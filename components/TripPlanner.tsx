import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TripForm } from './TripForm';
import { WeatherCard } from './WeatherCard';
import { CalendarView } from './CalendarView';
import { ListView } from './ListView';
import { HikingDay, LocationSearchResult } from '@/types/weather';
import { getWeatherForecast } from '@/lib/weather-api';
import {
  saveHikingDays,
  loadHikingDays,
  clearHikingDays,
  getLastUpdated,
  isWeatherDataValid,
} from '@/lib/storage';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Mountain,
  Calendar,
  MapPin,
  Trash2,
  RefreshCw,
  Loader2,
  Download,
  Upload,
  RotateCcw,
  List,
  Grid,
  Plus,
} from 'lucide-react';

type ViewMode = 'list' | 'calendar';

export function TripPlanner() {
  const [hikingDays, setHikingDays] = useState<HikingDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDayId, setLoadingDayId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Charger les données au démarrage
  useEffect(() => {
    const loadSavedData = async () => {
      const savedDays = loadHikingDays();
      const lastUpdated = getLastUpdated();

      if (savedDays.length > 0) {
        setHikingDays(savedDays);

        // Vérifier si les données météo sont encore valides
        if (lastUpdated && !isWeatherDataValid(lastUpdated)) {
          console.log('Données météo expirées, actualisation nécessaire');
          // Actualiser automatiquement les données expirées
          await refreshMissingWeatherData();
        } else {
          // Actualiser les données météo manquantes
          await refreshMissingWeatherData();
        }
      }

      setIsInitialized(true);
    };

    loadSavedData();
  }, []);

  // Fonction pour actualiser les données météo manquantes
  const refreshMissingWeatherData = async () => {
    const daysWithoutWeather = hikingDays.filter((day) => !day.weather);

    for (const day of daysWithoutWeather) {
      await fetchWeatherForDay(day);
      // Petite pause pour éviter de surcharger l'API
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  };

  // Sauvegarder les données à chaque modification
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

    // Charger la météo pour ce jour spécifique
    await fetchWeatherForDay(newDay, date);
  };

  const fetchWeatherForDay = async (day: HikingDay, targetDate?: Date) => {
    if (!day.location.coordinates) {
      console.error(
        'No coordinates available for location:',
        day.location.name
      );
      return;
    }

    setLoadingDayId(day.id);

    try {
      const weatherData = await getWeatherForecast(
        day.location.coordinates.lat,
        day.location.coordinates.lon,
        targetDate || day.date
      );

      if (weatherData) {
        setHikingDays((prev) =>
          prev.map((d) =>
            d.id === day.id ? { ...d, weather: weatherData } : d
          )
        );
      }
    } catch (error) {
      console.error('Error fetching weather for day:', error);
    } finally {
      setLoadingDayId(null);
    }
  };

  const handleRefreshWeather = async (day: HikingDay) => {
    await fetchWeatherForDay(day);
  };

  const handleRemoveDay = (dayId: string) => {
    setHikingDays((prev) => prev.filter((day) => day.id !== dayId));
  };

  const handleClearAll = () => {
    setHikingDays([]);
    clearHikingDays();
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
          (day: HikingDay & { date: string }) => ({
            ...day,
            date: new Date(day.date),
          })
        );

        setHikingDays((prev) => {
          const existingIds = new Set(prev.map((d) => d.id));
          const newDays = importedDays.filter(
            (day) => !existingIds.has(day.id)
          );
          return [...prev, ...newDays];
        });

        console.log(
          `${importedDays.length} jours de randonnée importés avec succès`
        );
      } else {
        throw new Error('Format de données invalide dans hiking.json');
      }
    } catch (error) {
      console.error("Erreur lors de l'import du fichier hiking.json:", error);
      alert("Erreur lors de l'import du fichier hiking.json");
    }
  };

  const handleRefreshAllWeather = async () => {
    setIsLoading(true);
    try {
      const daysWithCoordinates = hikingDays.filter(
        (day) => day.location.coordinates
      );

      for (const day of daysWithCoordinates) {
        await fetchWeatherForDay(day);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error("Erreur lors de l'actualisation des données météo:", error);
    } finally {
      setIsLoading(false);
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
    <div className='container mx-auto p-4 sm:p-6 max-w-7xl'>
      <div className='mb-6 sm:mb-8'>
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

      <div className='grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6'>
        {/* Form Section */}
        <div className='lg:col-span-1 order-1'>
          <TripForm onAddHikingDay={handleAddHikingDay} isLoading={isLoading} />
        </div>

        {/* Trip Overview */}
        <div className='lg:col-span-3 order-2'>
          <Card>
            <CardHeader className='pb-4'>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                <CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
                  <Calendar className='h-4 w-4 sm:h-5 sm:w-5' />
                  <span className='hidden sm:inline'>
                    Mon Voyage de Randonnée
                  </span>
                  <span className='sm:hidden'>Mon Voyage</span>
                </CardTitle>
                <div className='flex items-center gap-2 flex-wrap'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleImportHikingData}
                    className='text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3'
                  >
                    <Upload className='h-3 w-3 sm:h-4 sm:w-4 mr-1' />
                    <span className='hidden sm:inline'>Importer</span>
                  </Button>
                  <div className='flex items-center gap-1 border rounded-md'>
                    <Button
                      size='sm'
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      onClick={() => setViewMode('list')}
                      className='p-0'
                    >
                      <List className='h-3 w-3 sm:h-4 sm:w-4' />
                    </Button>
                    <Button
                      size='sm'
                      variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                      onClick={() => setViewMode('calendar')}
                      className='p-0'
                    >
                      <Grid className='h-3 w-3 sm:h-4 sm:w-4' />
                    </Button>
                  </div>

                  {hikingDays.length > 0 && (
                    <div className='flex gap-1'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={handleRefreshAllWeather}
                        disabled={isLoading}
                        className='text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3'
                      >
                        <RefreshCw className='h-3 w-3 sm:h-4 sm:w-4' />
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={handleClearAll}
                        className='text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3 text-red-600 hover:text-red-700 hover:bg-red-50'
                      >
                        <Trash2 className='h-3 w-3 sm:h-4 sm:w-4' />
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
              ) : (
                <ListView
                  hikingDays={hikingDays}
                  onRemoveDay={handleRemoveDay}
                  onRefreshWeather={handleRefreshWeather}
                  loadingDayId={loadingDayId}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
