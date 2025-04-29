# Travel Planner - Airoam

## Description
Airoam is a modern web application that helps users plan their trips with AI-powered recommendations and interactive maps. Built with React, TypeScript, and Express.js, it provides a seamless experience for discovering and planning travel destinations.

## Architecture
```ascii
+------------------+     +-------------------+     +------------------+
|                  |     |                   |     |                  |
|  Frontend        |     |  Backend          |     |  External APIs   |
|  (React + TS)    |     |  (Express.js)     |     |                  |
|                  |     |                   |     |                  |
+------------------+     +-------------------+     +------------------+
        |                        |                        |
        |                        |                        |
        v                        v                        v
+------------------+     +-------------------+     +------------------+
|                  |     |                   |     |                  |
|  User Interface  |     |  API Gateway      |     |  Google Places   |
|  - Maps          |     |  - Auth           |     |  - Places API    |
|  - Search        |     |  - Routes         |     |  - Maps API      |
|  - Itinerary     |     |  - Middleware     |     |                  |
|  - Photos        |     |                   |     |                  |
|                  |     |                   |     |                  |
+------------------+     +-------------------+     +------------------+
        |                        |                        |
        |                        |                        |
        v                        v                        v
+------------------+     +-------------------+     +------------------+
|                  |     |                   |     |                  |
|  State Management|     |  Business Logic   |     |  OpenAI API      |
|  - React Query   |     |  - AI Processing  |     |  - GPT Models    |
|  - Context       |     |  - Data Processing|     |  - Embeddings    |
|  - Local Storage |     |                   |     |                  |
|                  |     |                   |     |                  |
+------------------+     +-------------------+     +------------------+
```


### Short description
Our app is a sophisticated travel planning system built using React and TypeScript for the frontend, with a Node.js/Express backend. It leverages the Google Places API for location data and OpenAI's API for intelligent travel recommendations. The application features a modern UI built with Tailwind CSS and Shadcn UI components, providing a responsive and intuitive user experience.

### Data sources used
- Google Places API for location data, reviews, and place details
- OpenAI API for generating personalized travel recommendations
- Express.js backend for API proxying and business logic
- Local storage for saving user preferences and trip data

### Key Features
- Interactive map integration with Google Maps
- AI-powered travel recommendations
- Place search with detailed information
- Photo galleries for destinations
- Personalized itinerary planning
- Budget planning assistance
- Accommodation recommendations

## Technology & Languages

- **Frontend:**
  - React
  - TypeScript
  - Tailwind CSS
  - Shadcn UI
  - React Router
  - React Query
  - React Hook Form
  - Zod

- **Backend:**
  - Node.js
  - Express.js
  - OpenAI API
  - Google Places API

- **Development Tools:**
  - Vite
  - ESLint
  - Jest
  - TypeScript
  - PostCSS

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Google Places API key
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd travel-planner
```

2. Install dependencies:
```bash
npm install
```

3. replace in `.env` file in the root directory with the following variables:
```
VITE_GOOGLE_PLACES_API_KEY=your_google_places_api_key
VITE_OPENAI_API_KEY=your_openai_api_key
PORT=3000
```

4. Start the development server:
```bash
npm run dev
```

5. Start the backend server:
```bash
npm run server
```

## Who can benefit from Airoam?
- Travel enthusiasts looking for personalized trip planning
- Tourists seeking detailed information about destinations
- Travel agencies needing a modern planning tool
- Individual travelers wanting AI-powered recommendations
- Users looking for an interactive way to explore new places

## Project Structure
```
travel-planner/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── services/      # API services
│   ├── hooks/         # Custom React hooks
│   ├── contexts/      # React contexts
│   ├── types/         # TypeScript type definitions
│   └── lib/           # Utility functions
├── public/            # Static assets
└── server.js          # Express backend server
```

## Project Video
[5-Minute Demo Video | AIROAM](https://www.youtube.com/watch?v=7JBjwC4-oGs)

Welcome to the final demo video of AIROAM, a revolutionary AI-powered travel planning platform. In this video, our diverse team from Finland 🇫🇮, France 🇫🇷, and the Netherlands 🇳🇱 gives you a comprehensive walkthrough of AIROAM and its capabilities. Whether you’re a planner or spontaneous traveler, AIROAM instantly generates personalized travel recommendations based on your interests, preferences, and budget. It’s fast, fun, and most importantly, designed to make travel planning feel like discovering, not a chore.

Watch to see how AI helps create a seamless travel experience and how we built this innovative tool with AI at every step of the process. From planning to discovering new destinations, AIROAM is here to transform your travel journey.

Key Features:
Personalized travel recommendations based on your interests and personality

No more endless tabs, just quick and efficient itineraries

Built with AI at every level, from the frontend to the backend

Designed to make travel planning feel like inspiration, not a hassle

We also dive into the development process, challenges we faced, and how AI played a central role in building AIROAM. It's not just a tool — it’s a blueprint for how human-AI collaboration can shape the future.

## Team Members
Josie Zhang (@Josie0316), Zhen Qi (@zqi4869), Xinyue Gao (@XYGalaxy)
