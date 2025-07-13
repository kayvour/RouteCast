import React, { useState } from 'react';

function App() {
  const [start, setStart] = useState('');
  const [destination, setDestination] = useState('');
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = 'https://routecast-server.onrender.com/';

  const fetchRoute = async () => {
    if (!start.trim() || !destination.trim()) {
      setError('Please enter both start and destination');
      return;
    }

    setLoading(true);
    setError('');
    setStops([]);

    try {
      console.log('Fetching route from:', start, 'to:', destination);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const res = await fetch(`${API_URL}/routecast`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          start: start.trim(), 
          destination: destination.trim() 
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details || `Server error: ${res.status}`);
      }

      const data = await res.json();
      
      if (!data.stops || !Array.isArray(data.stops)) {
        throw new Error('Invalid response format');
      }

      setStops(data.stops);
      
      if (data.stops.length === 0) {
        setError('No route data found. Please try different locations.');
      }

    } catch (err) {
      console.error('Route fetch error:', err);
      
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again with shorter routes.');
      } else if (err.message.includes('fetch')) {
        setError('Unable to connect to server. Please check your internet connection.');
      } else {
        setError(err.message || 'Could not fetch route or weather info');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchRoute();
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white font-sans"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      <div className="bg-black bg-opacity-80 min-h-screen px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            RouteCast 🌦️
          </h1>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
            <input
              value={start}
              onChange={(e) => setStart(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Starting location (e.g., New York)"
              className="p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 w-full md:w-1/3 border border-gray-700 focus:border-cyan-500 focus:outline-none transition-colors"
              disabled={loading}
            />
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Destination (e.g., Boston)"
              className="p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 w-full md:w-1/3 border border-gray-700 focus:border-cyan-500 focus:outline-none transition-colors"
              disabled={loading}
            />
            <button
              onClick={fetchRoute}
              disabled={loading || !start.trim() || !destination.trim()}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all px-6 py-3 rounded-lg text-white font-semibold shadow-lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading...
                </span>
              ) : (
                'Get Route Weather'
              )}
            </button>
          </div>

          {error && (
            <div className="text-center text-red-400 mb-6 p-4 bg-red-900 bg-opacity-20 rounded-lg border border-red-800">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          <div className="max-w-3xl mx-auto">
            {stops.length === 0 && !loading && !error && (
              <div className="text-center text-gray-400 p-8">
                <div className="text-6xl mb-4">🗺️</div>
                <p className="text-lg">Enter a route to get weather updates along your journey.</p>
                <p className="text-sm mt-2">Example: "New York" to "Boston"</p>
              </div>
            )}

            {loading && (
              <div className="text-center text-gray-400 p-8">
                <div className="text-6xl mb-4">⏳</div>
                <p className="text-lg">Calculating route and fetching weather data...</p>
                <p className="text-sm mt-2">This may take a few moments</p>
              </div>
            )}

            {stops.length > 0 && (
              <div className="mb-4 text-center text-gray-300">
                <p>Found {stops.length} stops along your route</p>
              </div>
            )}

            <div className="grid gap-4">
              {stops.map((stop, i) => (
                <div
                  key={i}
                  className="bg-gray-900 bg-opacity-70 p-6 rounded-xl border border-white/10 shadow-lg hover:bg-opacity-80 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {stop.location}
                      </h3>
                      <div className="flex items-center gap-4 text-gray-300">
                        <p className="flex items-center gap-1">
                          <span className="text-cyan-400">📍</span>
                          ETA: {stop.eta}
                        </p>
                        <p className="flex items-center gap-1">
                          <span className="text-cyan-400">🌤️</span>
                          {stop.weather}
                        </p>
                      </div>
                    </div>
                    {stop.icon && (
                      <img 
                        src={stop.icon} 
                        alt="Weather icon" 
                        className="h-16 w-16 ml-4"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
