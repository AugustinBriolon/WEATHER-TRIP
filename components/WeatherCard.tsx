import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WeatherData } from '@/types/weather';
import { getWeatherIcon, getWindDirection } from '@/lib/weather-api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Calendar,
  MapPin,
  BarChart3,
} from 'lucide-react';

interface WeatherCardProps {
  date: Date;
  location: string;
  weather: WeatherData;
}

export function WeatherCard({ date, location, weather }: WeatherCardProps) {
  return (
    <Card className='w-full'>
      <CardHeader className='pb-3'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4'>
          <div className='flex items-center gap-2'>
            <Calendar className='h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0' />
            <CardTitle className='text-base sm:text-lg'>
              {format(date, 'EEEE d MMMM', { locale: fr })}
            </CardTitle>
          </div>
          <Badge variant='outline' className='text-xs w-fit'>
            {format(date, 'dd/MM/yyyy')}
          </Badge>
        </div>
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <MapPin className='h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0' />
          <span className='truncate'>{location}</span>
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        <div className='space-y-4'>
          {/* Condition météo principale */}
          <div className='flex items-center gap-3 sm:gap-4'>
            <div className='flex items-center gap-2'>
              <img
                src={`https://openweathermap.org/img/wn/${weather.condition.icon}@2x.png`}
                alt={weather.condition.description}
                className='w-12 h-12 sm:w-16 sm:h-16'
              />
              <div>
                <div className='text-lg sm:text-2xl font-bold'>
                  {weather.temperature.current}°C
                </div>
                <div className='text-sm sm:text-base text-muted-foreground capitalize'>
                  {weather.condition.description}
                </div>
              </div>
            </div>
            <Badge variant='secondary' className='text-xs sm:text-sm'>
              {weather.condition.main}
            </Badge>
          </div>

          {/* Températures min/max */}
          <div className='flex items-center gap-2 text-sm sm:text-base'>
            <Thermometer className='h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0' />
            <span className='text-blue-600 font-medium'>
              {weather.temperature.min}°C
            </span>
            <span className='text-muted-foreground'>/</span>
            <span className='text-red-600 font-medium'>
              {weather.temperature.max}°C
            </span>
          </div>

          {/* Détails météo */}
          <div className='grid grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base'>
            <div className='flex items-center gap-2'>
              <Droplets className='h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0' />
              <span>Précipitations {weather.precipitation}%</span>
            </div>
            <div className='flex items-center gap-2'>
              <Wind className='h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0' />
              <span>
                Vent {weather.wind.speed} km/h{' '}
                {getWindDirection(weather.wind.direction)}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <Gauge className='h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0' />
              <span>Humidité {weather.humidity}%</span>
            </div>
            <div className='flex items-center gap-2'>
              <BarChart3 className='h-3 w-3 sm:h-4 sm:w-4 text-purple-500 flex-shrink-0' />
              <span>Pression {weather.pressure} hPa</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
