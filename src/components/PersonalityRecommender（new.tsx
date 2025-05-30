import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Compass, MapPin, Heart } from 'lucide-react';

interface PersonalityRecommenderProps {
  onComplete: (answers: Record<string, string>) => void;
}

interface Answer {
  question: string;
  answer: string;
  dimension: 'budget' | 'experience' | 'logistics' | 'social' | 'emotional';
}

interface PersonalityType {
  type: string;
  code: string;
  primaryTraits: string[];
  characterProfile: {
    travelStyle: string;
    keyMotivations: string[];
    challengeAreas: string[];
  };
  dimensionPreferences: {
    budget: string;
    experience: string;
    logistics: string;
    social: string;
    emotional: string;
  };
  reportStyle: {
    tone: string;
    focus: string;
    detailLevel: string;
    languageStyle: string;
    emphasis: string[];
    recommendations: string;
  };
}

const personalityQuestions = [
  {
    id: 'budgetPhilosophy',
    dimension: 'budget',
    question: "Your travel funds are like a river. How do you navigate its flow?",
    options: [
      { 
        value: 'frugal', 
        label: "Carefully channeling each drop, maximizing every resource",
        icon: <Compass className="h-5 w-5" />,
        traits: ['Cost-conscious', 'Strategic', 'Resourceful']
      },
      { 
        value: 'balanced', 
        label: "Flowing smoothly, balancing experiences with mindful spending",
        icon: <MapPin className="h-5 w-5" />,
        traits: ['Pragmatic', 'Flexible', 'Wise']
      },
      { 
        value: 'luxurious', 
        label: "Embracing the river's full potential, enjoying its richness",
        icon: <Heart className="h-5 w-5" />,
        traits: ['Indulgent', 'Experience-driven', 'Comfortable']
      }
    ]
  },
  {
    id: 'experienceIntensity',
    dimension: 'experience',
    question: "If your journey were a musical composition, what would it sound like?",
    options: [
      { 
        value: 'comfort', 
        label: "A gentle, predictable melody with occasional soft crescendos",
        icon: <Heart className="h-5 w-5" />,
        traits: ['Relaxed', 'Measured', 'Contemplative']
      },
      { 
        value: 'active', 
        label: "A dynamic, energetic symphony with bold, unexpected rhythms",
        icon: <Compass className="h-5 w-5" />,
        traits: ['Adventurous', 'Energetic', 'Spontaneous']
      },
      { 
        value: 'immersive', 
        label: "A complex, layered composition that tells a deep cultural story",
        icon: <MapPin className="h-5 w-5" />,
        traits: ['Intellectual', 'Curious', 'Profound']
      }
    ]
  },
  {
    id: 'logisticalStyle',
    dimension: 'logistics',
    question: "Your travel is a journey through a landscape. What's your preferred path?",
    options: [
      { 
        value: 'spontaneous', 
        label: "An unmarked trail, discovering beauty in the unexpected",
        icon: <Compass className="h-5 w-5" />,
        traits: ['Flexible', 'Adventurous', 'Free-spirited']
      },
      { 
        value: 'structured', 
        label: "A well-mapped route with clear milestones and objectives",
        icon: <MapPin className="h-5 w-5" />,
        traits: ['Organized', 'Efficient', 'Methodical']
      },
      { 
        value: 'adaptive', 
        label: "A path that adapts, with room for both planning and spontaneity",
        icon: <Heart className="h-5 w-5" />,
        traits: ['Balanced', 'Intuitive', 'Resilient']
      }
    ]
  },
  {
    id: 'socialInteraction',
    dimension: 'social',
    question: "In the grand theater of travel, what's your preferred role?",
    options: [
      { 
        value: 'solo', 
        label: "A solitary performer, finding depth in personal reflection",
        icon: <Compass className="h-5 w-5" />,
        traits: ['Independent', 'Introspective', 'Self-sufficient']
      },
      { 
        value: 'group', 
        label: "Part of an ensemble, thriving on shared experiences",
        icon: <Heart className="h-5 w-5" />,
        traits: ['Social', 'Collaborative', 'Energetic']
      },
      { 
        value: 'selective', 
        label: "A discerning actor, choosing meaningful connections",
        icon: <MapPin className="h-5 w-5" />,
        traits: ['Thoughtful', 'Selective', 'Quality-oriented']
      }
    ]
  },
  {
    id: 'emotionalMotivation',
    dimension: 'emotional',
    question: "Your travel is a story. What chapter are you seeking to write?",
    options: [
      { 
        value: 'escape', 
        label: "A chapter of personal transformation and reset",
        icon: <Heart className="h-5 w-5" />,
        traits: ['Introspective', 'Healing', 'Renewal-seeking']
      },
      { 
        value: 'growth', 
        label: "An epic of personal challenge and self-discovery",
        icon: <Compass className="h-5 w-5" />,
        traits: ['Ambitious', 'Learning-oriented', 'Courageous']
      },
      { 
        value: 'cultural', 
        label: "A narrative of deep cultural understanding",
        icon: <MapPin className="h-5 w-5" />,
        traits: ['Empathetic', 'Curious', 'Global-minded']
      }
    ]
  }
];

