import React from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import './TravelMap.css';

interface TravelMapProps {
  landmarks?: Array<{
    id: string;
    name: string;
    location: {
      latitude: number;
      longitude: number;
    };
    address?: string;
    rating?: number;
    totalRatings?: number;
    types?: string[];
    photos?: any[];
    reviews?: any[];
    website?: string;
    phone?: string;
    openingHours?: string[];
  }>;
  onSelectLandmark?: (landmark: any) => void;
  selectedLandmark?: any;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 51.505,
  lng: -0.09
};

const TravelMap: React.FC<TravelMapProps> = ({ 
  landmarks = [], 
  onSelectLandmark = () => {},
  selectedLandmark = null
}) => {
  const [map, setMap] = React.useState<google.maps.Map | null>(null);
  const [bounds, setBounds] = React.useState<google.maps.LatLngBounds | null>(null);

  // 当landmarks变化时，调整地图视图
  React.useEffect(() => {
    if (map && landmarks.length > 0) {
      const newBounds = new google.maps.LatLngBounds();
      landmarks.forEach(landmark => {
        newBounds.extend({
          lat: landmark.location.latitude,
          lng: landmark.location.longitude
        });
      });
      map.fitBounds(newBounds, { padding: 50 });
      setBounds(newBounds);
    }
  }, [landmarks, map]);

  const onLoad = React.useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const renderInfoWindow = (landmark: any) => (
    <div className="info-window">
      <h3 className="font-bold text-lg">{landmark.name}</h3>
      <p className="text-sm text-gray-600">{landmark.description}</p>
      {landmark.rating && (
        <div className="flex items-center mt-1">
          <span className="text-yellow-500">★</span>
          <span className="ml-1 text-sm">{landmark.rating.toFixed(1)}</span>
        </div>
      )}
      {landmark.priceLevel && (
        <div className="text-sm text-gray-500">
          {'$'.repeat(landmark.priceLevel)}
        </div>
      )}
      {landmark.website && (
        <a 
          href={landmark.website} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-blue-500 hover:underline mt-2 block"
        >
          Visit Website
        </a>
      )}
    </div>
  );

  return (
    <div className="map-container" style={{ height: '500px', width: '100%' }}>
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={4}
          onLoad={onLoad}
          options={{
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          }}
        >
          {landmarks.map((landmark) => (
            <Marker
              key={landmark.id}
              position={{
                lat: landmark.location.latitude,
                lng: landmark.location.longitude
              }}
              onClick={() => onSelectLandmark(landmark)}
              icon={{
                url: selectedLandmark?.id === landmark.id 
                  ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                  : 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                scaledSize: new google.maps.Size(32, 32)
              }}
            >
              {selectedLandmark?.id === landmark.id && (
                <InfoWindow
                  position={{
                    lat: landmark.location.latitude,
                    lng: landmark.location.longitude
                  }}
                  onCloseClick={() => onSelectLandmark(null)}
                >
                  {renderInfoWindow(landmark)}
                </InfoWindow>
              )}
            </Marker>
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default TravelMap;
