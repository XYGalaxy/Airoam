import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import { Beer, Coffee, Mountain, Leaf, Wine, Music, Umbrella, Building, Camera, ShoppingCart, Trash2, Plus, Map } from 'lucide-react';
import { GoogleMap, Marker, InfoWindow, LoadScript } from '@react-google-maps/api';
import TravelMap from './TravelMap';
import LandmarkDetail from './LandmarkDetail';
import { searchPlaces, getPlaceDetails, Landmark as PlacesLandmark } from '../services/placesService';
import { searchPlaces as searchOSMPlaces, convertToLandmark as convertOSMLandmark } from '../services/openStreetMapService';
import { getPlaceType, getKeyword } from '../services/placesService';
import { EuropeanCountry, ActivityType, Activity } from '../types/Country';
import { Landmark } from '../types/Landmark';
import './ActivityPlanner.css';
import 'leaflet/dist/leaflet.css';
import { useLandmarks } from '@/contexts/LandmarksContext';
import Chatbot from './Chatbot';

type ActivityType = 'nature' | 'culture' | 'food' | 'shopping' | 'nightlife';

interface Activity {
  type: ActivityType;
  name: string;
  icon: string;
  description: string;
}

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
      source: 'mock',
      countryDescription: 'Italy offers some of the most diverse hiking experiences in Europe, from the dramatic coastal trails of Cinque Terre to the challenging paths of the Dolomites. The country\'s rich history and stunning landscapes make every hike a journey through time and nature.'
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
      source: 'mock',
      countryDescription: 'The Alps offer some of the most spectacular hiking in the world, with the Tour du Mont Blanc being one of the most famous long-distance trails. This region combines French charm, Italian passion, and Swiss precision in a breathtaking mountain setting.'
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
          description: 'Alpine scenery, from Jungfrau to Matterhorn, the paradise for hikers.',
          coordinates: [8.2275, 46.8182],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        },
        {
          name: 'Norway',
          description: 'The fjords and the Northern Lights, Norway\'s natural beauty is breathtaking, a perfect choice for hiking.',
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
          description: 'The Algarve Coast, a scenic coastal hiking route.',
          coordinates: [-8.2245, 39.3999],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        },
        {
          name: 'Croatia',
          description: 'The beautiful hiking route along the Adriatic Sea.',
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
          description: 'The Uffizi Gallery and the Vatican Museums, the temple of Renaissance art.',
          coordinates: [12.4964, 41.9028],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        },
        {
          name: 'France',
          description: 'The Louvre and the Orsay Museum, world-class art collection.',
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
          description: 'The National Archaeological Museum of Greece, the witness of ancient Greek civilization.',
          coordinates: [23.7275, 37.9838],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        },
        {
          name: 'UK',
          description: 'The British Museum, the treasure trove of world history and culture.',
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
          description: 'The cafes in Venice and Rome, the birthplace of Italian coffee culture.',
          coordinates: [12.4964, 41.9028],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        },
        {
          name: 'Greece',
          description: 'The traditional cafes in Athens, experience Greek coffee culture.',
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
          description: 'The Dutch coffee culture in Amsterdam, professional coffee training.',
          coordinates: [4.8952, 52.3702],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        },
        {
          name: 'Denmark',
          description: 'The Danish coffee culture in Copenhagen, Nordic coffee experience.',
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
          description: 'Wine tasting in Bordeaux and Burgundy, world-class wine region.',
          coordinates: [2.3522, 48.8566],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        },
        {
          name: 'Italy',
          description: 'Wine tasting in Tuscany, experience Italian wine culture.',
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
          description: 'The vineyard tour in Rioja and Priorat.',
          coordinates: [-3.7038, 40.4168],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        },
        {
          name: 'Portugal',
          description: 'The vineyard tour in the Douro Valley, the birthplace of Port wine.',
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
          description: 'The mushroom picking experience in Swedish forests, Nordic mushroom culture.',
          coordinates: [18.0686, 59.3293],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        },
        {
          name: 'Finland',
          description: 'The mushroom picking experience in Finnish forests, experience Nordic natural culture.',
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
          description: 'The truffle market in Provence, the representative of French mushroom culture.',
          coordinates: [2.3522, 48.8566],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        },
        {
          name: 'Italy',
          description: 'The mushroom market in Tuscany, part of Italian food culture.',
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
          description: 'The La Boqueria market in Barcelona, experience Spanish food culture.',
          coordinates: [-3.7038, 40.4168],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        },
        {
          name: 'Greece',
          description: 'The Central Market in Athens, experience Greek traditional market culture.',
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
          description: 'The street food in Istanbul, experience Turkish food culture.',
          coordinates: [28.9784, 41.0082],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        },
        {
          name: 'Germany',
          description: 'The street food in Berlin, experience German food culture.',
          coordinates: [13.4050, 52.5200],
          imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963'
        }
      ]
    }
  ]
};

