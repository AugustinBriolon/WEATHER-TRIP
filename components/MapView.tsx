import { Card, CardContent } from '@/components/ui/card';
import mapboxgl from 'mapbox-gl';
import { useEffect, useRef } from 'react';


export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);


  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/agtt/cmevfveoy00hn01qw3wsq3hfw',
      center: [2.2137, 46.2276],
      zoom: 5,
    });

    mapRef.current.on('style.load', () => {
      mapRef.current?.setFog({});
    });

    mapRef.current.on('load', () => {
      mapRef.current?.addSource('hiking-days', {
        type: 'geojson',
        data: '/hiking-days.geojson',
      });

      mapRef.current?.addLayer({
        id: 'hiking-days',
        type: 'circle',
        source: 'hiking-days',
      });
    });

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  return (
    <div className='h-full flex flex-col'>
      <Card className='flex-1 py-0'>
        <CardContent className='p-0 overflow-hidden'>
          <div
            ref={mapContainer}
            className='w-full h-full min-h-[500px]'
          />
        </CardContent>
      </Card>
    </div>
  );
}
