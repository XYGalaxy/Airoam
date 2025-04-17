
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Beer, Coffee, Mountain, Mushroom, Wine, Music, Beach, Castle, Camera } from 'lucide-react';
import TravelMap from './TravelMap';
import LandmarkDetail from './LandmarkDetail';

const activities = [
  { id: 'alcohol', name: 'Wine & Beer', icon: <Beer className="h-6 w-6" /> },
  { id: 'coffee', name: 'Coffee Culture', icon: <Coffee className="h-6 w-6" /> },
  { id: 'hiking', name: 'Hiking', icon: <Mountain className="h-6 w-6" /> },
  { id: 'mushrooms', name: 'Mushroom Foraging', icon: <Mushroom className="h-6 w-6" /> },
  { id: 'music', name: 'Live Music', icon: <Music className="h-6 w-6" /> },
  { id: 'beaches', name: 'Beaches', icon: <Beach className="h-6 w-6" /> },
  { id: 'castles', name: 'Castles & History', icon: <Castle className="h-6 w-6" /> },
  { id: 'photography', name: 'Photography', icon: <Camera className="h-6 w-6" /> },
];

// Mock data for landmarks based on activities
const landmarksByActivity: Record<string, any[]> = {
  alcohol: [
    { id: 1, name: 'Champagne Region', country: 'France', location: [4.023, 49.044], type: 'Wine Region', price: '€€', daysNeeded: 2, rating: 4.8 },
    { id: 2, name: 'Pilsner Urquell Brewery', country: 'Czech Republic', location: [13.383, 49.748], type: 'Brewery', price: '€', daysNeeded: 1, rating: 4.6 },
    { id: 3, name: 'Port Wine Cellars', country: 'Portugal', location: [-8.614, 41.138], type: 'Wine Cellar', price: '€', daysNeeded: 1, rating: 4.7 },
  ],
  coffee: [
    { id: 4, name: 'Café Central', country: 'Austria', location: [16.366, 48.210], type: 'Historic Café', price: '€€', daysNeeded: 0.5, rating: 4.5 },
    { id: 5, name: 'Café A Brasileira', country: 'Portugal', location: [-9.142, 38.714], type: 'Historic Café', price: '€', daysNeeded: 0.5, rating: 4.3 },
  ],
  hiking: [
    { id: 6, name: 'Cinque Terre', country: 'Italy', location: [9.724, 44.128], type: 'Coastal Trail', price: '€€', daysNeeded: 3, rating: 4.9 },
    { id: 7, name: 'Tour du Mont Blanc', country: 'France/Italy/Switzerland', location: [6.864, 45.917], type: 'Mountain Trail', price: '€€€', daysNeeded: 7, rating: 4.9 },
  ],
  mushrooms: [
    { id: 8, name: 'Black Forest', country: 'Germany', location: [8.214, 48.268], type: 'Forest', price: '€', daysNeeded: 2, rating: 4.4 },
    { id: 9, name: 'Białowieża Forest', country: 'Poland', location: [23.837, 52.757], type: 'Ancient Forest', price: '€', daysNeeded: 2, rating: 4.6 },
  ],
  music: [
    { id: 10, name: 'La Scala', country: 'Italy', location: [9.189, 45.467], type: 'Opera House', price: '€€€', daysNeeded: 1, rating: 4.8 },
    { id: 11, name: 'Roskilde Festival', country: 'Denmark', location: [12.080, 55.620], type: 'Music Festival', price: '€€€', daysNeeded: 4, rating: 4.7 },
  ],
  beaches: [
    { id: 12, name: 'Navagio Beach', country: 'Greece', location: [20.624, 37.859], type: 'Beach', price: '€€', daysNeeded: 1, rating: 4.9 },
    { id: 13, name: 'Playa de Ses Illetes', country: 'Spain', location: [1.427, 38.731], type: 'Beach', price: '€€', daysNeeded: 1, rating: 4.8 },
  ],
  castles: [
    { id: 14, name: 'Neuschwanstein Castle', country: 'Germany', location: [10.750, 47.557], type: 'Castle', price: '€€', daysNeeded: 1, rating: 4.9 },
    { id: 15, name: 'Edinburgh Castle', country: 'Scotland', location: [-3.200, 55.949], type: 'Castle', price: '€€', daysNeeded: 1, rating: 4.7 },
  ],
  photography: [
    { id: 16, name: 'Santorini', country: 'Greece', location: [25.396, 36.416], type: 'Island', price: '€€€', daysNeeded: 3, rating: 4.9 },
    { id: 17, name: 'Plitvice Lakes', country: 'Croatia', location: [15.582, 44.865], type: 'National Park', price: '€€', daysNeeded: 1, rating: 4.8 },
  ],
};

