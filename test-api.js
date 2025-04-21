import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.VITE_GOOGLE_PLACES_API_KEY;
const BASE_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

async function testApi() {
  try {
    const params = {
      location: '48.8566,2.3522',
      radius: '1000',
      type: 'restaurant',
      key: API_KEY
    };

    console.log('Testing API with key:', API_KEY);
    const response = await axios.get(BASE_URL, { params });
    console.log('API Response:', response.data);
  } catch (error) {
    console.error('API Test Error:', error.response?.data || error.message);
  }
}

testApi(); 