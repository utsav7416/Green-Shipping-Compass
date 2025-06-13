import React from 'react';
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
  '20ft': { 
    capacity: 33.2, 
    base_cost: 1500, 
    icon: '📦', 
    features: ['Ideal for small cargo', 'Easy handling', 'Cost-effective'],
    description: 'Perfect for smaller shipments and general cargo. The 20ft container is the most economical choice for businesses starting their international trade journey.',
    dimensions: '20′ × 8′ × 8′6″',
    maxWeight: '28,230 kg',
    advantages: ['Lower shipping costs', 'Easier to handle', 'Widely available', 'Perfect for LCL shipments']
  },
  '40ft': { 
    capacity: 67.6, 
    base_cost: 2800, 
    icon: '🚛', 
    features: ['Double capacity', 'Perfect for bulk items', 'Better value per m³'],
    description: 'The industry standard for most international shipments. Offers excellent value for money with double the capacity of a 20ft container.',
    dimensions: '40′ × 8′ × 8′6″',
    maxWeight: '30,480 kg',
    advantages: ['Best value per cubic meter', 'Industry standard', 'Suitable for most cargo types', 'Efficient loading']
  },
  '40ft-hc': { 
    capacity: 76.3, 
    base_cost: 3200, 
    icon: '🏭', 
    features: ['Extra height', 'Maximum space', 'Specialized cargo'],
    description: 'High cube container with an extra foot of height, perfect for lightweight but voluminous cargo and specialized equipment.',
    dimensions: '40′ × 8′ × 9′6″',
    maxWeight: '30,480 kg',
    advantages: ['Maximum cubic capacity', 'Extra height for tall items', 'Perfect for furniture & textiles', 'Premium cargo solution']
  },
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
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
             Math.cos(lat1) * Math.cos(lat2) *
             Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
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
          <h1 className="text-5xl font-black text-primary-600 mb-4">Green Shipping Compass</h1>
          <p className="text-black text-xl font-bold">Calculate eco-friendly shipping costs with real-time container and route optimization.</p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
            role="alert"
          >
            <span className="block sm:inline font-bold">{error}</span>
          </motion.div>
        )}

        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerAnimation}
          transition={{ duration: 0.5 }}
          className="bg-amber-100 p-8 rounded-lg shadow-xl mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div variants={containerAnimation} className="bg-gradient-to-br from-green-100 to-amber-100 p-6 rounded-lg">
              <h2 className="text-3xl font-black text-primary-600 mb-6 flex items-center">
                <span className="mr-2">🌍</span> Port Selection
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-black text-gray-700 mb-2">Origin Port</label>
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="block w-full pl-3 pr-10 py-3 text-base font-bold border-green-300 focus:outline-none focus:ring-green-1000 focus:border-green-1000 rounded-lg shadow-sm"
                  >
                    {Object.keys(ports).map(port => (
                      <option key={port} value={port}>{port}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-lg font-black text-gray-700 mb-2">Destination Port</label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="block w-full pl-3 pr-10 py-3 text-base font-bold border-green-300 focus:outline-none focus:ring-green-1000 focus:border-green-1000 rounded-lg shadow-sm"
                  >
                    {Object.keys(ports).map(port => (
                      <option key={port} value={port}>{port}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            <motion.div variants={containerAnimation} className="bg-gradient-to-br from-green-100 to-amber-100 p-6 rounded-lg">
              <h2 className="text-3xl font-black text-primary-600 mb-6 flex items-center">
                <span className="mr-2">📦</span> Cargo Details
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-black text-gray-700 mb-4">Container Type</label>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(containerTypes).map(([type, details]) => (
                      <motion.button
                        key={type}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setContainerType(type)}
                        className={`p-4 rounded-lg text-center transition duration-300 ${
                          containerType === type
                            ? 'bg-blue-100 border-2 border-green-1000 shadow-lg'
                            : 'bg-gray-50 border border-gray-200 hover:bg-amber-100 hover:border-primary-300'
                        }`}
                      >
                        <div className="text-2xl mb-2">{details.icon}</div>
                        <div className="font-black">{type}</div>
                        <div className="text-sm font-bold text-black">{details.capacity}m³</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-lg font-black text-gray-700 mb-4">Cargo Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(cargoTypes).map(([type, details]) => (
                      <motion.button
                        key={type}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCargoType(type)}
                        className={`p-4 rounded-lg text-center transition duration-300 ${
                          cargoType === type
                            ? 'bg-blue-100 border-2 border-green-1000 shadow-lg'
                            : 'bg-gray-50 border border-gray-200 hover:bg-amber-100 hover:border-primary-300'
                        }`}
                      >
                        <div className="text-2xl mb-2">{details.icon}</div>
                        <div className="font-black">{details.name}</div>
                        {details.surcharge > 0 && (
                          <div className="text-sm font-bold text-red-500">+{details.surcharge * 100}% surcharge</div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-lg font-black text-gray-700 mb-2">
                    Weight per Item: {weight} kg
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="1000"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full h-2 bg-primary-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm font-bold text-black mt-1">
                    <span>1 kg</span>
                    <span>500 kg</span>
                    <span>1000 kg</span>
                  </div>
                </div>
                <div>
                  <label className="block text-lg font-black text-gray-700 mb-2">Quantity</label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 bg-blue-100 rounded-lg hover:bg-primary-200 transition-colors font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="block w-20 text-center py-2 text-base font-bold border-green-300 focus:outline-none focus:ring-green-1000 focus:border-green-1000 rounded-lg"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1 bg-blue-100 rounded-lg hover:bg-primary-200 transition-colors font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div variants={containerAnimation} className="mt-8">
            <h2 className="text-3xl font-black text-primary-600 mb-6 flex items-center">
              <span className="mr-2">📋</span> Selected Container Information
            </h2>
            <div className="bg-gradient-to-br from-blue-50 to-green-50 p-6 rounded-lg border-2 border-blue-200 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-2xl font-black text-primary-600 mb-4 flex items-center">
                    {containerTypes[containerType].icon} {containerType} Container
                  </h3>
                  <p className="text-gray-700 font-bold mb-4">{containerTypes[containerType].description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                      <span className="font-black text-primary-600">Dimensions:</span>
                      <span className="font-bold">{containerTypes[containerType].dimensions}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                      <span className="font-black text-primary-600">Capacity:</span>
                      <span className="font-bold">{containerTypes[containerType].capacity} m³</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                      <span className="font-black text-primary-600">Max Weight:</span>
                      <span className="font-bold">{containerTypes[containerType].maxWeight}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xl font-black text-primary-600 mb-4">Key Advantages</h4>
                  <div className="space-y-2">
                    {containerTypes[containerType].advantages.map((advantage, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center p-2 bg-green-100 rounded-lg"
                      >
                        <span className="text-green-600 mr-2 font-bold">✓</span>
                        <span className="font-bold text-gray-700">{advantage}</span>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-4 bg-amber-100 rounded-lg border-l-4 border-amber-500">
                    <h5 className="font-black text-amber-700 mb-2">Pro Tip:</h5>
                    <p className="text-amber-700 font-bold text-sm">
                      {containerType === '20ft' && "Perfect for first-time shippers or smaller businesses. Lowest entry cost with maximum flexibility."}
                      {containerType === '40ft' && "The sweet spot for most international shipments. Offers the best balance of cost and capacity."}
                      {containerType === '40ft-hc' && "Ideal for lightweight but bulky items like furniture, textiles, or oversized equipment."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={containerAnimation} className="mt-8">
            <h2 className="text-3xl font-black text-primary-600 mb-6 flex items-center">
              <span className="mr-2">🚢</span> Shipping Method
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Object.entries(shippingMethods).map(([key, value]) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMethod(key)}
                  className={`p-6 rounded-lg text-center transition duration-300 ${
                    method === key
                      ? 'bg-blue-100 border-2 border-green-1000 shadow-lg transform scale-105'
                      : 'bg-gray-50 border border-gray-200 hover:bg-amber-100 hover:border-primary-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{value.icon}</div>
                  <div className="font-black text-lg">{value.name}</div>
                  <div className="text-md font-bold text-black mb-2">{value.days}</div>
                  <div className="text-sm font-bold text-black">{value.description}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-amber-100 p-8 rounded-lg shadow-xl mb-8"
        >
          <h2 className="text-4xl font-black text-primary-600 mb-8 flex items-center justify-center">
            <span className="mr-2">💰</span> 
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mr-3"></div>
                <span className="font-black">Calculating...</span>
              </div>
            ) : (
              <motion.span
                key={totalCost}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="font-black"
              >
                Estimated Cost: ${totalCost.toFixed(2)}
              </motion.span>
            )}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <motion.div variants={containerAnimation} className="bg-gradient-to-br from-green-100 to-amber-100 p-6 rounded-lg shadow-md">
              <h3 className="font-black text-xl mb-4 flex items-center">
                <span className="mr-2">🛣️</span> Route Details
              </h3>
              <div className="space-y-3 text-md">
                <div className="flex items-center justify-between p-2 hover:bg-blue-100 rounded-lg">
                  <span className="text-primary-600 font-black">From:</span>
                  <span className="font-bold">{origin}</span>
                </div>
                <div className="flex items-center justify-between p-2 hover:bg-blue-100 rounded-lg">
                  <span className="text-primary-600 font-black">To:</span>
                  <span className="font-bold">{destination}</span>
                </div>
                <div className="flex items-center justify-between p-2 hover:bg-blue-100 rounded-lg">
                  <span className="text-primary-600 font-black">Container:</span>
                  <span className="font-bold">{containerType} ({containerTypes[containerType].capacity}m³)</span>
                </div>
                <div className="flex items-center justify-between p-2 hover:bg-blue-100 rounded-lg">
                  <span className="text-primary-600 font-black">Distance:</span>
                  <span className="font-bold">{distance.toLocaleString()} km</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={containerAnimation} className="bg-gradient-to-br from-green-100 to-amber-100 p-6 rounded-lg shadow-md">
              <h3 className="font-black text-xl mb-4 flex items-center">
                <span className="mr-2">📊</span> Shipping Details
              </h3>
              <div className="space-y-3 text-md">
                <div className="flex items-center justify-between p-2 hover:bg-blue-100 rounded-lg">
                  <span className="text-primary-600 font-black">Method:</span>
                  <span className="font-bold">{shippingMethods[method].name}</span>
                </div>
                <div className="flex items-center justify-between p-2 hover:bg-blue-100 rounded-lg">
                  <span className="text-primary-600 font-black">Cargo Type:</span>
                  <span className="font-bold">{cargoTypes[cargoType].name}</span>
                </div>
                <div className="flex items-center justify-between p-2 hover:bg-blue-100 rounded-lg">
                  <span className="text-primary-600 font-black">Delivery:</span>
                  <span className="font-bold">{shippingMethods[method].days}</span>
                </div>
                <div className="flex items-center justify-between p-2 hover:bg-blue-100 rounded-lg">
                  <span className="text-primary-600 font-black">Cargo:</span>
                  <span className="font-bold">{quantity} item(s) ({totalWeight} kg total)</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={containerAnimation} className="bg-gradient-to-br from-green-100 to-amber-100 p-6 rounded-lg shadow-md">
              <h3 className="font-black text-xl mb-4 flex items-center">
                <span className="mr-2">🌱</span> Environmental Impact
              </h3>
              <div className="space-y-3">
                <div className="flex items-center mb-2">
                  <span className="text-primary-600 mr-2 font-black">Eco Rating:</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`text-xl ${
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

                <div className="flex items-start justify-between p-3 bg-green-100 rounded-lg border border-green-200">
                  <span className="text-green-700 text-md font-bold leading-relaxed">
                    Choosing sustainable shipping methods helps preserve marine ecosystems, reduce emissions, and protect our planet for future generations. 🌍🌊
                  </span>
                </div>

                {method !== 'eco' && (
                  <div className="mt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setMethod('eco')}
                      className="w-full py-2 bg-green-1000 text-black font-black rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Switch to Eco-Friendly
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div variants={containerAnimation} className="bg-amber-100 p-6 rounded-lg shadow-md">
              <h3 className="font-black text-xl mb-6 flex items-center">
                <span className="mr-2">📈</span> Cost Progression
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progressData}>
                    <defs>
                      <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="cost"
                      name="Cumulative Cost ($)"
                      stroke="#22c55e"
                      fillOpacity={1}
                      fill="url(#costGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div variants={containerAnimation} className="bg-amber-100 p-6 rounded-lg shadow-md">
              <h3 className="font-black text-xl mb-6 flex items-center">
                <span className="mr-2">💵</span> Cost Breakdown
              </h3>
              <div className="space-y-4">
                {Object.entries(costs).map(([key, value], index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex justify-between items-center p-3 bg-gradient-to-r from-green-100 to-amber-100 rounded-lg hover:shadow-md"
                  >
                    <span className="font-black">{key}</span>
                    <span className="font-black">${value.toFixed(2)}</span>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-between items-center p-4 bg-blue-100 rounded-lg font-black text-xl"
                >
                  <span>Total Cost</span>
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