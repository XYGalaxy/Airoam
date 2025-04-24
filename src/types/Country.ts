import { Location } from './Landmark';

export interface EuropeanCountry {
  id: string;
  name: string;
  capital: string;
  description: string;
  imageUrl: string;
  location: Location;
  recommendedDays: number;
  popularActivities: string[];
}

export type ActivityType = 'natural' | 'historical' | 'cultural' | 'food' | 'all';

export interface Activity {
  type: ActivityType;
  name: string;
  description: string;
  icon: string;
}

export interface Country {
  id: number;
  name: string;
  code: string;  // ISO country code (e.g., "ES" for Spain)
  description?: string;
  imageUrl?: string;
  landmarks: string[];  // References to landmark IDs
  destinations: string[];  // References to destination IDs
  continent: string;
  languages: string[];
  currency: {
    code: string;
    name: string;
    symbol: string;
  };
  timeZones: string[];
}

export interface CountriesData {
  countries: Country[];
} 