import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Beer, Coffee, Mountain, Leaf, Wine, Music, Umbrella, Building, Camera } from 'lucide-react';
import TravelMap from './TravelMap';
import LandmarkDetail from './LandmarkDetail';
import { searchPlaces as searchGooglePlaces, convertToLandmark as convertGoogleLandmark } from '@/services/placesService';
import { searchPlaces as searchOSMPlaces, convertToLandmark as convertOSMLandmark } from '@/services/openStreetMapService';
import { getPlaceDetails } from '@/services/placesService';

const activities = [
  { id: 'alcohol', name: 'Wine & Beer', icon: <Beer className="h-6 w-6" /> },
  { id: 'coffee', name: 'Coffee Culture', icon: <Coffee className="h-6 w-6" /> },
  { id: 'hiking', name: 'Hiking', icon: <Mountain className="h-6 w-6" /> },
  { id: 'mushrooms', name: 'Mushroom Foraging', icon: <Leaf className="h-6 w-6" /> },
  { id: 'music', name: 'Live Music', icon: <Music className="h-6 w-6" /> },
  { id: 'beaches', name: 'Beaches', icon: <Umbrella className="h-6 w-6" /> },
  { id: 'castles', name: 'Castles & History', icon: <Building className="h-6 w-6" /> },
  { id: 'photography', name: 'Photography', icon: <Camera className="h-6 w-6" /> },
];

// Mock data for landmarks based on activities
const landmarksByActivity: Record<string, any[]> = {
  alcohol: [
    { id: 1, name: 'Champagne Region', country: 'France', location: [4.023, 49.044], type: 'Wine Region', price: '€€', daysNeeded: 2, rating: 4.8 },
    { id: 2, name: 'Pilsner Urquell Brewery', country: 'Czech Republic', location: [13.383, 49.748], type: 'Brewery', price: '€', daysNeeded: 1, rating: 4.6 },
    { id: 3, name: 'Port Wine Cellars', country: 'Portugal', location: [-8.614, 41.138], type: 'Wine Cellar', price: '€', daysNeeded: 1, rating: 4.7 },
    { id: 18, name: 'Tuscany Wine Region', country: 'Italy', location: [11.257, 43.771], type: 'Wine Region', price: '€€', daysNeeded: 3, rating: 4.9 },
    { id: 19, name: 'Belgian Beer Route', country: 'Belgium', location: [4.352, 50.847], type: 'Beer Route', price: '€€', daysNeeded: 2, rating: 4.7 },
  ],
  coffee: [
    { id: 4, name: 'Café Central', country: 'Austria', location: [16.366, 48.210], type: 'Historic Café', price: '€€', daysNeeded: 0.5, rating: 4.5 },
    { id: 5, name: 'Café A Brasileira', country: 'Portugal', location: [-9.142, 38.714], type: 'Historic Café', price: '€', daysNeeded: 0.5, rating: 4.3 },
    { id: 20, name: 'Café de Flore', country: 'France', location: [2.333, 48.854], type: 'Historic Café', price: '€€', daysNeeded: 0.5, rating: 4.6 },
    { id: 21, name: 'Caffè Florian', country: 'Italy', location: [12.338, 45.434], type: 'Historic Café', price: '€€€', daysNeeded: 0.5, rating: 4.8 },
  ],
  hiking: [
    { id: 6, name: 'Cinque Terre', country: 'Italy', location: [9.724, 44.128], type: 'Coastal Trail', price: '€€', daysNeeded: 3, rating: 4.9 },
    { id: 7, name: 'Tour du Mont Blanc', country: 'France/Italy/Switzerland', location: [6.864, 45.917], type: 'Mountain Trail', price: '€€€', daysNeeded: 7, rating: 4.9 },
    { id: 22, name: 'Plitvice Lakes', country: 'Croatia', location: [15.582, 44.865], type: 'National Park', price: '€€', daysNeeded: 2, rating: 4.8 },
    { id: 23, name: 'Dolomites', country: 'Italy', location: [11.850, 46.500], type: 'Mountain Range', price: '€€€', daysNeeded: 5, rating: 4.9 },
  ],
  mushrooms: [
    { id: 8, name: 'Black Forest', country: 'Germany', location: [8.214, 48.268], type: 'Forest', price: '€', daysNeeded: 2, rating: 4.4 },
    { id: 9, name: 'Białowieża Forest', country: 'Poland', location: [23.837, 52.757], type: 'Ancient Forest', price: '€', daysNeeded: 2, rating: 4.6 },
    { id: 24, name: 'Bavarian Forest', country: 'Germany', location: [13.200, 48.900], type: 'National Park', price: '€', daysNeeded: 2, rating: 4.5 },
  ],
  music: [
    { id: 10, name: 'La Scala', country: 'Italy', location: [9.189, 45.467], type: 'Opera House', price: '€€€', daysNeeded: 1, rating: 4.8 },
    { id: 11, name: 'Roskilde Festival', country: 'Denmark', location: [12.080, 55.620], type: 'Music Festival', price: '€€€', daysNeeded: 4, rating: 4.7 },
    { id: 25, name: 'Sziget Festival', country: 'Hungary', location: [19.050, 47.550], type: 'Music Festival', price: '€€', daysNeeded: 5, rating: 4.8 },
    { id: 26, name: 'Vienna State Opera', country: 'Austria', location: [16.367, 48.203], type: 'Opera House', price: '€€€', daysNeeded: 1, rating: 4.9 },
  ],
  beaches: [
    { id: 12, name: 'Navagio Beach', country: 'Greece', location: [20.624, 37.859], type: 'Beach', price: '€€', daysNeeded: 1, rating: 4.9 },
    { id: 13, name: 'Playa de Ses Illetes', country: 'Spain', location: [1.427, 38.731], type: 'Beach', price: '€€', daysNeeded: 1, rating: 4.8 },
    { id: 27, name: 'Zlatni Rat', country: 'Croatia', location: [16.650, 43.267], type: 'Beach', price: '€€', daysNeeded: 1, rating: 4.7 },
    { id: 28, name: 'Praia da Marinha', country: 'Portugal', location: [-8.412, 37.088], type: 'Beach', price: '€', daysNeeded: 1, rating: 4.9 },
  ],
  castles: [
    { id: 14, name: 'Neuschwanstein Castle', country: 'Germany', location: [10.750, 47.557], type: 'Castle', price: '€€', daysNeeded: 1, rating: 4.9 },
    { id: 15, name: 'Edinburgh Castle', country: 'Scotland', location: [-3.200, 55.949], type: 'Castle', price: '€€', daysNeeded: 1, rating: 4.7 },
    { id: 29, name: 'Prague Castle', country: 'Czech Republic', location: [14.400, 50.092], type: 'Castle', price: '€€', daysNeeded: 1, rating: 4.8 },
    { id: 30, name: 'Château de Chambord', country: 'France', location: [1.517, 47.616], type: 'Castle', price: '€€', daysNeeded: 1, rating: 4.7 },
  ],
  photography: [
    { id: 16, name: 'Santorini', country: 'Greece', location: [25.396, 36.416], type: 'Island', price: '€€€', daysNeeded: 3, rating: 4.9 },
    { id: 17, name: 'Plitvice Lakes', country: 'Croatia', location: [15.582, 44.865], type: 'National Park', price: '€€', daysNeeded: 1, rating: 4.8 },
    { id: 31, name: 'Hallstatt', country: 'Austria', location: [13.650, 47.562], type: 'Village', price: '€€', daysNeeded: 1, rating: 4.9 },
    { id: 32, name: 'Cinque Terre', country: 'Italy', location: [9.724, 44.128], type: 'Coastal Villages', price: '€€', daysNeeded: 2, rating: 4.9 },
  ],
};

