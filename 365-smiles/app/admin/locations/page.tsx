'use client';

import { GoogleMap, Marker, useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { useState, useRef, useCallback } from 'react';

const containerStyle = {
  width: '100%',
  height: '500px',
};

export default function LocationsPage() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['places'],
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState<google.maps.LatLngLiteral | null>(null);
  const [searchMarker, setSearchMarker] = useState<google.maps.LatLngLiteral | null>(null);
  const autoCompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 📍 Get user's current location
  const getCurrentLocation = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCenter(coords);
        map?.panTo(coords);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
      }
    );
  }, [map]);

  const handleLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autoCompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    const place = autoCompleteRef.current?.getPlace();
    if (place?.geometry?.location) {
      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      setSearchMarker(location);
      map?.panTo(location);
    }
  };

  if (!isLoaded) return <p className="text-center p-10">Loading Map...</p>;

  return (
    <main className="max-w-5xl mx-auto p-4">
      <h1 className="text-xl font-bold text-center mb-4">📍 Find Nearby Homes/Trusts</h1>

      <div className="flex justify-between items-center gap-4 mb-4">
        <Autocomplete onLoad={handleLoad} onPlaceChanged={onPlaceChanged}>
          <input
            type="text"
            placeholder="Search location..."
            ref={inputRef}
            className="border p-2 rounded w-full"
          />
        </Autocomplete>
        <button
          onClick={getCurrentLocation}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Use My Location
        </button>
      </div>

      {center && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={14}
          onLoad={(mapInstance) => setMap(mapInstance)}
        >
          <Marker position={center} label="You" />
          {searchMarker && <Marker position={searchMarker} />}
        </GoogleMap>
      )}

      {!center && (
        <div className="text-center text-gray-500 mt-10">
          Click “Use My Location” to begin
        </div>
      )}
    </main>
  );
}
