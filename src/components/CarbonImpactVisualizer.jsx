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
      className="bg-black p-5 rounded-lg text-center flex-1 border border-gray-700 flex flex-col overflow-hidden relative"
      whileHover={{ 
        y: -8, 
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3), 0 0 0 1px rgba(34, 197, 94, 0.1)',
        borderColor: '#22c55e'
      }}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-green-900/10 to-transparent opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      <div className="flex-grow relative z-10">
        <motion.div 
          className={`text-5xl mb-3 ${colorClass}`}
          initial={{ scale: 0.5, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ 
            scale: 1.2, 
            rotate: 5,
            textShadow: '0 0 20px rgba(34, 197, 94, 0.5)'
          }}
        >
          {icon}
        </motion.div>
        
        <motion.p 
          className={`text-4xl font-black text-white`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          whileHover={{ scale: 1.1, color: '#22c55e' }}
        >
          {value}
        </motion.p>
        
        <motion.p 
          className={`text-lg font-bold text-gray-300`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          {unit}
        </motion.p>
        
        <motion.p 
          className="text-sm text-gray-400 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          {label}
        </motion.p>
      </div>
      
      <motion.p 
        className="text-base text-white font-semibold mt-4 pt-4 border-t border-gray-800 relative z-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        {description}
      </motion.p>
      
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-blue-500 opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

const InfoCard = ({ title, description, image, stats, gradient }) => (
  <motion.div
    className="bg-black p-6 rounded-lg border border-gray-700 relative overflow-hidden"
    whileHover={{ 
      y: -4, 
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
    }}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />
    <div className="relative z-10">
      <div className="flex items-center mb-4">
        <img 
          src={image} 
          alt={title}
          className="w-16 h-16 rounded-lg object-cover mr-4 border-2 border-gray-600"
        />
        <div>
          <h4 className="font-bold text-lg text-white">{title}</h4>
          <div className="flex space-x-4 mt-1">
            {stats.map((stat, index) => (
              <span key={index} className="text-xs text-green-400 font-semibold">
                {stat}
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <InfoCard
          title="Ocean Health Impact"
          description="Ocean acidification from CO₂ emissions affects marine ecosystems. Your carbon choices directly impact coral reefs, fish populations, and ocean biodiversity worldwide."
          image="https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400&h=300&fit=crop"
          stats={['pH -0.1 per 100ppm CO₂', '30% coral loss since 1980s']}
          gradient="from-blue-900 to-teal-900"
        />
        <InfoCard
          title="Forest Conservation"
          description="Trees are our natural carbon capture systems. Each ton of CO₂ saved helps preserve forest ecosystems and supports biodiversity conservation efforts globally."
          image="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop"
          stats={['21kg CO₂/tree/year', '15% forest loss reduction']}
          gradient="from-green-900 to-emerald-900"
        />
        <InfoCard
          title="Arctic Ice Impact"
          description="Carbon emissions contribute to global warming, accelerating Arctic ice melt. Your shipping choices affect polar bear habitats and global sea levels."
          image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1_CPFozh87mlfbIhoxvHt5Acbw9I3HUEYUA&s"
          stats={['2.5cm/decade sea rise', '13% ice loss/decade']}
          gradient="from-cyan-900 to-blue-900"
        />
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <div className="w-full lg:w-2/3 rounded-lg overflow-hidden border border-gray-700">
            <img src="https://transport.ec.europa.eu/sites/default/files/styles/embed_large_2x/public/2024-12/ff55_refueleu_update-april-2023.png?itok=WN_6dHfG" alt="FuelEU Maritime Initiative" className="w-full h-full object-cover" />
        </div>
        <motion.div
            className="w-full lg:w-1/3 bg-gradient-to-r from-lime-900/30 to-rose-900/30 p-6 rounded-lg border border-green-500/50 flex flex-col justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
        >
            <div className="text-center">
                <h4 className="font-bold text-xl text-white mb-4">🌍 Every Shipment Counts</h4>
                <p className="text-gray-300 mb-6">
                    Your shipping decisions create a ripple effect. By choosing eco-friendly options,
                    you're supporting cleaner transportation and a sustainable future.
                </p>
                <div className="flex flex-col items-center space-y-4">
                    <div className="text-center">
                        <div className="text-3xl">🚚</div>
                        <div className="text-sm font-semibold text-blue-400 mt-1">Efficient Routes</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl">📦</div>
                        <div className="text-sm font-semibold text-green-400 mt-1">Smart Packaging</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl">⚡</div>
                        <div className="text-sm font-semibold text-yellow-400 mt-1">Clean Energy</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl">🌱</div>
                        <div className="text-sm font-semibold text-purple-400 mt-1">Carbon Neutral</div>
                    </div>
                </div>
            </div>
        </motion.div>
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

        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 bg-black p-4 rounded-lg border border-gray-700 flex flex-col">
            <h4 className="font-bold text-base text-white mb-1">Savings Breakdown</h4>
            <p className="text-xs text-gray-400 mb-2">{isEcoSelected ? 'Fully optimized.' : 'Savings vs. new footprint.'}</p>
            <div className="flex-grow h-40 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={savingsBreakdownData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
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
                        <div className="text-3xl text-green-400 mb-1">✓</div>
                        <div className="text-sm font-bold text-gray-300">Optimized</div>
                    </div>
                 ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                        <div className="text-2xl font-black text-green-400 drop-shadow-lg">
                            -{((savings / carbonFootprint) * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs font-bold text-green-300 uppercase tracking-wider mt-1">
                            Reduction
                        </div>
                    </div>
                 )}
            </div>
          </div>
          
          <motion.div
            className="w-full md:w-1/2 bg-black p-6 rounded-lg border border-gray-700 flex flex-col justify-center items-center text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(34, 197, 94, 0.7)' }}
          >
            <h4 className="font-bold text-base text-white mb-3 flex items-center justify-center">
              <span className="text-2xl mr-3"></span>
              Maritime Shipping Trivia
            </h4>
            <p className="text-md text-gray-300 leading-relaxed max-w-md">
              Did you know? The global shipping industry accounts for nearly <span className="font-bold text-green-400">2-3%</span> of global CO₂ emissions, making it a critical area for sustainable innovation.
            </p>
            <motion.div
              className="mt-4 text-green-400 text-4xl"
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              ⚓
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mt-8">
        <div className="w-full md:w-3/5 rounded-lg overflow-hidden border border-white/10">
          <img
            src="https://images.squarespace-cdn.com/content/v1/6155b5bdada6ea1708c2c74d/1648471264339-LO9FUYTELUU2HQDEKGQE/Picture3.png"
            alt="Sustainable logistics infographic"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-full md:w-1/5 rounded-lg overflow-hidden border border-white/10">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTctKJTBVgBWc0GWbsH0FO6nWcisg2yZvnSVw&s"
            alt="Eco-friendly shipping container"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-full md:w-1/5 rounded-lg overflow-hidden border border-white/10">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7NS6fMHGS6JqBszC4H3XNz9WqBxB0gqfluQ&s"
            alt="Sustainable logistics"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
