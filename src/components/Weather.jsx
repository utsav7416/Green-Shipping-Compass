import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Sun, CloudRain, Wind, Thermometer, Droplets, Eye, Gauge, Sunrise, Sunset, Waves, AlertTriangle, TrendingUp, TrendingDown, BarChart3, Leaf, Zap, Snowflake } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend } from 'recharts';
import { ports } from '../data/ports';

const AnimatedWeatherBackground = ({ weather }) => {
    if (!weather) return null;
    const condition = weather.weather[0].main;
    
    const rainVariants = { animate: { y: [0, 100], transition: { duration: 0.5, repeat: Infinity, ease: "linear" } } };
    const cloudVariants = { animate: { x: [-50, 100], transition: { duration: 20, repeat: Infinity, ease: "linear" } } };
    const sunVariants = { animate: { rotate: 360, transition: { duration: 30, repeat: Infinity, ease: "linear" } } };

    switch (condition) {
        case 'Rain': case 'Drizzle':
            return (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(40)].map((_, i) => (
                        <motion.div key={i} className="absolute w-0.5 h-8 bg-blue-400 opacity-60 rounded-full"
                            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * -20}%` }}
                            variants={rainVariants} animate="animate" initial={{ y: -100 }} />
                    ))}
                </div>
            );
        case 'Clouds':
            return (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(3)].map((_, i) => (
                        <motion.div key={i} className="absolute w-20 h-12 bg-gray-200 rounded-full opacity-30"
                            style={{ top: `${20 + i * 15}%`, left: `${-10 + i * 30}%` }}
                            variants={cloudVariants} animate="animate" initial={{ x: -100 }} />
                    ))}
                </div>
            );
        case 'Clear':
            return (
                <div className="absolute top-4 right-4 overflow-hidden pointer-events-none">
                    <motion.div className="w-16 h-16 bg-yellow-300 rounded-full opacity-40" variants={sunVariants} animate="animate"
                        style={{ background: 'radial-gradient(circle, rgba(255,255,0,0.4) 0%, rgba(255,255,0,0.1) 70%)' }} />
                </div>
            );
        default: return null;
    }
};

const AirPollutionInfo = ({ originData, destinationData, origin, destination }) => {
    if (!originData || !destinationData) return null;

    const calculateUsAqi = (pm25) => {
        if (pm25 === undefined || pm25 === null) return { aqi: 'N/A', text: 'Unknown', color: 'bg-gray-100 text-gray-800', advice: 'PM2.5 data not available.' };
        let aqi, text, color, advice;
        if (pm25 <= 12.0) { aqi = Math.round((50/12.0) * pm25); text = 'Good'; color = 'bg-green-100 text-green-800'; advice = 'Air quality is considered satisfactory, and air pollution poses little or no risk.'; }
        else if (pm25 <= 35.4) { aqi = Math.round(((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51); text = 'Moderate'; color = 'bg-yellow-100 text-yellow-800'; advice = 'Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution.'; }
        else if (pm25 <= 55.4) { aqi = Math.round(((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101); text = 'Unhealthy for Sensitive Groups'; color = 'bg-orange-100 text-orange-800'; advice = 'Members of sensitive groups may experience health effects. The general public is not likely to be affected.'; }
        else if (pm25 <= 150.4) { aqi = Math.round(((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151); text = 'Unhealthy'; color = 'bg-red-100 text-red-800'; advice = 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.'; }
        else if (pm25 <= 250.4) { aqi = Math.round(((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201); text = 'Very Unhealthy'; color = 'bg-purple-100 text-purple-800'; advice = 'Health alert: everyone may experience more serious health effects.'; }
        else { aqi = Math.round(((500 - 301) / (500.4 - 250.5)) * (pm25 - 250.5) + 301); text = 'Hazardous'; color = 'bg-red-200 text-red-900'; advice = 'Health warnings of emergency conditions. The entire population is more likely to be affected.'; }
        return { aqi, text, color, advice };
    };

    const renderPortData = (data, portName) => {
        if (!data || !data.list || !data.list[0]) return null;
        const components = data.list[0].components; const pm25 = components.pm2_5; const aqiInfo = calculateUsAqi(pm25);

        return (
            <motion.div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-indigo-500"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} whileHover={{ scale: 1.02 }}>
                <h4 className="font-black text-indigo-600 mb-3 text-lg">{portName} Port Conditions</h4>
                <motion.div className="flex items-center space-x-3 mb-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <motion.span className={`px-3 py-1 text-sm font-bold rounded-full ${aqiInfo.color}`} whileHover={{ scale: 1.05 }}>US AQI: {aqiInfo.aqi}</motion.span>
                    <p className="text-sm font-semibold text-gray-700">{aqiInfo.text}</p>
                </motion.div>
                <motion.p className="text-xs text-gray-600 mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>{aqiInfo.advice}</motion.p>
                <motion.div className="grid grid-cols-2 gap-3 text-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <div className="bg-gray-50 p-2 rounded"><strong>PM2.5:</strong> {pm25.toFixed(2)} μg/m³</div>
                    <div className="bg-gray-50 p-2 rounded"><strong>O₃:</strong> {components.o3.toFixed(2)} μg/m³</div>
                    <div className="bg-gray-50 p-2 rounded"><strong>NO₂:</strong> {components.no2.toFixed(2)} μg/m³</div>
                    <div className="bg-gray-50 p-2 rounded"><strong>SO₂:</strong> {components.so2.toFixed(2)} μg/m³</div>
                </motion.div>
            </motion.div>
        );
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-6 bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-lg border-2 border-indigo-200 shadow-xl">
            <motion.h3 className="text-xl font-black text-indigo-700 mb-4 flex items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                <Leaf className="mr-2" />Air & Sea Conditions Analysis
            </motion.h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderPortData(originData, origin)}
                {renderPortData(destinationData, destination)}
            </div>
        </motion.div>
    );
};

const Weather = ({ origin, destination }) => {
    const [originWeather, setOriginWeather] = useState(null); const [destinationWeather, setDestinationWeather] = useState(null);
    const [originForecast, setOriginForecast] = useState(null); const [destinationForecast, setDestinationForecast] = useState(null);
    const [originPollution, setOriginPollution] = useState(null); const [destinationPollution, setDestinationPollution] = useState(null);
    const [loading, setLoading] = useState(true); const [error, setError] = useState(null);
    const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

    useEffect(() => {
        const fetchWeatherData = async () => {
            if (!API_KEY) { setError('API key not configured. Ensure VITE_OPENWEATHER_API_KEY is set.'); setLoading(false); return; }
            if (!origin || !destination) return;

            try {
                setLoading(true); setError(null);
                const originCoords = ports[origin]; const destinationCoords = ports[destination];
                if (!originCoords || !destinationCoords) throw new Error('Port coordinates not found');

                const [originResponse, destinationResponse, originForecastResponse, destinationForecastResponse, originPollutionResponse, destinationPollutionResponse] = await Promise.all([
                    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${originCoords.lat}&lon=${originCoords.lon}&appid=${API_KEY}&units=metric`),
                    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${destinationCoords.lat}&lon=${destinationCoords.lon}&appid=${API_KEY}&units=metric`),
                    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${originCoords.lat}&lon=${originCoords.lon}&appid=${API_KEY}&units=metric`),
                    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${destinationCoords.lat}&lon=${destinationCoords.lon}&appid=${API_KEY}&units=metric`),
                    fetch(`https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${originCoords.lat}&lon=${originCoords.lon}&appid=${API_KEY}`),
                    fetch(`https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${destinationCoords.lat}&lon=${destinationCoords.lon}&appid=${API_KEY}`)
                ]);

                const responses = [originResponse, destinationResponse, originForecastResponse, destinationForecastResponse, originPollutionResponse, destinationPollutionResponse];
                for (const res of responses) { if (!res.ok) { const errorData = await res.json(); throw new Error(errorData.message || `Failed to fetch data (status: ${res.status})`); } }

                const [originData, destinationData, originForecastData, destinationForecastData, originPollutionData, destinationPollutionData] = await Promise.all([
                    originResponse.json(), destinationResponse.json(), originForecastResponse.json(), destinationForecastResponse.json(), originPollutionResponse.json(), destinationPollutionResponse.json()
                ]);

                setOriginWeather(originData); setDestinationWeather(destinationData); setOriginForecast(originForecastData); setDestinationForecast(destinationForecastData);
                setOriginPollution(originPollutionData); setDestinationPollution(destinationPollutionData);
            } catch (err) { setError(err.message); } finally { setLoading(false); }
        };
        fetchWeatherData();
    }, [origin, destination, API_KEY]);

    const getWeatherIcon = (condition) => {
        const lowerCaseCondition = condition.toLowerCase(); const iconProps = { className: "w-12 h-12" };
        if (lowerCaseCondition.includes('rain') || lowerCaseCondition.includes('drizzle')) return <CloudRain {...iconProps} className="w-12 h-12 text-blue-500" />;
        else if (lowerCaseCondition.includes('cloud')) return <Cloud {...iconProps} className="w-12 h-12 text-gray-500" />;
        else if (lowerCaseCondition.includes('clear')) return <Sun {...iconProps} className="w-12 h-12 text-yellow-500" />;
        else if (lowerCaseCondition.includes('snow')) return <Snowflake {...iconProps} className="w-12 h-12 text-blue-300" />;
        else if (lowerCaseCondition.includes('thunderstorm')) return <Zap {...iconProps} className="w-12 h-12 text-purple-500" />;
        else return <Cloud {...iconProps} className="w-12 h-12 text-gray-400" />;
    };

    const getSeaConditions = (windSpeed) => {
        if (windSpeed > 25) return { condition: 'Rough seas', color: 'text-red-600', icon: '🌊', severity: 'high' };
        if (windSpeed > 15) return { condition: 'Moderate seas', color: 'text-yellow-600', icon: '🌊', severity: 'medium' };
        if (windSpeed > 8) return { condition: 'Slight seas', color: 'text-blue-600', icon: '🌊', severity: 'low' };
        return { condition: 'Calm seas', color: 'text-green-600', icon: '🌊', severity: 'none' };
    };

    const getShippingRecommendation = (weather) => {
        if (!weather || !weather.weather) return {};
        const windSpeed = Math.round(weather.wind.speed * 3.6); const visibility = weather.visibility ? Math.round(weather.visibility / 1000) : 10; const condition = weather.weather[0].main;
        if (condition === 'Thunderstorm' || windSpeed > 30) return { text: 'High risk - Consider delaying operations', color: 'bg-red-100 text-red-800', icon: '⚠️' };
        if (condition === 'Rain' || windSpeed > 20 || visibility < 3) return { text: 'Moderate risk - Extra precautions needed', color: 'bg-yellow-100 text-yellow-800', icon: '⚡' };
        if (windSpeed > 10 || visibility < 8) return { text: 'Low risk - Normal operations with care', color: 'bg-blue-100 text-blue-800', icon: '✓' };
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
            const destItem = destinationForecast.list[index]; const originPollutant = originPollution.list[index]; const destPollutant = destinationPollution.list[index];
            return {
                time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                originTemp: Math.round(item.main.temp), destinationTemp: destItem ? Math.round(destItem.main.temp) : 0,
                originHumidity: item.main.humidity, destinationHumidity: destItem ? destItem.main.humidity : 0,
                originWind: Math.round(item.wind.speed * 3.6), destinationWind: destItem ? Math.round(destItem.wind.speed * 3.6) : 0,
                originPressure: item.main.pressure, destinationPressure: destItem ? destItem.main.pressure : 0,
                originVisibility: item.visibility ? Math.round(item.visibility / 1000) : 10, destinationVisibility: destItem ? (destItem.visibility ? Math.round(destItem.visibility / 1000) : 10) : 0,
                originAqi: originPollutant ? calculateAqiFromPm25(originPollutant.components.pm2_5) : 0, destinationAqi: destPollutant ? calculateAqiFromPm25(destPollutant.components.pm2_5) : 0,
            };
        });

        const chartTooltipStyle = { contentStyle: { backgroundColor: '#333', border: '1px solid #555', color: '#fff' }, labelStyle: { color: '#fff' } };
        const chartAxisStyle = { tick: { fill: '#fff' } }; const chartLegendStyle = { wrapperStyle: { color: '#fff' } };

        const chartConfigs = [
            { title: 'Temperature Trends (°C)', color: 'blue-400', type: 'area', data1: 'originTemp', data2: 'destinationTemp', color1: '#3b82f6', color2: '#10b981' },
            { title: 'Wind Speed Comparison (km/h)', color: 'cyan-400', type: 'bar', data1: 'originWind', data2: 'destinationWind', color1: '#06b6d4', color2: '#8b5cf6' },
            { title: 'Humidity Levels (%)', color: 'amber-400', type: 'line', data1: 'originHumidity', data2: 'destinationHumidity', color1: '#f59e0b', color2: '#ef4444' },
            { title: 'Atmospheric Pressure (hPa)', color: 'purple-400', type: 'line', data1: 'originPressure', data2: 'destinationPressure', color1: '#7c3aed', color2: '#059669' },
            { title: 'Visibility (km)', color: 'green-400', type: 'area', data1: 'originVisibility', data2: 'destinationVisibility', color1: '#22c55e', color2: '#f97316' },
            { title: 'US Air Quality Index (AQI)', color: 'red-400', type: 'bar', data1: 'originAqi', data2: 'destinationAqi', color1: '#d946ef', color2: '#ec4899' }
        ];

        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
                className="mt-6 bg-black p-6 rounded-lg border-2 border-gray-700">
                <h3 className="text-2xl font-black text-white mb-6 flex items-center"><BarChart3 className="w-6 h-6 mr-3" />Real-Time Weather Analytics</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {chartConfigs.map((config, index) => (
                        <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-sm">
                            <h4 className={`font-black text-${config.color} mb-3`}>{config.title}</h4>
                            <ResponsiveContainer width="100%" height={200}>
                                {config.type === 'area' ? (
                                    <AreaChart data={combinedData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                                        <XAxis dataKey="time" {...chartAxisStyle} />
                                        <YAxis {...chartAxisStyle} />
                                        <Tooltip {...chartTooltipStyle} />
                                        <Legend {...chartLegendStyle} />
                                        <Area type="monotone" dataKey={config.data1} stackId="1" stroke={config.color1} fill={config.color1} fillOpacity={0.6} name={`${origin} ${config.title.split(' ')[0]}`} />
                                        <Area type="monotone" dataKey={config.data2} stackId="2" stroke={config.color2} fill={config.color2} fillOpacity={0.6} name={`${destination} ${config.title.split(' ')[0]}`} />
                                    </AreaChart>
                                ) : config.type === 'bar' ? (
                                    <BarChart data={combinedData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                                        <XAxis dataKey="time" {...chartAxisStyle} />
                                        <YAxis {...chartAxisStyle} />
                                        <Tooltip {...chartTooltipStyle} />
                                        <Legend {...chartLegendStyle} />
                                        <Bar dataKey={config.data1} fill={config.color1} name={`${origin} ${config.title.split(' ')[0]}`} />
                                        <Bar dataKey={config.data2} fill={config.color2} name={`${destination} ${config.title.split(' ')[0]}`} />
                                    </BarChart>
                                ) : (
                                    <LineChart data={combinedData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                                        <XAxis dataKey="time" {...chartAxisStyle} />
                                        <YAxis domain={config.data1.includes('Pressure') ? ['dataMin - 5', 'dataMax + 5'] : undefined} {...chartAxisStyle} />
                                        <Tooltip {...chartTooltipStyle} />
                                        <Legend {...chartLegendStyle} />
                                        <Line type="monotone" dataKey={config.data1} stroke={config.color1} strokeWidth={config.data1.includes('Pressure') ? 2 : 3} name={`${origin} ${config.title.split(' ')[0]}`} />
                                        <Line type="monotone" dataKey={config.data2} stroke={config.color2} strokeWidth={config.data1.includes('Pressure') ? 2 : 3} name={`${destination} ${config.title.split(' ')[0]}`} />
                                    </LineChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    ))}
                </div>
            </motion.div>
        );
    };

    const WeatherCard = ({ weather, location, type }) => {
        if (!weather) return null;

        const temp = Math.round(weather.main.temp); const feelsLike = Math.round(weather.main.feels_like); const condition = weather.weather[0].main; const description = weather.weather[0].description;
        const windSpeed = Math.round(weather.wind.speed * 3.6); const windDir = weather.wind.deg; const humidity = weather.main.humidity; const pressure = weather.main.pressure;
        const visibility = weather.visibility ? Math.round(weather.visibility / 1000) : 'N/A'; const sunrise = new Date(weather.sys.sunrise * 1000); const sunset = new Date(weather.sys.sunset * 1000);
        const dewPoint = weather.main.temp - ((100 - weather.main.humidity) / 5); const seaConditions = getSeaConditions(windSpeed); const recommendation = getShippingRecommendation(weather);

        const getWindDirection = (deg) => {
            const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
            return directions[Math.round(deg / 22.5) % 16];
        };

        const getTempTrend = () => {
            const forecast = type === 'origin' ? originForecast : destinationForecast;
            if (!forecast || !forecast.list || forecast.list.length < 2) return null;
            const nextTemp = forecast.list[1].main.temp; const currentTemp = weather.main.temp;
            if (nextTemp > currentTemp + 1) return { icon: TrendingUp, text: 'Rising', color: 'text-red-500' };
            if (nextTemp < currentTemp - 1) return { icon: TrendingDown, text: 'Falling', color: 'text-blue-500' };
            return { icon: null, text: 'Stable', color: 'text-gray-500' };
        };

        const tempTrend = getTempTrend();

        const weatherMetrics = [
            { icon: Thermometer, value: `${temp}°C`, subValue: `Feels ${feelsLike}°C`, color: 'text-red-500', trend: tempTrend },
            { icon: Wind, value: `${windSpeed} km/h`, subValue: getWindDirection(windDir), color: 'text-blue-500' },
            { icon: Droplets, value: `${humidity}%`, subValue: 'Humidity', color: 'text-blue-600' },
            { icon: Gauge, value: pressure, subValue: 'hPa', color: 'text-purple-500' },
            { icon: Eye, value: `${visibility} km`, subValue: 'Visibility', color: 'text-green-500' },
            { icon: Sunrise, value: sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), subValue: 'Sunrise', color: 'text-orange-500' },
            { icon: Sunset, value: sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), subValue: 'Sunset', color: 'text-orange-600' },
            { icon: Droplets, value: `${dewPoint.toFixed(1)}°C`, subValue: 'Dew Point', color: 'text-blue-400' }
        ];

        return (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: type === 'origin' ? 0.2 : 0.4 }}
                className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-xl shadow-2xl border-2 border-blue-200"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}>
                <AnimatedWeatherBackground weather={weather} />
                <div className="relative z-10">
                    <motion.div className="flex items-center justify-between mb-4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                        <div>
                            <h3 className="text-2xl font-black text-indigo-700 flex items-center">{type === 'origin' ? '🚢' : '🏁'} {location}</h3>
                            <p className="text-sm font-bold text-gray-600">{type === 'origin' ? 'Departure Port' : 'Arrival Port'}</p>
                        </div>
                        <motion.div className="text-center" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} whileHover={{ scale: 1.1 }}>
                            {getWeatherIcon(condition)}
                            <p className="text-sm font-bold text-gray-600 mt-1 capitalize">{description}</p>
                        </motion.div>
                    </motion.div>

                    <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                        {weatherMetrics.slice(0, 4).map((metric, index) => (
                            <motion.div key={index} className="flex items-center space-x-2 p-3 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm"
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                                <metric.icon className={`w-5 h-5 ${metric.color}`} />
                                <div>
                                    <p className="text-2xl font-black text-indigo-700">{metric.value}</p>
                                    <div className="flex items-center text-xs font-bold text-gray-500">
                                        <span>{metric.subValue}</span>
                                        {metric.trend && metric.trend.icon && <metric.trend.icon className={`w-3 h-3 ml-1 ${metric.trend.color}`} />}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                        {weatherMetrics.slice(4).map((metric, index) => (
                            <motion.div key={index} className="p-3 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm"
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                                <div className="flex items-center space-x-2 mb-1">
                                    <metric.icon className={`w-4 h-4 ${metric.color}`} />
                                    <span className="text-xs font-bold text-gray-500">{metric.subValue}</span>
                                </div>
                                <p className="text-sm font-black text-indigo-700">{metric.value}</p>
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                        <motion.div className={`p-4 rounded-lg border-l-4 ${seaConditions.severity === 'high' ? 'border-red-500 bg-red-50' : seaConditions.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' : seaConditions.severity === 'low' ? 'border-blue-500 bg-blue-50' : 'border-green-500 bg-green-50'} shadow-sm`} whileHover={{ scale: 1.02 }}>
                            <div className="flex items-center space-x-2 mb-2">
                                <Waves className={`w-5 h-5 ${seaConditions.color}`} />
                                <span className="font-black text-gray-700">Sea Conditions</span>
                            </div>
                            <p className={`text-sm font-bold ${seaConditions.color}`}>{seaConditions.icon} {seaConditions.condition}</p>
                            <p className="text-xs text-gray-600 mt-1">Based on {windSpeed} km/h winds</p>
                        </motion.div>

                        <motion.div className={`p-4 rounded-lg ${recommendation.color} shadow-sm`} whileHover={{ scale: 1.02 }}>
                            <div className="flex items-center space-x-2 mb-2">
                                <AlertTriangle className="w-5 h-5" />
                                <span className="font-black">Shipping Advisory</span>
                            </div>
                            <p className="text-sm font-bold">{recommendation.icon} {recommendation.text}</p>
                            <p className="text-sm font-bold text-gray-600 mt-2">
                                {weather.weather[0].main === 'Clear' && '☀️ Perfect conditions for cargo operations'}
                                {weather.weather[0].main === 'Clouds' && '☁️ Overcast but suitable for shipping'}
                                {weather.weather[0].main === 'Rain' && '🌧️ Wet conditions - extra care needed'}
                                {weather.weather[0].main === 'Thunderstorm' && '⛈️ Severe weather - operations may be delayed'}
                                {weather.weather[0].main === 'Snow' && '❄️ Cold conditions - temperature-sensitive cargo protection required'}
                                {weather.weather[0].main === 'Fog' && '🌫️ Low visibility - potential delays in port operations'}
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        );
    };

    if (loading) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
                className="bg-amber-100 p-8 rounded-lg shadow-xl mb-8">
                <div className="text-center">
                    <motion.div className="inline-flex items-center px-6 py-3 font-semibold leading-6 text-lg shadow-lg rounded-lg text-indigo-700 bg-white"
                        animate={{ scale: [1, 1.05, 1], boxShadow: ["0 4px 6px -1px rgba(0, 0, 0, 0.1)", "0 10px 15px -3px rgba(0, 0, 0, 0.1)", "0 4px 6px -1px rgba(0, 0, 0, 0.1)"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                        <motion.svg className="w-6 h-6 mr-3 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </motion.svg>
                        Loading live weather and pollution data...
                    </motion.div>
                </div>
            </motion.div>
        );
    }
    
    if (error) {
        return (
            <motion.div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg relative mb-8 shadow-lg" role="alert"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </motion.div>
        )
    }

    const impactItems = [
        { title: '🌊 Sea Conditions', content: (originWeather?.wind?.speed > 10 || destinationWeather?.wind?.speed > 10) ? "Moderate to rough seas expected. Secure loading recommended." : "Calm sea conditions favorable for all cargo types.", color: 'blue' },
        { title: '📦 Cargo Protection', content: (originWeather?.weather[0]?.main === 'Rain' || destinationWeather?.weather[0]?.main === 'Rain') ? "Rain detected. Ensure waterproof covering for sensitive cargo." : "Dry conditions - minimal weather protection required.", color: 'green' },
        { title: '⏰ Operations', content: (originWeather?.visibility < 5000 || destinationWeather?.visibility < 5000) ? "Reduced visibility may cause port operation delays." : "Clear visibility - normal port operations expected.", color: 'orange' },
        { title: '🌡️ Temperature Impact', content: (originWeather?.main?.temp > 35 || destinationWeather?.main?.temp > 35) ? "High temperatures - ensure proper cargo ventilation and crew safety." : (originWeather?.main?.temp < 5 || destinationWeather?.main?.temp < 5) ? "Cold conditions - protect temperature-sensitive cargo and equipment." : "Moderate temperatures - ideal for most cargo operations.", color: 'purple' }
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-amber-50 via-amber-100 to-orange-100 p-8 rounded-xl shadow-2xl mb-8 border-2 border-amber-200">
            <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <motion.h2 className="text-4xl font-black text-indigo-700 mb-4 flex items-center justify-center" whileHover={{ scale: 1.05 }}>
                    <motion.span className="mr-3" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>🌤️</motion.span>
                    Live Weather Conditions
                </motion.h2>
                <p className="text-lg font-bold text-gray-700">Real-time data for optimal shipping decisions and cargo protection</p>
                <p className="text-sm font-bold text-gray-600 mt-2">Last updated: {new Date().toLocaleString()}</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <WeatherCard weather={originWeather} location={origin} type="origin" />
                <WeatherCard weather={destinationWeather} location={destination} type="destination" />
            </div>

            <WeatherGraph />
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                className="mt-8 bg-gradient-to-r from-blue-100 to-green-100 p-6 rounded-xl border-2 border-blue-200 shadow-lg">
                <motion.h3 className="text-xl font-black text-indigo-700 mb-4 flex items-center" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}>
                    <motion.span className="mr-2" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>⚠️</motion.span>
                    Weather Impact on Shipping
                </motion.h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm font-bold">
                    {impactItems.map((item, index) => (
                        <motion.div key={index} className="p-4 bg-white rounded-lg shadow-md border-l-4 border-blue-500"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 + index * 0.1 }} whileHover={{ scale: 1.03, y: -2 }}>
                            <h4 className={`font-black text-${item.color}-600 mb-2`}>{item.title}</h4>
                            <p className="text-gray-700">{item.content}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            <AirPollutionInfo originData={originPollution} destinationData={destinationPollution} origin={origin} destination={destination} />
        </motion.div>
    );
};

export default Weather;