import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// 直接使用API key，不通过环境变量
const API_KEY = 'AIzaSyCx5Ddmau2zkG9eGKNtyremtkAvPBKVi2I';

console.log('Environment variables:', {
  PORT: process.env.PORT,
  API_KEY: API_KEY
});

// Enable CORS for all routes
app.use(cors());

app.use(express.json());

// Google Places API proxy endpoint
app.get('/api/places/nearbysearch', async (req, res) => {
  try {
    const { location, radius, type, keyword } = req.query;
    console.log('Received request with params:', { location, radius, type, keyword });

    const apiUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
    const params = {
      location,
      radius,
      type,
      keyword,
      key: API_KEY
    };

    console.log('Making request to Google Places API with params:', {
      ...params,
      key: 'API_KEY_HIDDEN' // 不在日志中显示完整的API key
    });
    
    const response = await axios.get(apiUrl, { params });
    console.log('Google Places API response status:', response.data.status);
    console.log('Google Places API response results count:', response.data.results.length);

    if (response.data.status === 'OK' || response.data.status === 'ZERO_RESULTS') {
      res.json(response.data);
    } else {
      throw new Error(`Google Places API error: ${response.data.status} - ${response.data.error_message || 'No error message'}`);
    }
  } catch (error) {
    console.error('Error proxying Google Places API:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
    }
    res.status(500).json({ 
      error: 'Failed to fetch places',
      details: error.message,
      response: error.response?.data
    });
  }
});

// Place Details proxy endpoint
app.get('/api/places/details', async (req, res) => {
  try {
    const { place_id, fields } = req.query;
    
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id,
        fields,
        key: API_KEY
      }
    });

    if (response.data.status === 'OK') {
      res.json(response.data);
    } else {
      throw new Error(`Google Places API error: ${response.data.status}`);
    }
  } catch (error) {
    console.error('Error proxying Place Details API:', error);
    res.status(500).json({ 
      error: 'Failed to fetch place details',
      details: error.message 
    });
  }
});

// Photo proxy endpoint
app.get('/api/places/photo', async (req, res) => {
  try {
    const { maxwidth, photo_reference } = req.query;
    
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/photo', {
      params: {
        maxwidth,
        photo_reference,
        key: API_KEY
      },
      responseType: 'arraybuffer'
    });
    
    // Set appropriate headers for image response
    res.set('Content-Type', 'image/jpeg');
    res.send(response.data);
  } catch (error) {
    console.error('Error proxying Place Photo API:', error);
    res.status(500).json({ 
      error: 'Failed to fetch photo',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something broke!',
    details: err.message 
  });
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
}); 