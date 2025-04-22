import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Beer, Coffee, Mountain, Leaf, Wine, Music, Umbrella, Building, Camera } from 'lucide-react';
import TravelMap from './TravelMap';
import LandmarkDetail from './LandmarkDetail';
import { searchPlaces, getPlaceDetails, Landmark } from '../services/placesService';
import { searchPlaces as searchOSMPlaces, convertToLandmark as convertOSMLandmark } from '@/services/openStreetMapService';
import { getPlaceType, getKeyword } from '@/services/placesService';
import { EuropeanCountry } from '../types/Country';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';

type ActivityType = 'nature' | 'culture' | 'food' | 'shopping' | 'nightlife';

interface Activity {
  type: ActivityType;
  name: string;
  icon: string;
  description: string;
}

const activities = [
  { id: 'hiking', name: 'Hiking' },
  { id: 'museum', name: 'Museum' },
  { id: 'wine', name: 'Wine' },
  { id: 'coffee', name: 'Coffee' },
  { id: 'mushroom', name: 'Mushroom' },
  { id: 'more', name: 'More' }
];

// Mock data for landmarks based on activities
const landmarksByActivity: Record<string, Landmark[]> = {
  hiking: [
    {
      id: '1',
      name: 'Cinque Terre',
      description: 'A string of centuries-old seaside villages on the rugged Italian Riviera coastline.',
      location: { latitude: 44.128, longitude: 9.724 },
      type: 'Coastal Trail',
      rating: 4.9,
      priceLevel: 2,
      estimatedDays: 3,
      country: 'Italy',
      source: 'mock'
    },
    {
      id: '2',
      name: 'Tour du Mont Blanc',
      description: 'A 170 km trek through France, Italy and Switzerland, circumnavigating Mont Blanc.',
      location: { latitude: 45.917, longitude: 6.864 },
      type: 'Mountain Trail',
      rating: 4.9,
      priceLevel: 3,
      estimatedDays: 7,
      country: 'France/Italy/Switzerland',
      source: 'mock'
    }
  ],
  castles: [
    {
      id: '3',
      name: 'Neuschwanstein Castle',
      description: 'A 19th-century Romanesque Revival palace on a rugged hill above the village of Hohenschwangau.',
      location: { latitude: 47.557, longitude: 10.750 },
      type: 'Castle',
      rating: 4.9,
      priceLevel: 2,
      estimatedDays: 1,
      country: 'Germany',
      source: 'mock'
    },
    {
      id: '4',
      name: 'Edinburgh Castle',
      description: 'A historic fortress which dominates the skyline of Edinburgh, the capital of Scotland.',
      location: { latitude: 55.949, longitude: -3.200 },
      type: 'Castle',
      rating: 4.7,
      priceLevel: 2,
      estimatedDays: 1,
      country: 'Scotland',
      source: 'mock'
    }
  ],
  coffee: [
    {
      id: '5',
      name: 'Café Central',
      description: 'A traditional Viennese coffeehouse in the Innere Stadt district of Vienna.',
      location: { latitude: 48.210, longitude: 16.366 },
      type: 'Historic Café',
      rating: 4.5,
      priceLevel: 2,
      estimatedDays: 0.5,
      country: 'Austria',
      source: 'mock'
    },
    {
      id: '6',
      name: 'Café A Brasileira',
      description: 'A famous coffeehouse in Lisbon, Portugal, known for its historic significance and artistic heritage.',
      location: { latitude: 38.714, longitude: -9.142 },
      type: 'Historic Café',
      rating: 4.3,
      priceLevel: 1,
      estimatedDays: 0.5,
      country: 'Portugal',
      source: 'mock'
    }
  ],
  alcohol: [
    {
      id: '7',
      name: 'Champagne Region',
      description: 'The world-famous wine region in northeastern France, home to the sparkling wine Champagne.',
      location: { latitude: 49.044, longitude: 4.023 },
      type: 'Wine Region',
      rating: 4.8,
      priceLevel: 2,
      estimatedDays: 2,
      country: 'France',
      source: 'mock'
    },
    {
      id: '8',
      name: 'Pilsner Urquell Brewery',
      description: 'The birthplace of Pilsner beer, located in Pilsen, Czech Republic.',
      location: { latitude: 49.748, longitude: 13.383 },
      type: 'Brewery',
      rating: 4.6,
      priceLevel: 1,
      estimatedDays: 1,
      country: 'Czech Republic',
      source: 'mock'
    }
  ],
  photography: [
    {
      id: '9',
      name: 'Santorini',
      description: 'A stunning Greek island in the Aegean Sea, known for its white-washed buildings and blue domes.',
      location: { latitude: 36.416, longitude: 25.396 },
      type: 'Island',
      rating: 4.9,
      priceLevel: 3,
      estimatedDays: 3,
      country: 'Greece',
      source: 'mock'
    },
    {
      id: '10',
      name: 'Plitvice Lakes',
      description: 'A national park in Croatia known for its chain of 16 terraced lakes, joined by waterfalls.',
      location: { latitude: 44.865, longitude: 15.582 },
      type: 'National Park',
      rating: 4.8,
      priceLevel: 2,
      estimatedDays: 1,
      country: 'Croatia',
      source: 'mock'
    }
  ]
};

