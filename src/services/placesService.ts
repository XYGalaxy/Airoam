import axios from 'axios';
import { cacheService } from './cacheService';

const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
const SERVER_PORT = 3000;  // Changed to match server port
const PROXY_BASE_URL = `http://localhost:${SERVER_PORT}/api/places`;
const API_BASE_URL = 'http://localhost:3001/api/places';

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
  results: PlaceResult[];
}

interface PlaceResult {
  place_id?: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  photos?: any[];
  reviews?: any[];
  website?: string;
  formatted_phone_number?: string;
  opening_hours?: {
    weekday_text: string[];
  };
  price_level?: number;
}

interface PlaceDetailsResponse {
  result: PlaceDetails;
  status: string;
}

interface PlaceDetails {
  place_id: string;
  name: string;
  vicinity: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating: number;
  user_ratings_total: number;
  types: string[];
  photos: any[];
  reviews: any[];
  website: string;
  formatted_phone_number: string;
  opening_hours: {
    weekday_text: string[];
  };
  price_level: number;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Landmark {
  id: string;
  name: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  rating: number;
  totalRatings: number;
  types: string[];
  type: string;
  photos?: any[];
  reviews?: any[];
  website?: string;
  phone?: string;
  openingHours?: string[];
  priceLevel: number;
  imageUrl?: string;
  estimatedDays: number;
}

interface SearchPlacesParams {
  location: string;
  radius: number;
  type: string;
  keyword: string;
}

export const searchPlaces = async (
  location: { lat: number; lng: number },
  activityType: string = 'museum',
  radius: number = 50000
): Promise<Landmark[]> => {
  try {
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      throw new Error('Invalid location provided');
    }

    // Special handling for wine-related searches
    const searchParams: any = {
      location: `${location.lat},${location.lng}`,
      radius: radius,
      maxResults: 20 // Increase max results since we'll be filtering
    };

    if (activityType === 'wine' || activityType === 'vineyard tours') {
      // Try multiple searches with different parameters
      const searchPromises = [
        // Search 1: Focus on tourist attractions with wine keywords
        axios.get(`${PROXY_BASE_URL}/search`, {
          params: {
            ...searchParams,
            type: 'tourist_attraction',
            keyword: 'winery OR vineyard'
          }
        }),
        // Search 2: Focus on food & drink establishments
        axios.get(`${PROXY_BASE_URL}/search`, {
          params: {
            ...searchParams,
            type: 'food',
            keyword: 'wine tasting OR wine bar'
          }
        })
      ];

      const responses = await Promise.all(searchPromises);
      const allResults = responses.flatMap(response => response.data?.results || []);
      
      // Log detailed search results
      console.log('Search 1 (tourist_attraction) results:', responses[0].data?.results || []);
      console.log('Search 2 (food) results:', responses[1].data?.results || []);
      console.log('Combined search results:', allResults);

      // Remove duplicates based on place_id
      const uniqueResults = Array.from(new Map(allResults.map(place => [place.place_id, place])).values());
      console.log('Unique results:', uniqueResults);

      const places = uniqueResults
        .map((place: any) => {
          const id = place.place_id || generateStableId(place);
          
          // Log each place before conversion
          console.log('Processing place:', {
            name: place.name,
            types: place.types,
            address: place.formatted_address || place.vicinity
          });
          
          return {
            id,
            name: place.name || 'Unknown Place',
            description: place.formatted_address || place.vicinity || '',
            location: {
              lat: place.geometry?.location?.lat || 0,
              lng: place.geometry?.location?.lng || 0
            },
            rating: place.rating || 0,
            totalRatings: place.user_ratings_total || 0,
            types: place.types || [],
            type: activityType,
            photos: place.photos || [],
            reviews: place.reviews || [],
            website: place.website || '',
            phone: place.formatted_phone_number || '',
            openingHours: place.opening_hours?.weekday_text || [],
            priceLevel: place.price_level || 0,
            imageUrl: place.photos?.[0]?.photo_reference ? 
              `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}` : 
              '',
            estimatedDays: estimateDaysNeeded(activityType),
            place_id: place.place_id
          };
        })
        .filter(place => {
          const lowerTypes = (place.types || []).map((t: string) => t.toLowerCase());
          const lowerName = place.name.toLowerCase();
          
          // Log filtering decision
          console.log('Filtering place:', {
            name: place.name,
            types: lowerTypes,
            isLodging: lowerTypes.includes('lodging') || lowerTypes.includes('hotel'),
            hasWineInName: lowerName.includes('wine') || 
                          lowerName.includes('vinho') || 
                          lowerName.includes('vineyard') || 
                          lowerName.includes('winery')
          });
          
          // Exclude places that are primarily hotels/lodging unless they explicitly mention wine
          if (lowerTypes.includes('lodging') || lowerTypes.includes('hotel')) {
            return lowerName.includes('wine') || 
                   lowerName.includes('vinho') || 
                   lowerName.includes('vineyard') || 
                   lowerName.includes('winery');
          }
          
          return true;
        });

      console.log('Final converted and filtered wine-related places:', places.map(p => ({
        name: p.name,
        types: p.types,
        description: p.description
      })));
      return places;
    } else {
      // Original search logic for non-wine activities
      const response = await axios.get(`${PROXY_BASE_URL}/search`, {
        params: {
          ...searchParams,
          type: getPlaceType(activityType),
          keyword: getKeyword(activityType)
        }
      });

      console.log('Search response:', response.data);
      const placesData = response.data?.results || [];
      
      if (!Array.isArray(placesData)) {
        console.error('Invalid response format:', response.data);
        return [];
      }

      if (placesData.length === 0) {
        console.log('No places found for the given parameters');
        return [];
      }

      const places = placesData
        .map((place: any) => {
          const id = place.place_id || generateStableId(place);
          return {
            id,
            name: place.name || 'Unknown Place',
            description: place.formatted_address || place.vicinity || '',
            location: {
              lat: place.geometry?.location?.lat || 0,
              lng: place.geometry?.location?.lng || 0
            },
            rating: place.rating || 0,
            totalRatings: place.user_ratings_total || 0,
            types: place.types || [],
            type: activityType,
            photos: place.photos || [],
            reviews: place.reviews || [],
            website: place.website || '',
            phone: place.formatted_phone_number || '',
            openingHours: place.opening_hours?.weekday_text || [],
            priceLevel: place.price_level || 0,
            imageUrl: place.photos?.[0]?.photo_reference ? 
              `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}` : 
              '',
            estimatedDays: estimateDaysNeeded(activityType),
            place_id: place.place_id
          };
        })
        .filter(place => {
          const lowerTypes = (place.types || []).map((t: string) => t.toLowerCase());
          return !lowerTypes.includes('lodging') && !lowerTypes.includes('hotel');
        });

      console.log('Converted and filtered places:', places);
      return places;
    }
  } catch (error) {
    console.error('Error searching places:', error);
    if (error instanceof Error) {
      const axiosError = error as any;
      if (axiosError.response?.data) {
        console.error('Response data:', axiosError.response.data);
      }
    }
    return [];
  }
};

