import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Compass, MapPin, Heart } from 'lucide-react';

interface PersonalityRecommenderProps {
  onComplete: (answers: Record<string, string>) => void;
}

const personalityQuestions = [
  {
    id: 'planning',
    question: "When planning a trip, I prefer to",
    options: [
      { value: 'detailed', label: 'Have a detailed itinerary planned out' },
      { value: 'spontaneous', label: 'Go with the flow and be spontaneous' },
      { value: 'mixed', label: 'Mix of both - some planning but leave room for flexibility' },
    ],
  },
  {
    id: 'exploration',
    question: "In a new city, I like to",
    options: [
      { value: 'landmarks', label: 'Visit famous landmarks and tourist attractions' },
      { value: 'local', label: 'Explore local neighborhoods and hidden gems' },
      { value: 'both', label: 'Do a bit of both' },
    ],
  },
  {
    id: 'accommodation',
    question: "My ideal accommodation is",
    options: [
      { value: 'luxury', label: 'Luxury hotel with all amenities' },
      { value: 'local', label: 'Cozy local guesthouse or Airbnb' },
      { value: 'midrange', label: 'Something in between' },
    ],
  },
  {
    id: 'food',
    question: "When it comes to food",
    options: [
      { value: 'local', label: 'I want to try local cuisine and street food' },
      { value: 'familiar', label: 'I prefer familiar food options' },
      { value: 'both', label: 'I enjoy both local and familiar options' },
    ],
  },
  {
    id: 'pace',
    question: "My travel pace is usually",
    options: [
      { value: 'fast', label: 'Fast-paced, trying to see as much as possible' },
      { value: 'slow', label: 'Slow and relaxed, taking time to enjoy each place' },
      { value: 'moderate', label: 'Moderate pace with some downtime' },
    ],
  },
];

const getTravelPersonality = (answers: Record<string, string>) => {
  // Analyze answers to determine personality type
  const planningStyle = answers.planning;
  const explorationStyle = answers.exploration;
  const pace = answers.pace;
  
  if (planningStyle === 'detailed' && pace === 'fast') {
    return {
      type: 'The Adventurous Planner',
      description: 'You love to explore new places with a well-thought-out plan. Your energy and enthusiasm for travel are contagious!',
      image: 'adventurer.png', // You'll need to add these images
      traits: ['Organized', 'Energetic', 'Curious'],
      color: 'bg-travel-orange'
    };
  } else if (planningStyle === 'spontaneous' && pace === 'slow') {
    return {
      type: 'The Serene Wanderer',
      description: 'You prefer to take things slow and let the journey unfold naturally. Your calm approach helps you discover hidden gems.',
      image: 'wanderer.png',
      traits: ['Relaxed', 'Observant', 'Flexible'],
      color: 'bg-travel-teal'
    };
  } else {
    return {
      type: 'The Balanced Explorer',
      description: 'You strike the perfect balance between planning and spontaneity. Your adaptable nature makes you a great travel companion!',
      image: 'explorer.png',
      traits: ['Adaptable', 'Open-minded', 'Balanced'],
      color: 'bg-travel-green'
    };
  }
};

const PersonalityRecommender: React.FC<PersonalityRecommenderProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [personality, setPersonality] = useState<any>(null);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers({
      ...answers,
      [questionId]: value,
    });
  };

  const handleNext = () => {
    if (currentQuestion < personalityQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const personalityAnalysis = getTravelPersonality(answers);
      setPersonality(personalityAnalysis);
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleOptionSelect = (option: string) => {
    onComplete({ ...answers, selectedOption: option });
  };

  const question = personalityQuestions[currentQuestion];
  const questionAnswered = answers[question.id] !== undefined;

  if (showResults && personality) {
    return (
      <Card className="w-full max-w-2xl mx-auto animate-fade-in">
        <CardHeader>
          <CardTitle className="text-2xl">Your Travel Personality</CardTitle>
          <CardDescription>
            Based on your answers, we've discovered your unique travel style!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6">
            <div className={`w-32 h-32 rounded-full ${personality.color} flex items-center justify-center`}>
              <img 
                src={`/images/${personality.image}`} 
                alt={personality.type}
                className="w-24 h-24 object-contain"
              />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold">{personality.type}</h3>
              <p className="text-muted-foreground mt-2">{personality.description}</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {personality.traits.map((trait: string, index: number) => (
                  <span key={index} className="bg-muted px-3 py-1 rounded-full text-sm">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            className="w-full" 
            onClick={() => handleOptionSelect('personality')}
          >
            <MapPin className="mr-2 h-4 w-4" />
            Discover Your Perfect Cities
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => handleOptionSelect('interests')}
          >
            <Heart className="mr-2 h-4 w-4" />
            Explore by Your Interests
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl">Find Your Perfect Destination</CardTitle>
        <CardDescription>
          Answer a few questions about your travel preferences to get personalized recommendations.
        </CardDescription>
        <div className="w-full bg-muted rounded-full h-2 mt-4">
          <div 
            className="bg-travel-teal h-2 rounded-full transition-all" 
            style={{ width: `${((currentQuestion + 1) / personalityQuestions.length) * 100}%` }}
          ></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{question.question}</h3>
          <RadioGroup 
            onValueChange={(value) => handleAnswer(question.id, value)}
            value={answers[question.id]}
          >
            <div className="space-y-3">
              {question.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="cursor-pointer">{option.label}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleBack}
          disabled={currentQuestion === 0}
        >
          Back
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!questionAnswered}
        >
          {currentQuestion === personalityQuestions.length - 1 ? 'See Your Travel Personality' : 'Next'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PersonalityRecommender;
