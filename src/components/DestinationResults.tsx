
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Instagram } from 'lucide-react';
import TravelMap from './TravelMap';

interface DestinationResultsProps {
  personalityAnswers: Record<string, string>;
  onReset: () => void;
}

// Mock data based on personality types
const getRecommendedDestinations = (answers: Record<string, string>) => {
  // This would be more sophisticated in a real app
  const destinations = [
    {
      id: 1,
      name: 'Barcelona, Spain',
      description: 'A vibrant city with stunning architecture, beaches, and a lively atmosphere.',
      imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=1170&auto=format&fit=crop',
      match: '94%',
      highlights: ['Sagrada Familia', 'Park Güell', 'Las Ramblas', 'Beach life']
    },
    {
      id: 2,
      name: 'Amalfi Coast, Italy',
      description: 'Breathtaking coastal views, charming villages, and excellent cuisine.',
      imageUrl: 'https://images.unsplash.com/photo-1533599301075-c01f8ea6fcb4?q=80&w=1170&auto=format&fit=crop',
      match: '89%',
      highlights: ['Positano', 'Ravello', 'Coastal hikes', 'Beaches']
    },
    {
      id: 3,
      name: 'Scottish Highlands',
      description: 'Rugged mountains, serene lochs, and fascinating history and culture.',
      imageUrl: 'https://images.unsplash.com/photo-1610296647932-96cd59c540b2?q=80&w=1170&auto=format&fit=crop',
      match: '85%',
      highlights: ['Isle of Skye', 'Loch Ness', 'Hiking trails', 'Castles']
    }
  ];
  
  return destinations;
};

const instagramPosts = [
  {
    id: 1,
    username: "travel_junkie",
    location: "Santorini, Greece",
    imageUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1974&auto=format&fit=crop",
    likes: 2543,
    caption: "Getting lost in the white alleyways of Santorini 🇬🇷 #santorini #greece #travel"
  },
  {
    id: 2,
    username: "wanderlust_diaries",
    location: "Lake Como, Italy",
    imageUrl: "https://images.unsplash.com/photo-1574428095061-b4f9e80881a5?q=80&w=1974&auto=format&fit=crop",
    likes: 1872,
    caption: "Villa vibes on Lake Como 🏡 #lakecomo #italy #villalife"
  },
  {
    id: 3,
    username: "explore_with_emma",
    location: "Porto, Portugal",
    imageUrl: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=2070&auto=format&fit=crop",
    likes: 3241,
    caption: "Colorful streets of Porto - every corner is a new discovery 🇵🇹 #porto #portugal"
  }
];

const DestinationResults: React.FC<DestinationResultsProps> = ({ personalityAnswers, onReset }) => {
  const recommendedDestinations = getRecommendedDestinations(personalityAnswers);

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold text-center">Your Perfect European Destinations</h2>
      <p className="text-center text-muted-foreground">Based on your personality and preferences</p>
      
      <Tabs defaultValue="destinations" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="destinations">Destinations</TabsTrigger>
          <TabsTrigger value="inspiration">Instagram Inspiration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="destinations" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              {recommendedDestinations.map((destination) => (
                <Card key={destination.id} className="overflow-hidden">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={destination.imageUrl} 
                      alt={destination.name}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{destination.name}</CardTitle>
                      <span className="text-travel-green font-semibold">{destination.match} match</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{destination.description}</p>
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Highlights:</h4>
                      <div className="flex flex-wrap gap-2">
                        {destination.highlights.map((highlight, index) => (
                          <span key={index} className="bg-muted px-3 py-1 rounded-full text-sm">
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Explore <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            <div className="h-[600px]">
              <TravelMap destinations={recommendedDestinations.map(d => d.name)} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="inspiration" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {instagramPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden">
                <div className="h-64 overflow-hidden">
                  <img 
                    src={post.imageUrl} 
                    alt={post.location}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardHeader className="p-4">
                  <div className="flex items-center gap-2">
                    <Instagram className="h-4 w-4 text-pink-500" />
                    <span className="font-medium text-sm">{post.username}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{post.location}</p>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm">{post.caption}</p>
                  <p className="text-xs font-medium mt-2">{post.likes.toLocaleString()} likes</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-center mt-8">
        <Button onClick={onReset} variant="outline">Start Over</Button>
      </div>
    </div>
  );
};

export default DestinationResults;
