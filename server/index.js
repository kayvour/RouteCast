const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const turf = require('@turf/turf');
require('dotenv').config();

const app = express();

// CORS configuration for production
app.use(cors({
  origin: [
    'https://route-cast.vercel.app/',
    'http://localhost:3000',
    'https://localhost:3000'
  ],
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'RouteCast API is running',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Main route endpoint
app.post('/routecast', async (req, res) => {
  const { start, destination } = req.body;

  // Validation
  if (!start || !destination) {
    return res.status(400).json({ 
      error: 'Missing required fields', 
      details: 'Both start and destination are required' 
    });
  }

  // Check for required environment variables
  if (!process.env.ORS_KEY || !process.env.OWM_KEY) {
    return res.status(500).json({ 
      error: 'Server configuration error', 
      details: 'Missing required API keys' 
    });
  }

  const geocode = async (place) => {
    try {
      const response = await fetch(
        `https://api.openrouteservice.org/geocode/search?api_key=${process.env.ORS_KEY}&text=${encodeURIComponent(place)}`
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.features?.length) {
        throw new Error(`Could not find location: ${place}`);
      }
      return data.features[0].geometry.coordinates.reverse(); // [lat, lng]
    } catch (error) {
      throw new Error(`Geocoding failed for ${place}: ${error.message}`);
    }
  };

  try {
    console.log(`Processing route from ${start} to ${destination}`);
    
    const startCoords = await geocode(start);
    const endCoords = await geocode(destination);

    console.log('Start coords:', startCoords);
    console.log('End coords:', endCoords);

    const routeRes = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
      method: 'POST',
      headers: {
        Authorization: process.env.ORS_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        coordinates: [[startCoords[1], startCoords[0]], [endCoords[1], endCoords[0]]] 
      }),
    });

    if (!routeRes.ok) {
      throw new Error(`Route API error: ${routeRes.status}`);
    }

    const routeData = await routeRes.json();
    
    if (!routeData.features?.length) {
      throw new Error('No route found');
    }

    const coords = routeData.features[0].geometry.coordinates;
    const duration = routeData.features[0].properties.summary.duration;
    const hours = Math.min(Math.ceil(duration / 3600), 12); // Cap at 12 hours

    const line = turf.lineString(coords);
    const stops = [];

    console.log(`Generating ${hours} stops along the route`);

    for (let i = 0; i <= hours; i++) {
      try {
        const dist = (i * turf.length(line, { units: 'kilometers' })) / hours;
        const [lng, lat] = turf.along(line, dist, { units: 'kilometers' }).geometry.coordinates;

        // Get location name
        let locationName = `Stop ${i}`;
        try {
          const locRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
            headers: { 'User-Agent': 'RouteCast/1.0' }
          });
          
          if (locRes.ok) {
            const locData = await locRes.json();
            locationName = locData.address?.city || 
                         locData.address?.town || 
                         locData.address?.village || 
                         locData.display_name?.split(',')[0] || 
                         `Stop ${i}`;
          }
        } catch (locError) {
          console.warn(`Location lookup failed for stop ${i}:`, locError.message);
        }

        // Get weather data
        let weather = 'Unavailable';
        let icon = null;
        
        try {
          const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${process.env.OWM_KEY}&units=metric`);
          
          if (weatherRes.ok) {
            const weatherData = await weatherRes.json();
            
            if (weatherData.list?.length) {
              const targetTime = Date.now() + i * 3600 * 1000;
              const forecast = weatherData.list.find(item => {
                const forecastTime = new Date(item.dt * 1000).getTime();
                return Math.abs(forecastTime - targetTime) < 90 * 60 * 1000;
              }) || weatherData.list[0]; // Fallback to first forecast
              
              if (forecast) {
                weather = `${forecast.weather[0].main}, ${Math.round(forecast.main.temp)}°C`;
                icon = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;
              }
            }
          }
        } catch (weatherError) {
          console.warn(`Weather lookup failed for stop ${i}:`, weatherError.message);
        }

        stops.push({ 
          location: locationName, 
          eta: `${i}h`, 
          weather, 
          icon 
        });

        // Rate limiting - be more aggressive to avoid timeouts
        if (i < hours) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (stopError) {
        console.error(`Error processing stop ${i}:`, stopError);
        // Continue with other stops
        stops.push({ 
          location: `Stop ${i}`, 
          eta: `${i}h`, 
          weather: 'Unavailable', 
          icon: null 
        });
      }
    }

    console.log(`Successfully generated ${stops.length} stops`);
    res.json({ stops });

  } catch (err) {
    console.error('Route processing error:', err);
    res.status(500).json({ 
      error: 'Server error', 
      details: err.message 
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found', 
    availableRoutes: ['GET /', 'POST /routecast'] 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong' 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`ORS_KEY configured: ${!!process.env.ORS_KEY}`);
  console.log(`OWM_KEY configured: ${!!process.env.OWM_KEY}`);
});
