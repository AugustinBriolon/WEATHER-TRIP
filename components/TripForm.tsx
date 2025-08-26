import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LocationSearchResult } from '@/types/weather';
import { searchLocation } from '@/lib/weather-api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, MapPin, Search, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TripFormProps {
  onAddHikingDay: (date: Date, location: LocationSearchResult) => void;
  isLoading?: boolean;
  hideDatePicker?: boolean;
  defaultDate?: Date;
}

export function TripForm({
  onAddHikingDay,
  isLoading = false,
  hideDatePicker = false,
  defaultDate,
}: TripFormProps) {
  const [date, setDate] = useState<Date | undefined>(defaultDate);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>(
    []
  );
  const [selectedLocation, setSelectedLocation] =
    useState<LocationSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Mettre à jour la date si defaultDate change
  React.useEffect(() => {
    if (defaultDate) {
      setDate(defaultDate);
    }
  }, [defaultDate]);

  const handleLocationSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchLocation(searchQuery);
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Erreur lors de la recherche de localisation:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSelect = (location: LocationSearchResult) => {
    setSelectedLocation(location);
    setSearchQuery(`${location.name}, ${location.country}`);
    setShowResults(false);
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      setCalendarOpen(false); // Fermer le calendrier après sélection
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !selectedLocation) {
      alert('Veuillez sélectionner une date et une localisation');
      return;
    }

    onAddHikingDay(date, selectedLocation);

    // Reset form seulement si pas en mode modal
    if (!hideDatePicker) {
      setDate(undefined);
      setSearchQuery('');
      setSelectedLocation(null);
      setSearchResults([]);
    }
  };

  return (
    <Card className='h-fit'>
      <CardHeader className='pb-4'>
        <CardTitle className='text-lg sm:text-xl flex items-center gap-2'>
          <Plus className='h-4 w-4 sm:h-5 sm:w-5' />
          {hideDatePicker
            ? 'Ajouter une randonnée'
            : 'Ajouter un jour de randonnée'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Date Picker - caché si hideDatePicker est true */}
          {!hideDatePicker && (
            <div className='space-y-2'>
              <Label htmlFor='date' className='text-sm sm:text-base'>
                Date de randonnée
              </Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={cn(
                      'w-full justify-start text-left font-normal text-sm sm:text-base',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className='mr-2 h-3 w-3 sm:h-4 sm:w-4' />
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
                    weekStartsOn={1} // 1 = Lundi, 0 = Dimanche
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Affichage de la date sélectionnée en mode modal */}
          {hideDatePicker && date && (
            <div className='space-y-2'>
              <Label className='text-sm sm:text-base'>Date sélectionnée</Label>
              <div className='p-3 bg-muted rounded-md'>
                <span className='font-medium text-sm sm:text-base'>
                  {format(date, 'EEEE d MMMM yyyy', { locale: fr })}
                </span>
              </div>
            </div>
          )}

          {/* Location Search */}
          <div className='space-y-2'>
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
            </div>

            {/* Résultats de recherche */}
            {searchResults.length > 0 && (
              <div className='max-h-48 overflow-y-auto border rounded-md'>
                {searchResults.map((result) => (
                  <button
                    key={`${result.lat}-${result.lon}`}
                    type='button'
                    onClick={() => handleLocationSelect(result)}
                    className='w-full p-3 text-left hover:bg-muted flex items-center gap-2 border-b last:border-b-0'
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

            {/* État de chargement */}
            {isLoading && (
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Loader2 className='h-3 w-3 sm:h-4 sm:w-4 animate-spin' />
                Recherche en cours...
              </div>
            )}
          </div>

          {/* Bouton de soumission */}
          <Button
            type='submit'
            className='w-full'
            disabled={!date || !selectedLocation || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin' />
                Ajout en cours...
              </>
            ) : (
              <>
                <Plus className='mr-2 h-3 w-3 sm:h-4 sm:w-4' />
                Ajouter
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