export const TravelPersonalityTypes = [
  {
    type: 'Mindful Wanderer',
    code: 'MW',
    primaryTraits: ['Balanced', 'Introspective', 'Cultural'],
    characterProfile: {
      travelStyle: 'Deliberate and Thoughtful',
      keyMotivations: [
        'Deep cultural understanding',
        'Personal growth',
        'Meaningful experiences'
      ],
      challengeAreas: [
        'May overthink travel decisions',
        'Can be hesitant with spontaneity'
      ]
    },
    dimensionPreferences: {
      budget: 'balanced',
      experience: 'immersive',
      logistics: 'adaptive',
      social: 'selective',
      emotional: 'cultural'
    },
    reportStyle: {
      tone: 'Reflective and thoughtful',
      focus: 'Cultural insights and personal growth',
      detailLevel: 'Comprehensive',
      languageStyle: 'Elaborate and descriptive',
      emphasis: ['Historical context', 'Local customs', 'Personal reflections'],
      recommendations: 'Balanced mix of popular and off-the-beaten-path experiences'
    }
  },
  {
    type: 'Adventure Seeker',
    code: 'AS',
    primaryTraits: ['Energetic', 'Spontaneous', 'Bold'],
    characterProfile: {
      travelStyle: 'High-Intensity Exploration',
      keyMotivations: [
        'Personal challenge',
        'Adrenaline rush',
        'Constant discovery'
      ],
      challengeAreas: [
        'May overlook cultural nuances',
        'Potential burnout from constant activity'
      ]
    },
    dimensionPreferences: {
      budget: 'frugal',
      experience: 'active',
      logistics: 'spontaneous',
      social: 'group',
      emotional: 'growth'
    },
    reportStyle: {
      tone: 'Energetic and enthusiastic',
      focus: 'Action and adventure',
      detailLevel: 'Highlights-focused',
      languageStyle: 'Dynamic and vivid',
      emphasis: ['Thrilling experiences', 'Physical challenges', 'Spontaneous discoveries'],
      recommendations: 'Adventure activities and unique experiences'
    }
  },
  {
    type: 'Luxury Connoisseur',
    code: 'LC',
    primaryTraits: ['Refined', 'Comfortable', 'Quality-Focused'],
    characterProfile: {
      travelStyle: 'Curated Experiences',
      keyMotivations: [
        'Premium experiences',
        'Comfort',
        'Exclusive discoveries'
      ],
      challengeAreas: [
        'High travel costs',
        'Limited authentic interactions'
      ]
    },
    dimensionPreferences: {
      budget: 'luxurious',
      experience: 'comfort',
      logistics: 'structured',
      social: 'selective',
      emotional: 'escape'
    },
    reportStyle: {
      tone: 'Sophisticated and refined',
      focus: 'Quality and exclusivity',
      detailLevel: 'Detailed',
      languageStyle: 'Elegant and polished',
      emphasis: ['Premium accommodations', 'Fine dining', 'Exclusive experiences'],
      recommendations: 'High-end options and luxury experiences'
    }
  },
  {
    type: 'Cultural Immersionist',
    code: 'CI',
    primaryTraits: ['Empathetic', 'Curious', 'Deep-Learner'],
    characterProfile: {
      travelStyle: 'Profound Cultural Engagement',
      keyMotivations: [
        'Language learning',
        'Local community interaction',
        'Authentic experiences'
      ],
      challengeAreas: [
        'Potential culture shock',
        'Slower travel pace'
      ]
    },
    dimensionPreferences: {
      budget: 'balanced',
      experience: 'immersive',
      logistics: 'adaptive',
      social: 'group',
      emotional: 'cultural'
    },
    reportStyle: {
      tone: 'Intellectual and insightful',
      focus: 'Cultural understanding and local perspectives',
      detailLevel: 'In-depth',
      languageStyle: 'Analytical and informative',
      emphasis: ['Local traditions', 'Language insights', 'Community interactions'],
      recommendations: 'Authentic local experiences and cultural activities'
    }
  },
  {
    type: 'Solo Explorer',
    code: 'SE',
    primaryTraits: ['Independent', 'Introspective', 'Self-Sufficient'],
    characterProfile: {
      travelStyle: 'Personal Journey',
      keyMotivations: [
        'Self-discovery',
        'Personal freedom',
        'Independent navigation'
      ],
      challengeAreas: [
        'Potential loneliness',
        'Safety considerations'
      ]
    },
    dimensionPreferences: {
      budget: 'frugal',
      experience: 'active',
      logistics: 'spontaneous',
      social: 'solo',
      emotional: 'growth'
    },
    reportStyle: {
      tone: 'Personal and introspective',
      focus: 'Self-discovery and independence',
      detailLevel: 'Balanced',
      languageStyle: 'Authentic and personal',
      emphasis: ['Solo-friendly activities', 'Personal growth opportunities', 'Safe exploration'],
      recommendations: 'Solo-friendly destinations and activities with opportunities for reflection'
    }
  }
];

