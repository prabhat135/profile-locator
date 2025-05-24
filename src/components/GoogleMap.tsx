
import React, { useEffect, useRef, useState } from 'react';

interface GoogleMapProps {
  center: { lat: number; lng: number };
  markers?: { lat: number; lng: number }[];
  zoom?: number;
  className?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export const GoogleMap: React.FC<GoogleMapProps> = ({
  center,
  markers = [],
  zoom = 10,
  className = "w-full h-full"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to initialize the map
  const initializeMap = () => {
    console.log('Initializing Google Maps...');
    console.log('Google Maps API available:', !!window.google);
    console.log('Map ref available:', !!mapRef.current);
    console.log('Center coordinates:', center);

    if (!mapRef.current) {
      console.error('Map container not found');
      setError('Map container not found');
      setIsLoading(false);
      return;
    }

    if (!window.google || !window.google.maps) {
      console.error('Google Maps API not loaded');
      setError('Google Maps API not loaded. Please check your API key.');
      setIsLoading(false);
      return;
    }

    try {
      // Initialize map
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      });

      console.log('Map initialized successfully');
      setIsLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
      setIsLoading(false);
    }
  };

  // Wait for Google Maps API to be ready
  useEffect(() => {
    const waitForGoogleMaps = () => {
      if (!window.google || !window.google.maps) {
        console.log('Waiting for Google Maps API...');
        setTimeout(waitForGoogleMaps, 100);
        return;
      }
      console.log('Google Maps API is ready');
      
      // Once Google Maps is ready, wait a bit more for the DOM to be fully rendered
      setTimeout(() => {
        if (mapRef.current) {
          initializeMap();
        } else {
          console.log('DOM element still not ready, trying again...');
          setTimeout(() => {
            if (mapRef.current) {
              initializeMap();
            } else {
              setError('Unable to find map container');
              setIsLoading(false);
            }
          }, 500);
        }
      }, 300);
    };

    waitForGoogleMaps();
  }, []);

  // Update map center when it changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    console.log('Updating map center to:', center);
    mapInstanceRef.current.setCenter(center);
  }, [center]);

  // Update markers when they change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    console.log('Updating markers:', markers);

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    markers.forEach((position, index) => {
      try {
        const marker = new window.google.maps.Marker({
          position,
          map: mapInstanceRef.current,
          title: `Location ${index + 1}`,
        });
        markersRef.current.push(marker);
        console.log('Added marker at:', position);
      } catch (err) {
        console.error('Error adding marker:', err);
      }
    });
  }, [markers]);

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300`}>
        <div className="text-center p-4">
          <p className="text-red-600 font-semibold mb-2">Map Error</p>
          <p className="text-sm text-gray-600">{error}</p>
          <p className="text-xs text-gray-500 mt-2">
            Please ensure your Google Maps API key is valid and the Maps JavaScript API is enabled.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100`}>
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className={className} />;
};
