import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { searchLocation, getWeatherForecast } from '@/lib/weather-api';
import { LocationSearchResult, WeatherData } from '@/types/weather';


export function useLocationSearch(query: string) {
  return useQuery<LocationSearchResult[], Error>({
    queryKey: ['location-search', query],
    queryFn: () => searchLocation(query),
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useWeatherForecast(
  lat: number | null,
  lon: number | null,
  targetDate: Date | null
) {
  return useQuery<WeatherData | null, Error>({
    queryKey: [
      'weather-forecast',
      lat,
      lon,
      targetDate?.toISOString().split('T')[0],
    ],
    queryFn: () => {
      if (!lat || !lon || !targetDate) {
        throw new Error('Coordonnées ou date manquantes');
      }
      return getWeatherForecast(lat, lon, targetDate);
    },
    enabled: !!(lat && lon && targetDate),
    staleTime: 1000 * 60 * 15,
    retry: (failureCount, error: Error) => {
      if (error?.message?.includes('401') || error?.message?.includes('404')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useRefreshWeather() {
  const queryClient = useQueryClient();

  return useMutation<
    WeatherData | null,
    Error,
    { lat: number; lon: number; targetDate: Date }
  >({
    mutationFn: async ({
      lat,
      lon,
      targetDate,
    }: {
      lat: number;
      lon: number;
      targetDate: Date;
    }) => {
      return getWeatherForecast(lat, lon, targetDate);
    },
    onSuccess: (data, variables) => {
      const dateKey = variables.targetDate.toISOString().split('T')[0];
      queryClient.setQueryData(
        ['weather-forecast', variables.lat, variables.lon, dateKey],
        data
      );
      toast.success('Données météo mises à jour');
    },
    onError: (error: Error) => {
      toast.error('Erreur lors de la mise à jour', {
        description: error.message || 'Impossible de rafraîchir les données',
      });
    },
  });
}

export function useRefreshAllWeather() {
  const queryClient = useQueryClient();

  return useMutation<
    (WeatherData | null)[],
    Error,
    Array<{ lat: number; lon: number; date: Date }>
  >({
    mutationFn: async (
      hikingDays: Array<{ lat: number; lon: number; date: Date }>
    ) => {
      const promises = hikingDays.map((day) =>
        getWeatherForecast(day.lat, day.lon, day.date)
      );
      return Promise.all(promises);
    },
    onSuccess: (data, variables) => {
      variables.forEach((day, index) => {
        const dateKey = day.date.toISOString().split('T')[0];
        queryClient.setQueryData(
          ['weather-forecast', day.lat, day.lon, dateKey],
          data[index]
        );
      });
      toast.success(`${variables.length} journées mises à jour`);
    },
    onError: (error: Error) => {
      toast.error('Erreur lors de la mise à jour globale', {
        description:
          error.message || 'Impossible de rafraîchir toutes les données',
      });
    },
  });
}
