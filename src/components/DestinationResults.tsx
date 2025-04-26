import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ArrowRight, Instagram } from 'lucide-react';
import TravelMap from './TravelMap';
import destinationsData from '../data/destinations.json';
import { Destination } from '../types/Destination';

interface DestinationResultsProps {
  personalityAnswers: Record<string, string>;
  onReset: () => void;
}

// Get recommended destinations based on personality type
const getRecommendedDestinations = (answers: Record<string, string>): Destination[] => {
  // Extract personality traits from answers
  const personalityTraits = {
    planning: answers.planning === 'detailed' ? 'cultural' : 
              answers.planning === 'spontaneous' ? 'adventurous' : 'relaxed',
    exploration: answers.exploration === 'landmarks' ? 'cultural' :
                answers.exploration === 'local' ? 'adventurous' : 'relaxed',
    pace: answers.pace === 'fast' ? 'adventurous' :
          answers.pace === 'slow' ? 'relaxed' : 'cultural',
    food: answers.food === 'local' ? 'adventurous' :
          answers.food === 'familiar' ? 'relaxed' : 'cultural'
  };
  
  // Filter destinations based on personality traits
  const destinations = destinationsData.destinations as unknown as Destination[];
  
  const filteredDestinations = destinations
    .map(dest => {
      // Calculate match percentage based on personality traits
      const matchScores = Object.values(personalityTraits).map(trait => 
        dest.matchScore[trait] || 0
      );
      
      // Calculate weighted average based on how many traits match
      const avgMatch = Math.round(
        matchScores.reduce((sum, score) => sum + score, 0) / matchScores.length
      );
      
      return {
        ...dest,
        match: `${avgMatch}%`
      };
    })
    .sort((a, b) => parseInt(b.match || '0') - parseInt(a.match || '0'))
    .slice(0, 5); // Get top 5 matches
  
  return filteredDestinations;
};

const instagramPosts = [
  {
    id: 1,
    username: "european_wanderer",
    location: "Santorini, Greece",
    imageUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1974&auto=format&fit=crop",
    likes: 2543,
    caption: "Getting lost in the white alleyways of Santorini 🇬🇷 #santorini #greece #travel"
  },
  {
    id: 2,
    username: "nordic_explorer",
    location: "Helsinki, Finland",
    imageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1974&auto=format&fit=crop",
    likes: 1872,
    caption: "Design meets nature in Helsinki 🇫🇮 #helsinki #finland #design"
  },
  {
    id: 3,
    username: "mediterranean_dreams",
    location: "Amalfi Coast, Italy",
    imageUrl: "https://images.unsplash.com/photo-1533599301075-c01f8ea6fcb4?q=80&w=1974&auto=format&fit=crop",
    likes: 3241,
    caption: "Coastal paradise in Amalfi 🇮🇹 #amalficoast #italy #travel"
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
