import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WeatherCard } from './WeatherCard';
import { TripForm } from './TripForm';
import { HikingDay, LocationSearchResult } from '@/types/weather';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Mountain, Plus, X, MapPin } from 'lucide-react';

interface CalendarViewProps {
  hikingDays: HikingDay[];
  onAddHikingDay: (date: Date, location: LocationSearchResult) => void;
  onRemoveDay: (dayId: string) => void;
}

export function CalendarView({
  hikingDays,
  onAddHikingDay,
  onRemoveDay,
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fonction pour obtenir les jours avec des événements
  const getDaysWithEvents = () => {
    return hikingDays.map((day) => day.date);
  };

  // Fonction pour obtenir l'événement d'une date spécifique
  const getEventForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return hikingDays.find((day) => format(day.date, 'yyyy-MM-dd') === dateStr);
  };

  // Fonction pour gérer le clic sur une date
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const event = getEventForDate(date);

    if (event) {
      // Ouvrir la modale de consultation
      setIsModalOpen(true);
    } else {
      // Ouvrir la modale d'ajout
      setIsAddModalOpen(true);
    }
  };

  // Fonction pour ajouter un événement depuis la modale
  const handleAddFromModal = (date: Date, location: LocationSearchResult) => {
    onAddHikingDay(date, location);
    setIsAddModalOpen(false);
    setSelectedDate(undefined);
  };

  // Fonction pour supprimer un événement depuis la modale
  const handleRemoveFromModal = () => {
    if (selectedDate) {
      const event = getEventForDate(selectedDate);
      if (event) {
        onRemoveDay(event.id);
        setIsModalOpen(false);
        setSelectedDate(undefined);
      }
    }
  };

  return (
    <div className='space-y-4 sm:space-y-6'>
      {/* Calendrier */}
      <div className='bg-white rounded-lg border p-4 sm:p-6'>
        <Calendar
          mode='single'
          selected={selectedDate}
          onSelect={(date) => {
            if (date) {
              handleDateClick(date);
            }
          }}
          disabled={(date) => date < new Date()}
          weekStartsOn={1}
          modifiers={{
            event: getDaysWithEvents(),
          }}
          modifiersStyles={{
            event: {
              position: 'relative',
            },
          }}
          className='w-full'
        />
      </div>

      {/* Légende */}
      <div className='flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground'>
        <div className='flex justify-center items-center gap-2'>
          <div className='w-1.5 h-1.5 bg-green-500 rounded-full'></div>
          <span>Jour de randonnée</span>
        </div>
      </div>

      {/* Modale de consultation d'événement */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className='max-w-sm sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-base sm:text-lg'>
              <Mountain className='h-4 w-4 sm:h-5 sm:w-5' />
              Randonnée du{' '}
              {selectedDate &&
                format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
            </DialogTitle>
          </DialogHeader>

          {selectedDate &&
            (() => {
              const event = getEventForDate(selectedDate);
              if (!event) return null;

              return (
                <div className='space-y-3 sm:space-y-4'>
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4'>
                    <div className='flex items-center gap-2'>
                      <MapPin className='h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0' />
                      <span className='font-medium text-sm sm:text-base truncate'>
                        {event.location.name}
                      </span>
                    </div>
                    <Badge variant='outline' className='text-xs w-fit'>
                      {format(event.date, 'dd/MM/yyyy')}
                    </Badge>
                  </div>

                  {event.weather ? (
                    <WeatherCard
                      date={event.date}
                      location={event.location.name}
                      weather={event.weather}
                    />
                  ) : (
                    <div className='text-center py-6 sm:py-8 text-muted-foreground'>
                      <p className='text-sm sm:text-base'>
                        Données météo non disponibles
                      </p>
                    </div>
                  )}

                  <div className='flex justify-end gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleRemoveFromModal}
                      className='text-red-600 hover:text-red-700 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3'
                    >
                      <X className='h-3 w-3 sm:h-4 sm:w-4 mr-1' />
                      Supprimer
                    </Button>
                  </div>
                </div>
              );
            })()}
        </DialogContent>
      </Dialog>

      {/* Modale d'ajout d'événement */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className='max-w-sm sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-base sm:text-lg'>
              <Plus className='h-4 w-4 sm:h-5 sm:w-5' />
              Ajouter une randonnée le{' '}
              {selectedDate &&
                format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-3 sm:space-y-4'>
            <p className='text-xs sm:text-sm text-muted-foreground'>
              Sélectionnez une localisation pour ajouter une randonnée à cette
              date.
            </p>

            <TripForm
              onAddHikingDay={handleAddFromModal}
              isLoading={false}
              hideDatePicker={true}
              defaultDate={selectedDate}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