// 定义每个活动对应的兴趣选项和推荐国家
const interestsByActivity: Record<string, Array<{
  name: string;
  countries: Array<{
    name: string;
    description: string;
    coordinates: [number, number];
    imageUrl: string;
  }>;
}>> = {
  hiking: [
    {
      name: 'Mountain Trails',
      countries: [
        {
          name: 'Switzerland',
          description: '阿尔卑斯山脉的壮丽景色，从少女峰到马特洪峰，徒步者的天堂。',
          coordinates: [8.2275, 46.8182],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        },
        {
          name: 'Norway',
          description: '峡湾和极光，挪威的自然景观令人叹为观止，是徒步旅行的绝佳选择。',
          coordinates: [10.7522, 59.9139],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        }
      ]
    },
    {
      name: 'Coastal Walks',
      countries: [
        {
          name: 'Portugal',
          description: '阿尔加维海岸线，风景如画的海岸徒步路线。',
          coordinates: [-8.2245, 39.3999],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        },
        {
          name: 'Croatia',
          description: '亚得里亚海沿岸的美丽徒步路线。',
          coordinates: [15.2, 45.1],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        }
      ]
    }
  ],
  museum: [
    {
      name: 'Art Museums',
      countries: [
        {
          name: 'Italy',
          description: '乌菲兹美术馆和梵蒂冈博物馆，文艺复兴艺术的殿堂。',
          coordinates: [12.4964, 41.9028],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        },
        {
          name: 'France',
          description: '卢浮宫和奥赛博物馆，世界级艺术收藏。',
          coordinates: [2.3522, 48.8566],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        }
      ]
    },
    {
      name: 'History Museums',
      countries: [
        {
          name: 'Greece',
          description: '雅典国家考古博物馆，古希腊文明的见证。',
          coordinates: [23.7275, 37.9838],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        },
        {
          name: 'UK',
          description: '大英博物馆，世界历史文化的宝库。',
          coordinates: [-0.1276, 51.5074],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        }
      ]
    }
  ],
  coffee: [
    {
      name: 'Historic Cafés',
      countries: [
        {
          name: 'Italy',
          description: '威尼斯和罗马的百年咖啡馆，意式咖啡文化的发源地。',
          coordinates: [12.4964, 41.9028],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        },
        {
          name: 'Greece',
          description: '雅典的传统咖啡馆，体验希腊独特的咖啡文化。',
          coordinates: [23.7275, 37.9838],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        }
      ]
    },
    {
      name: 'Barista Workshops',
      countries: [
        {
          name: 'Netherlands',
          description: '阿姆斯特丹的精品咖啡文化，专业的咖啡师培训。',
          coordinates: [4.8952, 52.3702],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        },
        {
          name: 'Denmark',
          description: '哥本哈根的咖啡文化，北欧风格的咖啡体验。',
          coordinates: [12.5683, 55.6761],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        }
      ]
    }
  ],
  wine: [
    {
      name: 'Wine Tasting',
      countries: [
        {
          name: 'France',
          description: '波尔多和勃艮第的葡萄酒品鉴，世界顶级葡萄酒产区。',
          coordinates: [2.3522, 48.8566],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        },
        {
          name: 'Italy',
          description: '托斯卡纳的葡萄酒品鉴，体验意大利葡萄酒文化。',
          coordinates: [12.4964, 41.9028],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        }
      ]
    },
    {
      name: 'Vineyard Tours',
      countries: [
        {
          name: 'Spain',
          description: '里奥哈和普里奥拉特的葡萄园之旅。',
          coordinates: [-3.7038, 40.4168],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        },
        {
          name: 'Portugal',
          description: '杜罗河谷的葡萄园，波特酒的故乡。',
          coordinates: [-8.2245, 39.3999],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        }
      ]
    }
  ],
  mushroom: [
    {
      name: 'Foraging Tours',
      countries: [
        {
          name: 'Sweden',
          description: '瑞典森林的蘑菇采摘体验，北欧独特的蘑菇文化。',
          coordinates: [18.0686, 59.3293],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        },
        {
          name: 'Finland',
          description: '芬兰森林的蘑菇采摘，体验北欧自然文化。',
          coordinates: [24.9384, 60.1699],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        }
      ]
    },
    {
      name: 'Mushroom Markets',
      countries: [
        {
          name: 'France',
          description: '普罗旺斯的松露市场，法国蘑菇文化的代表。',
          coordinates: [2.3522, 48.8566],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        },
        {
          name: 'Italy',
          description: '托斯卡纳的蘑菇市场，意大利美食文化的一部分。',
          coordinates: [12.4964, 41.9028],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        }
      ]
    }
  ],
  more: [
    {
      name: 'Local Markets',
      countries: [
        {
          name: 'Spain',
          description: '巴塞罗那的波盖利亚市场，体验西班牙美食文化。',
          coordinates: [-3.7038, 40.4168],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        },
        {
          name: 'Greece',
          description: '雅典的中央市场，体验希腊传统市场文化。',
          coordinates: [23.7275, 37.9838],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        }
      ]
    },
    {
      name: 'Street Food',
      countries: [
        {
          name: 'Turkey',
          description: '伊斯坦布尔的街头美食，体验土耳其美食文化。',
          coordinates: [28.9784, 41.0082],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        },
        {
          name: 'Germany',
          description: '柏林的街头美食，体验德国美食文化。',
          coordinates: [13.4050, 52.5200],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        }
      ]
    }
  ]
};

