import express from 'express';
import cors from 'cors';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// Log environment variables
console.log('Environment variables:', {
  PORT: process.env.PORT,
  GOOGLE_PLACES_API_KEY: process.env.VITE_GOOGLE_PLACES_API_KEY || 'Not set'
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

const GOOGLE_PLACES_API_KEY = process.env.VITE_GOOGLE_PLACES_API_KEY;

if (!GOOGLE_PLACES_API_KEY) {
  console.error('Google Places API key is not configured');
  process.exit(1);
}

// Google Places API proxy endpoint
app.get('/api/places/search', async (req, res) => {
  try {
    const { location, type, radius, maxResults = 5 } = req.query;
    
    console.log('Environment variables:', {
      GOOGLE_PLACES_API_KEY: process.env.VITE_GOOGLE_PLACES_API_KEY || 'Not set'
    });
    
    console.log('Received search request with params:', { location, type, radius, maxResults });
    
    if (!GOOGLE_PLACES_API_KEY) {
      console.error('Google Places API key not configured');
      return res.status(500).json({ error: 'Google Places API key not configured' });
    }

    if (!location) {
      console.error('Location parameter is required');
      return res.status(400).json({ error: 'Location parameter is required' });
    }

    // 根据活动类型设置搜索参数
    let searchType = 'point_of_interest';
    let searchKeyword = '';

    switch (type) {
      case 'hiking':
        searchType = 'natural_feature';
        searchKeyword = 'hiking trail mountain';
        break;
      case 'museum':
        searchType = 'museum';
        break;
      case 'wine':
        searchType = 'restaurant';
        searchKeyword = 'wine bar winery';
        break;
      case 'coffee':
        searchType = 'cafe';
        searchKeyword = 'coffee';
        break;
      case 'mushroom':
        searchType = 'natural_feature';
        searchKeyword = 'forest park';
        break;
    }

    const searchParams = {
      key: GOOGLE_PLACES_API_KEY,
      location,
      type: searchType,
      keyword: searchKeyword
    };

    // 只有当 radius 存在且有效时才添加
    if (radius && !isNaN(radius) && radius > 0) {
      searchParams.radius = Math.min(parseInt(radius), 50000);
    } else {
      searchParams.rankby = 'prominence';
    }

    console.log('Searching Google Places API with params:', searchParams);

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: searchParams
    });

    console.log('Google Places API response:', response.data);

    if (response.data.status === 'ZERO_RESULTS') {
      console.log('No results found for the given parameters');
      return res.json({ results: [] });
    }

    if (response.data.status === 'REQUEST_DENIED') {
      console.error('Google Places API request denied:', response.data.error_message);
      return res.status(403).json({ 
        error: 'Google Places API request denied',
        details: response.data.error_message || 'Unknown error'
      });
    }

    if (response.data.status !== 'OK') {
      console.error('Google Places API error:', response.data.error_message);
      return res.status(500).json({ 
        error: response.data.error_message || 'Unknown error',
        status: response.data.status
      });
    }

    // 获取每个地点的详细信息
    const places = await Promise.all(
      response.data.results
        .slice(0, parseInt(maxResults) || 5) // 限制返回数量
        .map(async (place) => {
        try {
          const detailsResponse = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
            params: {
              key: GOOGLE_PLACES_API_KEY,
              place_id: place.place_id,
              fields: 'name,formatted_address,geometry,rating,user_ratings_total,types,photos,reviews,website,international_phone_number,opening_hours'
            }
          });
          return detailsResponse.data.result;
        } catch (error) {
          console.error('Error fetching place details:', error);
          return place; // Return basic place info if details fetch fails
        }
      })
    );

    console.log('Returning places:', places);
    res.json({ results: places });
  } catch (error) {
    console.error('Error searching places:', error);
    res.status(500).json({ error: error.message });
  }
});

// Photo proxy endpoint
app.get('/api/places/photo', async (req, res) => {
  try {
    const { photo_reference, maxwidth = 400 } = req.query;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Google Places API key not configured' });
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/photo', {
      params: {
        photo_reference,
        maxwidth,
        key: apiKey
      },
      responseType: 'arraybuffer'
    });

    res.set('Content-Type', response.headers['content-type']);
    res.send(response.data);
  } catch (error) {
    console.error('Error fetching photo:', error);
    res.status(500).json({ error: 'Failed to fetch photo' });
  }
});

// Place details endpoint
app.get('/api/places/details/:placeId', async (req, res) => {
  try {
    const { placeId } = req.params;
    
    console.log('Fetching place details for:', placeId);

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id: placeId,
        fields: 'name,formatted_address,geometry,rating,price_level,photos,reviews,types,user_ratings_total,opening_hours',
        key: GOOGLE_PLACES_API_KEY
      }
    });

    console.log('Place details response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error getting place details:', error);
    res.status(500).json({ error: error.message });
  }
});

