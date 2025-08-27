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

  const getDaysWithEvents = () => {
    return hikingDays.map((day) => day.date);
  };

  const getEventForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return hikingDays.find((day) => format(day.date, 'yyyy-MM-dd') === dateStr);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const event = getEventForDate(date);

    if (event) {
      setIsModalOpen(true);
    } else {
      setIsAddModalOpen(true);
    }
  };

  const handleAddFromModal = (date: Date, location: LocationSearchResult) => {
    onAddHikingDay(date, location);
    setIsAddModalOpen(false);
    setSelectedDate(undefined);
  };

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

      <div className='flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground'>
        <div className='flex justify-center items-center gap-2'>
          <div className='w-1.5 h-1.5 bg-green-500 rounded-full'></div>
          <span>Jour de randonnée</span>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className='max-w-sm sm:max-w-md'>
          {selectedDate &&
            (() => {
              const event = getEventForDate(selectedDate);
              if (!event) return null;

              return (
                <div className='space-y-3 sm:space-y-4'>
                  {event.weather ? (
                    <WeatherCard
                      date={event.date}
                      location={event.location.name}
                      weather={event.weather}
                      isFromModal
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

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className='max-w-sm sm:max-w-md'>
          <TripForm
            onAddHikingDay={handleAddFromModal}
            isLoading={false}
            hideDatePicker={true}
            defaultDate={selectedDate}
            isFromModal
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
