import axios from 'axios';
import { cacheService } from './cacheService';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

interface OpenStreetMapSearchParams {
  q: string;
  format: string;
  limit: number;
  countrycodes?: string;
  viewbox?: string;
  bounded?: number;
}

interface OpenStreetMapPlace {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon?: string;
}

export const searchPlaces = async (params: OpenStreetMapSearchParams): Promise<OpenStreetMapPlace[]> => {
  try {
    // Generate cache key from search parameters
    const cacheKey = `osm-${params.q}-${params.countrycodes || 'all'}`;
    
    // Check cache first
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const response = await axios.get(NOMINATIM_BASE_URL, {
      params: {
        ...params,
        format: 'json',
        limit: 10,
        countrycodes: 'fr,de,it,es,uk,at,ch,be,nl,pt,gr,dk,se,no,fi,ie,pl,cz,hu,ro,bg,hr,si,sk,lt,lv,ee,is,mt,cy,lu,mc,va,sm,ad,li',
        featuretype: 'tourism',
        addressdetails: 1,
        'accept-language': 'en',
        bounded: 1, // Only return results within the specified country
        viewbox: '-10,70,40,30', // Rough bounding box for Europe
      },
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'WanderlustWhisperer/1.0',
      },
    });

    const data = response.data;
    
    // Cache the results
    cacheService.set(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error('Error fetching places from OpenStreetMap:', error);
    return [];
  }
};

export const convertToLandmark = (place: OpenStreetMapPlace, type: string) => {
  const addressParts = place.display_name.split(',');
  const country = addressParts[addressParts.length - 1].trim();
  
  return {
    id: `osm-${place.place_id}`,
    name: place.display_name.split(',')[0],
    country: country,
    location: [parseFloat(place.lon), parseFloat(place.lat)],
    type: type,
    price: getPriceSymbol(place.type),
    daysNeeded: estimateDaysNeeded(type),
    rating: calculateRating(place.importance),
    source: 'openstreetmap'
  };
};

const getPriceSymbol = (type: string): string => {
  switch (type) {
    case 'restaurant':
    case 'hotel':
      return '€€';
    case 'cafe':
    case 'bar':
      return '€';
    case 'attraction':
    case 'museum':
      return '€€';
    default:
      return '€';
  }
};

const estimateDaysNeeded = (type: string): number => {
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

const calculateRating = (importance: number): number => {
  // Convert importance (0-1) to rating (1-5)
  return Math.round((importance * 4) + 1);
}; 