const ActivityPlanner = () => {
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedLandmark, setSelectedLandmark] = useState<any | null>(null);
  
  const toggleActivity = (activityId: string) => {
    if (selectedActivities.includes(activityId)) {
      setSelectedActivities(selectedActivities.filter(id => id !== activityId));
    } else {
      setSelectedActivities([...selectedActivities, activityId]);
    }
    
    // Reset selected landmark when changing activities
    setSelectedLandmark(null);
  };
  
  // Get all landmarks for selected activities
  const landmarks = selectedActivities.flatMap(activityId => landmarksByActivity[activityId] || []);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Choose Your Activities</CardTitle>
          <CardDescription>
            Select the activities you're interested in and we'll show matching landmarks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3">
            {activities.map((activity) => (
              <Button
                key={activity.id}
                variant={selectedActivities.includes(activity.id) ? "default" : "outline"}
                className={`flex-col h-24 ${selectedActivities.includes(activity.id) ? 'bg-travel-teal hover:bg-travel-teal/90' : ''}`}
                onClick={() => toggleActivity(activity.id)}
              >
                {activity.icon}
                <span className="mt-2 text-xs">{activity.name}</span>
              </Button>
            ))}
          </div>
          
          {selectedActivities.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Selected Activities:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedActivities.map((id) => {
                  const activity = activities.find(a => a.id === id);
                  return (
                    <span key={id} className="bg-travel-teal/20 text-travel-teal px-3 py-1 rounded-full text-xs flex items-center gap-1">
                      {activity?.name}
                      <button 
                        onClick={() => toggleActivity(id)}
                        className="text-travel-teal hover:text-travel-teal/80"
                      >
                        ✕
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-2">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
            <div className={`${selectedLandmark ? 'hidden md:block' : 'col-span-full'} md:col-span-2`}>
              <TravelMap 
                landmarks={landmarks}
                onSelectLandmark={setSelectedLandmark}
                selectedLandmark={selectedLandmark}
              />
            </div>
            
            {landmarks.length > 0 ? (
              <div className={`${selectedLandmark ? 'block' : 'hidden md:block'} border-t md:border-t-0 md:border-l border-border h-full`}>
                <div className="p-4 border-b">
                  <h3 className="font-medium">
                    {selectedLandmark ? 'Landmark Details' : 'Landmarks'}
                  </h3>
                </div>
                
                <ScrollArea className="h-[calc(100%-53px)]">
                  {selectedLandmark ? (
                    <LandmarkDetail 
                      landmark={selectedLandmark} 
                      onClose={() => setSelectedLandmark(null)}
                    />
                  ) : (
                    <div className="p-4 space-y-3">
                      {landmarks.map((landmark) => (
                        <div 
                          key={landmark.id}
                          className="p-3 hover:bg-muted rounded-md cursor-pointer"
                          onClick={() => setSelectedLandmark(landmark)}
                        >
                          <h4 className="font-medium">{landmark.name}</h4>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <span>{landmark.country}</span>
                            <span className="mx-2">•</span>
                            <span>{landmark.type}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span>{landmark.price}</span>
                            <span>{landmark.daysNeeded} {landmark.daysNeeded === 1 ? 'day' : 'days'}</span>
                            <div className="flex items-center">
                              <span>★</span>
                              <span className="ml-1">{landmark.rating}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            ) : selectedActivities.length > 0 ? (
              <div className="col-span-full flex items-center justify-center">
                <p className="text-muted-foreground">Loading landmarks for your selected activities...</p>
              </div>
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center p-6 text-center">
                <Mountain className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Choose activities to get started</h3>
                <p className="text-muted-foreground mt-2">
                  Select activities you're interested in to see landmarks across Europe
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityPlanner;
