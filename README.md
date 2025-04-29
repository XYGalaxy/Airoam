# Travel Planner - Airoam

## Description
Airoam is a modern web application that helps users plan their trips with AI-powered recommendations and interactive maps. Built with React, TypeScript, and Express.js, it provides a seamless experience for discovering and planning travel destinations.

## Architecture
```ascii
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|  Frontend        |     |  Backend         |     |  External APIs   |
|  (React + TS)    |     |  (Express.js)    |     |                  |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
        |                        |                        |
        |                        |                        |
        v                        v                        v
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|  User Interface  |     |  API Gateway     |     |  Google Places   |
|  - Maps          |     |  - Auth          |     |  - Places API    |
|  - Search        |     |  - Routes        |     |  - Maps API      |
|  - Itinerary     |     |  - Middleware    |     |                  |
|  - Photos        |     |                  |     |                  |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
        |                        |                        |
        |                        |                        |
        v                        v                        v
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|  State Management|     |  Business Logic  |     |  OpenAI API      |
|  - React Query   |     |  - AI Processing |     |  - GPT Models    |
|  - Context       |     |  - Data Processing|     |  - Embeddings   |
|  - Local Storage |     |                  |     |                  |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
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

3. Create a `.env` file in the root directory with the following variables:
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

## Who can benefit from your app?
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

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