// 添加欧洲国家列表
const europeanCountries = [
  {
    id: 'france',
    name: 'France',
    description: 'France is renowned for its rich culture, world-class cuisine, and iconic landmarks. From the romantic streets of Paris to the sun-kissed vineyards of Bordeaux, France offers a perfect blend of history, art, and gastronomy.',
    location: { latitude: 46.2276, longitude: 2.2137 }
  },
  {
    id: 'italy',
    name: 'Italy',
    description: 'Italy is a treasure trove of art, history, and culinary delights. From the ancient ruins of Rome to the Renaissance masterpieces of Florence, and the romantic canals of Venice, Italy offers an unforgettable cultural experience.',
    location: { latitude: 41.8719, longitude: 12.5674 }
  },
  {
    id: 'spain',
    name: 'Spain',
    description: 'Spain is a vibrant country known for its passionate culture, stunning architecture, and diverse landscapes. From the bustling streets of Barcelona to the historic charm of Seville, Spain offers a perfect mix of tradition and modernity.',
    location: { latitude: 40.4168, longitude: -3.7038 }
  },
  {
    id: 'germany',
    name: 'Germany',
    description: 'Germany is a country of contrasts, from the modern metropolis of Berlin to the fairytale castles of Bavaria. Known for its rich history, engineering excellence, and world-famous beer culture.',
    location: { latitude: 51.1657, longitude: 10.4515 }
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    description: 'The UK is a fascinating blend of history and modernity. From the iconic landmarks of London to the stunning landscapes of Scotland, the UK offers a diverse range of experiences for every traveler.',
    location: { latitude: 55.3781, longitude: -3.4360 }
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
  onLandmarkSelect?: (landmarks: any[]) => void;
}

interface ActivityPlannerState {
  selectedCountry: EuropeanCountry | null;
  selectedActivity: Activity | null;
  landmarks: Landmark[];
  selectedLandmark: Landmark | null;
  loading: boolean;
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

const getActivityIcon = (activityId: string): string => {
  switch (activityId) {
    case 'hiking':
      return '🏔️';
    case 'museum':
      return '🏛️';
    case 'wine':
      return '🍷';
    case 'coffee':
      return '☕';
    case 'mushroom':
      return '🍄';
    default:
      return '📍';
  }
};

const getActivityDescription = (activityId: string): string => {
  switch (activityId) {
    case 'hiking':
      return 'Explore scenic trails and natural landscapes';
    case 'museum':
      return 'Discover art, history, and culture';
    case 'wine':
      return 'Experience local vineyards and wine tasting';
    case 'coffee':
      return 'Find the best local coffee spots';
    case 'mushroom':
      return 'Learn about local fungi and foraging';
    default:
      return 'Explore points of interest';
  }
};

const SERVER_PORT = 3000;
const PROXY_BASE_URL = `http://localhost:${SERVER_PORT}/api/places`;

const getMarkerIcon = (activityType: string): string => {
  switch (activityType) {
    case 'historical':
      return '/markers/historical.png';
    case 'nature':
      return '/markers/nature.png';
    case 'entertainment':
      return '/markers/entertainment.png';
    case 'dining':
      return '/markers/dining.png';
    default:
      return '/markers/default.png';
  }
};

// 将 libraries 配置移到组件外部
const libraries: ("places" | "marker")[] = ['places', 'marker'];

// 兜底生成唯一 id 的函数
const generateStableId = (place: any): string => {
  const name = place.name || '';
  const lat = place.location?.lat || place.location?.latitude || 0;
  const lng = place.location?.lng || place.location?.longitude || 0;
  return `place-${name.toLowerCase().replace(/\s+/g, '-')}-${lat}-${lng}`;
};

const ActivityPlanner: React.FC<ActivityPlannerProps> = ({ onLandmarkSelect }) => {
  const { selectedLandmarks, addLandmark, removeLandmark } = useLandmarks();
  const [state, setState] = useState<ActivityPlannerState>({
    selectedCountry: null,
    selectedActivity: null,
    landmarks: [],
    selectedLandmark: null,
    loading: false,
    interests: []
  });

  const [activities, setActivities] = useState([
    { id: 'hiking', name: 'Hiking', icon: Mountain },
    { id: 'museum', name: 'Museum', icon: Building },
    { id: 'wine', name: 'Wine', icon: Wine },
    { id: 'coffee', name: 'Coffee', icon: Coffee },
    { id: 'mushroom', name: 'Mushroom', icon: Leaf },
    { id: 'more', name: 'More', icon: Camera }
  ]);

  const [itinerary, setItinerary] = useState<Landmark[]>([]);
  const [showItinerary, setShowItinerary] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  // 添加 useEffect 来处理 selectedLandmarks 的变化
  useEffect(() => {
    if (onLandmarkSelect) {
      onLandmarkSelect(selectedLandmarks);
    }
  }, [selectedLandmarks, onLandmarkSelect]);

  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapContainerStyle = {
    width: '100%',
    height: '100%',
    minHeight: '400px',
    position: 'relative' as const
  };

  const defaultCenter = {
    lat: 48.8566,
    lng: 2.3522
  };

  const defaultOptions = {
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
      }
    ]
  };

  const onMapLoad = React.useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setMapLoaded(true);
  }, []);

  const renderInfoWindow = (landmark: Landmark) => (
    <div className="info-window">
      <h3 className="font-bold text-lg">{landmark.name}</h3>
      <p className="text-sm text-gray-600">{landmark.description}</p>
      {landmark.rating && (
        <div className="flex items-center mt-1">
          <span className="text-yellow-500">★</span>
          <span className="ml-1 text-sm">{landmark.rating.toFixed(1)}</span>
        </div>
      )}
      {landmark.priceLevel && (
        <div className="text-sm text-gray-500">
          {'$'.repeat(landmark.priceLevel)}
        </div>
      )}
      {landmark.website && (
        <a 
          href={landmark.website} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-blue-500 hover:underline mt-2 block"
        >
          Visit Website
        </a>
      )}
    </div>
  );

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
    try {
      setState(prev => ({
        ...prev,
        selectedActivity: {
          type: activity.id as ActivityType,
          name: activity.name,
          icon: getActivityIcon(activity.id),
          description: getActivityDescription(activity.id)
        },
        selectedCountry: null,
        landmarks: [],
        interests: []
      }));

      // 获取该活动对应的兴趣列表
      const activityInterests = interestsByActivity[activity.id] || [];
      if (activityInterests.length > 0) {
        // 不自动设置 interests，只有用户点击兴趣按钮时才设置
      }
    } catch (error) {
      console.error('Error selecting activity:', error);
    }
  };

  const handleInterestSelect = (interestName: string) => {
    if (!state.selectedActivity) return;

    const interest = interestsByActivity[state.selectedActivity.type]?.find(
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
      countryDescription: country.description
    }));

    setState(prev => ({
      ...prev,
      interests: prev.interests.includes(interestName)
        ? prev.interests.filter(i => i !== interestName)
        : [...prev.interests, interestName],
      landmarks: countryLandmarks
    }));
  };

  const handleCountrySelect = async (country: EuropeanCountry) => {
    console.log('Selected country:', country);
    console.log('Country location:', country.location);

    try {
      setState(prev => ({
        ...prev,
        selectedCountry: country,
        loading: true,
        landmarks: [],
        selectedLandmark: null
      }));
      
      // 获取国家中心点
      const countryCenter = {
        lat: country.location.latitude,
        lng: country.location.longitude
      };
      console.log('Country center:', countryCenter);

      // 获取当前活动类型
      const activityType = state.selectedActivity?.type || 'museum';
      console.log('Searching for activity type:', activityType);

      // 搜索该国家下的地标
      const places = await searchPlaces(
        countryCenter,
        getPlaceType(activityType),
        50000
      );

      console.log('Raw places data:', places);

      if (mapRef.current) {
        const landmarks: Landmark[] = places
          .filter(place => place && place.location && typeof place.location.lat === 'number' && typeof place.location.lng === 'number')
          .map(place => ({
            ...place,
            id: place.place_id || generateStableId(place),
            location: {
              latitude: place.location.lat,
              longitude: place.location.lng
            },
            source: 'google_places',
            country: country.name
          }))
          .filter(l => !!l.id);
        
        console.log('Processed landmarks:', landmarks);

        // 设置地图中心点和缩放级别
        mapRef.current.panTo(countryCenter);
        mapRef.current.setZoom(12);

        setState(prev => ({
          ...prev,
          landmarks,
          selectedLandmark: null,
          loading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false
        }));
      }
    } catch (error) {
      console.error('Error searching places:', error);
      setState(prev => ({
        ...prev,
        loading: false
      }));
    }
  };

  const handleLandmarkSelect = async (landmark: Landmark | null) => {
    if (!landmark || landmark.source !== 'google_places') {
      setState(prev => ({ ...prev, selectedLandmark: null }));
      return;
    }

    // 先展示基础信息
    setState(prev => ({ ...prev, selectedLandmark: landmark, loading: false }));

    // 有 place_id 再去 fetch 详情补充内容
    if (landmark.place_id) {
      setState(prev => ({ ...prev, loading: true }));
      try {
        const details = await getPlaceDetails(landmark.place_id);
        if (details) {
          setState(prev => ({
            ...prev,
            selectedLandmark: { ...landmark, ...details },
            loading: false
          }));
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        setState(prev => ({ ...prev, loading: false }));
      }
    }
  };

  const handleAddToItinerary = (landmark: Landmark) => {
    addLandmark(landmark);
  };

  const handleRemoveFromItinerary = (id: string) => {
    removeLandmark(id);
  };

  // AI推荐国家后自动选择国家
  const handleAIRecommendCountries = (recommendation: { activity: string; countries: Array<{ name: string; reason: string }> }) => {
    if (!recommendation || !recommendation.activity || !recommendation.countries.length) return;
    
    // 更新 activities 列表，替换 "more" 为新的活动
    const newActivities = activities.map(activity => 
      activity.id === 'more' 
        ? { 
            id: recommendation.activity.toLowerCase(),
            name: recommendation.activity,
            icon: Music // 为 theatre 使用 Music 图标
          }
        : activity
    );
    setActivities(newActivities);

    // 自动选择新的活动
    handleActivitySelect({
      id: recommendation.activity.toLowerCase(),
      name: recommendation.activity
    });

    // 处理推荐的国家
    recommendation.countries.slice(0, 3).forEach(country => {
      const found = europeanCountries.find(c => c.name.toLowerCase() === country.name.toLowerCase());
      if (found) {
        found.description = country.reason; // 使用 AI 提供的推荐理由
        handleCountrySelect(found);
      }
    });

    setShowChatbot(false);
  };

  return (
    <div className="grid grid-cols-4 gap-4 h-[calc(100vh-2rem)] p-4">
      {/* 左侧活动选择面板 */}
      <div className="col-span-1 h-full">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Select Activity Type</CardTitle>
            <CardDescription>Select the activity type you are interested in</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {activities.map((activity) => (
                <Button
                  key={activity.id}
                  variant={state.selectedActivity?.type === activity.id ? "default" : "outline"}
                  className="h-24 flex flex-col items-center justify-center gap-2"
                  onClick={() => {
                    if (activity.id === 'more') {
                      setShowChatbot(true);
                    } else {
                      handleActivitySelect(activity);
                    }
                  }}
                >
                  {React.createElement(activity.icon, { className: "h-6 w-6" })}
                  <span>{activity.name}</span>
                </Button>
              ))}
            </div>

            {/* 兴趣选择区域 */}
            {state.selectedActivity && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Select Specific Interest</h3>
                <div className="flex flex-wrap gap-2">
                  {interestsByActivity[state.selectedActivity.type]?.map((interest, index) => (
                    <Button
                      key={`${interest.name}-${index}`}
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

            {/* 国家选择列表：只在选完兴趣后显示，并且只显示推荐国家 */}
            {state.selectedActivity && Array.isArray(state.interests) && state.interests.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-medium mb-2">Recommended Countries</h3>
                <div className="space-y-2">
                  {interestsByActivity[state.selectedActivity.type]
                    ?.filter(interest => state.interests.includes(interest.name))
                    .flatMap(interest => interest.countries)
                    .map((country) => (
                      <div
                        key={country.name}
                        className={`p-3 rounded-md cursor-pointer ${
                          state.selectedCountry?.name === country.name ? 'bg-travel-teal/20' : 'hover:bg-muted'
                        }`}
                        onClick={() => handleCountrySelect({
                          id: country.name,
                          name: country.name,
                          location: {
                            latitude: country.coordinates[1],
                            longitude: country.coordinates[0]
                          },
                          description: country.description,
                          capital: '',
                          imageUrl: country.imageUrl,
                          recommendedDays: 0,
                          popularActivities: []
                        })}
                      >
                        <h4 className="font-medium">{country.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {country.description}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

          </CardContent>
        </Card>
      </div>

      {/* 中间地图面板 */}
      <div className="col-span-3 h-full">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Select Destination</CardTitle>
            <CardDescription>Select the country you want to visit on the map</CardDescription>
          </CardHeader>
          <CardContent className="h-[calc(100%-8rem)]">
            <div className="h-full">
              <LoadScript 
                googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                libraries={libraries}
                onLoad={() => {
                  console.log('Google Maps API loaded');
                  setMapLoaded(true);
                }}
                onError={(error) => console.error('Error loading Google Maps API:', error)}
              >
                <div style={{ height: '100%', width: '100%', position: 'relative' }}>
                  {!mapLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                  )}
                  {mapLoaded && (
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={
                        state.selectedCountry
                          ? {
                              lat: state.selectedCountry.location.latitude,
                              lng: state.selectedCountry.location.longitude
                            }
                          : defaultCenter
                      }
                      zoom={state.selectedCountry ? 12 : 4}
                      onLoad={onMapLoad}
                      options={defaultOptions}
                    >
                      {state.landmarks
                        .filter(l =>
                          l.source === 'google_places' &&
                          l.id &&
                          l.location &&
                          typeof l.location.latitude === 'number' &&
                          !isNaN(l.location.latitude) &&
                          typeof l.location.longitude === 'number' &&
                          !isNaN(l.location.longitude)
                        )
                        .slice(0, 5)
                        .map((landmark, index) => (
                          <Marker
                            key={landmark.id || index}
                            position={{
                              lat: landmark.location.latitude,
                              lng: landmark.location.longitude
                            }}
                            onClick={() => handleLandmarkSelect(landmark)}
                            icon={{
                              url: state.selectedLandmark?.id === landmark.id 
                                ? 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                                : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                              scaledSize: new google.maps.Size(32, 32)
                            }}
                          />
                        ))}
                      {state.selectedLandmark && (
                        <InfoWindow
                          position={{
                            lat: state.selectedLandmark.location.latitude,
                            lng: state.selectedLandmark.location.longitude
                          }}
                          onCloseClick={() => handleLandmarkSelect(null)}
                        >
                          <div style={{ padding: '8px', minWidth: 220, position: 'relative' }}>
                            <button
                              style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer' }}
                              title="Add to itinerary"
                              onClick={() => handleAddToItinerary(state.selectedLandmark)}
                            >
                              <Plus size={20} color={selectedLandmarks.find(item => item.id === state.selectedLandmark.id) ? '#22c55e' : '#888'} />
                            </button>
                            <h3 style={{ margin: '0 0 8px 0', fontWeight: 600 }}>{state.selectedLandmark.name}</h3>
                            {state.selectedLandmark.description && (
                              <p style={{ margin: '0 0 4px 0' }}>{state.selectedLandmark.description}</p>
                            )}
                            {state.selectedLandmark.rating && (
                              <p style={{ margin: '0 0 4px 0' }}>
                                Rating: {state.selectedLandmark.rating}
                                {state.selectedLandmark.user_ratings_total ? `（${state.selectedLandmark.user_ratings_total} reviews）` : ''}
                              </p>
                            )}
                            {state.selectedLandmark.website && (
                              <a
                                href={state.selectedLandmark.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#007bff', textDecoration: 'underline', display: 'block', marginBottom: 4 }}
                              >
                                Website
                              </a>
                            )}
                            {state.selectedLandmark.imageUrl && (
                              <img
                                src={state.selectedLandmark.imageUrl}
                                alt={state.selectedLandmark.name}
                                style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 6, marginTop: 6 }}
                              />
                            )}
                            {state.selectedLandmark.opening_hours && state.selectedLandmark.opening_hours.open_now && (
                              <div style={{ marginTop: 8 }}>
                                <strong>Opening Hours:</strong>
                                <ul style={{ paddingLeft: 16, margin: 0 }}>
                                  {state.selectedLandmark.opening_hours.weekday_text?.map((line, idx) => (
                                    <li key={idx} style={{ fontSize: 12 }}>{line}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </InfoWindow>
                      )}
                    </GoogleMap>
                  )}
                </div>
              </LoadScript>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 加载状态 */}
      {state.loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <p>Loading...</p>
          </div>
        </div>
      )}

      {/* 页面右上角行程icon和数量 */}
      <div style={{ position: 'fixed', top: 24, right: 32, zIndex: 1000 }}>
        <button
          style={{ background: 'white', border: '1px solid #eee', borderRadius: 24, padding: '8px 16px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer' }}
          onClick={() => setShowItinerary(true)}
          title="View itinerary list"
        >
          <Map size={22} color="#0ea5e9" />
          <span style={{ marginLeft: 8, fontWeight: 600, color: '#0ea5e9' }}>{selectedLandmarks.length}</span>
        </button>
      </div>

      {/* 行程清单弹窗 */}
      {showItinerary && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowItinerary(false)}>
          <div style={{ background: 'white', borderRadius: 12, minWidth: 320, maxWidth: 400, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 4px 24px rgba(0,0,0,0.15)', padding: 24, position: 'relative' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Itinerary List</h3>
            {selectedLandmarks.length === 0 ? (
              <p style={{ color: '#888', textAlign: 'center' }}>No items in itinerary</p>
            ) : (
              <div>
                {Object.entries(
                  selectedLandmarks.reduce((acc, item) => {
                    const country = item.country || 'Unknown';
                    if (!acc[country]) {
                      acc[country] = [];
                    }
                    acc[country].push(item);
                    return acc;
                  }, {} as Record<string, typeof selectedLandmarks>)
                ).map(([country, landmarks]) => (
                  <div key={country} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#666', marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid #eee' }}>
                      {country}
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {landmarks.map(item => (
                        <li key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500 }}>{item.name}</div>
                          </div>
                          <button
                            style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 8 }}
                            title="Delete"
                            onClick={() => handleRemoveFromItinerary(item.id)}
                          >
                            <Trash2 size={18} color="#ef4444" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            <button
              style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}
              onClick={() => setShowItinerary(false)}
              title="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {showChatbot && (
        <Chatbot
          onClose={() => setShowChatbot(false)}
          onRecommendCountries={handleAIRecommendCountries}
        />
      )}
    </div>
  );
};

// 添加样式
const styles = `
  .marker-content {
    position: relative;
  }
  .marker-icon {
    font-size: 24px;
    cursor: pointer;
  }
  .marker-icon.selected {
    color: red;
  }
`;

// 添加样式到文档
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default ActivityPlanner;
