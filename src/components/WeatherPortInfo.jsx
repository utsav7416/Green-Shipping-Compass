import React, { useState, useEffect, useRef } from 'react';

const PORT_DATA_URL = 'https://raw.githubusercontent.com/marchah/sea-ports/master/ports.json';

export default function WeatherPortInfo() {
  const [portList, setPortList] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedPort, setSelectedPort] = useState(null);
  const [weather, setWeather] = useState(null);
  const [vesselData, setVesselData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    fetch(PORT_DATA_URL)
      .then((res) => res.json())
      .then((json) => setPortList(Object.values(json)))
      .catch(() => setError('Failed to load port list'));
  }, []);

  const connectToAISStream = (port) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const { coordinates } = port;
    const [lon, lat] = coordinates;
    
    const radiusKm = 25;
    const latOffset = radiusKm / 111;
    const lonOffset = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

    const boundingBox = [
      [lat - latOffset, lon - lonOffset],
      [lat + latOffset, lon + lonOffset]
    ];

    try {
      const ws = new WebSocket('wss://stream.aisstream.io/v0/stream');
      wsRef.current = ws;

      ws.onopen = () => {
        const subscriptionMessage = {
          APIKey: process.env.REACT_APP_AISSTREAM_KEY,
          BoundingBoxes: [boundingBox],
          FilterMessageTypes: ['PositionReport']
        };
        ws.send(JSON.stringify(subscriptionMessage));
      };

      let vesselCounter = new Set();
      let lastUpdate = Date.now();

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.MessageType === 'PositionReport') {
            const aisMessage = message.Message.PositionReport;
            const mmsi = aisMessage.UserID;
            
            vesselCounter.add(mmsi);

            if (Date.now() - lastUpdate > 3000) {
              const vesselCount = vesselCounter.size;
              const congestionLevel = Math.min((vesselCount / 20) * 100, 100);
              
              setVesselData({
                vesselCount: vesselCount,
                congestion: congestionLevel,
                status: congestionLevel > 70 ? 'High' : congestionLevel > 40 ? 'Moderate' : 'Low',
                lastUpdated: new Date().toLocaleString(),
                dataSource: 'AISStream.io Live Feed'
              });
              
              lastUpdate = Date.now();
            }
          }
        } catch (err) {
          console.error('WebSocket message error:', err);
        }
      };

      ws.onerror = () => {
        setError('Failed to connect to AIS stream');
      };

    } catch (err) {
      setError('WebSocket connection failed');
    }
  };

  useEffect(() => {
    if (!selectedPort) return;

    const { coordinates } = selectedPort;
    const [lon, lat] = coordinates;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.REACT_APP_OWM_KEY}`
        );
        const weatherJson = await weatherRes.json();
        setWeather(weatherJson);

        connectToAISStream(selectedPort);

      } catch (err) {
        setError('Failed to fetch weather data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [selectedPort]);

  const suggestions = query.length < 2 ? [] : portList
    .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8);

  const handlePortSelect = (port) => {
    setSelectedPort(port);
    setQuery(port.name);
    setShowSuggestions(false);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setShowSuggestions(true);
    if (e.target.value.length < 2) {
      setSelectedPort(null);
    }
  };

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const getWindDirection = (degrees) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-xl shadow-xl mb-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-black text-primary-600 mb-4 flex items-center justify-center">
          <span className="mr-3">🌊</span>
          Live Port Intelligence
          <span className="ml-3">⚓</span>
        </h2>
        <p className="text-gray-600 font-bold text-lg">Real-time weather and live vessel tracking data</p>
      </div>

      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            value={query}
            placeholder="🔍 Search for a port (e.g., Singapore, Dubai, Rotterdam)..."
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            className="w-full px-6 py-4 text-lg font-bold border-2 border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 rounded-xl shadow-lg bg-white transition-all duration-300"
          />

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white border-2 border-blue-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
              {suggestions.map((port, index) => (
                <div
                  key={`${port.name}-${index}`}
                  onClick={() => handlePortSelect(port)}
                  className="px-6 py-4 hover:bg-blue-50 cursor-pointer transition-colors duration-200 border-b border-gray-100 last:border-b-0 flex items-center justify-between"
                >
                  <div>
                    <div className="font-black text-gray-800">{port.name}</div>
                    <div className="text-sm font-bold text-gray-500">{port.country}</div>
                  </div>
                  <div className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                    {port.unlocs?.[0] || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mr-4"></div>
            <span className="text-xl font-black text-blue-600">Connecting to live vessel stream...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-2 border-red-300 text-red-700 px-6 py-4 rounded-xl mb-6 text-center">
          <div className="font-black text-lg mb-2">⚠️ Error</div>
          <div className="font-bold">{error}</div>
        </div>
      )}

      {selectedPort && weather && (
        <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-200">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-black text-gray-800 mb-2">
              {selectedPort.name}
            </h3>
            <div className="text-lg font-bold text-gray-600 mb-4">
              {selectedPort.country} • {selectedPort.unlocs?.[0]}
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full">
              <span className="text-green-800 font-bold text-sm">📡 Live AIS Data Stream</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-6 rounded-xl border-2 border-blue-200">
              <h4 className="text-2xl font-black text-blue-800 mb-6 flex items-center">
                <span className="mr-3">🌤️</span>
                Current Weather
              </h4>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <img 
                    src={getWeatherIcon(weather.weather?.[0]?.icon)} 
                    alt={weather.weather?.[0]?.description}
                    className="w-16 h-16 mr-4"
                  />
                  <div>
                    <div className="text-4xl font-black text-gray-800">
                      {Math.round(weather.main?.temp)}°C
                    </div>
                    <div className="text-lg font-bold text-gray-600 capitalize">
                      {weather.weather?.[0]?.description}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="text-sm font-bold text-gray-500 mb-1">Feels Like</div>
                  <div className="text-xl font-black text-gray-800">{Math.round(weather.main?.feels_like)}°C</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="text-sm font-bold text-gray-500 mb-1">Humidity</div>
                  <div className="text-xl font-black text-gray-800">{weather.main?.humidity}%</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="text-sm font-bold text-gray-500 mb-1">Wind</div>
                  <div className="text-xl font-black text-gray-800">
                    {weather.wind?.speed} m/s {getWindDirection(weather.wind?.deg)}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="text-sm font-bold text-gray-500 mb-1">Pressure</div>
                  <div className="text-xl font-black text-gray-800">{weather.main?.pressure} hPa</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-100 p-6 rounded-xl border-2 border-orange-200">
              <h4 className="text-2xl font-black text-orange-800 mb-6 flex items-center">
                <span className="mr-3">🚢</span>
                Live Vessel Activity
                <span className="ml-2 text-sm bg-green-500 text-white px-2 py-1 rounded-full">LIVE</span>
              </h4>
              
              {vesselData ? (
                <>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-600">Activity Level</span>
                      <span className="font-black text-2xl text-orange-800">
                        {vesselData.congestion.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className={`h-4 rounded-full transition-all duration-500 ${
                          vesselData.congestion > 70 ? 'bg-red-500' : 
                          vesselData.congestion > 40 ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(vesselData.congestion, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white p-4 rounded-lg border border-orange-200">
                      <div className="text-sm font-bold text-gray-500 mb-1">Active Vessels</div>
                      <div className="text-xl font-black text-gray-800">{vesselData.vesselCount}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-orange-200">
                      <div className="text-sm font-bold text-gray-500 mb-1">Last Update</div>
                      <div className="text-sm font-black text-gray-800">{vesselData.lastUpdated}</div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full font-black ${
                      vesselData.status === 'High' ? 'bg-red-200 text-red-800' :
                      vesselData.status === 'Moderate' ? 'bg-orange-200 text-orange-800' : 'bg-green-200 text-green-800'
                    }`}>
                      {vesselData.status === 'High' ? '🔴 High Activity' :
                       vesselData.status === 'Moderate' ? '🟡 Moderate Activity' : '🟢 Low Activity'}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-pulse">
                    <div className="text-4xl mb-4">📡</div>
                    <div className="font-bold text-gray-600">Connecting to live vessel tracking...</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-100 p-6 rounded-xl border-2 border-purple-200">
            <h4 className="text-2xl font-black text-purple-800 mb-4 flex items-center">
              <span className="mr-3">🛡️</span>
              Weather Delay Insurance & ETA Services
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <h5 className="font-black text-lg text-purple-700 mb-3">Insurance Options</h5>
                <div className="space-y-2">
                  <a
                    href="https://www.standard-club.com/fileadmin/uploads/standardclub/Documents/2070_NS-AYC-Weather_Delay_v2_281123.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors font-bold text-blue-800"
                  >
                    📄 Standard Club Weather Delay Coverage
                  </a>
                  <a
                    href="http://north-standard.com/insights-and-resources/resources/press-releases/northstandard-to-provide-first-ever-strike-delay-cover-for-adverse-weather"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors font-bold text-green-800"
                  >
                    📋 NorthStandard Strike & Weather Cover
                  </a>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <h5 className="font-black text-lg text-purple-700 mb-3">Live Vessel Intelligence</h5>
                <p className="text-sm font-bold text-gray-600 mb-3">
                  Real-time AIS tracking provides live vessel counts and activity levels for accurate port congestion assessment.
                </p>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <code className="text-xs font-bold text-gray-700">
                    AISStream.io provides free global vessel tracking via WebSocket
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!selectedPort && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-black text-gray-600 mb-2">Select a Port</h3>
          <p className="text-gray-500 font-bold">Search and select a port to view real-time weather and live vessel activity data</p>
        </div>
      )}
    </div>
  );
}
