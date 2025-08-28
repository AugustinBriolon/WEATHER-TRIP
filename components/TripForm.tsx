import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useLocationSearch } from '@/hooks/use-weather';
import { cn } from '@/lib/utils';
import { LocationSearchResult } from '@/types/weather';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Loader2, MapPin, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface TripFormProps {
  onAddHikingDay: (date: Date, location: LocationSearchResult) => void;
  isLoading?: boolean;
  hideDatePicker?: boolean;
  defaultDate?: Date;
  isFromModal?: boolean;
}

export function TripForm({
  onAddHikingDay,
  isLoading = false,
  hideDatePicker = false,
  defaultDate,
  isFromModal = false,
}: TripFormProps) {
  const [date, setDate] = useState<Date | undefined>(defaultDate);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] =
    useState<LocationSearchResult | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const {
    data: searchResults = [],
    isLoading: isSearching,
    error,
  } = useLocationSearch(searchQuery);

  useEffect(() => {
    if (error) {
      toast.error('Erreur lors de la recherche de localisation', {
        description: error.message || 'Vérifiez votre connexion internet',
      });
    }
  }, [error]);

  useEffect(() => {
    if (defaultDate) {
      setDate(defaultDate);
    }
  }, [defaultDate]);

  const handleLocationSelect = (location: LocationSearchResult) => {
    setSelectedLocation(location);
    setSearchQuery(`${location.name}, ${location.country}`);
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      setCalendarOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !selectedLocation) {
      alert('Veuillez sélectionner une date et une localisation');
      return;
    }

    onAddHikingDay(date, selectedLocation);

    if (!hideDatePicker) {
      setDate(undefined);
      setSearchQuery('');
      setSelectedLocation(null);
    }
  };

  return (
    <Card className={cn('h-fit', isFromModal && 'border-0 shadow-none p-0')}>
      <CardHeader className={cn(isFromModal && 'p-0')}>
        <CardTitle className='text-lg sm:text-xl flex items-center gap-2'>
          Ajouter un itinéraire
        </CardTitle>
      </CardHeader>

      <CardContent className={cn(isFromModal && 'p-0')}>
        <form
          onSubmit={handleSubmit}
          className={cn(
            'flex items-end justify-start gap-4 flex-wrap',
            isFromModal && 'flex-col items-start gap-2'
          )}
        >
          {!hideDatePicker && (
            <div className={cn('space-y-2', isFromModal && 'w-full')}>
              <Label htmlFor='date' className='text-sm sm:text-base'>
                Date de randonnée
              </Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={cn(
                      'w-full justify-start text-left text-sm',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className='h-3 w-3 sm:h-4 sm:w-4' />
                    {date
                      ? format(date, 'PPP', { locale: fr })
                      : 'Sélectionner une date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={date}
                    onSelect={handleDateSelect}
                    disabled={(date) => date < new Date()}
                    weekStartsOn={1}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {hideDatePicker && date && (
            <div className={cn('space-y-2', isFromModal && 'w-full')}>
              <Label className='text-sm sm:text-base'>Date sélectionnée</Label>
              <div className='p-3 bg-muted rounded-md flex items-center gap-2'>
                <CalendarIcon className='h-3 w-3 sm:h-4 sm:w-4' />
                <span className='font-medium text-sm sm:text-base'>
                  {format(date, 'EEEE d MMMM yyyy', { locale: fr })}
                </span>
              </div>
            </div>
          )}

          <div className={cn('space-y-2', isFromModal && 'w-full relative')}>
            <Label htmlFor='location' className='text-sm sm:text-base'>
              Localisation
            </Label>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground' />
              <Input
                id='location'
                type='text'
                placeholder='Rechercher une ville...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-9 text-sm sm:text-base'
                disabled={isLoading}
              />
              {searchResults.length > 0 && (
                <div className='max-h-48 overflow-y-auto border rounded-md absolute top-full left-0 w-full'>
                  {searchResults.map((result) => (
                    <button
                      key={`${result.lat}-${result.lon}`}
                      type='button'
                      onClick={() => handleLocationSelect(result)}
                      className='w-full p-3 text-left hover:bg-muted flex items-center gap-2 border-b last:border-b-0 bg-white'
                    >
                      <MapPin className='h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0' />
                      <div className='min-w-0 flex-1'>
                        <div className='font-medium text-sm sm:text-base truncate'>
                          {result.name}
                        </div>
                        <div className='text-xs sm:text-sm text-muted-foreground truncate'>
                          {result.country}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isSearching && (
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Loader2 className='h-3 w-3 sm:h-4 sm:w-4 animate-spin' />
                Recherche en cours...
              </div>
            )}
          </div>

          <Button
            className={cn(isFromModal && 'w-full')}
            type='submit'
            disabled={!date || !selectedLocation || isLoading}
          >
            {isLoading ? (
              <Loader2 className='h-3 w-3 sm:h-4 sm:w-4 animate-spin' />
            ) : (
              'Ajouter'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
