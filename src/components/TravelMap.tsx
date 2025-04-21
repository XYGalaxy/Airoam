import React, { useEffect, useRef } from 'react';
import { Globe } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './TravelMap.css';

interface TravelMapProps {
  destinations?: string[];
  landmarks?: Array<{
    id: number;
    name: string;
    location: [number, number];
  }>;
  onSelectLandmark?: (landmark: any) => void;
  selectedLandmark?: any;
}

const TravelMap: React.FC<TravelMapProps> = ({ 
  destinations = [], 
  landmarks = [],
  onSelectLandmark = () => {},
  selectedLandmark = null
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  
  useEffect(() => {
    if (!mapRef.current) {
      // Initialize map
      mapRef.current = L.map('map').setView([48.8566, 2.3522], 5);
      
      // Add tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    // Add markers for landmarks
    landmarks.forEach(landmark => {
      const marker = L.marker([landmark.location[1], landmark.location[0]], {
        icon: L.divIcon({
          className: `landmark-marker ${selectedLandmark?.id === landmark.id ? 'selected' : ''}`,
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        })
      }).addTo(mapRef.current!);
      
      marker.bindPopup(landmark.name);
      marker.on('click', () => onSelectLandmark(landmark));
      markersRef.current.push(marker);
    });
    
    // Fit bounds to show all markers
    if (landmarks.length > 0) {
      const bounds = L.latLngBounds(landmarks.map(l => [l.location[1], l.location[0]]));
      mapRef.current?.fitBounds(bounds, { padding: [50, 50] });
    }
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [landmarks, selectedLandmark]);
  
  return (
    <div className="relative h-full w-full">
      <div id="map" className="h-full w-full z-0" />
      
      <div className="absolute bottom-4 left-4 right-4 flex justify-center z-10">
        <div className="bg-white/90 backdrop-blur-sm p-2 rounded-md shadow-md text-xs">
          <p className="text-center text-muted-foreground">
            {landmarks.length ? `Showing ${landmarks.length} landmarks` : 
             destinations.length ? `Showing recommended destinations` : 
             'Europe Map'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TravelMap;