// AI recommendation endpoint
app.post('/api/ai-recommend', async (req, res) => {
  try {
    const { query, type, dates, travelers, personality, totalDays, mainDestination } = req.body;
    const apiKey = process.env.VITE_OPENAI_API_KEY;

    if (!apiKey) {
      console.error('OpenAI API key not configured');
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    let systemPrompt = '';
    if (type === 'itinerary') {
      // 生成表格行的模板
      const tableRows = Array.from({ length: totalDays }, (_, i) => {
        return `| Day ${i + 1} | | | |`;
      }).join('\n');

      systemPrompt = `You are a knowledgeable travel assistant. Create a detailed travel report following this EXACT markdown format. DO NOT add any additional sections or modify the format:

# Travel Planning Report

## 🗺️ Basic Travel Overview
- **Destination**: ${mainDestination || '[Extract from landmarks]'}
- **Number of Days**: ${totalDays || '[Calculate based on landmarks]'}
- **Number of Travelers**: ${travelers || '2-4'}
- **Personality Type**: ${personality || 'Cultural Explorer'}

## 🎯 Selected Landmarks
${query.includes('Here are the selected landmarks:') ? query.split('Here are the selected landmarks:\n')[1].split('\n').map(line => `- ${line.replace(/^\d+\.\s*/, '')}`).join('\n') : ''}

## 💰 Budget Planning
### Overall Budget
[Provide budget range]

### Budget Optimization Suggestions
- [Budget tip 1]
- [Budget tip 2]
- [Budget tip 3]

## 🏨 Accommodation Arrangements
### Recommended Accommodation Types
- **Accommodation Style**: [Based on personality]
- **Budget Accommodation Options**:
  1. [Option 1]
  2. [Option 2]

## 📅 Detailed Itinerary
### Itinerary Overview
| Date | Morning | Afternoon | Evening |
|:---:|:---:|:---:|:---:|
${tableRows}

## 💡 Personalized Recommendations
### Curated Based on Your Travel Personality
- **Must-Do Experiences**:
  - [Experience 1]
  - [Experience 2]
  - [Experience 3]
- **Hidden Travel Gems**:
  - [Hidden gem 1]
  - [Hidden gem 2]
- **Unique Local Experiences**:
  - [Local experience 1]
  - [Local experience 2]

Use the provided landmarks and their descriptions to fill in the specific details. Make sure to incorporate all selected landmarks into the daily itinerary. Maintain exact emoji usage and formatting. Focus on providing practical and engaging content while keeping the exact structure.`;
    } else {
      systemPrompt = `You are a travel assistant. Your ONLY task is to return a JSON object.
      DO NOT include any text, explanations, or markdown outside the JSON object.
      DO NOT use any formatting or styling.
      DO NOT add any additional information.
      The response must be a valid JSON object with this exact structure:
      {
        "activity": "theaters and performing arts",
        "followUpQuestion": "What type of performances interest you most?",
        "availableInterests": ["Classical Performances", "Contemporary Shows", "Opera", "Ballet", "Historical Venues", "Modern Theaters"]
      }
      Remember: ONLY return the JSON object, nothing else.`;
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: query
          }
        ],
        temperature: 0.7,
        response_format: type === 'itinerary' ? undefined : { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      console.error('Invalid response format from OpenAI:', response.data);
      return res.status(500).json({ error: 'Invalid response from AI service' });
    }

    const aiResponse = response.data.choices[0].message.content;
    res.json({ 
      content: type === 'itinerary' ? aiResponse : JSON.parse(aiResponse)
    });
  } catch (error) {
    console.error('Error in AI recommendation:', error);
    res.status(500).json({ 
      error: 'Failed to get AI recommendations',
      details: error.message
    });
  }
});

// Helper function to extract country recommendations from AI response
function extractCountryRecommendations(response) {
  if (!response) {
    console.warn('Empty response received in extractCountryRecommendations');
    return [];
  }

  const countries = [];
  const lines = response.split('\n');
  
  console.log('Processing response lines:', lines.length);
  
  lines.forEach(line => {
    // Look for country names followed by explanations
    const europeanCountries = [
      'France', 'Germany', 'Italy', 'Spain', 'Portugal', 'Greece',
      'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Norway',
      'Sweden', 'Denmark', 'Finland', 'Iceland', 'Ireland', 'UK'
    ];
    
    europeanCountries.forEach(country => {
      if (line.includes(country)) {
        countries.push({
          name: country,
          reason: line.trim()
        });
      }
    });
  });
  
  console.log('Extracted countries:', countries);
  return countries;
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Catch-all route to serve the frontend application
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
}); 