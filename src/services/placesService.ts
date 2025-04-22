import axios from 'axios';
import { cacheService } from './cacheService';

const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT || 3000;
const PROXY_BASE_URL = `http://localhost:${SERVER_PORT}/api`;

console.log('Frontend API key check:', GOOGLE_PLACES_API_KEY ? 'API key is defined' : 'API key is missing');

// Add ActivityType enum for better type safety
export type ActivityType = 'historical' | 'nature' | 'entertainment' | 'dining';

interface PlaceSearchParams {
  location: string; // lat,lng
  radius: number; // in meters
  type?: string;
  keyword?: string;
}

interface PlaceSearchResponse {
  status: string;
  error_message?: string;
  results: Array<{
    place_id: string;
    name: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      }
    };
    vicinity?: string;
    formatted_address?: string;
    photos?: Array<{
      photo_reference: string;
    }>;
    rating?: number;
    price_level?: number;
  }>;
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

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Landmark {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  description: string;
  imageUrl: string | null | undefined;
  rating?: number;
  priceLevel?: number;
  type?: string;
  estimatedDays?: number;
  country?: string;
  source?: string;
}

interface SearchPlacesParams {
  location: string;
  radius: number;
  type: string;
  keyword: string;
}

export const searchPlaces = async (params: PlaceSearchParams): Promise<Landmark[]> => {
  try {
    const response = await axios.get<PlaceSearchResponse>('/api/places/search', {
      params
    });

    if (response.data.status !== 'OK') {
      throw new Error(response.data.error_message || 'Failed to fetch places');
    }

    return response.data.results.map((place) => ({
      id: place.place_id,
      name: place.name,
      location: {
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng
      },
      description: place.vicinity || place.formatted_address || '',
      imageUrl: place.photos?.[0]?.photo_reference 
        ? `/api/places/photo?photo_reference=${place.photos[0].photo_reference}` 
        : null,
      rating: place.rating || 0,
      priceLevel: place.price_level || 0,
      type: params.type,
      estimatedDays: 1,
      country: '',
      source: 'google'
    }));
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
      ? `${PROXY_BASE_URL}/places/photo?photo_reference=${place.photos[0].photo_reference}`
      : '',
    rating: place.rating || 0,
    priceLevel: place.price_level || 0,
    type: place.types?.[0] || 'point_of_interest',
    estimatedDays: 1,
  };
};

export const getPriceSymbol = (level: number): string => {
  if (level <= 0) return 'Free';
  return '€'.repeat(level);
};

export const estimateDaysNeeded = (type: string): number => {
  switch (type.toLowerCase()) {
    case 'museum':
    case 'art_gallery':
      return 0.5;
    case 'amusement_park':
    case 'theme_park':
      return 1;
    case 'national_park':
      return 2;
    default:
      return 0.5;
  }
};

export const getPlaceType = (activityId: ActivityType): string => {
  switch (activityId) {
    case 'historical':
      return 'museum';
    case 'nature':
      return 'park';
    case 'entertainment':
      return 'amusement_park';
    case 'dining':
      return 'restaurant';
    default:
      return 'point_of_interest';
  }
};

export const getKeyword = (activityId: ActivityType): string => {
  switch (activityId) {
    case 'historical':
      return 'historical';
    case 'nature':
      return 'nature';
    case 'entertainment':
      return 'entertainment';
    case 'dining':
      return 'dining';
    default:
      return '';
  }
}; 