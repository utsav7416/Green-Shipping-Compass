import React, { useState, useEffect, useRef } from 'react';

const PORT_DATA_URL = 'https://raw.githubusercontent.com/tayljordan/ports/main/ports.json';

export default function WeatherPortInfo() {
  const [portList, setPortList] = useState([]);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedPort, setSelectedPort] = useState(null);
  const [weather, setWeather] = useState(null);
  const [vesselData, setVesselData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    fetch(PORT_DATA_URL)
      .then(res => res.json())
      .then(list => {
        setPortList(list.map(p => ({
          name: p.CITY,
          country: p.COUNTRY,
          state: p.STATE,
          coordinates: [p.LONGITUDE, p.LATITUDE],
          unlocs: [`${p.CITY.slice(0, 2).toUpperCase()}${p.CITY.slice(-3).toUpperCase()}`]
        })));
      })
      .catch(() => setError('Failed to load port list'));
  }, []);

  useEffect(() => {
    if (!selectedPort) return;

    const [lon, lat] = selectedPort.coordinates;
    setLoading(true);
    setError(null);
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.REACT_APP_OWM_KEY}`)
      .then(res => res.json())
      .then(data => setWeather(data))
      .catch(() => setError('Weather API error'))
      .finally(() => setLoading(false));

    if (wsRef.current) wsRef.current.close();
    const radiusKm = 25;
    const latOff = radiusKm / 111;
    const lonOff = radiusKm / (111 * Math.cos(lat * Math.PI / 180));
    const box = [
      [lat - latOff, lon - lonOff],
      [lat + latOff, lon + lonOff]
    ];

    const ws = new WebSocket('wss://stream.aisstream.io/v0/stream');
    wsRef.current = ws;
    ws.onopen = () => {
      ws.send(JSON.stringify({
        APIKey: process.env.REACT_APP_AISSTREAM_KEY,
        BoundingBoxes: [box],
        FilterMessageTypes: ['PositionReport']
      }));
    };

    let vessels = new Set();
    let lastUpdate = Date.now();
    ws.onmessage = e => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.MessageType === 'PositionReport') {
          vessels.add(msg.Message.PositionReport.UserID);
          if (Date.now() - lastUpdate > 3000) {
            const count = vessels.size;
            const cong = Math.min((count / 20) * 100, 100);
            setVesselData({
              vesselCount: count,
              congestion: cong.toFixed(1),
              status: cong > 70 ? 'High' : cong > 40 ? 'Moderate' : 'Low',
              lastUpdated: new Date().toLocaleTimeString(),
              dataSource: 'AISStream.io Live Feed'
            });
            lastUpdate = Date.now();
          }
        }
      } catch {}
    };
    ws.onerror = () => setError('Vessel stream error');
    return () => ws.close();
  }, [selectedPort]);

  const onChange = e => {
    const q = e.target.value;
    setQuery(q);
    setShowSuggestions(true);
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    const lower = q.toLowerCase();
    setSuggestions(
      portList.filter(
        p =>
          p.name.toLowerCase().includes(lower) ||
          p.country.toLowerCase().includes(lower)
      ).slice(0, 8)
    );
  };

  const selectPort = p => {
    setSelectedPort(p);
    setQuery(p.name);
    setShowSuggestions(false);
    setVesselData(null);
  };

  const getWeatherIcon = code =>
    `https://openweathermap.org/img/wn/${code}@2x.png`;

  const getWindDirection = deg => {
    const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
    return dirs[Math.round(deg/22.5)%16];
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-xl shadow-xl mb-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-black text-primary-600 mb-4 flex justify-center items-center">
          <span className="mr-3">🌊</span>Live Port Intelligence<span className="ml-3">⚓</span>
        </h2>
        <p className="text-gray-600 font-bold text-lg">
          Real-time weather and live vessel tracking data
        </p>
      </div>

      <div className="max-w-2xl mx-auto mb-8 relative">
        <input
          type="text"
          value={query}
          onChange={onChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder="🔍 Search for a port…"
          className="w-full px-6 py-4 text-lg font-bold border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-64 overflow-y-auto shadow-lg">
            {suggestions.map((p, i) => (
              <div
                key={i}
                onClick={() => selectPort(p)}
                className="px-6 py-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b last:border-b-0"
              >
                <div>
                  <div className="font-black text-gray-800">{p.name}</div>
                  <div className="text-sm text-gray-500">{p.country}</div>
                </div>
                <div className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                  {p.unlocs[0]}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mr-4"></div>
            <span className="text-xl font-black text-blue-600">
              Loading…
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-6 py-4 rounded-lg mb-6 text-center">
          {error}
        </div>
      )}

      {selectedPort && weather && (
        <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-blue-200">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-black text-gray-800">
              {selectedPort.name}
            </h3>
            <div className="text-lg font-bold text-gray-600">
              {selectedPort.country} • {selectedPort.state}
            </div>
            <div className="inline-flex items-center mt-2 bg-green-100 px-4 py-1 rounded-full text-green-800 font-bold text-sm">
              📡 Live AIS Data Stream
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-6 rounded-xl border border-blue-200">
              <h4 className="text-2xl font-black text-blue-800 mb-6 flex items-center">
                <span className="mr-3">🌤️</span>Current Weather
              </h4>
              <div className="flex items-center mb-6">
                <img
                  src={getWeatherIcon(weather.weather[0].icon)}
                  alt=""
                  className="w-16 h-16 mr-4"
                />
                <div>
                  <div className="text-4xl font-black text-gray-800">
                    {Math.round(weather.main.temp)}°C
                  </div>
                  <div className="capitalize text-lg text-gray-600">
                    {weather.weather[0].description}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border text-center">
                  <div className="text-sm text-gray-500 mb-1">Humidity</div>
                  <div className="text-xl font-black text-gray-800">
                    {weather.main.humidity}%
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border text-center">
                  <div className="text-sm text-gray-500 mb-1">Wind</div>
                  <div className="text-xl font-black text-gray-800">
                    {weather.wind.speed} m/s {getWindDirection(weather.wind.deg)}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border text-center">
                  <div className="text-sm text-gray-500 mb-1">Feels Like</div>
                  <div className="text-xl font-black text-gray-800">
                    {Math.round(weather.main.feels_like)}°C
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border text-center">
                  <div className="text-sm text-gray-500 mb-1">Pressure</div>
                  <div className="text-xl font-black text-gray-800">
                    {weather.main.pressure} hPa
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-100 p-6 rounded-xl border border-orange-200">
              <h4 className="text-2xl font-black text-orange-800 mb-6 flex items-center">
                <span className="mr-3">🚢</span>Live Vessel Activity
              </h4>
              {vesselData ? (
                <>
                  <div className="mb-4">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-600">Count</span>
                      <span className="font-black text-gray-800">{vesselData.vesselCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-600">Congestion</span>
                      <span className="font-black text-gray-800">
                        {vesselData.congestion}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-600">Status</span>
                      <span className="font-black text-gray-800">{vesselData.status}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Updated: {vesselData.lastUpdated}
                  </div>
                </>
              ) : (
                <div>Connecting to live vessel tracking…</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
