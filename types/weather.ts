export interface WeatherData {
  date: string;
  temperature: {
    min: number;
    max: number;
    current: number;
  };
  condition: {
    main: string;
    description: string;
    icon: string;
  };
  precipitation: number;
  humidity: number;
  wind: {
    speed: number;
    direction: number;
  };
  pressure: number;
}

export interface HikingDay {
  id: string;
  date: Date;
  location: {
    name: string;
    coordinates?: {
      lat: number;
      lon: number;
    };
  };
  weather?: WeatherData;
}

export interface LocationSearchResult {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

// Types pour l'API OpenWeatherMap 3.0 OneCall
export interface OpenWeatherOneCallResponse {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current: {
    dt: number;
    sunrise: number;
    sunset: number;
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    dew_point: number;
    uvi: number;
    clouds: number;
    visibility: number;
    wind_speed: number;
    wind_deg: number;
    wind_gust: number;
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
  };
  daily: Array<{
    dt: number;
    sunrise: number;
    sunset: number;
    moonrise: number;
    moonset: number;
    moon_phase: number;
    summary: string;
    temp: {
      day: number;
      min: number;
      max: number;
      night: number;
      eve: number;
      morn: number;
    };
    feels_like: {
      day: number;
      night: number;
      eve: number;
      morn: number;
    };
    pressure: number;
    humidity: number;
    dew_point: number;
    wind_speed: number;
    wind_deg: number;
    wind_gust: number;
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    clouds: number;
    pop: number;
    rain?: number;
    uvi: number;
  }>;
  alerts?: Array<{
    sender_name: string;
    event: string;
    start: number;
    end: number;
    description: string;
    tags: string[];
  }>;
}

// Types pour l'API Geo 1.0
export interface OpenWeatherGeoResponse {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

// Type legacy pour compatibilité (API 2.5)
export interface OpenWeatherResponse {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      temp_min: number;
      temp_max: number;
      humidity: number;
      pressure: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    wind: {
      speed: number;
      deg: number;
    };
    pop: number; // Probability of precipitation
  }>;
  city: {
    name: string;
    country: string;
  };
}

// Types pour l'API OpenWeatherMap OneCall Day Summary (nouvel endpoint)
export interface OpenWeatherDaySummaryResponse {
  lat: number;
  lon: number;
  tz: string;
  date: string;
  units: string;
  cloud_cover: {
    afternoon: number;
  };
  humidity: {
    afternoon: number;
  };
  precipitation: {
    total: number;
  };
  temperature: {
    min: number;
    max: number;
    afternoon: number;
    night: number;
    evening: number;
    morning: number;
  };
  pressure: {
    afternoon: number;
  };
  wind: {
    max: {
      speed: number;
      direction: number;
    };
  };
}
