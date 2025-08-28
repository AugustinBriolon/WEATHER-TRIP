import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHikingData } from '@/hooks/use-hiking-data';
import { useViewMode } from '@/hooks/use-view-mode';
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
import { CalendarView } from './CalendarView';
import { ListView } from './ListView';
import { MapView } from './MapView';
import { TripForm } from './TripForm';

export function TripPlanner() {
  const {
    hikingDays,
    isInitialized,
    isLoading,
    isRefreshingAll,
    handleAddHikingDay,
    handleRemoveDay,
    handleClearAll,
    handleRefreshWeather,
    handleRefreshAllWeather,
    handleImportHikingData,
  } = useHikingData();

  const { viewMode, changeViewMode } = useViewMode();

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
        <TripForm onAddHikingDay={handleAddHikingDay} isLoading={isLoading} />

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
                    onClick={() => changeViewMode('list')}
                  >
                    <List className='h-4 w-4' />
                  </Button>
                  <Button
                    size='sm'
                    variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                    onClick={() => changeViewMode('calendar')}
                  >
                    <Grid className='h-4 w-4' />
                  </Button>
                  <Button
                    size='sm'
                    variant={viewMode === 'map' ? 'default' : 'ghost'}
                    onClick={() => changeViewMode('map')}
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
                      disabled={isRefreshingAll}
                      className='text-sm h-8 px-3'
                    >
                      {isRefreshingAll ? (
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
                loadingDayId={isLoading ? 'loading' : null}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
