import axios from 'axios';
import { cacheService } from './cacheService';

const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';
const PROXY_BASE_URL = 'http://localhost:3000/api';

console.log('Frontend API key check:', GOOGLE_PLACES_API_KEY ? 'API key is defined' : 'API key is missing');

interface PlaceSearchParams {
  location: string; // lat,lng
  radius: number; // in meters
  type?: string;
  keyword?: string;
}

interface PlaceSearchResponse {
  results: any[];
  next_page_token?: string;
  status: string;
  error_message?: string;
}

interface PlaceDetailsResponse {
  result: PlaceDetails;
  status: string;
}

interface PlaceDetails {
  place_id: string;
  name: string;
  vicinity?: string;
  formatted_address?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: Array<{
    photo_reference: string;
  }>;
  rating?: number;
  price_level?: number;
  types?: string[];
  user_ratings_total?: number;
  opening_hours?: {
    open_now?: boolean;
  };
}

interface Landmark {
  id: string;
  name: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
  };
  imageUrl: string;
  rating: number;
  priceLevel: number;
  type: string;
  estimatedDays: number;
  isOpen?: boolean;
  totalRatings?: number;
}

export const searchPlaces = async (params: PlaceSearchParams): Promise<Landmark[]> => {
  try {
    const cacheKey = `places:${JSON.stringify(params)}`;
    const cachedData = await cacheService.get(cacheKey);
    
    if (cachedData) {
      return cachedData as Landmark[];
    }

    const response = await axios.get<PlaceSearchResponse>(`${PROXY_BASE_URL}/places/nearbysearch`, {
      params: {
        ...params,
        key: GOOGLE_PLACES_API_KEY
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(response.data.error_message || 'Failed to search places');
    }

    const results = response.data.results.map(convertToLandmark);
    
    // Cache the results
    await cacheService.set(cacheKey, results);
    
    return results;
  } catch (error) {
    console.error('Error searching places:', error);
    throw error;
  }
};

export const getPlaceDetails = async (placeId: string): Promise<PlaceDetails | null> => {
  try {
    if (!GOOGLE_PLACES_API_KEY) {
      console.warn('Google Places API key not found');
      return null;
    }

    // Generate cache key
    const cacheKey = `google-details-${placeId}`;
    
    // Check cache first
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Use proxy server instead of calling Google Places API directly
    const response = await axios.get<PlaceDetailsResponse>(`${PROXY_BASE_URL}/places/details`, {
      params: {
        place_id: placeId,
        key: GOOGLE_PLACES_API_KEY,
        fields: 'name,vicinity,formatted_address,geometry,photos,rating,price_level,types,user_ratings_total,opening_hours',
      },
    });

    const place = response.data.result;
    
    // Cache the results
    cacheService.set(cacheKey, place);
    
    return place;
  } catch (error) {
    console.error('Error getting place details:', error);
    return null;
  }
};

// Helper function to convert Google Places data to our landmark format
export const convertToLandmark = (place: PlaceDetails): Landmark => {
  if (!place || !place.place_id || !place.name) {
    console.warn('Received incomplete place data:', place);
    return {
      id: place?.place_id || `temp-${Date.now()}`,
      name: place?.name || 'Unknown Place',
      description: place?.vicinity || place?.formatted_address || '',
      location: {
        latitude: 0,
        longitude: 0,
      },
      imageUrl: '',
      rating: 0,
      priceLevel: 0,
      type: 'point_of_interest',
      estimatedDays: 1,
    };
  }

  return {
    id: place.place_id,
    name: place.name,
    description: place.vicinity || place.formatted_address || '',
    location: {
      latitude: place.geometry?.location?.lat || 0,
      longitude: place.geometry?.location?.lng || 0,
    },
    imageUrl: place.photos?.[0]?.photo_reference 
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
      : '',
    rating: place.rating || 0,
    priceLevel: place.price_level || 0,
    type: place.types?.[0] || 'point_of_interest',
    estimatedDays: 1,
  };
};

export const getPriceSymbol = (level: number): string => {
  switch (level) {
    case 1: return '€';
    case 2: return '€€';
    case 3: return '€€€';
    case 4: return '€€€€';
    default: return '€';
  }
};

export const estimateDaysNeeded = (type: string): number => {
  switch (type.toLowerCase()) {
    case 'museum':
    case 'castle':
    case 'historic site':
      return 0.5;
    case 'national park':
    case 'wine region':
      return 2;
    case 'city':
    case 'island':
      return 3;
    default:
      return 1;
  }
}; 