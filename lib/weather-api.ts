import {
  LocationSearchResult,
  OpenWeatherDaySummaryResponse,
  OpenWeatherGeoResponse,
  WeatherData,
} from '@/types/weather';
import { toast } from 'sonner';

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/3.0';

export async function searchLocation(
  query: string
): Promise<LocationSearchResult[]> {
  if (!OPENWEATHER_API_KEY) {
    toast.error('OpenWeather API key not configured');
    throw new Error('OpenWeather API key not configured');
  }

  const url = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
    query
  )}&limit=5&appid=${OPENWEATHER_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error response:', errorText);
      toast.error('Erreur lors de la recherche de localisation');
      throw new Error(
        `Failed to search location: ${response.status} ${response.statusText}`
      );
    }

    const data: OpenWeatherGeoResponse[] = await response.json();

    return data.map((item: OpenWeatherGeoResponse) => ({
      name: item.name,
      country: item.country,
      state: item.state,
      lat: item.lat,
      lon: item.lon,
    }));
  } catch (error) {
    console.error('Erreur lors de la recherche de localisation:', error);
    toast.error('Erreur lors de la recherche de localisation');
    return [];
  }
}

export async function getWeatherForecast(
  lat: number,
  lon: number,
  targetDate: Date
): Promise<WeatherData | null> {
  if (!OPENWEATHER_API_KEY) {
    toast.error('OpenWeather API key not configured');
    return null;
  }

  try {
    const dateStr = targetDate.toISOString().split('T')[0];

    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/onecall/day_summary?lat=${lat}&lon=${lon}&date=${dateStr}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    if (!response.ok) {
      toast.error('Erreur lors de la récupération des données météo');
      return null;
    }

    const data: OpenWeatherDaySummaryResponse = await response.json();

    return {
      date: dateStr,
      temperature: {
        current: data.temperature.afternoon,
        min: data.temperature.min,
        max: data.temperature.max,
      },
      condition: {
        main: getWeatherConditionFromCloudCover(data.cloud_cover.afternoon),
        description: getWeatherDescriptionFromCloudCover(
          data.cloud_cover.afternoon
        ),
        icon: getWeatherIconFromCloudCover(data.cloud_cover.afternoon),
      },
      precipitation: data.precipitation.total,
      humidity: data.humidity.afternoon,
      pressure: data.pressure.afternoon,
      wind: {
        speed: data.wind.max.speed,
        direction: data.wind.max.direction,
      },
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des données météo:', error);
    toast.error('Erreur lors de la récupération des données météo');
    return null;
  }
}

function getWeatherConditionFromCloudCover(cloudCover: number): string {
  if (cloudCover < 20) return 'Clear';
  if (cloudCover < 50) return 'Clouds';
  if (cloudCover < 80) return 'Clouds';
  return 'Clouds';
}

function getWeatherDescriptionFromCloudCover(cloudCover: number): string {
  if (cloudCover < 20) return 'Ciel dégagé';
  if (cloudCover < 50) return 'Peu nuageux';
  if (cloudCover < 80) return 'Nuageux';
  return 'Très nuageux';
}

function getWeatherIconFromCloudCover(cloudCover: number): string {
  if (cloudCover < 20) return '01d';
  if (cloudCover < 50) return '02d';
  if (cloudCover < 80) return '03d';
  return '04d';
}

export function getWeatherIcon(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

export function getWindDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}
