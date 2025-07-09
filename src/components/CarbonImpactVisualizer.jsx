import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const CO2_EQUIVALENCIES = {
  car_km: 0.121,
  smartphones: 8.3,
  tree_year: 21,
};

const ImpactCard = ({ icon, value, unit, label, description, color }) => {
  const colorClass = `text-${color}-400`;

  return (
    <motion.div
      className="bg-gray-900 p-5 rounded-lg text-center flex-1 border border-gray-700 flex flex-col"
      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex-grow">
        <div className={`text-5xl mb-3 ${colorClass}`}>{icon}</div>
        <p className={`text-4xl font-black text-white`}>{value}</p>
        <p className={`text-lg font-bold text-gray-300`}>{unit}</p>
        <p className="text-sm text-gray-400 mt-2">{label}</p>
      </div>
      <p className="text-base text-white font-semibold mt-4 pt-4 border-t border-gray-800">{description}</p>
  </motion.div>
  );
};

export default function CarbonImpactVisualizer({ carbonFootprint, ecoFootprint, ecoRating, onSwitchToEco }) {
  const savings = carbonFootprint - ecoFootprint;
  const isEcoSelected = carbonFootprint <= ecoFootprint;

  const comparisonData = [
    { name: 'Your Selection', emissions: carbonFootprint, fill: isEcoSelected ? '#22c55e' : '#ef4444' },
    { name: 'Eco Option', emissions: ecoFootprint, fill: '#22c55e' },
  ];
  
  const savingsBreakdownData = [
    { name: 'CO₂ Savings', value: Math.max(0, savings) },
    { name: 'Remaining CO₂', value: isEcoSelected ? carbonFootprint : ecoFootprint },
  ];
  const SAVINGS_COLORS = ['#22c55e', '#374151'];

  const treesNeeded = Math.ceil(Math.max(0, savings) / CO2_EQUIVALENCIES.tree_year);
  const yearsToAbsorb = savings > 0 && treesNeeded > 0 ? (savings / (treesNeeded * CO2_EQUIVALENCIES.tree_year)) : 0;
  
  const sequestrationData = Array.from({ length: Math.ceil(yearsToAbsorb) + 2 }, (_, i) => ({
      year: i,
      absorbed: Math.min(savings, i * (treesNeeded * CO2_EQUIVALENCIES.tree_year)),
  }));

  const emptySequestrationData = Array.from({ length: 5 }, (_, i) => ({ year: i, absorbed: 0 }));

  return (
    <div className="bg-black p-8 rounded-lg shadow-2xl">
      <h3 className="font-black text-2xl mb-2 text-green-400 flex items-center">
        <span className="mr-3 text-3xl">🌍</span> Your Shipment's Environmental Impact
      </h3>
      <p className="text-white font-semibold mb-6 text-base">
        Understand your shipment's carbon footprint with real-world equivalencies and savings analysis.
      </p>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <ImpactCard
          icon="🚗"
          value={(carbonFootprint / CO2_EQUIVALENCIES.car_km).toFixed(0)}
          unit="Kilometers"
          label="Equivalent Car Travel"
          description={`Comparable to driving an average passenger car for this distance.`}
          color="blue"
        />
        <ImpactCard
          icon="📱"
          value={(carbonFootprint / CO2_EQUIVALENCIES.smartphones).toFixed(1)}
          unit="Smartphones"
          label="Lifecycle Emissions"
          description={`Equivalent to the total carbon cost of manufacturing and powering this many new smartphones.`}
          color="purple"
        />
        <ImpactCard
          icon="🌳"
          value={(carbonFootprint / CO2_EQUIVALENCIES.tree_year).toFixed(1)}
          unit="Trees' Work"
          label="for One Year"
          description={`This many mature trees would be needed for a full year to absorb this amount of CO₂.`}
          color="teal"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-black p-4 rounded-lg border border-gray-700 h-80 flex flex-col">
          <h4 className="font-bold text-lg text-white mb-1">Emissions: Current vs. Eco</h4>
          <p className="text-xs text-gray-400 mb-2">A direct comparison of the carbon footprint.</p>
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: 10, bottom: 35 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af" 
                  fontSize={12} 
                  angle={-45}
                  textAnchor="end"
                  height={50}
                  interval={0}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={12} 
                  label={{ 
                    value: 'Carbon Emissions (kg CO₂e)', 
                    angle: -90, 
                    position: 'insideLeft', 
                    fill: '#9ca3af',
                    style: { textAnchor: 'middle' }
                  }} 
                />
                <Tooltip cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }} contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} />
                <Bar dataKey="emissions" radius={[4, 4, 0, 0]}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-black p-6 rounded-lg border border-gray-700 h-80 flex flex-col">
          <h4 className="font-bold text-lg text-white mb-1">Carbon Sequestration Timeline</h4>
          <p className="text-xs text-gray-400 mb-4">{isEcoSelected ? 'You have chosen the most efficient option.' : `Timeline for ${treesNeeded} trees to absorb the ${savings.toFixed(0)} kg of saved CO₂.`}</p>
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={isEcoSelected ? emptySequestrationData : sequestrationData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <defs><linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.8}/><stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" stroke="#9ca3af" fontSize={12} label={{ value: 'Years', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}/>
                <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 'dataMax']} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} formatter={(value) => [`${Number(value).toFixed(0)} kg`, 'CO₂ Absorbed']} />
                <Area type="monotone" dataKey="absorbed" stroke="#2dd4bf" fillOpacity={1} fill="url(#colorUv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-black p-6 rounded-lg border border-gray-700 flex flex-col justify-center text-center">
            <h3 className="font-bold text-lg text-white mb-2">Selected Shipment Rating</h3>
            <div className="flex justify-center text-5xl mb-4">
              {[...Array(5)].map((_, i) => (
                <motion.span key={i} className={i < ecoRating ? 'text-yellow-400' : 'text-gray-600'}>★</motion.span>
              ))}
            </div>
            {!isEcoSelected && onSwitchToEco && (
              <motion.div className="bg-green-900/50 p-4 rounded-lg border-2 border-green-500">
                  <h4 className="font-bold text-green-300 text-lg">💡 Make a Difference!</h4>
                  <p className="text-white my-2 text-base">Switching to Eco-Friendly saves <span className="font-black text-xl text-green-400">{savings.toFixed(1)} kg CO₂</span>.</p>
                  <button onClick={onSwitchToEco} className="w-full mt-2 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-lg text-base">Switch to Eco-Friendly</button>
              </motion.div>
            )}
            {isEcoSelected && (
                 <motion.div className="text-center">
                    <div className="text-5xl text-green-400">✓</div>
                    <h4 className="font-bold text-lg text-white mt-2">Maximum Efficiency</h4>
                    <p className="text-sm text-gray-400 mt-1">You've selected the best option for the planet.</p>
                </motion.div>
            )}
        </div>
        <div className="bg-black p-6 rounded-lg border border-gray-700 flex flex-col">
            <h4 className="font-bold text-lg text-white mb-1">Savings Breakdown</h4>
            <p className="text-xs text-gray-400 mb-4">{isEcoSelected ? 'Your shipment is fully optimized.' : 'How your potential savings compare to the new footprint.'}</p>
            <div className="flex-grow h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={savingsBreakdownData}
                            cx="50%"
                            cy="50%"
                            innerRadius={85}
                            outerRadius={115}
                            fill="#8884d8"
                            paddingAngle={isEcoSelected && savingsBreakdownData.every(d => d.value === 0) ? 0 : 5}
                            dataKey="value"
                        >
                            {savingsBreakdownData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={SAVINGS_COLORS[index % SAVINGS_COLORS.length]} stroke={SAVINGS_COLORS[index % SAVINGS_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
                            formatter={(value) => [`${Number(value).toFixed(1)} kg CO₂e`]}
                        />
                    </PieChart>
                </ResponsiveContainer>
                 {isEcoSelected ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <motion.div
                            className="text-center"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="text-5xl text-green-400 mb-2">✓</div>
                            <div className="text-lg font-bold text-gray-300">
                                Optimized
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                                {carbonFootprint.toFixed(1)} kg CO₂e
                            </div>
                        </motion.div>
                    </div>
                 ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <motion.div
                            className="text-center"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <motion.div
                                className="relative"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="text-4xl font-black text-green-400 mb-1 drop-shadow-lg">
                                    -{((savings / carbonFootprint) * 100).toFixed(0)}%
                                </div>
                                <div className="text-xs font-bold text-green-300 uppercase tracking-wider">
                                    Reduction
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    {savings.toFixed(1)} kg CO₂e saved
                                </div>
                            </motion.div>
                            <motion.div
                                className="absolute -top-2 -right-2 w-3 h-3 bg-green-400 rounded-full animate-pulse"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                            />
                        </motion.div>
                    </div>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
}