// 定义每个活动对应的推荐国家
const recommendedCountriesByActivity: Record<string, Array<{
  name: string;
  description: string;
  coordinates: [number, number];
  imageUrl: string;
}>> = {
  alcohol: [
    {
      name: 'France',
      description: '世界著名的葡萄酒产区，从波尔多到勃艮第，每个地区都有其独特的葡萄酒文化。',
      coordinates: [2.3522, 48.8566],
      imageUrl: 'https://images.unsplash.com/photo-1502741224143-90386d401f93',
    },
    {
      name: 'Italy',
      description: '托斯卡纳的葡萄酒和威尼托的普罗塞克，意大利的葡萄酒文化源远流长。',
      coordinates: [12.4964, 41.9028],
      imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963',
    },
    {
      name: 'Germany',
      description: '啤酒之都慕尼黑和莱茵河谷的葡萄酒，德国是啤酒和葡萄酒爱好者的天堂。',
      coordinates: [13.4050, 52.5200],
      imageUrl: 'https://images.unsplash.com/photo-1506197603052-3cc9d3a201bd',
    },
  ],
  coffee: [
    {
      name: 'Italy',
      description: '意式浓缩咖啡的发源地，从威尼斯到罗马，每个城市都有其独特的咖啡文化。',
      coordinates: [12.4964, 41.9028],
      imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963',
    },
    {
      name: 'Austria',
      description: '维也纳咖啡馆文化，优雅的咖啡厅和精致的甜点，体验皇室般的享受。',
      coordinates: [16.3738, 48.2082],
      imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963',
    },
    {
      name: 'Portugal',
      description: '里斯本的咖啡文化，独特的葡式咖啡和蛋挞，体验地道的葡萄牙风情。',
      coordinates: [-9.1393, 38.7223],
      imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963',
    },
  ],
  hiking: [
    {
      name: 'Switzerland',
      description: '阿尔卑斯山脉的壮丽景色，从少女峰到马特洪峰，徒步者的天堂。',
      coordinates: [8.2275, 46.8182],
      imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963',
    },
    {
      name: 'Norway',
      description: '峡湾和极光，挪威的自然景观令人叹为观止，是徒步旅行的绝佳选择。',
      coordinates: [10.7522, 59.9139],
      imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963',
    },
    {
      name: 'Scotland',
      description: '高地徒步，从尼斯湖到本尼维斯山，体验苏格兰的野性之美。',
      coordinates: [-4.2518, 55.8642],
      imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963',
    },
  ],
  // ... 其他活动的推荐国家
};

