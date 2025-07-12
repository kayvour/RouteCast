const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const turf = require('@turf/turf');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/routecast', async (req, res) => {
  const { start, destination } = req.body;

  const geocode = async (place) => {
    const response = await fetch(
      `https://api.openrouteservice.org/geocode/search?api_key=${process.env.ORS_KEY}&text=${encodeURIComponent(place)}`
    );
    const data = await response.json();
    if (!data.features?.length) throw new Error(`Could not find location: ${place}`);
    return data.features[0].geometry.coordinates.reverse(); // [lat, lng]
  };

  try {
    const startCoords = await geocode(start);
    const endCoords = await geocode(destination);

    const routeRes = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
      method: 'POST',
      headers: {
        Authorization: process.env.ORS_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ coordinates: [[startCoords[1], startCoords[0]], [endCoords[1], endCoords[0]]] }),
    });

    const routeData = await routeRes.json();
    const coords = routeData.features[0].geometry.coordinates;
    const duration = routeData.features[0].properties.summary.duration;
    const hours = Math.ceil(duration / 3600);

    const line = turf.lineString(coords);
    const stops = [];

    for (let i = 0; i <= hours; i++) {
      const dist = (i * turf.length(line, { units: 'kilometers' })) / hours;
      const [lng, lat] = turf.along(line, dist, { units: 'kilometers' }).geometry.coordinates;

      const locRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
        headers: { 'User-Agent': 'RouteCast/1.0' }
      });
      const locData = await locRes.json();
      const name = locData.address?.city || locData.address?.town || locData.address?.village || locData.display_name || `Stop ${i}`;

      const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${process.env.OWM_KEY}&units=metric`);
      const weatherData = await weatherRes.json();

      let forecast = null;
      if (weatherData.list) {
        const targetTime = Date.now() + i * 3600 * 1000;
        forecast = weatherData.list.find(item => {
          const forecastTime = new Date(item.dt * 1000).getTime();
          return Math.abs(forecastTime - targetTime) < 90 * 60 * 1000;
        });
      }

      const weather = forecast
        ? `${forecast.weather[0].main}, ${Math.round(forecast.main.temp)}°C`
        : 'Unavailable';

      const icon = forecast?.weather?.[0]?.icon
        ? `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`
        : null;

      stops.push({ location: name, eta: `${i}h`, weather, icon });

      await new Promise(res => setTimeout(res, 1000)); // Respect rate limits
    }

    res.json({ stops });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

app.listen(5000, () => console.log('✅ Server running on http://localhost:5000'));
