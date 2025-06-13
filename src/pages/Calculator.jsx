import { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ports } from '../data/ports';
import ImageCarousel from '../components/ImageCarousel';
import MaritimeQuotes from '../components/MaritimeQuotes';
import ShippingStats from '../components/ShippingStats';
import Features from '../components/Features';
import axios from 'axios';

const shippingMethods = {
  standard: { name: 'Standard', days: '20-25 days', rate: 1, icon: '🚢', description: 'Reliable and cost-effective shipping solution' },
  express: { name: 'Express', days: '14-16 days', rate: 1.5, icon: '⚡', description: 'Faster delivery for time-sensitive cargo' },
  premium: { name: 'Premium', days: '7-10 days', rate: 2.2, icon: '✨', description: 'Priority handling and guaranteed delivery' },
  eco: { name: 'Eco-friendly', days: '25-30 days', rate: 0.85, icon: '🌱', description: 'Reduced carbon footprint shipping option' },
};

const containerSizeMap = {
  '20ft': 20,
  '40ft': 40,
  '40ft-hc': 45
};

const containerTypes = {
  '20ft': { capacity: 33.2, base_cost: 1500, icon: '📦', description: 'A standard 20-foot container, perfect for smaller shipments and general cargo. It offers a good balance of capacity and cost-efficiency.', features: ['Ideal for small cargo', 'Easy handling', 'Cost-effective'] },
  '40ft': { capacity: 67.6, base_cost: 2800, icon: '🚛', description: 'A versatile 40-foot container, offering double the capacity of a 20ft unit. Suited for larger volumes of goods and bulk items, providing better value per cubic meter.', features: ['Double capacity', 'Perfect for bulk items', 'Better value per m³'] },
  '40ft-hc': { capacity: 76.3, base_cost: 3200, icon: '🏭', description: 'The 40-foot high cube container provides extra height, maximizing vertical space. It\'s ideal for oversized or specialized cargo that requires additional clearance.', features: ['Extra height', 'Maximum space', 'Specialized cargo'] },
};

const cargoTypes = {
  normal: { name: 'Normal', surcharge: 0, icon: '📦', description: 'Standard cargo with no special handling requirements' },
  fragile: { name: 'Fragile', surcharge: 0.15, icon: '🥚', description: 'Requires careful handling and specialized packaging' },
  perishable: { name: 'Perishable', surcharge: 0.25, icon: '🍎', description: 'Temperature-controlled environment for food and organic goods' },
  hazardous: { surcharge: 0.4, icon: '⚠️', description: 'Special permits and handling for dangerous materials' }
};

