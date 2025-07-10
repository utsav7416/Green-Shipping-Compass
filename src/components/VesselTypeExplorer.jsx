import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { vesselTypes } from '../data/vesselData';

const ShipVisual = ({ visual }) => {
  if (!visual) return null;
  const { color, hullPath, superstructure } = visual;

  return (
    <div className="w-full h-full flex items-center justify-center p-6 relative">
      <svg viewBox="0 0 250 100" className="w-full h-full absolute inset-0">
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="waterGradientImproved" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <rect width="250" height="100" fill="url(#skyGradient)" />
        <path d="M 0 70 Q 125 85, 250 70 T 250 100 L 0 100 Z" fill="url(#waterGradientImproved)" />
        <path d="M 0 75 Q 125 60, 250 75" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" fill="none" />
      </svg>
      <motion.svg
        viewBox="0 0 250 100"
        className="w-full h-full absolute inset-0"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      >
        <g>
          <path d={hullPath} fill={color} stroke="#020617" strokeWidth="0.5" />
          {superstructure.map((el, i) => {
            if (el.type === 'rect') return <rect key={i} {...el} />;
            if (el.type === 'path') return <path key={i} {...el} strokeWidth="1" />;
            return null;
          })}
        </g>
      </motion.svg>
    </div>
  );
};

const Attributes = ({ data }) => (
  <div>
    <h5 className="font-bold text-green-400 mb-3">Attribute Ratings</h5>
    <div className="space-y-3">
      {Object.entries(data).map(([key, value]) => (
        <div key={key}>
          <div className="flex justify-between items-center mb-1">
            <p className="font-bold text-sm text-white">{key}</p>
            <p className="font-mono text-xs text-green-400">{value}/10</p>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${value * 10}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

function VesselTypeExplorer() {
  const [selectedVessel, setSelectedVessel] = useState('Container Ship');
  const vessel = vesselTypes[selectedVessel];

  const shippingFacts = {
    'Container Ship': "By stacking containers, ships utilize space with incredible efficiency, making sea freight the most carbon-efficient mode of transport per ton-mile.",
    'Bulk Carrier': "Bulk carriers often use specialized port facilities with massive cranes and conveyor belts to load or unload thousands of tons of cargo per hour.",
    'Ro-Ro Ship': "Ro-Ro ships have built-in ramps, allowing wheeled cargo to be driven on and off quickly, significantly reducing port turnaround time compared to lift-on/lift-off vessels.",
    'Tanker': "Modern LNG tankers use the boiled-off natural gas from their cargo as fuel for their engines, a process known as 'boil-off gas management'."
  };

  const fact = shippingFacts[selectedVessel];

  return (
    <div className="bg-black p-8 md:p-10 rounded-lg shadow-2xl border-2 border-green-600">
      <h3 className="text-4xl font-black mb-8 text-green-400">Interactive Vessel Explorer</h3>
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="w-full lg:w-1/4 flex flex-col">
          <div>
            <div className="space-y-3">
              {Object.keys(vesselTypes).map((type) => (
                <motion.button
                  key={type}
                  onClick={() => setSelectedVessel(type)}
                  className={`w-full text-left p-4 rounded-lg font-bold transition-all duration-200 border-l-4 ${
                    selectedVessel === type
                      ? 'bg-green-500 text-black border-green-400'
                      : 'bg-gray-800 text-white border-transparent hover:bg-gray-700'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {type}
                </motion.button>
              ))}
            </div>
          </div>
          <motion.div 
            key={selectedVessel}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-8 flex-grow flex flex-col justify-end"
          >
            <div className="p-4 bg-gray-900/70 rounded-lg border border-blue-600/30">
                <h6 className="font-bold text-blue-400 mb-2 text-sm">Vessel Fact</h6>
                <p className="text-gray-400 text-sm leading-relaxed">
                    {fact}
                </p>
            </div>
          </motion.div>
        </div>

        <div className="w-full lg:w-3/4 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-gray-900 rounded-lg h-96 flex flex-col relative overflow-hidden shadow-inner">
            <div className="p-3 text-center border-b border-green-600/30">
              <h5 className="font-bold text-green-400 text-sm">Visual Profile</h5>
            </div>
            <div className="flex-grow relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedVessel}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <ShipVisual visual={vessel.visual} />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="p-2 text-center bg-black/20 text-xs text-gray-500">
                <p>Illustrative representation</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedVessel}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col justify-center space-y-5"
            >
              <Attributes data={vessel.heatmapData} />
              
              <div>
                <h4 className="text-3xl font-bold text-white mb-2">{selectedVessel}</h4>
                <p className="text-gray-300 text-base">{vessel.description}</p>
              </div>

              <div>
                <h5 className="font-bold text-green-400 mb-2">Key Statistics</h5>
                <ul className="text-gray-400 space-y-2 text-sm">
                  {Object.entries(vessel.stats).map(([key, value]) => (
                    <li key={key} className="flex justify-between items-center">
                      <strong className="text-white">{key}:</strong>
                      <span className="font-mono">{value}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="font-bold text-green-400 mb-2">Typical Cargo</h5>
                <div className="flex flex-wrap gap-2">
                  {vessel.cargo.map((item) => (
                    <span key={item} className="bg-gray-700 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default VesselTypeExplorer;