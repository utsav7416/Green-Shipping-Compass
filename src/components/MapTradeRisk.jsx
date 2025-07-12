import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ports } from '../data/ports.js'; 

const intelligence = {
  'Far-East': {
    chokePoints: [{ name: 'Taiwan Strait', description: 'Critical passage between Taiwan and mainland China.' }],
    hotspots: [{ name: 'Geopolitical Tensions', description: 'Heightened military activity in the strait.' }, { name: 'Typhoon Season', description: 'Active from June to October.' }]
  },
  'Intra-EastAsia': {
    chokePoints: [{ name: 'Korea Strait', description: 'Connects the Sea of Japan, the Yellow Sea, and the East China Sea.' }],
    hotspots: [{ name: 'High Vessel Traffic', description: 'One of the world\'s busiest shipping lanes.' }, { name: 'Typhoon Season', description: 'Seasonal risk of powerful storms.' }]
  },
  'EastAsia-SEAsia': {
    chokePoints: [{ name: 'Strait of Malacca', description: 'Primary channel between the Indian and Pacific oceans.' }, { name: 'South China Sea', description: 'Major trade artery with disputed territories.' }],
    hotspots: [{ name: 'Piracy Risk (Malacca)', description: 'Occasional piracy despite increased patrols.' }, { name: 'Territorial Disputes', description: 'Navigation risks due to geopolitical tensions.' }]
  },
  'Asia-ME': {
    chokePoints: [{ name: 'Strait of Malacca', description: 'Primary chokepoint for East–West trade.' }, { name: 'Strait of Hormuz', description: 'Vital oil transit chokepoint to Persian Gulf.' }],
    hotspots: [{ name: 'Piracy Risk (Malacca)', description: 'Occasional piracy despite patrols.' }, { name: 'Regional Tensions (Hormuz)', description: 'Geopolitical instability.' }]
  },
  'Asia-NA': {
    chokePoints: [{ name: 'North Pacific', description: 'The great circle route for transpacific trade.' }],
    hotspots: [{ name: 'Typhoon Alley', description: 'Frequent typhoons from May to October.' }, { name: 'Rough Seas', description: 'Challenging conditions, especially in winter.' }]
  },
  'Asia-EU': {
    chokePoints: [{ name: 'Suez Canal', description: 'Key link between Mediterranean and Red Sea.' }, { name: 'Bab el-Mandeb Strait', description: 'Gateway to the Red Sea from the Indian Ocean.' }],
    hotspots: [{ name: 'Geopolitical Tensions (Red Sea)', description: 'Attacks and instability in the region.' }, { name: 'Piracy Risk (Gulf of Aden)', description: 'Threats near Somalia.' }]
  },
  'Asia-SA': {
    chokePoints: [{ name: 'Panama Canal', description: 'Connects the Atlantic and Pacific oceans.' }, { name: 'Strait of Magellan', description: 'Alternative route around South America.' }],
    hotspots: [{ name: 'Drought Risk (Panama)', description: 'Water level issues affecting transit capacity.' }, { name: 'Pacific Storms', description: 'Weather-related disruptions.' }]
  },
  'EU-NA': {
    chokePoints: [{ name: 'English Channel', description: 'One of the world’s busiest seaways.' }],
    hotspots: [{ name: 'North Atlantic Storms', description: 'Powerful extratropical cyclones, particularly in winter.' }]
  },
  'EU-ME': {
    chokePoints: [{ name: 'Suez Canal', description: 'Connects the Mediterranean to the Red Sea.' }, { name: 'Strait of Gibraltar', description: 'Connects the Atlantic to the Mediterranean.' }],
    hotspots: [{ name: 'Red Sea Tensions', description: 'Security risks in the Bab el-Mandeb strait.' }]
  },
  'NA-SA': {
    chokePoints: [{ name: 'Panama Canal', description: 'Critical link for North-South American trade.' }, { name: 'Caribbean Passages', description: 'Various straits in the Caribbean Sea.' }],
    hotspots: [{ name: 'Hurricane Season (Caribbean)', description: 'High risk of tropical cyclones from June to November.' }, { name: 'Canal Congestion', description: 'Potential for delays at the Panama Canal.' }]
  },
  'Trans-American': {
      chokePoints: [{ name: 'Panama Canal', description: 'Connects the US West and East coasts by sea.' }],
      hotspots: [{ name: 'Hurricane Season', description: 'Affects both Gulf and Pacific approaches.'}, { name: 'Canal Delays', description: 'Potential transit congestion.' }]
  }
};

