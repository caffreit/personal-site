'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { ArrowLeft, MapPin, Navigation } from 'lucide-react';

declare global {
  interface Window {
    // Google Maps JS SDK attaches itself to window without bundled types
    google?: any;
  }
}

interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
  color: string;
  zIndex: number;
}

const STATIONS: Station[] = [
  { id: '1', name: 'Connolly', lat: 53.35098334661667, lng: -6.250061547422157, color: '#16a34a', zIndex: 1 },
  { id: '2', name: 'Tara Street', lat: 53.3473907668813, lng: -6.254548674268324, color: '#2563eb', zIndex: 1000 },
  { id: '3', name: 'Pearse', lat: 53.34361274315517, lng: -6.249502388268081, color: '#ef4444', zIndex: 1 },
];

interface Result {
  station: Station;
  distance: number; // meters
  timeText: string;
  timeValue: number; // seconds
}

export interface ThreeStationsProps {
  onBack: () => void;
}

const MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'transit.line', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
  { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9c9c9' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
];

const GOOGLE_MAPS_SRC =
  'https://maps.googleapis.com/maps/api/js?key=AIzaSyAmq_h0qMknVu_EE_66YWzy1CWfp_CwY1Q';

export function ThreeStations({ onBack }: ThreeStationsProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const directionsServiceRef = useRef<any>(null);
  const renderersRef = useRef<any[]>([]);

  const [results, setResults] = useState<Result[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapsReady, setMapsReady] = useState(false);

  const clearRoutes = useCallback(() => {
    renderersRef.current.forEach((renderer) => renderer.setMap(null));
    renderersRef.current = [];
  }, []);

  const handleMapClick = useCallback(async (destination: any) => {
    if (!mapRef.current || !directionsServiceRef.current) return;
    setLoading(true);
    clearRoutes();
    setResults(null);

    const promises = STATIONS.map(
      (station) =>
        new Promise<Result | null>((resolve) => {
          const renderer = new window.google.maps.DirectionsRenderer({
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: station.color,
              strokeWeight: 6,
              strokeOpacity: 0.7,
              zIndex: station.zIndex,
            },
            preserveViewport: true,
          });

          renderer.setMap(mapRef.current);
          renderersRef.current.push(renderer);

          const request = {
            origin: { lat: station.lat, lng: station.lng },
            destination,
            travelMode: window.google.maps.TravelMode.WALKING,
          };

          directionsServiceRef.current.route(request, (result: any, status: any) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              renderer.setDirections(result);
              const leg = result.routes[0].legs[0];
              resolve({
                station,
                distance: leg.distance.value,
                timeText: leg.duration.text,
                timeValue: leg.duration.value,
              });
            } else {
              console.error(`Route failed for ${station.name}: ${status}`);
              resolve(null);
            }
          });
        }),
    );

    const rawResults = await Promise.all(promises);
    const validResults = rawResults.filter((r): r is Result => r !== null);
    validResults.sort((a, b) => a.timeValue - b.timeValue);

    setResults(validResults);
    setLoading(false);
  }, [clearRoutes]);

  useEffect(() => {
    if (!mapsReady || !mapContainerRef.current || !window.google) {
      return;
    }

    const center = { lat: 53.34739, lng: -6.251 };
    const map = new window.google.maps.Map(mapContainerRef.current, {
      zoom: 15,
      center,
      styles: MAP_STYLES,
      disableDefaultUI: true,
      zoomControl: false,
    });

    directionsServiceRef.current = new window.google.maps.DirectionsService();

    STATIONS.forEach((station) => {
      new window.google.maps.Marker({
        position: { lat: station.lat, lng: station.lng },
        map,
        title: station.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: station.color,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });
    });

    const clickListener = map.addListener('click', (event: any) => {
      if (event.latLng) {
        handleMapClick(event.latLng);
      }
    });

    mapRef.current = map;

    return () => {
      clickListener.remove();
      clearRoutes();
      mapRef.current = null;
      directionsServiceRef.current = null;
    };
  }, [mapsReady, handleMapClick, clearRoutes]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google) {
      setMapsReady(true);
    }
  }, []);

  return (
    <>
      <Script
        id="google-maps-sdk"
        src={GOOGLE_MAPS_SRC}
        strategy="afterInteractive"
        onLoad={() => setMapsReady(true)}
      />
      <div className="fixed inset-0 z-50 flex flex-col bg-stone-50 md:flex-row animate-in fade-in duration-300">
        <div className="order-1 md:order-2 relative h-[45vh] flex-grow bg-stone-200 md:h-full">
          <div ref={mapContainerRef} className="h-full w-full" />
          <button
            onClick={onBack}
            className="absolute left-4 top-4 z-10 rounded-full border border-stone-200 bg-white/90 p-3 text-stone-900 shadow-lg backdrop-blur md:hidden"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>

          {!results && !loading && (
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 w-full -translate-x-1/2 -translate-y-1/2 px-4 text-center">
              <div className="inline-block rounded-full bg-stone-900/90 px-6 py-3 font-bold text-white shadow-2xl backdrop-blur animate-bounce text-sm md:text-base">
                Tap map to check times
              </div>
            </div>
          )}
        </div>

        <div className="order-2 flex h-[55vh] w-full flex-col overflow-hidden rounded-t-3xl border-r border-stone-200 bg-white shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-20 md:order-1 md:h-full md:w-[400px] md:rounded-none md:shadow-2xl">
          <div className="hidden items-center justify-between border-b border-stone-200 p-6 md:flex">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-stone-500 transition-colors hover:text-stone-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Exit Lab</span>
            </button>
            <div className="rounded bg-lime-100 px-2 py-1 text-xs font-bold uppercase text-lime-800">
              Google Maps API
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-6 md:p-8">
            <div className="mb-4 flex items-start justify-between">
              <h1 className="text-3xl font-black leading-tight text-stone-900 md:text-4xl">
                Three Stations.
              </h1>
              <div className="rounded bg-lime-100 px-2 py-1 text-[10px] font-bold uppercase text-lime-800 md:hidden">
                API Active
              </div>
            </div>

            <p className="mb-6 font-serif text-sm italic text-stone-500 md:text-base">
              Real-time walking directions powered by Google Maps.
            </p>

            {!results && !loading && (
              <div className="flex h-32 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 p-6 text-center">
                <Navigation className="mx-auto mb-2 h-8 w-8 text-stone-300" />
                <p className="text-sm font-medium text-stone-400">Select location on map</p>
              </div>
            )}

            {loading && (
              <div className="flex h-32 flex-col items-center justify-center rounded-2xl bg-stone-50 p-6 text-center">
                <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-lime-300 border-t-stone-900" />
                <p className="text-sm font-medium text-stone-400">Calculating Routes...</p>
              </div>
            )}

            {results && !loading && (
              <div className="space-y-3 pb-20 md:space-y-4 md:pb-0 animate-in slide-in-from-bottom-4 duration-500">
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-lime-500" />
                  <span className="text-xs font-bold uppercase text-stone-400">Walking Times</span>
                </div>

                {results.map((res, index) => (
                  <div
                    key={res.station.id}
                    className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-500 md:p-5 ${
                      index === 0
                        ? 'scale-[1.02] border-stone-900 bg-stone-900 text-white shadow-lg'
                        : 'border-stone-200 bg-white text-stone-500'
                    }`}
                  >
                    {index === 0 && (
                      <div className="absolute right-0 top-0 rounded-bl-xl bg-lime-400 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-stone-900">
                        Best Option
                      </div>
                    )}

                    <div className="mb-1 flex items-center justify-between">
                      <h3
                        className={`text-base font-bold md:text-lg ${
                          index === 0 ? 'text-white' : 'text-stone-900'
                        }`}
                      >
                        {res.station.name}
                      </h3>
                      <div
                        className="h-3 w-3 shrink-0 rounded-full border border-white/20"
                        style={{ backgroundColor: res.station.color }}
                      />
                    </div>

                    <div className="flex items-baseline gap-4 md:gap-6">
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`font-mono text-2xl font-bold md:text-3xl ${
                            index === 0 ? 'text-lime-300' : 'text-stone-900'
                          }`}
                        >
                          {res.timeText.replace(' mins', '').replace(' min', '')}
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            index === 0 ? 'text-lime-300/80' : 'text-stone-400'
                          }`}
                        >
                          min
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs opacity-60 md:text-sm">
                        <MapPin className="h-3 w-3" />
                        <span className="font-mono">{res.distance}m</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}


