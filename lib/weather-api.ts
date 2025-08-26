import {
  LocationSearchResult,
  WeatherData,
  OpenWeatherGeoResponse,
  OpenWeatherOneCallResponse,
  OpenWeatherDaySummaryResponse,
} from '@/types/weather';

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/3.0';

const DEMO_WEATHER_DATA: WeatherData[] = [
  {
    date: new Date().toISOString().split('T')[0],
    temperature: { min: 12, max: 22, current: 18 },
    condition: { main: 'Clouds', description: 'nuageux', icon: '03d' },
    precipitation: 20,
    humidity: 65,
    wind: { speed: 15, direction: 180 },
    pressure: 1013,
  },
  {
    date: new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    temperature: { min: 10, max: 20, current: 16 },
    condition: { main: 'Rain', description: 'pluie légère', icon: '10d' },
    precipitation: 60,
    humidity: 80,
    wind: { speed: 20, direction: 200 },
    pressure: 1008,
  },
  {
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    temperature: { min: 8, max: 18, current: 14 },
    condition: { main: 'Clear', description: 'dégagé', icon: '01d' },
    precipitation: 5,
    humidity: 55,
    wind: { speed: 12, direction: 150 },
    pressure: 1020,
  },
];

export async function searchLocation(
  query: string
): Promise<LocationSearchResult[]> {
  if (!OPENWEATHER_API_KEY) {
    throw new Error('OpenWeather API key not configured');
  }

  const url = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
    query
  )}&limit=5&appid=${OPENWEATHER_API_KEY}`;

  console.log('Searching location with URL:', url);

  try {
    const response = await fetch(url);

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error response:', errorText);
      throw new Error(
        `Failed to search location: ${response.status} ${response.statusText}`
      );
    }

    const data: OpenWeatherGeoResponse[] = await response.json();
    console.log('API Response data:', data);

    return data.map((item: OpenWeatherGeoResponse) => ({
      name: item.name,
      country: item.country,
      state: item.state,
      lat: item.lat,
      lon: item.lon,
    }));
  } catch (error) {
    console.error('Search location error:', error);
    throw error;
  }
}

export async function getWeatherForecast(
  lat: number,
  lon: number,
  targetDate: Date
): Promise<WeatherData | null> {
  if (!OPENWEATHER_API_KEY) {
    console.error('OpenWeather API key not configured');
    return null;
  }

  try {
    // Formater la date au format YYYY-MM-DD pour l'API
    const dateStr = targetDate.toISOString().split('T')[0];

    console.log(`Fetching weather for ${dateStr} at lat:${lat}, lon:${lon}`);

    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/onecall/day_summary?lat=${lat}&lon=${lon}&date=${dateStr}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    if (!response.ok) {
      console.error(
        `Failed to fetch weather: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data: OpenWeatherDaySummaryResponse = await response.json();
    console.log('Weather API response:', data);

    // Convertir la réponse en format WeatherData
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
    console.error('Error fetching weather forecast:', error);
    return null;
  }
}

// Fonction helper pour déterminer la condition météo basée sur la couverture nuageuse
function getWeatherConditionFromCloudCover(cloudCover: number): string {
  if (cloudCover < 20) return 'Clear';
  if (cloudCover < 50) return 'Clouds';
  if (cloudCover < 80) return 'Clouds';
  return 'Clouds';
}

// Fonction helper pour obtenir une description basée sur la couverture nuageuse
function getWeatherDescriptionFromCloudCover(cloudCover: number): string {
  if (cloudCover < 20) return 'Ciel dégagé';
  if (cloudCover < 50) return 'Peu nuageux';
  if (cloudCover < 80) return 'Nuageux';
  return 'Très nuageux';
}

// Fonction helper pour obtenir l'icône météo basée sur la couverture nuageuse
function getWeatherIconFromCloudCover(cloudCover: number): string {
  if (cloudCover < 20) return '01d'; // Ciel dégagé
  if (cloudCover < 50) return '02d'; // Peu nuageux
  if (cloudCover < 80) return '03d'; // Nuageux
  return '04d'; // Très nuageux
}

export function getWeatherIcon(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

export function getWindDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}
