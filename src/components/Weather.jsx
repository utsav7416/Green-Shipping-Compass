import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Sun, CloudRain, Wind, Thermometer, Droplets, Eye, Gauge, Sunrise, Sunset, Waves, AlertTriangle, TrendingUp, TrendingDown, BarChart3, Leaf } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend } from 'recharts';
import { ports } from '../data/ports';

const AnimatedWeatherBackground = ({ weather }) => {
    if (!weather) return null;
    const condition = weather.weather[0].main;
    
    const rain = (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(60)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-0.5 h-12 bg-gradient-to-b from-blue-300 to-blue-500"
                    style={{ left: `${Math.random() * 100}%` }}
                    initial={{ y: '-10vh' }}
                    animate={{ y: '110vh' }}
                    transition={{
                        duration: 1 + Math.random() * 0.5,
                        repeat: Infinity,
                        ease: 'linear',
                        delay: Math.random() * 5,
                    }}
                />
            ))}
        </div>
    );
    
    const clouds = (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute bg-white/30 rounded-full"
                    style={{
                        width: `${120 + Math.random() * 100}px`,
                        height: `${70 + Math.random() * 50}px`,
                        top: `${10 + i * 15}%`,
                    }}
                    initial={{ x: '-150%' }}
                    animate={{ x: '150%' }}
                    transition={{
                        duration: 30 + Math.random() * 20,
                        repeat: Infinity,
                        ease: 'linear',
                        delay: i * 2,
                    }}
                />
            ))}
        </div>
    );
    
    const sun = (
        <div className="absolute top-4 right-4 overflow-hidden pointer-events-none">
            <motion.div
                className="w-24 h-24 bg-yellow-400/80 rounded-full shadow-lg"
                animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                transition={{
                    rotate: { duration: 40, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
                }}
            />
        </div>
    );
    
    switch (condition) {
        case 'Rain':
        case 'Drizzle':
            return rain;
        case 'Clouds':
            return clouds;
        case 'Clear':
            return sun;
        default:
            return null;
    }
};
const AirPollutionInfo = ({ originData, destinationData, origin, destination }) => {
    if (!originData || !destinationData) return null;

    const calculateUsAqi = (pm25) => {
        if (pm25 === undefined || pm25 === null) return { aqi: 'N/A', text: 'Unknown', color: 'bg-gray-100 text-gray-800', advice: 'PM2.5 data not available.' };
    
        let aqi, text, color, advice;
    
        if (pm25 <= 12.0) {
            aqi = Math.round((50/12.0) * pm25);
            text = 'Good';
            color = 'bg-green-100 text-green-800';
            advice = 'Air quality is considered satisfactory, and air pollution poses little or no risk.';
        } else if (pm25 <= 35.4) {
            aqi = Math.round(((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51);
            text = 'Moderate';
            color = 'bg-yellow-100 text-yellow-800';
            advice = 'Air quality is acceptable; however, for some pollutants there may be a moderate health concern.';
        } else if (pm25 <= 55.4) {
            aqi = Math.round(((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101);
            text = 'Unhealthy for Sensitive Groups';
            color = 'bg-orange-100 text-orange-800';
            advice = 'Members of sensitive groups may experience health effects. The general public is not likely to be affected.';
        } else if (pm25 <= 150.4) {
            aqi = Math.round(((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151);
            text = 'Unhealthy';
            color = 'bg-red-100 text-red-800';
            advice = 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.';
        } else if (pm25 <= 250.4) {
            aqi = Math.round(((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201);
            text = 'Very Unhealthy';
            color = 'bg-purple-100 text-purple-800';
            advice = 'Health alert: everyone may experience more serious health effects.';
        } else {
            aqi = Math.round(((500 - 301) / (500.4 - 250.5)) * (pm25 - 250.5) + 301);
            text = 'Hazardous';
            color = 'bg-maroon-100 text-maroon-800';
            advice = 'Health warnings of emergency conditions. The entire population is more likely to be affected.';
        }
        return { aqi, text, color, advice };
    };

    const renderPortData = (data, portName) => {
        if (!data || !data.list || !data.list[0]) return null;
        const components = data.list[0].components;
        const pm25 = components.pm2_5;
        const aqiInfo = calculateUsAqi(pm25);

        return (
            <div className="bg-white p-4 rounded-lg">
                <h4 className="font-black text-indigo-600 mb-2">{portName} Port Conditions</h4>
                <div className="flex items-center space-x-3 mb-3">
                    <span className={`px-3 py-1 text-sm font-bold rounded-full ${aqiInfo.color}`}>
                        US AQI: {aqiInfo.aqi}
                    </span>
                     <p className="text-sm font-semibold text-gray-700">{aqiInfo.text}</p>
                </div>
                <p className="text-xs text-gray-600 mb-3">{aqiInfo.advice}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><strong>PM2.5:</strong> {pm25.toFixed(2)} μg/m³</p>
                    <p><strong>O₃:</strong> {components.o3.toFixed(2)} μg/m³</p>
                    <p><strong>NO₂:</strong> {components.no2.toFixed(2)} μg/m³</p>
                    <p><strong>SO₂:</strong> {components.so2.toFixed(2)} μg/m³</p>
                </div>
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-lg border-2 border-indigo-200"
        >
            <h3 className="text-xl font-black text-primary-600 mb-3 flex items-center">
                <Leaf className="mr-2" />
                Air & Sea Conditions Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderPortData(originData, origin)}
                {renderPortData(destinationData, destination)}
            </div>
        </motion.div>
    );
};

const Weather = ({ origin, destination }) => {
    const [originWeather, setOriginWeather] = useState(null);
    const [destinationWeather, setDestinationWeather] = useState(null);
    const [originForecast, setOriginForecast] = useState(null);
    const [destinationForecast, setDestinationForecast] = useState(null);
    const [originPollution, setOriginPollution] = useState(null);
    const [destinationPollution, setDestinationPollution] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

    useEffect(() => {
        const fetchWeatherData = async () => {
            if (!API_KEY) {
                setError('API key not configured. Ensure VITE_OPENWEATHER_API_KEY is set.');
                setLoading(false);
                return;
            }
            if (!origin || !destination) return;

            try {
                setLoading(true);
                setError(null);

                const originCoords = ports[origin];
                const destinationCoords = ports[destination];

                if (!originCoords || !destinationCoords) {
                    throw new Error('Port coordinates not found');
                }

                const [
                    originResponse,
                    destinationResponse,
                    originForecastResponse,
                    destinationForecastResponse,
                    originPollutionResponse,
                    destinationPollutionResponse
                ] = await Promise.all([
                    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${originCoords.lat}&lon=${originCoords.lon}&appid=${API_KEY}&units=metric`),
                    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${destinationCoords.lat}&lon=${destinationCoords.lon}&appid=${API_KEY}&units=metric`),
                    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${originCoords.lat}&lon=${originCoords.lon}&appid=${API_KEY}&units=metric`),
                    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${destinationCoords.lat}&lon=${destinationCoords.lon}&appid=${API_KEY}&units=metric`),
                    fetch(`https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${originCoords.lat}&lon=${originCoords.lon}&appid=${API_KEY}`),
                    fetch(`https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${destinationCoords.lat}&lon=${destinationCoords.lon}&appid=${API_KEY}`)
                ]);

                const responses = [originResponse, destinationResponse, originForecastResponse, destinationForecastResponse, originPollutionResponse, destinationPollutionResponse];
                for (const res of responses) {
                    if (!res.ok) {
                        const errorData = await res.json();
                        throw new Error(errorData.message || `Failed to fetch data (status: ${res.status})`);
                    }
                }

                const originData = await originResponse.json();
                const destinationData = await destinationResponse.json();
                const originForecastData = await originForecastResponse.json();
                const destinationForecastData = await destinationForecastResponse.json();
                const originPollutionData = await originPollutionResponse.json();
                const destinationPollutionData = await destinationPollutionResponse.json();

                setOriginWeather(originData);
                setDestinationWeather(destinationData);
                setOriginForecast(originForecastData);
                setDestinationForecast(destinationForecastData);
                setOriginPollution(originPollutionData);
                setDestinationPollution(destinationPollutionData);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchWeatherData();
    }, [origin, destination, API_KEY]);

    const getWeatherIcon = (condition) => {
        const lowerCaseCondition = condition.toLowerCase();
        if (lowerCaseCondition.includes('rain') || lowerCaseCondition.includes('drizzle')) {
            return <CloudRain className="w-12 h-12 text-blue-500" />;
        } else if (lowerCaseCondition.includes('cloud')) {
            return <Cloud className="w-12 h-12 text-gray-500" />;
        } else if (lowerCaseCondition.includes('clear')) {
            return <Sun className="w-12 h-12 text-yellow-500" />;
        } else {
            return <Cloud className="w-12 h-12 text-gray-400" />;
        }
    };

    const getSeaConditions = (windSpeed) => {
        if (windSpeed > 25) return { condition: 'Rough seas', color: 'text-red-600', icon: '🌊', severity: 'high' };
        if (windSpeed > 15) return { condition: 'Moderate seas', color: 'text-yellow-600', icon: '🌊', severity: 'medium' };
        if (windSpeed > 8) return { condition: 'Slight seas', color: 'text-blue-600', icon: '🌊', severity: 'low' };
        return { condition: 'Calm seas', color: 'text-green-600', icon: '🌊', severity: 'none' };
    };

    const getShippingRecommendation = (weather) => {
        if (!weather || !weather.weather) return {};
        const windSpeed = Math.round(weather.wind.speed * 3.6);
        const visibility = weather.visibility ? Math.round(weather.visibility / 1000) : 10;
        const condition = weather.weather[0].main;

        if (condition === 'Thunderstorm' || windSpeed > 30) {
            return { text: 'High risk - Consider delaying operations', color: 'bg-red-100 text-red-800', icon: '⚠️' };
        }
        if (condition === 'Rain' || windSpeed > 20 || visibility < 3) {
            return { text: 'Moderate risk - Extra precautions needed', color: 'bg-yellow-100 text-yellow-800', icon: '⚡' };
        }
        if (windSpeed > 10 || visibility < 8) {
            return { text: 'Low risk - Normal operations with care', color: 'bg-blue-100 text-blue-800', icon: '✓' };
        }
        return { text: 'Optimal conditions - Safe for all operations', color: 'bg-green-100 text-green-800', icon: '✅' };
    };

    const WeatherGraph = () => {
        if (!originForecast || !destinationForecast || !originPollution || !destinationPollution) return null;

        const calculateAqiFromPm25 = (pm25) => {
            if (pm25 === undefined || pm25 === null) return 0;
            if (pm25 <= 12.0) return Math.round((50/12.0) * pm25);
            if (pm25 <= 35.4) return Math.round(((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51);
            if (pm25 <= 55.4) return Math.round(((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101);
            if (pm25 <= 150.4) return Math.round(((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151);
            if (pm25 <= 250.4) return Math.round(((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201);
            return Math.round(((500 - 301) / (500.4 - 250.5)) * (pm25 - 250.5) + 301);
        };
    
        const combinedData = originForecast.list.slice(0, 8).map((item, index) => {
            const destItem = destinationForecast.list[index];
            const originPollutant = originPollution.list[index];
            const destPollutant = destinationPollution.list[index];
    
            return {
                time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                originTemp: Math.round(item.main.temp),
                destinationTemp: destItem ? Math.round(destItem.main.temp) : 0,
                originHumidity: item.main.humidity,
                destinationHumidity: destItem ? destItem.main.humidity : 0,
                originWind: Math.round(item.wind.speed * 3.6),
                destinationWind: destItem ? Math.round(destItem.wind.speed * 3.6) : 0,
                originPressure: item.main.pressure,
                destinationPressure: destItem ? destItem.main.pressure : 0,
                originVisibility: item.visibility ? Math.round(item.visibility / 1000) : 10,
                destinationVisibility: destItem ? (destItem.visibility ? Math.round(destItem.visibility / 1000) : 10) : 0,
                originAqi: originPollutant ? calculateAqiFromPm25(originPollutant.components.pm2_5) : 0,
                destinationAqi: destPollutant ? calculateAqiFromPm25(destPollutant.components.pm2_5) : 0,
            };
        });

        const chartTooltipStyle = {
            contentStyle: { backgroundColor: '#333', border: '1px solid #555', color: '#fff' },
            labelStyle: { color: '#fff' },
        };

        const chartAxisStyle = { tick: { fill: '#fff' } };
        const chartLegendStyle = { wrapperStyle: { color: '#fff' } };

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="mt-6 bg-black p-6 rounded-lg border-2 border-gray-700"
            >
                <h3 className="text-2xl font-black text-white mb-6 flex items-center">
                    <BarChart3 className="w-6 h-6 mr-3" />
                    Real-Time Weather Analytics
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-800 p-4 rounded-lg shadow-sm">
                        <h4 className="font-black text-blue-400 mb-3">Temperature Trends (°C)</h4>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={combinedData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                                <XAxis dataKey="time" {...chartAxisStyle} />
                                <YAxis {...chartAxisStyle} />
                                <Tooltip {...chartTooltipStyle} />
                                <Legend {...chartLegendStyle} />
                                <Area type="monotone" dataKey="originTemp" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name={`${origin} Temp`} />
                                <Area type="monotone" dataKey="destinationTemp" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name={`${destination} Temp`} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg shadow-sm">
                        <h4 className="font-black text-cyan-400 mb-3">Wind Speed Comparison (km/h)</h4>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={combinedData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                                <XAxis dataKey="time" {...chartAxisStyle} />
                                <YAxis {...chartAxisStyle} />
                                <Tooltip {...chartTooltipStyle} />
                                <Legend {...chartLegendStyle} />
                                <Bar dataKey="originWind" fill="#06b6d4" name={`${origin} Wind`} />
                                <Bar dataKey="destinationWind" fill="#8b5cf6" name={`${destination} Wind`} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg shadow-sm">
                        <h4 className="font-black text-amber-400 mb-3">Humidity Levels (%)</h4>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={combinedData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                                <XAxis dataKey="time" {...chartAxisStyle} />
                                <YAxis {...chartAxisStyle} />
                                <Tooltip {...chartTooltipStyle} />
                                <Legend {...chartLegendStyle} />
                                <Line type="monotone" dataKey="originHumidity" stroke="#f59e0b" strokeWidth={3} name={`${origin} Humidity`} />
                                <Line type="monotone" dataKey="destinationHumidity" stroke="#ef4444" strokeWidth={3} name={`${destination} Humidity`} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg shadow-sm">
                        <h4 className="font-black text-purple-400 mb-3">Atmospheric Pressure (hPa)</h4>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={combinedData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                                <XAxis dataKey="time" {...chartAxisStyle} />
                                <YAxis domain={['dataMin - 5', 'dataMax + 5']} {...chartAxisStyle} />
                                <Tooltip {...chartTooltipStyle} />
                                <Legend {...chartLegendStyle} />
                                <Line type="monotone" dataKey="originPressure" stroke="#7c3aed" strokeWidth={2} name={`${origin} Pressure`} />
                                <Line type="monotone" dataKey="destinationPressure" stroke="#059669" strokeWidth={2} name={`${destination} Pressure`} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg shadow-sm">
                        <h4 className="font-black text-green-400 mb-3">Visibility (km)</h4>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={combinedData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                                <XAxis dataKey="time" {...chartAxisStyle} />
                                <YAxis {...chartAxisStyle} />
                                <Tooltip {...chartTooltipStyle} />
                                <Legend {...chartLegendStyle} />
                                <Area type="monotone" dataKey="originVisibility" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} name={`${origin} Visibility`} />
                                <Area type="monotone" dataKey="destinationVisibility" stackId="2" stroke="#f97316" fill="#f97316" fillOpacity={0.6} name={`${destination} Visibility`} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg shadow-sm">
                        <h4 className="font-black text-red-400 mb-3">US Air Quality Index (AQI)</h4>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={combinedData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                                <XAxis dataKey="time" {...chartAxisStyle} />
                                <YAxis domain={[0, 'dataMax + 20']} {...chartAxisStyle} />
                                <Tooltip {...chartTooltipStyle} />
                                <Legend {...chartLegendStyle} />
                                <Bar dataKey="originAqi" fill="#d946ef" name={`${origin} US AQI`} />
                                <Bar dataKey="destinationAqi" fill="#ec4899" name={`${destination} US AQI`} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </motion.div>
        );
    };

    const WeatherCard = ({ weather, location, type }) => {
        if (!weather) return null;

        const temp = Math.round(weather.main.temp);
        const feelsLike = Math.round(weather.main.feels_like);
        const condition = weather.weather[0].main;
        const description = weather.weather[0].description;
        const windSpeed = Math.round(weather.wind.speed * 3.6);
        const windDir = weather.wind.deg;
        const humidity = weather.main.humidity;
        const pressure = weather.main.pressure;
        const visibility = weather.visibility ? Math.round(weather.visibility / 1000) : 'N/A';
        const sunrise = new Date(weather.sys.sunrise * 1000);
        const sunset = new Date(weather.sys.sunset * 1000);
        const dewPoint = weather.main.temp - ((100 - weather.main.humidity) / 5);
        const seaConditions = getSeaConditions(windSpeed);
        const recommendation = getShippingRecommendation(weather);

        const getWindDirection = (deg) => {
            const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
            return directions[Math.round(deg / 22.5) % 16];
        };

        const getTempTrend = () => {
            const forecast = type === 'origin' ? originForecast : destinationForecast;
            if (!forecast || !forecast.list || forecast.list.length < 2) return null;

            const nextTemp = forecast.list[1].main.temp;
            const currentTemp = weather.main.temp;

            if (nextTemp > currentTemp + 1) return { icon: TrendingUp, text: 'Rising', color: 'text-red-500' };
            if (nextTemp < currentTemp - 1) return { icon: TrendingDown, text: 'Falling', color: 'text-blue-500' };
            return { icon: null, text: 'Stable', color: 'text-gray-500' };
        };

        const tempTrend = getTempTrend();

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 p-6 rounded-lg shadow-lg border-2 border-blue-200"
            >
                <AnimatedWeatherBackground weather={weather} />
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-2xl font-black text-primary-600 flex items-center">
                                {type === 'origin' ? '🚢' : '🏁'} {location}
                            </h3>
                            <p className="text-sm font-bold text-gray-600">{type === 'origin' ? 'Departure Port' : 'Arrival Port'}</p>
                        </div>
                        <div className="text-center">
                            {getWeatherIcon(condition)}
                            <p className="text-sm font-bold text-gray-600 mt-1 capitalize">{description}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div className="flex items-center space-x-2 p-3 bg-white/70 backdrop-blur-sm rounded-lg">
                            <Thermometer className="w-5 h-5 text-red-500" />
                            <div>
                                <p className="text-2xl font-black text-primary-600">{temp}°C</p>
                                <div className="flex items-center text-xs font-bold text-gray-500">
                                    <span>Feels {feelsLike}°C</span>
                                    {tempTrend && tempTrend.icon && (
                                        <tempTrend.icon className={`w-3 h-3 ml-1 ${tempTrend.color}`} />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 p-3 bg-white/70 backdrop-blur-sm rounded-lg">
                            <Wind className="w-5 h-5 text-blue-500" />
                            <div>
                                <p className="text-lg font-black text-primary-600">{windSpeed} km/h</p>
                                <p className="text-xs font-bold text-gray-500">{getWindDirection(windDir)}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 p-3 bg-white/70 backdrop-blur-sm rounded-lg">
                            <Droplets className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="text-lg font-black text-primary-600">{humidity}%</p>
                                <p className="text-xs font-bold text-gray-500">Humidity</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 p-3 bg-white/70 backdrop-blur-sm rounded-lg">
                            <Gauge className="w-5 h-5 text-purple-500" />
                            <div>
                                <p className="text-lg font-black text-primary-600">{pressure}</p>
                                <p className="text-xs font-bold text-gray-500">hPa</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div className="flex items-center space-x-2 p-3 bg-white/70 backdrop-blur-sm rounded-lg">
                            <Eye className="w-5 h-5 text-green-500" />
                            <div>
                                <p className="text-lg font-black text-primary-600">{visibility} km</p>
                                <p className="text-xs font-bold text-gray-500">Visibility</p>
                            </div>
                        </div>

                        <div className="p-3 bg-white/70 backdrop-blur-sm rounded-lg">
                            <div className="flex items-center space-x-2 mb-1">
                                <Sunrise className="w-4 h-4 text-orange-500" />
                                <span className="text-xs font-bold text-gray-500">Sunrise</span>
                            </div>
                            <p className="text-sm font-black text-primary-600">{sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>

                        <div className="p-3 bg-white/70 backdrop-blur-sm rounded-lg">
                            <div className="flex items-center space-x-2 mb-1">
                                <Sunset className="w-4 h-4 text-orange-600" />
                                <span className="text-xs font-bold text-gray-500">Sunset</span>
                            </div>
                            <p className="text-sm font-black text-primary-600">{sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>

                        <div className="p-3 bg-white/70 backdrop-blur-sm rounded-lg">
                            <div className="flex items-center space-x-2 mb-1">
                                <Droplets className="w-4 h-4 text-blue-400" />
                                <span className="text-xs font-bold text-gray-500">Dew Point</span>
                            </div>
                            <p className="text-sm font-black text-primary-600">{dewPoint.toFixed(1)}°C</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className={`p-3 rounded-lg border-l-4 ${seaConditions.severity === 'high' ? 'border-red-500 bg-red-50' : seaConditions.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' : seaConditions.severity === 'low' ? 'border-blue-500 bg-blue-50' : 'border-green-500 bg-green-50'}`}>
                            <div className="flex items-center space-x-2 mb-1">
                                <Waves className={`w-5 h-5 ${seaConditions.color}`} />
                                <span className="font-black text-gray-700">Sea Conditions</span>
                            </div>
                            <p className={`text-sm font-bold ${seaConditions.color}`}>
                                {seaConditions.icon} {seaConditions.condition}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                                Based on {windSpeed} km/h winds
                            </p>
                        </div>

                        <div className={`p-3 rounded-lg ${recommendation.color}`}>
                            <div className="flex items-center space-x-2 mb-1">
                                <AlertTriangle className="w-5 h-5" />
                                <span className="font-black">Shipping Advisory</span>
                            </div>
                            <p className="text-sm font-bold">
                                {recommendation.icon} {recommendation.text}
                            </p>
                            <p className="text-sm font-bold text-gray-600 mt-2">
                                {weather.weather[0].main === 'Clear' && '☀️ Perfect conditions for cargo operations'}
                                {weather.weather[0].main === 'Clouds' && '☁️ Overcast but suitable for shipping'}
                                {weather.weather[0].main === 'Rain' && '🌧️ Wet conditions - extra care needed'}
                                {weather.weather[0].main === 'Thunderstorm' && '⛈️ Severe weather - operations may be delayed'}
                                {weather.weather[0].main === 'Snow' && '❄️ Cold conditions - temperature-sensitive cargo protection required'}
                                {weather.weather[0].main === 'Fog' && '🌫️ Low visibility - potential delays in port operations'}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-amber-100 p-8 rounded-lg shadow-xl mb-8"
            >
                <div className="text-center">
                    <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-primary-600 bg-white">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading live weather and pollution data...
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-amber-100 p-8 rounded-lg shadow-xl mb-8"
        >
            <motion.div className="text-center mb-8">
                <h2 className="text-4xl font-black text-primary-600 mb-4 flex items-center justify-center">
                    <span className="mr-3">🌤️</span>
                    Live Weather Conditions
                </h2>
                <p className="text-lg font-bold text-gray-700">
                    Real-time data for optimal shipping decisions and cargo protection
                </p>
                <p className="text-sm font-bold text-gray-600 mt-2">
                    Last updated: {new Date().toLocaleString()}
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <WeatherCard
                    weather={originWeather}
                    location={origin}
                    type="origin"
                />
                <WeatherCard
                    weather={destinationWeather}
                    location={destination}
                    type="destination"
                />
            </div>
            
            <WeatherGraph />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 bg-gradient-to-r from-blue-100 to-green-100 p-8 rounded-lg border-2 border-blue-200"
            >
                <h3 className="text-xl font-black text-primary-600 mb-4 flex items-center leading-relaxed">
                    <span className="mr-2">⚠️</span>
                    Weather Impact on Shipping
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm font-bold">
                    <div className="p-4 bg-white rounded-lg min-h-[120px]">
                        <h4 className="font-black text-blue-600 mb-2 leading-relaxed">🌊 Sea Conditions</h4>
                        <p className="text-gray-700 leading-relaxed">
                            {(originWeather?.wind?.speed > 10 || destinationWeather?.wind?.speed > 10)
                                ? "Moderate to rough seas expected. Secure loading recommended."
                                : "Calm sea conditions favorable for all cargo types."}
                        </p>
                    </div>
                    <div className="p-4 bg-white rounded-lg min-h-[120px]">
                        <h4 className="font-black text-green-600 mb-2 leading-relaxed">📦 Cargo Protection</h4>
                        <p className="text-gray-700 leading-relaxed">
                            {(originWeather?.weather[0]?.main === 'Rain' || destinationWeather?.weather[0]?.main === 'Rain')
                                ? "Rain detected. Ensure waterproof covering for sensitive cargo."
                                : "Dry conditions - minimal weather protection required."}
                        </p>
                    </div>
                    <div className="p-4 bg-white rounded-lg min-h-[120px]">
                        <h4 className="font-black text-orange-600 mb-2 leading-relaxed">⏰ Operations</h4>
                        <p className="text-gray-700 leading-relaxed">
                            {(originWeather?.visibility < 5000 || destinationWeather?.visibility < 5000)
                                ? "Reduced visibility may cause port operation delays."
                                : "Clear visibility - normal port operations expected."}
                        </p>
                    </div>
                    <div className="p-4 bg-white rounded-lg min-h-[120px]">
                        <h4 className="font-black text-purple-600 mb-2 leading-relaxed">🌡️ Temperature Impact</h4>
                        <p className="text-gray-700 leading-relaxed">
                            {(originWeather?.main?.temp > 35 || destinationWeather?.main?.temp > 35)
                                ? "High temperatures - ensure proper cargo ventilation and crew safety."
                                : (originWeather?.main?.temp < 5 || destinationWeather?.main?.temp < 5)
                                    ? "Cold conditions - protect temperature-sensitive cargo and equipment."
                                    : "Moderate temperatures - ideal for most cargo operations."}
                        </p>
                    </div>
                </div>
            </motion.div>
            
            <AirPollutionInfo originData={originPollution} destinationData={destinationPollution} origin={origin} destination={destination} />

            <style>{`
            .raindrop { position: absolute; animation: rainfall linear infinite; background: linear-gradient(to bottom, rgba(59, 130, 246, 0.8), rgba(59, 130, 246, 0.3)); width: 2px; height: 15px; border-radius: 50%; }
            @keyframes rainfall { 0% { transform: translateY(-100vh); opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }
            .cloud-background { position: absolute; background: rgba(156, 163, 175, 0.4); border-radius: 50px; animation: cloudFloat ease-in-out infinite; }
            .cloud-1 { width: 100px; height: 50px; top: 20%; left: 10%; animation-duration: 8s; }
            .cloud-2 { width: 80px; height: 40px; top: 40%; right: 15%; animation-duration: 12s; animation-delay: -4s; }
            .cloud-3 { width: 90px; height: 45px; top: 60%; left: 30%; animation-duration: 10s; animation-delay: -2s; }
            @keyframes cloudFloat { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(30px); } }
            .sun-background { width: 80px; height: 80px; background: radial-gradient(circle, rgba(251, 191, 36, 0.6) 0%, rgba(251, 191, 36, 0.2) 70%); border-radius: 50%; animation: sunPulse ease-in-out infinite 3s; }
            @keyframes sunPulse { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.2); opacity: 0.8; } }
            `}</style>
        </motion.div>
    );
};

export default Weather;
