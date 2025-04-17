
import React, { useEffect, useRef, useState } from 'react';
import { Globe, Locate } from 'lucide-react';

// This is a placeholder for the actual map implementation
// In a real app, we would use a library like Mapbox, Google Maps, or Leaflet
const TravelMap = ({ 
  destinations = [], 
  landmarks = [],
  onSelectLandmark = () => {},
  selectedLandmark = null
}) => {
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  
  // Simulate map loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="relative h-full w-full bg-slate-100">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center">
            <Globe className="h-8 w-8 text-travel-blue animate-pulse" />
            <p className="mt-2 text-muted-foreground">Loading map...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="absolute inset-0 bg-blue-50">
            {/* This would be replaced with an actual map component */}
            <div 
              ref={mapRef}
              className="h-full w-full bg-[url('https://images.unsplash.com/photo-1541446654331-1a8be646f2db?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center"
            >
              {/* This is a simplified visualization of landmarks */}
              <div className="relative h-full w-full bg-gradient-to-b from-blue-400/20 to-blue-900/20">
                {landmarks.map((landmark) => (
                  <div 
                    key={landmark.id}
                    className={`absolute w-3 h-3 bg-travel-teal rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 shadow-md border border-white
                      ${selectedLandmark?.id === landmark.id ? 'w-4 h-4 bg-travel-orange z-10' : ''}
                      hover:w-4 hover:h-4 hover:bg-travel-orange transition-all`}
                    style={{
                      left: `${((landmark.location[0] + 15) / 60) * 100}%`,
                      top: `${(1 - ((landmark.location[1] - 35) / 30)) * 100}%`
                    }}
                    onClick={() => onSelectLandmark(landmark)}
                  >
                    <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 bg-white p-2 rounded shadow-md">
                      {landmark.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button className="bg-white p-2 rounded-md shadow-md">
              <Locate className="h-5 w-5 text-travel-blue" />
            </button>
          </div>
          
          <div className="absolute bottom-4 left-4 right-4 flex justify-center">
            <div className="bg-white/90 backdrop-blur-sm p-2 rounded-md shadow-md text-xs">
              <p className="text-center text-muted-foreground">
                {landmarks.length ? `Showing ${landmarks.length} landmarks` : 
                 destinations.length ? `Showing recommended destinations` : 
                 'Europe Map'}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TravelMap;