// 添加欧洲国家列表
const europeanCountries: EuropeanCountry[] = [
  {
    id: 'france',
    name: 'France',
    capital: 'Paris',
    description: 'Known for its rich culture, iconic landmarks like the Eiffel Tower, world-class cuisine, and beautiful countryside.',
    imageUrl: '/images/france.jpg',
    location: { latitude: 46.2276, longitude: 2.2137 },
    recommendedDays: 7,
    popularActivities: ['Visit the Eiffel Tower', 'Explore the Louvre', 'Wine tasting in Bordeaux']
  },
  {
    id: 'italy',
    name: 'Italy',
    capital: 'Rome',
    description: 'Home to ancient ruins, artistic treasures, famous cuisine, and stunning landscapes.',
    imageUrl: '/images/italy.jpg',
    location: { latitude: 41.8719, longitude: 12.5674 },
    recommendedDays: 10,
    popularActivities: ['Visit the Colosseum', 'Explore Venice canals', 'Tour Tuscan vineyards']
  },
  {
    id: 'spain',
    name: 'Spain',
    capital: 'Madrid',
    description: 'Famous for its vibrant culture, flamenco dancing, tapas cuisine, and historic architecture.',
    imageUrl: 'https://source.unsplash.com/featured/?madrid,spain',
    location: { latitude: 40.4168, longitude: -3.7038 },
    recommendedDays: 10,
    popularActivities: ['Visit Sagrada Familia', 'Tour the Prado Museum', 'Experience flamenco']
  }
];

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

interface Location {
  latitude: number;
  longitude: number;
}

