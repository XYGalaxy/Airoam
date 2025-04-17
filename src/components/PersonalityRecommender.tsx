
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import DestinationResults from './DestinationResults';

const personalityQuestions = [
  {
    id: 'pace',
    question: "What's your preferred travel pace?",
    options: [
      { value: 'relaxed', label: 'Relaxed and laid-back' },
      { value: 'balanced', label: 'Balanced mix of activities and downtime' },
      { value: 'busy', label: 'Busy itinerary, see as much as possible' },
    ],
  },
  {
    id: 'environment',
    question: 'Which environment do you prefer?',
    options: [
      { value: 'city', label: 'Urban cities with culture and nightlife' },
      { value: 'coastal', label: 'Coastal areas and beaches' },
      { value: 'nature', label: 'Mountains and natural landscapes' },
      { value: 'countryside', label: 'Rural countryside and small towns' },
    ],
  },
  {
    id: 'accommodation',
    question: 'What type of accommodation do you prefer?',
    options: [
      { value: 'luxury', label: 'Luxury hotels and resorts' },
      { value: 'boutique', label: 'Boutique and unique accommodations' },
      { value: 'budget', label: 'Budget-friendly options' },
      { value: 'local', label: 'Local homestays or Airbnbs' },
    ],
  },
];

const PersonalityRecommender = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

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
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
  };

  if (showResults) {
    return <DestinationResults personalityAnswers={answers} onReset={handleReset} />;
  }

  const question = personalityQuestions[currentQuestion];
  const questionAnswered = answers[question.id] !== undefined;

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
          {currentQuestion === personalityQuestions.length - 1 ? 'See Results' : 'Next'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PersonalityRecommender;
