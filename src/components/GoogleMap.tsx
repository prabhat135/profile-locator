
import React, { useEffect, useRef } from 'react';

interface GoogleMapProps {
  center: { lat: number; lng: number };
  markers?: { lat: number; lng: number }[];
  zoom?: number;
  className?: string;
}

export const GoogleMap: React.FC<GoogleMapProps> = ({
  center,
  markers = [],
  zoom = 10,
  className = "w-full h-full"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // Initialize map
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    });
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Update map center
    mapInstanceRef.current.setCenter(center);
  }, [center]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    markers.forEach(position => {
      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: 'Profile Location',
      });
      markersRef.current.push(marker);
    });
  }, [markers]);

  return <div ref={mapRef} className={className} />;
};
