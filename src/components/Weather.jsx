import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Sun, CloudRain, Wind, Thermometer, Droplets, Eye, Gauge, Sunrise, Sunset, Waves, AlertTriangle, TrendingUp, TrendingDown, BarChart3, Leaf } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend } from 'recharts';
import { ports } from '../data/ports';

const AnimatedWeatherBackground = ({ weather }) => {
    if (!weather) return null;

    const condition = weather.weather[0].main;
    let animationContent = null;

    switch (condition) {
        case 'Rain':
        case 'Drizzle':
            animationContent = (
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(60)].map((_, i) => (
                        <div
                            key={i}
                            className="raindrop"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 5}s`,
                                animationDuration: `${0.5 + Math.random() * 0.5}s`,
                            }}
                        />
                    ))}
                </div>
            );
            break;
        case 'Clouds':
            animationContent = (
                <div className="absolute inset-0 overflow-hidden">
                    <div className="cloud-background cloud-1" />
                    <div className="cloud-background cloud-2" />
                    <div className="cloud-background cloud-3" />
                </div>
            );
            break;
        case 'Clear':
            animationContent = (
                <div className="absolute top-0 right-0 overflow-hidden">
                    <div className="sun-background" />
                </div>
            );
            break;
        default:
            animationContent = null;
    }

    return <div className="absolute inset-0 -z-10">{animationContent}</div>;
};

const AirPollutionInfo = ({ originData, destinationData, origin, destination }) => {
    if (!originData || !destinationData) return null;

    const getAqiInfo = (aqi) => {
        switch (aqi) {
            case 1: return { text: 'Good', color: 'bg-green-100 text-green-800', advice: 'Air quality is excellent.' };
            case 2: return { text: 'Fair', color: 'bg-yellow-100 text-yellow-800', advice: 'Air quality is acceptable.' };
            case 3: return { text: 'Moderate', color: 'bg-orange-100 text-orange-800', advice: 'May affect sensitive groups.' };
            case 4: return { text: 'Poor', color: 'bg-red-100 text-red-800', advice: 'Health effects may be felt.' };
            case 5: return { text: 'Very Poor', color: 'bg-purple-100 text-purple-800', advice: 'Significant health risk.' };
            default: return { text: 'Unknown', color: 'bg-gray-100 text-gray-800', advice: 'Data not available.' };
        }
    };

    const renderPortData = (data, portName) => {
        if (!data || !data.list || !data.list[0]) return null;
        const aqi = data.list[0].main.aqi;
        const components = data.list[0].components;
        const aqiInfo = getAqiInfo(aqi);

        return (
            <div className="bg-white p-4 rounded-lg">
                <h4 className="font-black text-indigo-600 mb-2">{portName} Port Conditions</h4>
                <div className="flex items-center space-x-3 mb-3">
                    <span className={`px-3 py-1 text-sm font-bold rounded-full ${aqiInfo.color}`}>
                        AQI: {aqi} ({aqiInfo.text})
                    </span>
                    <p className="text-sm font-semibold text-gray-700">{aqiInfo.advice}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><strong>CO:</strong> {components.co.toFixed(2)} μg/m³</p>
                    <p><strong>NO₂:</strong> {components.no2.toFixed(2)} μg/m³</p>
                    <p><strong>O₃:</strong> {components.o3.toFixed(2)} μg/m³</p>
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

    const fetchWeatherData = async () => {
        if (!API_KEY) {
            setError('API key not configured. Ensure VITE_OPENWEATHER_API_KEY is set.');
            setLoading(false);
            return;
        }

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
                fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${originCoords.lat}&lon=${originCoords.lon}&appid=${API_KEY}`),
                fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${destinationCoords.lat}&lon=${destinationCoords.lon}&appid=${API_KEY}`)
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

    useEffect(() => {
        if (origin && destination) {
            fetchWeatherData();
        }
    }, [origin, destination]);

    const getWeatherIcon = (condition) => {
        if (condition.includes('rain') || condition.includes('drizzle')) {
            return <CloudRain className="w-12 h-12 text-blue-500" />;
        } else if (condition.includes('cloud')) {
            return <Cloud className="w-12 h-12 text-gray-500" />;
        } else if (condition.includes('clear')) {
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

        const combinedData = originForecast.list.slice(0, 8).map((item, index) => {
            const destItem = destinationForecast.list[index];
            const originPollutant = originPollution.list[0]?.components || {};
            const destPollutant = destinationPollution.list[0]?.components || {};

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
                originAqi: originPollution.list[0]?.main.aqi || 0,
                destinationAqi: destinationPollution.list[0]?.main.aqi || 0,
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
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
                        <h4 className="font-black text-red-400 mb-3">Air Quality Index (AQI)</h4>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={combinedData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                                <XAxis dataKey="time" {...chartAxisStyle} />
                                <YAxis domain={[0, 5]} allowDecimals={false} {...chartAxisStyle} />
                                <Tooltip {...chartTooltipStyle} />
                                <Legend {...chartLegendStyle} />
                                <Bar dataKey="originAqi" fill="#d946ef" name={`${origin} AQI`} />
                                <Bar dataKey="destinationAqi" fill="#ec4899" name={`${destination} AQI`} />
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
        const condition = weather.weather[0].main.toLowerCase();
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
                        Loading live weather data...
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
                    Real-time weather data for optimal shipping decisions and cargo protection
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
                className="mt-8 bg-gradient-to-r from-blue-100 to-green-100 p-6 rounded-lg border-2 border-blue-200"
            >
                <h3 className="text-xl font-black text-primary-600 mb-3 flex items-center">
                    <span className="mr-2">⚠️</span>
                    Weather Impact on Shipping
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm font-bold">
                    <div className="p-3 bg-white rounded-lg">
                        <h4 className="font-black text-blue-600 mb-1">🌊 Sea Conditions</h4>
                        <p className="text-gray-700">
                            {(originWeather?.wind?.speed > 10 || destinationWeather?.wind?.speed > 10)
                                ? "Moderate to rough seas expected. Secure loading recommended."
                                : "Calm sea conditions favorable for all cargo types."}
                        </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                        <h4 className="font-black text-green-600 mb-1">📦 Cargo Protection</h4>
                        <p className="text-gray-700">
                            {(originWeather?.weather[0]?.main === 'Rain' || destinationWeather?.weather[0]?.main === 'Rain')
                                ? "Rain detected. Ensure waterproof covering for sensitive cargo."
                                : "Dry conditions - minimal weather protection required."}
                        </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                        <h4 className="font-black text-orange-600 mb-1">⏰ Operations</h4>
                        <p className="text-gray-700">
                            {(originWeather?.visibility < 5000 || destinationWeather?.visibility < 5000)
                                ? "Reduced visibility may cause port operation delays."
                                : "Clear visibility - normal port operations expected."}
                        </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                        <h4 className="font-black text-purple-600 mb-1">🌡️ Temperature Impact</h4>
                        <p className="text-gray-700">
                            {(originWeather?.main?.temp > 35 || destinationWeather?.main?.temp > 35)
                                ? "High temperatures - ensure proper cargo ventilation and crew safety."
                                : (originWeather?.main?.temp < 5 || destinationWeather?.main?.temp < 5)
                                    ? "Cold conditions - protect temperature-sensitive cargo and equipment."
                                    : "Moderate temperatures - ideal for most cargo operations."}
                        </p>
                    </div>
                </div>
            </motion.div>

            <AirPollutionInfo
                originData={originPollution}
                destinationData={destinationPollution}
                origin={origin}
                destination={destination}
            />
        </motion.div>
    );
};

export default Weather;