function haversine(lat1, lon1, lat2, lon2) {
  const toRad = x => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function corridorKey(o, d) {
  const e_asia = ['China', 'Hong Kong', 'Korea', 'Taiwan'];
  const se_asia = ['Singapore', 'Malaysia', 'Thailand', 'Philippines'];
  const s_asia = ['India', 'Sri Lanka'];
  const asia = [...e_asia, ...se_asia, ...s_asia];
  const me = ['UAE'];
  const na = ['USA'];
  const eu = ['Netherlands', 'Germany', 'Belgium', 'Spain'];
  const sa = ['Brazil'];

  const inList = (arr, name) => arr.some(c => name.includes(c));
  const isO = (region) => inList(region, o);
  const isD = (region) => inList(region, d);

  if (isO(e_asia) && isD(e_asia) && o !== d) return 'Intra-EastAsia';
  if ((isO(e_asia) && isD(se_asia)) || (isO(se_asia) && isD(e_asia))) return 'EastAsia-SEAsia';
  if ((isO(na) && isD(na)) && o !== d) return 'Trans-American';

  if ((isO(asia) && isD(me)) || (isO(me) && isD(asia))) return 'Asia-ME';
  if ((isO(asia) && isD(na)) || (isO(na) && isD(asia))) return 'Asia-NA';
  if ((isO(asia) && isD(eu)) || (isO(eu) && isD(asia))) return 'Asia-EU';
  if ((isO(asia) && isD(sa)) || (isO(sa) && isD(asia))) return 'Asia-SA';

  if ((isO(eu) && isD(na)) || (isO(na) && isD(eu))) return 'EU-NA';
  if ((isO(eu) && isD(me)) || (isO(me) && isD(eu))) return 'EU-ME';

  if ((isO(na) && isD(sa)) || (isO(sa) && isD(na))) return 'NA-SA';

  return 'Custom';
}

const RouteMap = ({ origin, destination }) => {
  const [tradeData, setTradeData] = useState({
    distance: 0, vesselType: '', intensity: '', corridor: '', chokePoints: [], hotspots: []
  });

  useEffect(() => {
    const oPort = ports[origin], dPort = ports[destination];
    if (!oPort || !dPort) {
      setTradeData({ distance: 0, vesselType: '', intensity: '', corridor: '', chokePoints: [], hotspots: [] });
      return;
    }

    const dist = Math.round(haversine(oPort.lat, oPort.lon, dPort.lat, dPort.lon));
    let intensity = dist < 5000 ? 'High' : dist < 10000 ? 'Medium' : 'Low';

    let corridor = corridorKey(origin, destination);
    let intel = intelligence[corridor] || {
      chokePoints: [{ name: 'General Maritime Route', description: 'Standard open-ocean passage.' }],
      hotspots: [{ name: 'Variable Weather', description: 'Subject to seasonal weather patterns.' }]
    };

    setTradeData({ distance: dist, intensity, corridor, ...intel });
  }, [origin, destination]);

  const mapUrl = (() => {
    const o = ports[origin], d = ports[destination];
    if (!o || !d) return 'https://maps.google.com/maps?output=embed&q=world';

    return `https://maps.google.com/maps?output=embed&saddr=${o.lat},${o.lon}&daddr=${d.lat},${d.lon}`;
  })();

  const { distance, intensity, corridor, chokePoints, hotspots } = tradeData;

  return (
    <div className="bg-black p-6 md:p-8 rounded-lg shadow-lg border-gray-700 border-2">
      <div className="md:flex gap-6">
        <div className="md:w-1/2 h-80 relative overflow-hidden rounded-lg border-2 border-gray-700">
          <iframe
            title="Route Map"
            src={mapUrl}
            width="100%"
            height="100%"
            style={{border:0}}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs text-center p-2 pointer-events-none">
            This route is illustrative and does not represent actual transit time. For delivery time, see "Estimated Delivery" in the Quote component below.
          </div>
        </div>
        <motion.div className="md:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-6"
                    initial="hidden" animate="visible"
                    variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.1 } } }}>
          <div>
            <h3 className="text-xl font-bold text-cyan-300 mb-4">Trade Analytics</h3>
            <div className="space-y-3">
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-gray-900 p-3 rounded-md border-l-4 border-indigo-500">
                <p className="font-semibold text-indigo-400">Distance</p>
                <p className="text-gray-300">{distance} km</p>
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-gray-900 p-3 rounded-md border-l-4 border-indigo-500">
                <p className="font-semibold text-indigo-400">Trade Intensity</p>
                <p className="text-gray-300">{intensity}</p>
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-gray-900 p-3 rounded-md border-l-4 border-indigo-500">
                <p className="font-semibold text-indigo-400">Corridor</p>
                <p className="text-gray-300">{corridor}</p>
              </motion.div>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-cyan-300 mb-4">Route Intelligence</h3>
            {chokePoints.length > 0 && (
              <div className="mb-6">
                <h4 className="font-bold text-white mb-2">Key Chokepoints</h4>
                <div className="space-y-3">
                  {chokePoints.map((c,i) => (
                    <motion.div key={i} variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} className="bg-gray-900 p-3 rounded-md border-l-4 border-green-500">
                      <p className="font-semibold text-green-400">{c.name}</p>
                      <p className="text-gray-400 text-sm">{c.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            {hotspots.length > 0 && (
              <>
                <h4 className="font-bold text-white mb-2">Risk Hotspots</h4>
                <div className="space-y-3">
                  {hotspots.map((h,i) => (
                    <motion.div key={i} variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} className="bg-gray-900 p-3 rounded-md border-l-4 border-red-500">
                      <p className="font-semibold text-red-400">{h.name}</p>
                      <p className="text-gray-400 text-sm">{h.description}</p>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
      <p className="text-center text-gray-500 text-xs mt-6">
        Map is illustrative only; actual shipping routes and conditions will vary.
      </p>
    </div>
  );
};

export default RouteMap;
