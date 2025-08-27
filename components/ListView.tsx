import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HikingDay } from '@/types/weather';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  Droplets,
  Loader2,
  MapPin,
  Mountain,
  RefreshCw,
  Thermometer,
  Trash2,
  Wind,
} from 'lucide-react';

interface ListViewProps {
  hikingDays: HikingDay[];
  onRemoveDay: (dayId: string) => void;
  onRefreshWeather: (day: HikingDay) => void;
  loadingDayId: string | null;
}

export function ListView({
  hikingDays,
  onRemoveDay,
  onRefreshWeather,
  loadingDayId,
}: ListViewProps) {
  const sortedHikingDays = [...hikingDays].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  const getWeatherSummary = (day: HikingDay) => {
    if (!day.weather) return null;

    return {
      temp: day.weather.temperature.current,
      condition: day.weather.condition.main,
      precipitation: day.weather.precipitation,
      wind: day.weather.wind.speed,
    };
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return '☀️';
      case 'clouds':
        return '☁️';
      case 'rain':
      case 'drizzle':
        return '🌧️';
      case 'snow':
        return '❄️';
      case 'thunderstorm':
        return '⛈️';
      default:
        return '🌤️';
    }
  };

  const getTemperatureColor = (temp: number) => {
    if (temp < 0) return 'text-blue-600';
    if (temp < 10) return 'text-cyan-600';
    if (temp < 20) return 'text-green-600';
    if (temp < 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const isDayLoading = (dayId: string) => {
    return loadingDayId === 'loading' || loadingDayId === dayId;
  };

  if (hikingDays.length === 0) {
    return (
      <div className='text-center py-12 text-muted-foreground'>
        <Mountain className='h-12 w-12 mx-auto mb-4 opacity-50' />
        <p>Aucun jour de randonnée ajouté</p>
        <p className='text-sm'>
          Commencez par ajouter votre premier jour de randonnée
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='bg-white rounded-lg border border-slate-200 p-4 sm:p-6'>
        <h2 className='text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4'>
          Aperçu du voyage
        </h2>

        <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
          <div className='text-center'>
            <div className='text-xl sm:text-2xl font-bold text-slate-800'>
              {hikingDays.length}
            </div>
            <div className='text-xs sm:text-sm text-slate-600'>
              jour{hikingDays.length > 1 ? 's' : ''}
            </div>
            {hikingDays.length > 0 && (
              <div className='text-xs text-slate-500 mt-1'>
                {format(sortedHikingDays[0].date, 'dd/MM')} -{' '}
                {format(
                  sortedHikingDays[sortedHikingDays.length - 1].date,
                  'dd/MM'
                )}
              </div>
            )}
          </div>

          <div className='text-center'>
            <div className='text-xl sm:text-2xl font-bold text-green-600'>
              {
                hikingDays.filter(
                  (day) =>
                    day.weather &&
                    day.weather.precipitation < 30 &&
                    day.weather.wind.speed < 20
                ).length
              }
            </div>
            <div className='text-xs sm:text-sm text-slate-600'>
              jours favorables
            </div>
          </div>

          <div className='text-center'>
            <div className='text-xl sm:text-2xl font-bold text-orange-600'>
              {
                hikingDays.filter(
                  (day) => day.weather && day.weather.precipitation > 50
                ).length
              }
            </div>
            <div className='text-xs sm:text-sm text-slate-600'>
              risque pluie
            </div>
          </div>

          <div className='text-center'>
            <div className='text-xl sm:text-2xl font-bold text-red-600'>
              {
                hikingDays.filter(
                  (day) => day.weather && day.weather.wind.speed > 40
                ).length
              }
            </div>
            <div className='text-xs sm:text-sm text-slate-600'>vent fort</div>
          </div>
        </div>
      </div>

      {(() => {
        const highRainDays = hikingDays.filter(
          (day) => day.weather && day.weather.precipitation > 70
        );
        const highWindDays = hikingDays.filter(
          (day) => day.weather && day.weather.wind.speed > 50
        );
        const coldDays = hikingDays.filter(
          (day) => day.weather && day.weather.temperature.current < 5
        );
        const hotDays = hikingDays.filter(
          (day) => day.weather && day.weather.temperature.current > 30
        );

        if (
          highRainDays.length > 0 ||
          highWindDays.length > 0 ||
          coldDays.length > 0 ||
          hotDays.length > 0
        ) {
          return (
            <div className='space-y-2'>
              {highRainDays.length > 0 && (
                <div className='flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg'>
                  <Droplets className='h-4 w-4 sm:h-5 sm:w-5 text-blue-900 flex-shrink-0' />
                  <div className='text-xs sm:text-sm min-w-0 flex-1'>
                    <span className='font-medium'>
                      Pluie forte le
                    </span>
                    <span className='text-red-500'>
                      {' '}
                      {highRainDays
                        .map((day) => format(day.date, 'dd/MM'))
                        .join(', ')}
                    </span>
                    <span>
                      {' '}
                      - Équipement imperméable recommandé
                    </span>
                  </div>
                </div>
              )}

              {highWindDays.length > 0 && (
                <div className='flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg'>
                  <Wind className='h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0' />
                  <div className='text-xs sm:text-sm min-w-0 flex-1'>
                    <span className='font-medium text-red-800'>
                      Vent violent
                    </span>
                    <span className='text-red-700'>
                      {' '}
                      le{' '}
                      {highWindDays
                        .map((day) => format(day.date, 'dd/MM'))
                        .join(', ')}
                    </span>
                    <span className='text-red-600'>
                      {' '}
                      - Éviter les zones exposées
                    </span>
                  </div>
                </div>
              )}

              {coldDays.length > 0 && (
                <div className='flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                  <Thermometer className='h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0' />
                  <div className='text-xs sm:text-sm min-w-0 flex-1'>
                    <span className='font-medium text-blue-800'>
                      Températures froides
                    </span>
                    <span className='text-blue-700'>
                      {' '}
                      le{' '}
                      {coldDays
                        .map((day) => format(day.date, 'dd/MM'))
                        .join(', ')}
                    </span>
                    <span className='text-blue-600'>
                      {' '}
                      - Prévoir vêtements chauds
                    </span>
                  </div>
                </div>
              )}

              {hotDays.length > 0 && (
                <div className='flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-orange-50 border border-orange-200 rounded-lg'>
                  <Thermometer className='h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0' />
                  <div className='text-xs sm:text-sm min-w-0 flex-1'>
                    <span className='font-medium text-orange-800'>
                      Chaleur importante
                    </span>
                    <span className='text-orange-700'>
                      {' '}
                      le{' '}
                      {hotDays
                        .map((day) => format(day.date, 'dd/MM'))
                        .join(', ')}
                    </span>
                    <span className='text-orange-600'>
                      {' '}
                      - Hydratation et protection solaire
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        }
        return null;
      })()}

      <div className='grid gap-2'>
        {sortedHikingDays.map((day) => {
          const weatherSummary = getWeatherSummary(day);
          const isToday =
            format(day.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          const isTomorrow =
            format(day.date, 'yyyy-MM-dd') ===
            format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd');

          return (
            <Card
              key={day.id}
              className={`transition-all duration-200 hover:shadow-lg ${
                isToday
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : isTomorrow
                  ? 'ring-2 ring-green-500 bg-green-50'
                  : ''
              }`}
            >
              <CardContent className='p-4 sm:p-6'>
                <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4'>
                  <div className='flex-1 min-w-0'>
                    <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3'>
                      <div className='flex items-center gap-2'>
                        <Calendar className='h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0' />
                        <h3 className='text-base sm:text-lg font-semibold truncate'>
                          {format(day.date, 'EEEE d MMMM', { locale: fr })}
                        </h3>
                        {isToday && (
                          <Badge className='bg-blue-500 text-white text-xs'>
                            Aujourd&apos;hui
                          </Badge>
                        )}
                        {isTomorrow && (
                          <Badge className='bg-green-500 text-white text-xs'>
                            Demain
                          </Badge>
                        )}
                      </div>
                      <Badge variant='outline' className='text-xs w-fit'>
                        {format(day.date, 'dd/MM/yyyy')}
                      </Badge>
                    </div>

                    <div className='flex items-center gap-2 mb-3 sm:mb-4'>
                      <MapPin className='h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0' />
                      <span className='text-muted-foreground text-sm truncate'>
                        {day.location.name}
                      </span>
                    </div>

                    {weatherSummary ? (
                      <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4'>
                        <div className='flex items-center gap-2'>
                          <span className='text-xl sm:text-2xl'>
                            {getWeatherIcon(weatherSummary.condition)}
                          </span>
                          <span
                            className={`text-lg sm:text-xl font-bold ${getTemperatureColor(
                              weatherSummary.temp
                            )}`}
                          >
                            {weatherSummary.temp}°C
                          </span>
                        </div>

                        <div className='flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground'>
                          <div className='flex items-center gap-1'>
                            <Droplets className='h-3 w-3 sm:h-4 sm:w-4' />
                            <span>{weatherSummary.precipitation}%</span>
                          </div>
                          <div className='flex items-center gap-1'>
                            <Wind className='h-3 w-3 sm:h-4 sm:w-4' />
                            <span>{weatherSummary.wind} km/h</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className='flex items-center gap-2 text-muted-foreground'>
                        <Clock className='h-3 w-3 sm:h-4 sm:w-4' />
                        <span className='text-sm'>
                          Données météo non disponibles
                        </span>
                      </div>
                    )}
                  </div>

                  <div className='flex items-center gap-2 sm:ml-4'>
                    {isDayLoading(day.id) ? (
                      <div className='flex items-center gap-2 text-muted-foreground'>
                        <Loader2 className='h-3 w-3 sm:h-4 sm:w-4 animate-spin' />
                        <span className='text-xs sm:text-sm'>
                          Chargement...
                        </span>
                      </div>
                    ) : (
                      <>
                        {!day.weather && (
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => onRefreshWeather(day)}
                            disabled={!day.location.coordinates}
                            className='text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3'
                          >
                            <RefreshCw className='h-3 w-3 sm:h-4 sm:w-4 mr-1' />
                            <span className='hidden sm:inline'>Actualiser</span>
                          </Button>
                        )}
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => onRemoveDay(day.id)}
                          className='text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 sm:h-8 sm:w-8 p-0'
                        >
                          <Trash2 className='h-3 w-3 sm:h-4 sm:w-4' />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