// Helper function to generate a stable ID from place data
const generateStableId = (place: any): string => {
  // Use a combination of name and coordinates to create a stable ID
  const name = place.name || '';
  const lat = place.geometry?.location?.lat || 0;
  const lng = place.geometry?.location?.lng || 0;
  return `place-${name.toLowerCase().replace(/\s+/g, '-')}-${lat}-${lng}`;
};

export const getPlaceDetails = async (placeId: string): Promise<Landmark> => {
  try {
    if (!placeId) {
      throw new Error('Place ID is required');
    }

    // Skip fetching details for temporary IDs
    if (placeId.startsWith('place-')) {
      console.warn('Skipping details fetch for temporary ID:', placeId);
      return {
        id: placeId,
        name: 'Unknown Place',
        description: '',
        location: {
          lat: 0,
          lng: 0
        },
        rating: 0,
        totalRatings: 0,
        types: [],
        type: 'point_of_interest',
        priceLevel: 0,
        estimatedDays: 1,
        photos: [],
        reviews: [],
        website: '',
        phone: '',
        openingHours: []
      };
    }

    const response = await axios.get<{ result: PlaceDetails }>(`${PROXY_BASE_URL}/details/${placeId}`);
    
    if (!response.data || !response.data.result) {
      console.warn('No place details found for ID:', placeId);
      return {
        id: placeId,
        name: 'Unknown Place',
        description: '',
        location: {
          lat: 0,
          lng: 0
        },
        rating: 0,
        totalRatings: 0,
        types: [],
        type: 'point_of_interest',
        priceLevel: 0,
        estimatedDays: 1,
        photos: [],
        reviews: [],
        website: '',
        phone: '',
        openingHours: []
      };
    }

    const place = response.data.result;
    return {
      id: place.place_id,
      name: place.name,
      description: place.formatted_address || place.vicinity || '',
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      },
      rating: place.rating || 0,
      totalRatings: place.user_ratings_total || 0,
      types: place.types || [],
      type: 'point_of_interest',
      imageUrl: place.photos?.[0]?.photo_reference ? 
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}` : 
        undefined,
      priceLevel: place.price_level || 0,
      estimatedDays: 1,
      photos: place.photos || [],
      reviews: place.reviews || [],
      website: place.website || '',
      phone: place.formatted_phone_number || '',
      openingHours: place.opening_hours?.weekday_text || []
    };
  } catch (error) {
    console.error('Error fetching place details:', error);
    return {
      id: placeId,
      name: 'Unknown Place',
      description: '',
      location: {
        lat: 0,
        lng: 0
      },
      rating: 0,
      totalRatings: 0,
      types: [],
      type: 'point_of_interest',
      priceLevel: 0,
      estimatedDays: 1,
      photos: [],
      reviews: [],
      website: '',
      phone: '',
      openingHours: []
    };
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
        lat: 0,
        lng: 0,
      },
      rating: 0,
      totalRatings: 0,
      types: [],
      type: 'point_of_interest',
      photos: [],
      reviews: [],
      website: '',
      phone: '',
      openingHours: [],
      priceLevel: 0,
      imageUrl: '',
      estimatedDays: 1
    };
  }

  return {
    id: place.place_id,
    name: place.name,
    description: place.vicinity || place.formatted_address || '',
    location: {
      lat: place.geometry?.location?.lat || 0,
      lng: place.geometry?.location?.lng || 0,
    },
    rating: place.rating || 0,
    totalRatings: place.user_ratings_total || 0,
    types: place.types || [],
    type: place.types?.[0] || 'point_of_interest',
    photos: place.photos || [],
    reviews: place.reviews || [],
    website: place.website || '',
    phone: place.formatted_phone_number || '',
    openingHours: place.opening_hours?.weekday_text || [],
    priceLevel: place.price_level || 0,
    imageUrl: place.photos?.[0]?.photo_reference 
      ? `${PROXY_BASE_URL}/places/photo?photo_reference=${place.photos[0].photo_reference}`
      : '',
    estimatedDays: 1
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

export const getPlaceType = (activityId: string): string => {
  switch (activityId.toLowerCase()) {
    case 'culture':
      return 'museum';
    case 'nature':
      return 'park';
    case 'food':
      return 'restaurant';
    case 'shopping':
      return 'shopping_mall';
    case 'nightlife':
      return 'bar';
    case 'historical':
      return 'tourist_attraction';
    case 'art':
      return 'art_gallery';
    case 'museum':
      return 'museum';
    case 'wine':
      return 'establishment|tourist_attraction|bar|food';
    case 'vineyard tours':
      return 'establishment|tourist_attraction|bar|food';
    case 'theatre':
      return 'establishment';
    case 'performing_arts':
      return 'establishment';
    default:
      return 'point_of_interest';
  }
};

export const getKeyword = (activityId: string): string => {
  switch (activityId.toLowerCase()) {
    case 'culture':
      return 'museum';
    case 'nature':
      return 'nature';
    case 'food':
      return 'restaurant';
    case 'shopping':
      return 'shopping';
    case 'nightlife':
      return 'nightlife';
    case 'historical':
      return 'historical';
    case 'art':
      return 'art';
    case 'museum':
      return 'museum';
    case 'wine':
      return 'winery OR vineyard OR wine tasting';
    case 'vineyard tours':
      return 'vineyard OR winery OR wine estate';
    case 'theatre':
      return 'theatre OR theater OR opera house OR performing arts';
    case 'performing_arts':
      return 'theatre OR theater OR opera house OR concert hall';
    default:
      return '';
  }
}; 