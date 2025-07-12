import React, { useState } from 'react';

function App() {
  const [start, setStart] = useState('');
  const [destination, setDestination] = useState('');
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRoute = async () => {
    if (!start || !destination) {
      setError('Please enter both start and destination');
      return;
    }

    setLoading(true);
    setError('');
    setStops([]);

    try {
      const res = await fetch('http://localhost:5000/routecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start, destination }),
      });

      if (!res.ok) throw new Error('API request failed');

      const data = await res.json();
      setStops(data.stops || []);
    } catch (err) {
      setError('Could not fetch route or weather info');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white font-sans"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      <div className="bg-black bg-opacity-80 min-h-screen px-6 py-10">
        <h1 className="text-3xl font-bold mb-6 text-center">RouteCast 🌦️</h1>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
          <input
            value={start}
            onChange={(e) => setStart(e.target.value)}
            placeholder="Starting location"
            className="p-3 rounded bg-gray-800 text-white placeholder-gray-400 w-full md:w-1/3"
          />
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Destination"
            className="p-3 rounded bg-gray-800 text-white placeholder-gray-400 w-full md:w-1/3"
          />
          <button
            onClick={fetchRoute}
            className="bg-cyan-600 hover:bg-cyan-700 transition px-6 py-3 rounded text-white font-semibold"
          >
            {loading ? 'Loading...' : 'Get Route Weather'}
          </button>
        </div>

        {error && (
          <div className="text-center text-red-400 mb-6">
            {error}
          </div>
        )}

        <div className="max-w-3xl mx-auto">
          {stops.length === 0 && !loading && !error && (
            <p className="text-center text-gray-400">Enter a route to get weather updates.</p>
          )}

          {stops.map((stop, i) => (
            <div
              key={i}
              className="bg-gray-900 bg-opacity-70 p-4 rounded-xl mb-4 border border-white/10 shadow"
            >
              <h3 className="text-lg font-semibold">{stop.location}</h3>
              <p className="text-sm">ETA: {stop.eta}</p>
              <p className="text-sm mb-1">Weather: {stop.weather}</p>
              {stop.icon && (
                <img src={stop.icon} alt="Weather icon" className="h-12 w-12" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