// Personality Matching Algorithm
const determineTravelPersonality = (answers: Answer[]): { primaryPersonality: PersonalityType; allMatches: Array<{ type: PersonalityType; score: number }> } => {
  // Convert answers array to object format for easier matching
  const answersObj = answers.reduce((acc, curr) => ({
    ...acc,
    [curr.dimension]: curr.answer.toLowerCase()
  }), {} as Record<string, string>);

  // Define dimension weights
  const dimensionWeights = {
    budget: 1.5,
    experience: 2.0,
    logistics: 1.5,
    social: 1.8,
    emotional: 2.0
  };

  // Complex matching logic with weighted scoring
  const calculatePersonalityMatch = (personalityType: PersonalityType, answers: Record<string, string>) => {
    let matchScore = 0;
    const dimensions = [
      'budget', 'experience', 'logistics', 
      'social', 'emotional'
    ] as const;

    dimensions.forEach(dimension => {
      const expectedValue = personalityType.dimensionPreferences[dimension].toLowerCase();
      const userValue = answers[dimension];
      const weight = dimensionWeights[dimension];
      
      // Enhanced scoring logic
      if (expectedValue === userValue) {
        matchScore += 2 * weight; // Exact match
      } else {
        // Check for semantic similarity
        const similarityScore = calculateSemanticSimilarity(expectedValue, userValue);
        matchScore += similarityScore * weight;
      }
    });

    return {
      type: personalityType,
      score: matchScore
    };
  };

  // Helper function to calculate semantic similarity between two values
  const calculateSemanticSimilarity = (value1: string, value2: string): number => {
    // Define semantic groups
    const semanticGroups = {
      budget: {
        luxurious: ['luxury', 'premium', 'high-end'],
        balanced: ['moderate', 'mixed', 'flexible'],
        frugal: ['budget', 'economical', 'cost-effective']
      },
      experience: {
        immersive: ['cultural', 'deep', 'authentic'],
        active: ['adventure', 'thrilling', 'dynamic'],
        comfort: ['relaxed', 'leisurely', 'easy-going']
      },
      logistics: {
        structured: ['planned', 'organized', 'methodical'],
        adaptive: ['flexible', 'balanced', 'mixed'],
        spontaneous: ['unplanned', 'free', 'impulsive']
      },
      social: {
        group: ['social', 'communal', 'shared'],
        selective: ['balanced', 'mixed', 'moderate'],
        solo: ['independent', 'alone', 'personal']
      },
      emotional: {
        cultural: ['learning', 'understanding', 'discovery'],
        growth: ['challenge', 'development', 'achievement'],
        escape: ['relaxation', 'rejuvenation', 'renewal']
      }
    };

    // Find the dimension for these values
    const dimension = Object.keys(semanticGroups).find(dim => 
      Object.values(semanticGroups[dim as keyof typeof semanticGroups]).some(group => 
        group.includes(value1.toLowerCase()) || group.includes(value2.toLowerCase())
      )
    );

    if (!dimension) return 0;

    // Check if values belong to the same semantic group
    const groups = semanticGroups[dimension as keyof typeof semanticGroups];
    const value1Group = Object.entries(groups).find(([_, group]) => 
      group.includes(value1.toLowerCase())
    )?.[0];
    const value2Group = Object.entries(groups).find(([_, group]) => 
      group.includes(value2.toLowerCase())
    )?.[0];

    if (value1Group === value2Group) return 1.5; // Same semantic group
    return 0.5; // Different semantic groups but related
  };

  // Calculate matches for all personality types
  const matches = TravelPersonalityTypes.map(type => 
    calculatePersonalityMatch(type, answersObj)
  );

  // Sort matches by score (descending)
  const sortedMatches = matches.sort((a, b) => b.score - a.score);

  return {
    primaryPersonality: sortedMatches[0].type,
    allMatches: sortedMatches
  };
};

