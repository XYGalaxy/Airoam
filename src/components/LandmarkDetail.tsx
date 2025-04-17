
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Euro, Star, Clock, MapPin, ArrowLeft } from 'lucide-react';

const getRandomImage = (name: string) => {
  // In a real app, we would use actual images
  const images = [
    'https://images.unsplash.com/photo-1592906209472-a36b1f3782ef?q=80&w=1170&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1533606688076-b6683e707369?q=80&w=1170&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534531173927-aeb928d54385?q=80&w=1170&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519677100203-a0e668c92439?q=80&w=1170&auto=format&fit=crop'
  ];
  
  // Use the name as a seed to get a consistent image
  const index = name.length % images.length;
  return images[index];
};

const getPriceLabel = (price: string) => {
  switch (price) {
    case '€':
      return 'Budget';
    case '€€':
      return 'Moderate';
    case '€€€':
      return 'Expensive';
    default:
      return 'Varies';
  }
};

interface LandmarkDetailProps {
  landmark: any;
  onClose: () => void;
}

const LandmarkDetail: React.FC<LandmarkDetailProps> = ({ landmark, onClose }) => {
  return (
    <div className="p-4 animate-fade-in">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4 -ml-2 hover:bg-transparent hover:text-travel-teal"
        onClick={onClose}
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to list
      </Button>
      
      <div className="rounded-lg overflow-hidden">
        <img 
          src={getRandomImage(landmark.name)} 
          alt={landmark.name}
          className="w-full h-40 object-cover"
        />
      </div>
      
      <h2 className="text-xl font-bold mt-4">{landmark.name}</h2>
      
      <div className="flex items-center mt-2">
        <MapPin className="h-4 w-4 text-travel-red" />
        <span className="ml-1 text-sm">{landmark.country}</span>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="flex items-center">
          <Euro className="h-4 w-4 text-travel-green" />
          <div className="ml-2">
            <p className="text-xs text-muted-foreground">Price Range</p>
            <p className="text-sm font-medium">{getPriceLabel(landmark.price)}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <Clock className="h-4 w-4 text-travel-blue" />
          <div className="ml-2">
            <p className="text-xs text-muted-foreground">Time Needed</p>
            <p className="text-sm font-medium">{landmark.daysNeeded} {landmark.daysNeeded === 1 ? 'day' : 'days'}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <Star className="h-4 w-4 text-travel-orange" />
          <div className="ml-2">
            <p className="text-xs text-muted-foreground">Rating</p>
            <p className="text-sm font-medium">{landmark.rating}/5.0</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-travel-purple" />
          <div className="ml-2">
            <p className="text-xs text-muted-foreground">Best Time</p>
            <p className="text-sm font-medium">Apr-Oct</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="text-sm font-medium mb-2">About this landmark</h3>
        <p className="text-sm text-muted-foreground">
          {landmark.name} is a popular destination in {landmark.country} known for its {landmark.type.toLowerCase()} experience. 
          Visitors typically spend {landmark.daysNeeded} {landmark.daysNeeded === 1 ? 'day' : 'days'} exploring this site.
        </p>
      </div>
      
      <div className="chat-window mt-6 border-t pt-4">
        <h3 className="text-sm font-medium mb-2">Chat with AI Travel Assistant</h3>
        <div className="bg-muted rounded-lg p-3 text-sm">
          <p className="font-medium">Travel Assistant</p>
          <p className="mt-1">
            Would you like more information about {landmark.name} or help planning your visit?
          </p>
        </div>
        
        <div className="flex gap-2 mt-3">
          <Button variant="outline" size="sm" className="text-xs">Tell me more</Button>
          <Button variant="outline" size="sm" className="text-xs">Nearby attractions</Button>
          <Button variant="outline" size="sm" className="text-xs">How to get there</Button>
        </div>
      </div>
      
      <div className="mt-6 flex justify-between">
        <Button variant="outline">Add to Itinerary</Button>
        <Button>Show on Map</Button>
      </div>
    </div>
  );
};

export default LandmarkDetail;
