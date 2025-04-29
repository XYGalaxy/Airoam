import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 定义活动类型和对应的兴趣选项
const activityInterests = {
  'theaters and performing arts': {
    interests: [
      'Classical Performances',
      'Contemporary Shows',
      'Opera',
      'Ballet',
      'Historical Venues',
      'Modern Theaters'
    ],
    countries: [
      {
        name: 'Austria',
        interests: [
          {
            name: 'Classical Performances',
            description: 'Experience world-class classical performances in Vienna and Salzburg',
            coordinates: [16.3738, 48.2082],
            imageUrl: 'https://example.com/vienna-opera.jpg'
          },
          {
            name: 'Historical Venues',
            description: 'Visit historic theaters and opera houses in Austria',
            coordinates: [13.0550, 47.8095],
            imageUrl: 'https://example.com/salzburg-theater.jpg'
          }
        ]
      },
      {
        name: 'Italy',
        interests: [
          {
            name: 'Opera',
            description: 'Experience world-famous opera performances in Milan and Venice',
            coordinates: [9.1900, 45.4642],
            imageUrl: 'https://example.com/la-scala.jpg'
          },
          {
            name: 'Historical Venues',
            description: 'Visit historic theaters and opera houses in Italy',
            coordinates: [12.3155, 45.4408],
            imageUrl: 'https://example.com/la-fenice.jpg'
          }
        ]
      }
    ]
  },
  'wine tasting': {
    interests: [
      'Red Wine',
      'White Wine',
      'Sparkling Wine',
      'Wine Tours',
      'Vineyard Visits',
      'Wine Tasting Events'
    ],
    countries: [
      {
        name: 'France',
        interests: [
          {
            name: 'Red Wine',
            description: 'Explore the famous Bordeaux and Burgundy wine regions',
            coordinates: [-0.5792, 44.8378],
            imageUrl: 'https://example.com/bordeaux.jpg'
          },
          {
            name: 'Wine Tours',
            description: 'Experience guided tours through the Champagne region',
            coordinates: [4.0317, 49.2583],
            imageUrl: 'https://example.com/champagne.jpg'
          }
        ]
      },
      {
        name: 'Italy',
        interests: [
          {
            name: 'Red Wine',
            description: 'Discover the rich wines of Tuscany and Piedmont',
            coordinates: [11.2558, 43.7696],
            imageUrl: 'https://example.com/tuscany.jpg'
          },
          {
            name: 'Wine Tours',
            description: 'Experience the wine culture of Veneto and Sicily',
            coordinates: [12.3155, 45.4408],
            imageUrl: 'https://example.com/veneto.jpg'
          }
        ]
      }
    ]
  },
  'historical architecture': {
    interests: [
      'Ancient Ruins',
      'Medieval Castles',
      'Renaissance Buildings',
      'Baroque Architecture',
      'Gothic Cathedrals',
      'Modern Architecture'
    ],
    countries: [
      {
        name: 'Greece',
        interests: [
          {
            name: 'Ancient Ruins',
            description: 'Explore the ancient ruins of Athens and Delphi',
            coordinates: [23.7275, 37.9838],
            imageUrl: 'https://example.com/acropolis.jpg'
          },
          {
            name: 'Classical Architecture',
            description: 'Discover classical Greek architecture in Athens and Olympia',
            coordinates: [21.8243, 37.6385],
            imageUrl: 'https://example.com/olympia.jpg'
          }
        ]
      },
      {
        name: 'Italy',
        interests: [
          {
            name: 'Renaissance Buildings',
            description: 'Experience Renaissance architecture in Florence and Rome',
            coordinates: [11.2558, 43.7696],
            imageUrl: 'https://example.com/florence.jpg'
          },
          {
            name: 'Ancient Ruins',
            description: 'Explore the ancient ruins of Rome and Pompeii',
            coordinates: [12.4964, 41.9028],
            imageUrl: 'https://example.com/colosseum.jpg'
          }
        ]
      }
    ]
  }
};