function Calculator() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [origin, setOrigin] = useState('Dubai, UAE');
  const [destination, setDestination] = useState('Singapore');
  const [weight, setWeight] = useState(200);
  const [quantity, setQuantity] = useState(1);
  const [method, setMethod] = useState('standard');
  const [containerType, setContainerType] = useState('20ft');
  const [cargoType, setCargoType] = useState('normal');
  const [costs, setCosts] = useState({});
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateDistance = (origin, destination) => {
    const R = 6371;
    const lat1 = ports[origin].lat * Math.PI / 180;
    const lat2 = ports[destination].lat * Math.PI / 180;
    const lon1 = ports[origin].lon * Math.PI / 180;
    const lon2 = ports[destination].lon * Math.PI / 180;

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const fetchPricing = async () => {
    try {
      setLoading(true);
      setError(null);

      const distance = calculateDistance(origin, destination);
      const totalWeight = weight * quantity;

      const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/predict`, {
        distance: distance,
        weight: totalWeight,
        containerSize: containerSizeMap[containerType],
        method: method,
        cargoType: cargoType
      });

      const baseCosts = response.data.costs;
      const baseTotalCost = response.data.totalCost;
      const surcharge = cargoTypes[cargoType.toLowerCase()].surcharge;

      if (surcharge > 0) {
        baseCosts['Cargo Type Surcharge'] = baseTotalCost * surcharge;
        const adjustedTotalCost = baseTotalCost * (1 + surcharge);
        setCosts(baseCosts);
        setTotalCost(adjustedTotalCost);
      } else {
        setCosts(baseCosts);
        setTotalCost(baseTotalCost);
      }

    } catch (err) {
      setError('Failed to calculate shipping cost. Please try again.');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, [origin, destination, weight, quantity, method, containerType, cargoType]);

  const distance = calculateDistance(origin, destination);
  const totalWeight = weight * quantity;
  const co2Emissions = (distance * totalWeight * 0.0395) / 1000;

  const progressData = [
    { name: 'Origin Port', cost: costs['Base Container Cost'] || 0, label: 'Departure' },
    { name: 'Documentation', cost: totalCost * 0.3 || 0, label: 'Processing' },
    { name: 'Customs', cost: totalCost * 0.6 || 0, label: 'Clearance' },
    { name: 'Transit', cost: totalCost * 0.8 || 0, label: 'Shipping' },
    { name: 'Destination', cost: totalCost || 0, label: 'Arrival' }
  ];

  const containerAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full bg-gradient-to-br from-blue-300 via-green-200 to-amber-200">
      <ImageCarousel />
      <ShippingStats />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-extrabold text-primary-800 mb-4 tracking-wide">Green Shipping Compass</h1>
          <p className="text-gray-800 text-lg font-medium leading-relaxed">Calculate eco-friendly shipping costs with real-time container and route optimization for a sustainable future.</p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 font-semibold"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </motion.div>
        )}

        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerAnimation}
          transition={{ duration: 0.5 }}
          className="bg-amber-100 p-8 rounded-xl shadow-2xl mb-8 border border-amber-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div variants={containerAnimation} className="bg-gradient-to-br from-green-50 to-amber-50 p-8 rounded-xl shadow-lg border border-green-100">
              <h2 className="text-3xl font-bold text-primary-700 mb-6 flex items-center">
                <span className="mr-3 text-4xl">🌍</span> Global Port Selection
              </h2>
              <div className="space-y-7">
                <div>
                  <label className="block text-lg font-bold text-gray-800 mb-3">Origin Port</label>
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="block w-full px-4 py-3 text-lg border-green-400 focus:outline-none focus:ring-4 focus:ring-green-200 focus:border-green-600 rounded-xl shadow-sm bg-white text-gray-900"
                  >
                    {Object.keys(ports).map(port => (
                      <option key={port} value={port}>{port}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-lg font-bold text-gray-800 mb-3">Destination Port</label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="block w-full px-4 py-3 text-lg border-green-400 focus:outline-none focus:ring-4 focus:ring-green-200 focus:border-green-600 rounded-xl shadow-sm bg-white text-gray-900"
                  >
                    {Object.keys(ports).map(port => (
                      <option key={port} value={port}>{port}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            <motion.div variants={containerAnimation} className="bg-gradient-to-br from-green-50 to-amber-50 p-8 rounded-xl shadow-lg border border-green-100">
              <h2 className="text-3xl font-bold text-primary-700 mb-6 flex items-center">
                <span className="mr-3 text-4xl">📦</span> Cargo Details
              </h2>
              <div className="space-y-7">
                <div>
                  <label className="block text-lg font-bold text-gray-800 mb-4">Container Type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {Object.entries(containerTypes).map(([type, details]) => (
                      <motion.button
                        key={type}
                        whileHover={{ scale: 1.05, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setContainerType(type)}
                        className={`p-5 rounded-xl text-center transition-all duration-300 transform border-2 ${
                          containerType === type
                            ? 'bg-blue-200 border-blue-600 shadow-xl text-blue-900'
                            : 'bg-white border-gray-200 hover:bg-amber-100 hover:border-primary-400 text-gray-800'
                        } flex flex-col items-center justify-center`}
                      >
                        <div className="text-4xl mb-2">{details.icon}</div>
                        <div className="font-extrabold text-xl mb-1">{type}</div>
                        <div className="text-lg font-medium text-gray-700 mb-2">{details.capacity}m³</div>
                        <p className="text-sm text-gray-600 leading-tight">{details.description}</p>
                        <ul className="text-xs text-gray-500 list-disc list-inside mt-2">
                          {details.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-bold text-gray-800 mb-4">Cargo Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(cargoTypes).map(([type, details]) => (
                      <motion.button
                        key={type}
                        whileHover={{ scale: 1.05, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCargoType(type)}
                        className={`p-5 rounded-xl text-center transition-all duration-300 transform border-2 ${
                          cargoType === type
                            ? 'bg-blue-200 border-blue-600 shadow-xl text-blue-900'
                            : 'bg-white border-gray-200 hover:bg-amber-100 hover:border-primary-400 text-gray-800'
                        } flex flex-col items-center justify-center`}
                      >
                        <div className="text-4xl mb-2">{details.icon}</div>
                        <div className="font-extrabold text-lg">{details.name}</div>
                        {details.surcharge > 0 && (
                          <div className="text-sm text-red-600 font-semibold mt-1">+{details.surcharge * 100}% surcharge</div>
                        )}
                        <p className="text-xs text-gray-600 mt-2 leading-tight">{details.description}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-bold text-gray-800 mb-3">
                    Weight per Item: <span className="font-extrabold text-primary-700">{weight} kg</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="1000"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full h-3 bg-primary-300 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2 font-medium">
                    <span>1 kg</span>
                    <span>500 kg</span>
                    <span>1000 kg</span>
                  </div>
                </div>
                <div>
                  <label className="block text-lg font-bold text-gray-800 mb-3">Quantity</label>
                  <div className="flex items-center space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-5 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors text-2xl font-bold"
                    >
                      -
                    </motion.button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="block w-24 text-center py-2 text-xl font-bold border-green-400 focus:outline-none focus:ring-4 focus:ring-green-200 focus:border-green-600 rounded-xl bg-white text-gray-900"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-5 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors text-2xl font-bold"
                    >
                      +
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div variants={containerAnimation} className="mt-10">
            <h2 className="text-3xl font-bold text-primary-700 mb-6 flex items-center">
              <span className="mr-3 text-4xl">🚢</span> Choose Your Shipping Method
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(shippingMethods).map(([key, value]) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMethod(key)}
                  className={`p-7 rounded-xl text-center transition-all duration-300 transform border-2 ${
                    method === key
                      ? 'bg-blue-200 border-blue-600 shadow-xl text-blue-900 scale-105'
                      : 'bg-white border-gray-200 hover:bg-amber-100 hover:border-primary-400 text-gray-800'
                  } flex flex-col items-center justify-center`}
                >
                  <div className="text-5xl mb-3">{value.icon}</div>
                  <div className="font-extrabold text-xl mb-1">{value.name}</div>
                  <div className="text-lg font-medium text-gray-700 mb-2">{value.days}</div>
                  <p className="text-sm text-gray-600 leading-tight">{value.description}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-amber-100 p-8 rounded-xl shadow-2xl mb-8 border border-amber-200"
        >
          <h2 className="text-4xl font-extrabold text-primary-800 mb-8 flex items-center justify-center">
            <span className="mr-3 text-5xl">💰</span>
            {loading ? (
              <div className="flex items-center text-primary-700">
                <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-primary-700 mr-4"></div>
                <span>Calculating Your Eco-Friendly Shipping Cost...</span>
              </div>
            ) : (
              <motion.span
                key={totalCost}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, type: "spring", damping: 10, stiffness: 100 }}
                className="text-primary-800"
              >
                Estimated Total Cost: <span className="text-green-700">${totalCost.toFixed(2)}</span>
              </motion.span>
            )}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <motion.div variants={containerAnimation} className="bg-gradient-to-br from-green-50 to-amber-50 p-7 rounded-xl shadow-lg border border-green-100">
              <h3 className="text-2xl font-bold text-primary-700 mb-5 flex items-center">
                <span className="mr-3 text-3xl">🛣️</span> Route Summary
              </h3>
              <div className="space-y-4 text-lg">
                <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                  <span className="text-primary-600 font-semibold">From:</span>
                  <span className="font-extrabold text-gray-900">{origin}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                  <span className="text-primary-600 font-semibold">To:</span>
                  <span className="font-extrabold text-gray-900">{destination}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                  <span className="text-primary-600 font-semibold">Container:</span>
                  <span className="font-extrabold text-gray-900">{containerType} ({containerTypes[containerType].capacity}m³)</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                  <span className="text-primary-600 font-semibold">Distance:</span>
                  <span className="font-extrabold text-gray-900">{distance.toLocaleString()} km</span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={containerAnimation} className="bg-gradient-to-br from-green-50 to-amber-50 p-7 rounded-xl shadow-lg border border-green-100">
              <h3 className="text-2xl font-bold text-primary-700 mb-5 flex items-center">
                <span className="mr-3 text-3xl">📊</span> Shipping Overview
              </h3>
              <div className="space-y-4 text-lg">
                <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                  <span className="text-primary-600 font-semibold">Method:</span>
                  <span className="font-extrabold text-gray-900">{shippingMethods[method].name}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                  <span className="text-primary-600 font-semibold">Cargo Type:</span>
                  <span className="font-extrabold text-gray-900">{cargoTypes[cargoType].name}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                  <span className="text-primary-600 font-semibold">Delivery:</span>
                  <span className="font-extrabold text-gray-900">{shippingMethods[method].days}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                  <span className="text-primary-600 font-semibold">Cargo:</span>
                  <span className="font-extrabold text-gray-900">{quantity} item(s) ({totalWeight} kg total)</span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={containerAnimation} className="bg-gradient-to-br from-green-50 to-amber-50 p-7 rounded-xl shadow-lg border border-green-100">
              <h3 className="text-2xl font-bold text-primary-700 mb-5 flex items-center">
                <span className="mr-3 text-3xl">🌱</span> Environmental Impact
              </h3>
              <div className="space-y-4">
                <div className="flex items-center mb-3">
                  <span className="text-primary-700 text-lg font-semibold mr-3">Eco Rating:</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`text-3xl ${
                          i < Math.round((1 - shippingMethods[method].rate * 0.2) * 5)
                            ? 'text-green-500'
                            : 'text-gray-300'
                        }`}
                      >
                        ★
                      </motion.span>
                    ))}
                  </div>
                </div>

                <div className="flex items-start justify-between p-4 bg-green-200 rounded-xl border border-green-300 shadow-inner">
                  <span className="text-green-800 text-md font-medium leading-relaxed">
                    By choosing sustainable shipping methods, you actively contribute to preserving marine ecosystems, significantly reducing carbon emissions, and protecting our precious planet for future generations. Your choice makes a difference! 🌍🌊
                  </span>
                </div>

                {method !== 'eco' && (
                  <div className="mt-5">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 5px 15px rgba(0,200,0,0.3)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setMethod('eco')}
                      className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-lg shadow-md"
                    >
                      Switch to Eco-Friendly Option
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div variants={containerAnimation} className="bg-amber-100 p-7 rounded-xl shadow-lg border border-amber-200">
              <h3 className="text-2xl font-bold text-primary-700 mb-6 flex items-center">
                <span className="mr-3 text-3xl">📈</span> Cost Progression Chart
              </h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progressData}>
                    <defs>
                      <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} style={{ fontSize: '14px', fontWeight: 'bold', fill: '#4a4a4a' }} />
                    <YAxis tickFormatter={(value) => `$${value.toFixed(0)}`} axisLine={false} tickLine={false} style={{ fontSize: '14px', fontWeight: 'bold', fill: '#4a4a4a' }} />
                    <Tooltip
                      formatter={(value, name) => [`$${value.toFixed(2)}`, name]}
                      labelFormatter={(label) => `${label} Stage`}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#fff', padding: '10px' }}
                      labelStyle={{ fontWeight: 'bold', color: '#333' }}
                      itemStyle={{ color: '#555' }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="cost"
                      name="Cumulative Cost"
                      stroke="#16a34a"
                      fillOpacity={1}
                      fill="url(#costGradient)"
                      activeDot={{ r: 8, fill: '#16a34a', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div variants={containerAnimation} className="bg-amber-100 p-7 rounded-xl shadow-lg border border-amber-200">
              <h3 className="text-2xl font-bold text-primary-700 mb-6 flex items-center">
                <span className="mr-3 text-3xl">💵</span> Detailed Cost Breakdown
              </h3>
              <div className="space-y-4">
                {Object.entries(costs).map(([key, value], index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex justify-between items-center p-4 bg-gradient-to-r from-green-100 to-amber-100 rounded-lg hover:shadow-lg transition-shadow duration-300 border border-green-200"
                  >
                    <span className="font-semibold text-gray-800">{key}</span>
                    <span className="font-extrabold text-green-700 text-lg">${value.toFixed(2)}</span>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-between items-center p-5 bg-blue-500 text-white rounded-xl font-extrabold text-xl shadow-lg mt-6"
                >
                  <span>Final Total Cost</span>
                  <span>${totalCost.toFixed(2)}</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <Features />
      <MaritimeQuotes />
    </div>
  );
}

export default Calculator;