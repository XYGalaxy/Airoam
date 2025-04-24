export interface Landmark {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  location: {
    city: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  category: string[];  // e.g., ["Historical", "Architecture", "UNESCO"]
  visitDuration: {
    recommended: string;  // e.g., "2-3 hours"
    min: number;  // in hours
    max: number;  // in hours
  };
  ticketing?: {
    price: number;
    currency: string;
    needsAdvanceBooking: boolean;
    bookingUrl?: string;
  };
  bestTimeToVisit: {
    seasons: string[];  // e.g., ["Spring", "Summer"]
    timeOfDay: string[];  // e.g., ["Morning", "Sunset"]
  };
  accessibility: {
    wheelchairAccessible: boolean;
    publicTransport: boolean;
    parking: boolean;
  };
}

export interface LandmarksData {
  landmarks: Landmark[];
} 