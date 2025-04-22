import express from 'express';
import cors from 'cors';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const DEFAULT_PORT = 3000;

// Enable CORS
app.use(cors());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Google Places API proxy endpoint
app.get('/api/places/search', async (req, res) => {
  try {
    const { location, radius, type, keyword } = req.query;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Google Places API key not configured' });
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: {
        location,
        radius,
        type,
        keyword,
        key: apiKey
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching places:', error);
    res.status(500).json({ error: 'Failed to fetch places' });
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
app.get('/api/places/details', async (req, res) => {
  try {
    const { place_id } = req.query;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Google Places API key not configured' });
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id,
        key: apiKey,
        fields: 'name,vicinity,formatted_address,geometry,photos,rating,price_level,types,user_ratings_total,opening_hours'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching place details:', error);
    res.status(500).json({ error: 'Failed to fetch place details' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Catch-all route to serve the frontend application
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 动态端口分配
const startServer = (port) => {
  try {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      // 将当前端口保存到环境变量中，供前端使用
      process.env.VITE_SERVER_PORT = port;
    });
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      console.log(`Port ${port} is busy, trying ${port + 1}`);
      startServer(port + 1);
    } else {
      console.error('Error starting server:', error);
    }
  }
};

// 启动服务器
startServer(DEFAULT_PORT);

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
}); 