interface GooglePlace {
  place_id: string;
  name: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  vicinity?: string;
  formatted_address?: string;
  photos?: Array<{
    photo_reference: string;
  }>;
  rating?: number;
  price_level?: number;
  types?: string[];
}

interface Landmark {
  id: number;
  name: string;
  location: [number, number];
  description?: string;
  imageUrl?: string;
  rating?: number;
  priceLevel?: number;
  type?: string;
  estimatedDays?: number;
  source?: string;
}

interface Country {
  name: string;
  description: string;
  coordinates: [number, number];
  imageUrl: string;
}

interface PlaceDetails {
  // Define the structure of the PlaceDetails type
}

const ActivityPlanner = () => {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);

  const handleActivitySelect = (activityId: string) => {
    setSelectedActivity(activityId);
    setSelectedCountries([]);
    setLandmarks([]);
  };

  const handleCountrySelect = async (countryName: string) => {
    setSelectedCountries(prev => {
      const isSelected = prev.includes(countryName);
      if (isSelected) {
        return prev.filter(c => c !== countryName);
      } else {
        return [...prev, countryName];
      }
    });
    
    try {
      const country = recommendedCountriesByActivity[selectedActivity!].find(c => c.name === countryName);
      if (country) {
        setLoading(true);
        const params = {
          location: `${country.coordinates[1]},${country.coordinates[0]}`,
          radius: 100000,
          type: getPlaceType(selectedActivity!),
          keyword: getKeyword(selectedActivity!),
        };
        
        const places = await searchGooglePlaces(params) as unknown as GooglePlace[];
        const convertedLandmarks: Landmark[] = places.map(place => ({
          id: parseInt(place.place_id),
          name: place.name,
          location: place.geometry?.location ? 
            [place.geometry.location.lng, place.geometry.location.lat] as [number, number] : 
            [0, 0] as [number, number],
          description: place.vicinity || place.formatted_address || '',
          imageUrl: place.photos?.[0]?.photo_reference ? 
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}` : 
            undefined,
          rating: place.rating,
          priceLevel: place.price_level,
          type: place.types?.[0],
          estimatedDays: 1
        }));
        setLandmarks(prev => [...prev, ...convertedLandmarks]);
      }
    } catch (error) {
      console.error('Error fetching landmarks:', error);
      setError('Failed to fetch landmarks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getPlaceType = (activityId: string): string => {
    switch (activityId) {
      case 'alcohol':
        return 'bar';
      case 'coffee':
        return 'cafe';
      case 'hiking':
        return 'park';
      case 'mushrooms':
        return 'park';
      case 'music':
        return 'establishment';
      case 'beaches':
        return 'natural_feature';
      case 'castles':
        return 'point_of_interest';
      case 'photography':
        return 'point_of_interest';
      default:
        return 'point_of_interest';
    }
  };

  const getKeyword = (activityId: string): string => {
    switch (activityId) {
      case 'alcohol':
        return 'wine bar OR winery OR brewery';
      case 'coffee':
        return 'cafe OR coffee shop';
      case 'hiking':
        return 'hiking trail OR national park';
      case 'mushrooms':
        return 'forest OR nature reserve';
      case 'music':
        return 'concert hall OR music venue';
      case 'beaches':
        return 'beach OR seaside';
      case 'castles':
        return 'castle OR palace OR historic building';
      case 'photography':
        return 'scenic view OR viewpoint';
      default:
        return '';
    }
  };
  
  const handleLandmarkSelect = async (landmark: Landmark) => {
    setSelectedLandmark(landmark);
    
    try {
      const details = await getPlaceDetails(landmark.id.toString());
      if (details) {
        // Update the landmark with additional details if needed
        console.log('Landmark details:', details);
      }
    } catch (error) {
      console.error('Error fetching landmark details:', error);
    }
  };

  const buildSearchQuery = (activity: string): string => {
    const queryMap: Record<string, string> = {
      'Wine & Beer': 'wine bar OR winery OR brewery',
      'Beaches': 'beach OR seaside',
      'Museums': 'museum OR art gallery',
      'Castles': 'castle OR palace OR historic building',
      'Parks': 'park OR garden OR nature reserve',
      'Shopping': 'shopping center OR mall OR market',
      'Restaurants': 'restaurant OR cafe OR bistro',
      'Nightlife': 'bar OR nightclub OR pub',
      'Sports': 'stadium OR arena OR sports center',
      'Religious': 'church OR cathedral OR temple',
    };

    return queryMap[activity] || activity;
  };

  const getInterestsByActivity = (activityId: string): string[] => {
    switch (activityId) {
      case 'alcohol':
        return ['Red wine', 'White wine', 'Beer', 'Gin', 'Whiskey', 'Local brews'];
      case 'coffee':
        return ['Espresso', 'Cappuccino', 'Local cafes', 'Historic cafes'];
      case 'hiking':
        return ['Mountain trails', 'Coastal walks', 'National parks', 'Nature reserves'];
      case 'mushrooms':
        return ['Forest walks', 'Guided tours', 'Local experts'];
      case 'music':
        return ['Classical', 'Jazz', 'Folk music', 'Music festivals'];
      case 'beaches':
        return ['Sandy beaches', 'Hidden coves', 'Beach clubs', 'Water sports'];
      case 'castles':
        return ['Medieval castles', 'Royal palaces', 'Fortresses', 'Historic sites'];
      case 'photography':
        return ['Scenic views', 'City shots', 'Nature', 'Architecture'];
      default:
        return [];
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-screen p-6">
      {/* Left Panel - Activities */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Let's tailor your European adventure</CardTitle>
          <CardDescription>
            What activities interest you?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {activities.map((activity) => (
                <Button
                  key={activity.id}
                  variant={selectedActivity === activity.id ? "default" : "outline"}
                  className={`flex-col h-24 ${selectedActivity === activity.id ? 'bg-travel-teal hover:bg-travel-teal/90' : ''}`}
                  onClick={() => handleActivitySelect(activity.id)}
                >
                  {activity.icon}
                  <span className="mt-2 text-xs">{activity.name}</span>
                </Button>
              ))}
            </div>
            
            {selectedActivity && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">What specifically interests you?</h3>
                <div className="flex flex-wrap gap-2">
                  {getInterestsByActivity(selectedActivity).map(interest => (
                    <Button
                      key={interest}
                      variant="outline"
                      size="sm"
                      className={`rounded-full ${
                        interests.includes(interest) ? 'bg-travel-teal/20' : ''
                      }`}
                      onClick={() => setInterests(prev => 
                        prev.includes(interest) 
                          ? prev.filter(i => i !== interest)
                          : [...prev, interest]
                      )}
                    >
                      {interest}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Center Panel - Map and Countries */}
      <Card className="lg:col-span-6">
        <CardContent className="p-0 h-full">
          <div className="h-full flex flex-col">
            <div className="flex-1">
              <TravelMap 
                landmarks={landmarks}
                onSelectLandmark={setSelectedLandmark}
                selectedLandmark={selectedLandmark}
              />
            </div>
            
            {selectedActivity && (
              <div className="border-t p-4">
                <h3 className="font-medium mb-3">Selected: {selectedCountries.join(', ')}</h3>
                <ScrollArea className="h-48">
                  <div className="space-y-3">
                    {recommendedCountriesByActivity[selectedActivity]?.map((country) => (
                      <div
                        key={country.name}
                        className={`p-3 rounded-md cursor-pointer flex items-center justify-between ${
                          selectedCountries.includes(country.name) ? 'bg-travel-teal/20' : 'hover:bg-muted'
                        }`}
                        onClick={() => handleCountrySelect(country.name)}
                      >
                        <div>
                          <h4 className="font-medium">{country.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {country.description}
                          </p>
                        </div>
                        <div className="flex items-center justify-center w-6 h-6 border rounded">
                          {selectedCountries.includes(country.name) && '✓'}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Right Panel - AI Assistant */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Customize your route with AI</CardTitle>
          <CardDescription>
            Get personalized recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              5 days in selected countries
            </Button>
            <Button variant="outline" className="w-full justify-start">
              {selectedActivity === 'alcohol' ? 'Wine tasting route' : 
               selectedActivity === 'coffee' ? 'Coffee shop tour' :
               selectedActivity === 'hiking' ? 'Hiking trail plan' :
               'Custom itinerary'}
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Local recommendations
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Cultural experience
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityPlanner;
