export interface Landmark {
  id: string;
  name: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
  };
  type: string;
  rating?: number;
  priceLevel?: number;
  estimatedDays: number;
  country: string;
  source: string;
  countryDescription?: string;
  website?: string;
  vicinity?: string;
  formatted_address?: string;
  photos?: any[];
  reviews?: any[];
  openingHours?: string[];
  phone?: string;
  imageUrl?: string;
} 