router.post('/', async (req, res) => {
  try {
    const { query, type, currentActivity, currentInterests } = req.body;

    if (type === 'activity_identification') {
      // 识别活动类型
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a travel assistant. Your ONLY task is to return a JSON object.
            DO NOT include any text, explanations, or markdown outside the JSON object.
            DO NOT use any formatting or styling.
            DO NOT add any additional information.
            The response must be a valid JSON object with this exact structure:
            {
              "activity": "theaters and performing arts",
              "followUpQuestion": "What type of performances interest you most?",
              "availableInterests": ["Classical Performances", "Contemporary Shows", "Opera", "Ballet", "Historical Venues", "Modern Theaters"]
            }
            Remember: ONLY return the JSON object, nothing else.`
          },
          {
            role: "user",
            content: query
          }
        ],
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      try {
        const response = JSON.parse(completion.choices[0].message.content || '{}');
        if (!response.activity || !response.followUpQuestion || !response.availableInterests) {
          throw new Error('Invalid response format');
        }
        res.json(response);
      } catch (error) {
        console.error('Error parsing AI response:', error);
        res.status(500).json({ error: 'Invalid response format from AI' });
      }
    } 
    else if (type === 'interest_refinement') {
      // 细化兴趣
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a travel assistant. Your ONLY task is to return a JSON object.
            DO NOT include any text, explanations, or markdown outside the JSON object.
            DO NOT use any formatting or styling.
            DO NOT add any additional information.
            The response must be a valid JSON object with this exact structure:
            {
              "interests": ["Classical Performances", "Historical Venues"],
              "countryRecommendations": [
                {
                  "country": "Austria",
                  "interests": [
                    {
                      "name": "Classical Performances",
                      "description": "Experience world-class classical performances in Vienna",
                      "coordinates": [16.3738, 48.2082],
                      "imageUrl": "https://example.com/vienna-opera.jpg"
                    }
                  ]
                }
              ],
              "summary": "Based on your interests, here are some perfect destinations for you!",
              "nextStep": "Click on any interest to see detailed recommendations."
            }
            Remember: ONLY return the JSON object, nothing else.`
          },
          {
            role: "user",
            content: query
          }
        ],
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      try {
        const response = JSON.parse(completion.choices[0].message.content || '{}');
        if (!response.interests || !response.countryRecommendations || !response.summary || !response.nextStep) {
          throw new Error('Invalid response format');
        }
        res.json(response);
      } catch (error) {
        console.error('Error parsing AI response:', error);
        res.status(500).json({ error: 'Invalid response format from AI' });
      }
    }
    else if (type === 'country_recommendation') {
      // 生成结构化的推荐摘要
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a travel assistant. Your ONLY task is to return a JSON object.
            DO NOT include any text, explanations, or markdown outside the JSON object.
            DO NOT use any formatting or styling.
            DO NOT add any additional information.
            The response must be a valid JSON object with this exact structure:
            {
              "summary": "Discover Europe's finest classical performances in historic venues.",
              "details": [
                {
                  "country": "Austria",
                  "highlights": ["Vienna State Opera", "Salzburg Festival"],
                  "bestTime": "July-August",
                  "tips": ["Book standing room tickets", "Visit during festival season"]
                }
              ],
              "nextStep": "Would you like to explore more activities?"
            }
            Remember: ONLY return the JSON object, nothing else.`
          },
          {
            role: "user",
            content: `Based on the user's interests in ${currentInterests.join(', ')}, create a structured recommendation.`
          }
        ],
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      try {
        const response = JSON.parse(completion.choices[0].message.content || '{}');
        if (!response.summary || !response.details || !response.nextStep) {
          throw new Error('Invalid response format');
        }
        res.json(response);
      } catch (error) {
        console.error('Error parsing AI response:', error);
        res.status(500).json({ error: 'Invalid response format from AI' });
      }
    }
  } catch (error) {
    console.error('Error processing AI recommendation:', error);
    res.status(500).json({ error: 'Failed to process recommendation' });
  }
});

export default router; 