interface Country {
  name: string;
  description: string;
  coordinates: [number, number];
  imageUrl: string;
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

interface ActivityPlannerProps {
  landmarks: Landmark[];
  onLandmarkSelect: (landmark: Landmark) => void;
  selectedLandmark: Landmark | null;
  activities: string[];
  selectedActivity: string | null;
  onActivitySelect: (activity: string) => void;
}

interface ActivityPlannerState {
  selectedCountry: EuropeanCountry | null;
  selectedActivity: Activity | null;
  landmarks: Landmark[];
  selectedLandmark: Landmark | null;
  loading: boolean;
  showCountrySelector: boolean;
  interests: string[];
}

interface TravelMapProps {
  landmarks: Array<{
    id: number;
    name: string;
    location: [number, number];
  }>;
  onSelectLandmark: (landmark: any) => void;
  selectedLandmark: any;
}

const mockLandmarksByActivity = {
  nature: [
    {
      id: '11',
      name: 'Mont Blanc',
      description: 'The highest mountain in the Alps and Western Europe.',
      location: { latitude: 45.8326, longitude: 6.8652 },
      type: 'Mountain',
      rating: 4.9,
      priceLevel: 2,
      estimatedDays: 2,
      country: 'France/Italy',
      source: 'mock'
    },
    {
      id: '12',
      name: 'Plitvice Lakes',
      description: 'A stunning series of cascading lakes in Croatia.',
      location: { latitude: 44.8654, longitude: 15.5820 },
      type: 'National Park',
      rating: 4.8,
      priceLevel: 2,
      estimatedDays: 1,
      country: 'Croatia',
      source: 'mock'
    },
    {
      id: '13',
      name: 'Norwegian Fjords',
      description: 'Dramatic landscape of deep glacial valleys and steep mountains.',
      location: { latitude: 60.4720, longitude: 7.3236 },
      type: 'Natural Wonder',
      rating: 4.9,
      priceLevel: 3,
      estimatedDays: 3,
      country: 'Norway',
      source: 'mock'
    }
  ],
  nightlife: [
    {
      id: 1,
      name: 'Berghain',
      country: 'Germany',
      location: [52.5109, 13.4426],
      type: 'nightclub',
      price: 3,
      daysNeeded: 1,
      rating: 4.8
    },
    {
      id: 2,
      name: 'Fabric',
      country: 'UK',
      location: [51.5208, -0.1056],
      type: 'nightclub',
      price: 3,
      daysNeeded: 1,
      rating: 4.7
    },
    {
      id: 3,
      name: 'Amnesia',
      country: 'Spain',
      location: [39.0000, 1.4167],
      type: 'nightclub',
      price: 3,
      daysNeeded: 1,
      rating: 4.6
    }
  ],
  // ... other activity mock data ...
};

const ActivityPlanner: React.FC = () => {
  const [state, setState] = useState<ActivityPlannerState>({
    selectedCountry: null,
    selectedActivity: null,
    landmarks: [],
    selectedLandmark: null,
    loading: false,
    showCountrySelector: false,
    interests: []
  });

  // 缓存已加载的地标数据
  const landmarkCache = useRef<Record<string, Landmark[]>>({});

  const getActivityCategory = (activityType: ActivityType): string => {
    switch (activityType) {
      case 'nature':
        return 'hiking';
      case 'culture':
        return 'castles';
      case 'food':
        return 'coffee';
      case 'nightlife':
        return 'alcohol';
      case 'shopping':
        return 'photography';
      default:
        return activityType;
    }
  };

  const getInterestsByActivity = (activityId: string) => {
    return interestsByActivity[activityId] || [];
  };

  const handleActivitySelect = async (activity: { id: string; name: string }) => {
    console.log('Selected activity:', activity);
    
    setState(prev => ({
      ...prev,
      selectedActivity: activity,
      selectedCountry: null,
      landmarks: [],
      showCountrySelector: false,
      interests: []
    }));
  };

  const handleCountrySelect = async (country: EuropeanCountry) => {
    console.log('Selected country:', country);
    
    if (!state.selectedActivity) {
      console.error('No activity selected');
      return;
    }

    const category = getActivityCategory(state.selectedActivity.type);
    const location = `${country.location.latitude},${country.location.longitude}`;
    const radius = 50000; // 50km radius

    try {
      const type = getPlaceType(category);
      const keyword = getKeyword(category);
      
      console.log('Searching places with params:', {
        location,
        radius,
        type,
        keyword
      });

      const response = await searchPlaces({
        location,
        radius,
        type,
        keyword
      });

      console.log('Places API response:', response);

      if (response) {
        const mappedLandmarks: Landmark[] = response.map(landmark => ({
          id: landmark.id,
          name: landmark.name,
          location: landmark.location,
          description: landmark.description,
          imageUrl: landmark.imageUrl,
          rating: landmark.rating,
          priceLevel: landmark.priceLevel,
          type: category,
          estimatedDays: 1,
          country: country.name,
          source: 'google'
        }));

        setState(prev => ({
          ...prev,
          selectedCountry: country,
          landmarks: mappedLandmarks,
          showCountrySelector: false
        }));
      }
    } catch (error) {
      console.error('Error fetching places:', error);
    }
  };

  const handleLandmarkSelect = async (landmark: Landmark) => {
    setState(prev => ({
      ...prev,
      selectedLandmark: landmark
    }));

    try {
      const details = await getPlaceDetails(landmark.id);
      if (details) {
        setState(prev => ({
          ...prev,
          selectedLandmarkDetails: details
        }));
      }
    } catch (error) {
      console.error('Error fetching landmark details:', error);
    }
  };

  const handleInterestSelect = (interestName: string) => {
    if (!state.selectedActivity) return;

    const interest = interestsByActivity[state.selectedActivity.id]?.find(
      i => i.name === interestName
    );

    if (!interest) return;

    // 将国家信息转换为地标格式
    const countryLandmarks = interest.countries.map(country => ({
      id: `country-${country.name}`,
      name: country.name,
      description: country.description,
      location: {
        latitude: country.coordinates[1],
        longitude: country.coordinates[0]
      },
      type: 'Country',
      rating: 4.5,
      priceLevel: 2,
      estimatedDays: 3,
      country: country.name,
      source: 'recommended',
      imageUrl: country.imageUrl
    }));

    setState(prev => ({
      ...prev,
      interests: prev.interests.includes(interestName)
        ? prev.interests.filter(i => i !== interestName)
        : [...prev.interests, interestName],
      landmarks: countryLandmarks
    }));
  };

  const toggleCountrySelector = () => {
    setState(prev => ({
      ...prev,
      showCountrySelector: !prev.showCountrySelector
    }));
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
                  variant={state.selectedActivity?.id === activity.id ? "default" : "outline"}
                  className={`flex-col h-24 ${state.selectedActivity?.id === activity.id ? 'bg-travel-teal hover:bg-travel-teal/90' : ''}`}
                  onClick={() => handleActivitySelect(activity)}
                >
                  <span className="mt-2 text-xs">{activity.name}</span>
                </Button>
              ))}
            </div>
          
            {state.selectedActivity && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">What specifically interests you?</h3>
                <div className="flex flex-wrap gap-2">
                  {getInterestsByActivity(state.selectedActivity.id).map(interest => (
                    <Button
                      key={interest.name}
                      variant="outline"
                      size="sm"
                      className={`rounded-full ${
                        state.interests.includes(interest.name) ? 'bg-travel-teal/20' : ''
                      }`}
                      onClick={() => handleInterestSelect(interest.name)}
                    >
                      {interest.name}
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
                landmarks={state.landmarks.map(landmark => ({
                  id: parseInt(landmark.id.replace('country-', '')),
                  name: landmark.name,
                  location: [landmark.location.longitude, landmark.location.latitude]
                }))}
                onSelectLandmark={handleLandmarkSelect}
                selectedLandmark={state.selectedLandmark}
              />
            </div>
            
            {state.selectedActivity && (
              <div className="border-t p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">
                    {state.selectedCountry ? `Selected: ${state.selectedCountry.name}` : 'Select a country'}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleCountrySelector}
                  >
                    Choose other country
                  </Button>
                </div>
                <ScrollArea className="h-48">
                  <div className="space-y-3">
                    {(state.showCountrySelector ? europeanCountries : europeanCountries.filter(country => 
                      interestsByActivity[getActivityCategory(state.selectedActivity.type)]?.some(rec => 
                        rec.name === country.name
                      )
                    )).map((country) => (
                      <div
                        key={country.id}
                        className={`p-3 rounded-md cursor-pointer flex items-center justify-between ${
                          state.selectedCountry?.id === country.id ? 'bg-travel-teal/20' : 'hover:bg-muted'
                        }`}
                        onClick={() => handleCountrySelect(country)}
                      >
                        <div>
                          <h4 className="font-medium">{country.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {country.description}
                          </p>
                          </div>
                        <div className="flex items-center justify-center w-6 h-6 border rounded">
                          {state.selectedCountry?.id === country.id && '✓'}
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
              5 days in {state.selectedCountry?.name || 'selected country'}
            </Button>
            <Button variant="outline" className="w-full justify-start">
              {state.selectedActivity?.type === 'food' ? 'Local Food Tour' :
               state.selectedActivity?.type === 'culture' ? 'Historical Walking Tour' :
               state.selectedActivity?.type === 'nature' ? 'Nature Trail' :
               state.selectedActivity?.type === 'shopping' ? 'Shopping Route' :
               state.selectedActivity?.type === 'nightlife' ? 'Nightlife Tour' :
               'Custom Route'}
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