// Example Usage
const sampleAnswers: Answer[] = [
  { question: 'budgetPhilosophy', answer: 'Balanced', dimension: 'budget' },
  { question: 'experienceIntensity', answer: 'Immersive', dimension: 'experience' },
  { question: 'logisticalStyle', answer: 'Adaptive', dimension: 'logistics' },
  { question: 'socialInteraction', answer: 'Selective', dimension: 'social' },
  { question: 'emotionalMotivation', answer: 'Cultural', dimension: 'emotional' }
];

const result = determineTravelPersonality(sampleAnswers);
console.log(result);


const PersonalityRecommender: React.FC<PersonalityRecommenderProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [personality, setPersonality] = useState<PersonalityType | null>(null);

  const handleAnswer = (questionId: string, value: string) => {
    const question = personalityQuestions.find(q => q.id === questionId);
    if (!question) return;
    
    setAnswers(prevAnswers => {
      // Remove any existing answer for this question
      const filteredAnswers = prevAnswers.filter(a => a.question !== questionId);
      // Add the new answer
      return [...filteredAnswers, {
        question: questionId,
        answer: value,
        dimension: question.dimension as 'budget' | 'experience' | 'logistics' | 'social' | 'emotional'
      }];
    });
  };

  const handleNext = () => {
    if (currentQuestion < personalityQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const result = determineTravelPersonality(answers);
      setPersonality(result.primaryPersonality);
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleContinue = () => {
    // Convert answers to the format expected by onComplete
    const formattedAnswers = answers.reduce((acc, curr) => {
      const question = personalityQuestions.find(q => q.id === curr.question);
      if (question) {
        acc[question.dimension] = curr.answer;
      }
      return acc;
    }, {} as Record<string, string>);
    
    onComplete(formattedAnswers);
  };

  const question = personalityQuestions[currentQuestion];
  const questionAnswered = answers.some(a => a.question === question.id);

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
            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
              <img 
                src={`/images/personalities/${personality.code.toLowerCase()}.png`} 
                alt={personality.type}
                className="w-24 h-24 object-contain"
              />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold">{personality.type}</h3>
              <p className="text-muted-foreground mt-2">{personality.characterProfile.travelStyle}</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {personality.primaryTraits.map((trait, index) => (
                  <span key={index} className="bg-muted px-3 py-1 rounded-full text-sm">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
            <div className="w-full space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Key Motivations</h4>
                <ul className="list-disc list-inside space-y-1">
                  {personality.characterProfile.keyMotivations.map((motivation, index) => (
                    <li key={index} className="text-muted-foreground">{motivation}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Travel Style</h4>
                <p className="text-muted-foreground">{personality.reportStyle.focus}</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            className="w-full max-w-xs" 
            onClick={handleContinue}
          >
            Continue to Activities
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl">Question {currentQuestion + 1} of {personalityQuestions.length}</CardTitle>
        <CardDescription>
          {question.question}
        </CardDescription>
      </CardHeader>
      <CardContent>
          <RadioGroup 
          value={answers.find(a => a.question === question.id)?.answer}
            onValueChange={(value) => handleAnswer(question.id, value)}
          className="space-y-4"
          >
              {question.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value}>{option.label}</Label>
            </div>
          ))}
          </RadioGroup>
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
          {currentQuestion === personalityQuestions.length - 1 ? 'Complete' : 'Next'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PersonalityRecommender;
