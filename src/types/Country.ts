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