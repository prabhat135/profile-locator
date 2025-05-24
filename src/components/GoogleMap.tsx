
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
    initGoogleMaps: () => void;
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
    console.log('Attempting to initialize Google Maps...');
    
    if (!mapRef.current) {
      console.error('Map container ref not found');
      setError('Map container not available');
      setIsLoading(false);
      return false;
    }

    if (!window.google || !window.google.maps) {
      console.error('Google Maps API not loaded');
      setError('Google Maps API failed to load. Please check your internet connection and API key.');
      setIsLoading(false);
      return false;
    }

    try {
      console.log('Creating map instance...');
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
      return true;
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map. Please check your API key and ensure the Maps JavaScript API is enabled.');
      setIsLoading(false);
      return false;
    }
  };

  // Check for Google Maps API availability
  const checkGoogleMapsAPI = () => {
    return new Promise<boolean>((resolve) => {
      let attempts = 0;
      const maxAttempts = 30;
      
      const checkAPI = () => {
        attempts++;
        console.log(`Checking Google Maps API availability - attempt ${attempts}/${maxAttempts}`);
        
        if (window.google && window.google.maps) {
          console.log('Google Maps API is available');
          resolve(true);
          return;
        }
        
        if (attempts >= maxAttempts) {
          console.error('Google Maps API failed to load after maximum attempts');
          resolve(false);
          return;
        }
        
        setTimeout(checkAPI, 200);
      };
      
      checkAPI();
    });
  };

  // Initialize map when component mounts
  useEffect(() => {
    console.log('GoogleMap useEffect triggered');
    
    const initMap = async () => {
      // Wait for a short delay to ensure modal is rendered
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const apiAvailable = await checkGoogleMapsAPI();
      
      if (!apiAvailable) {
        setError('Google Maps API failed to load. Please check your API key and internet connection.');
        setIsLoading(false);
        return;
      }
      
      // Additional delay to ensure DOM is ready
      setTimeout(() => {
        initializeMap();
      }, 200);
    };

    initMap();
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
        <div className="text-center p-6 max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-600 mb-2">Map Error</h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Check if your Google Maps API key is valid</p>
            <p>• Ensure Maps JavaScript API is enabled</p>
            <p>• Verify your internet connection</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100`}>
        <div className="text-center p-6">
          <div className="relative mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-600 font-medium">Loading map...</p>
          <p className="text-xs text-gray-500 mt-1">Initializing Google Maps</p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className={className} />;
};
