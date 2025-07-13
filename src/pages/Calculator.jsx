import { React, useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ports } from '../data/ports';
import ImageCarousel from '../components/ImageCarousel';
import MaritimeQuotes from '../components/MaritimeQuotes';
import ShippingStats from '../components/ShippingStats';
import Features from '../components/Features';
import Weather from '../components/Weather';
import RegulatoryInfo from '../components/RegulatoryInfo';
import CarbonImpactVisualizer from '../components/CarbonImpactVisualizer';
import VesselTypeExplorer from '../components/VesselTypeExplorer';
import Demurrage from '../components/Demurrage';
import RouteMap from '../components/MapTradeRisk'; 
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

const API_BASE = 'https://green-shipping-compass.onrender.com';

const shippingMethods = {
  standard: { name: 'Standard', days: '20-25 days', rate: 1, icon: '🚢', description: 'Reliable and cost-effective shipping solution', carbonMultiplier: 1.0, ecoRating: 3 },
  express: { name: 'Express', days: '14-16 days', rate: 1.5, icon: '⚡', description: 'Faster delivery for time-sensitive cargo', carbonMultiplier: 1.8, ecoRating: 1 },
  premium: { name: 'Premium', days: '7-10 days', rate: 2.2, icon: '✨', description: 'Priority handling and guaranteed delivery', carbonMultiplier: 2.5, ecoRating: 1 },
  eco: { name: 'Eco-friendly', days: '25-30 days', rate: 0.85, icon: '🌱', description: 'Reduced carbon footprint shipping option', carbonMultiplier: 0.6, ecoRating: 5 },
};

const containerSizeMap = {
  '20ft': 20, '40ft': 40, '40ft-hc': 45
};

const containerTypes = {
  '20ft': {
    capacity: 33.2, base_cost: 1500, icon: '📦',
    features: ['Ideal for small cargo', 'Easy handling', 'Cost-effective'],
    description: 'Perfect for smaller shipments and general cargo. The 20ft container is the most economical choice for businesses starting their international trade journey.',
    dimensions: '20′ × 8′ × 8′6″',
    maxWeight: '28,230 kg',
    advantages: ['Lower shipping costs', 'Easier to handle', 'Widely available', 'Perfect for LCL shipments']
  },
  '40ft': {
    capacity: 67.6, base_cost: 2800, icon: '🚛',
    features: ['Double capacity', 'Perfect for bulk items', 'Better value per m³'],
    description: 'The industry standard for most international shipments. Offers excellent value for money with double the capacity of a 20ft container.',
    dimensions: '40′ × 8′ × 8′6″',
    maxWeight: '30,480 kg',
    advantages: ['Best value per cubic meter', 'Industry standard', 'Suitable for most cargo types', 'Efficient loading']
  },
  '40ft-hc': {
    capacity: 76.3, base_cost: 3200, icon: '🏭',
    features: ['Extra height', 'Maximum space', 'Specialized cargo'],
    description: 'High cube container with an extra foot of height, perfect for lightweight but voluminous cargo and specialized equipment.',
    dimensions: '40′ × 8′ × 9′6″',
    maxWeight: '30,480 kg',
    advantages: ['Maximum cubic capacity', 'Extra height for tall items', 'Perfect for furniture &amp; textiles', 'Premium cargo solution']
  },
};

const cargoTypes = {
  normal: { name: 'Normal', surcharge: 0, icon: '📦', description: 'Standard cargo with no special handling requirements' },
  fragile: { name: 'Fragile', surcharge: 0.15, icon: '🥚', description: 'Requires careful handling and specialized packaging' },
  perishable: { name: 'Perishable', surcharge: 0.25, icon: '🍎', description: 'Temperature-controlled environment for food and organic goods' },
  hazardous: { name: 'Hazardous', surcharge: 0.4, icon: '⚠️', description: 'Special permits and handling for dangerous materials' }
};

const conversionRates = {
  USD: { symbol: '$', name: 'US Dollar', rate: 1.000 },
  EUR: { symbol: '€', name: 'Euro', rate: 0.920 },
  INR: { symbol: '₹', name: 'Indian Rupee', rate: 82.500 },
  AED: { symbol: 'د.إ', name: 'UAE Dirham', rate: 3.672 },
  CNY: { symbol: '¥', name: 'Chinese Yuan', rate: 7.150 },
  GBP: { symbol: '£', name: 'British Pound', rate: 0.790 },
};

const TruckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const AnchorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.005a11.955 11.955 0 01-8.618 3.979M12 22v-7" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zM12 11a3 3 0 110-6 3 3 0 010 6z" /></svg>;
const ShipIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20.5l.394-.394a10.02 10.02 0 00-4.788-12.828L3 4.5m18 0l-4.606 3.286a10.02 10.02 0 00-4.788 12.828L12 20.5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v2m0 16.5v-2m-8.25-6.5H2m20 0h-1.75M4.93 4.93L3.515 3.515m16.97 16.97l-1.414-1.414M4.93 19.07l-1.414 1.414m16.97-16.97l-1.414 1.414" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const WarehouseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;

const getAverageDuration = (daysString) => {
    const parts = daysString.match(/\d+/g).map(Number);
    if (parts.length < 2) return (parts[0] || 0);
    return Math.round((parts[0] + parts[1]) / 2);
};

const getDynamicStages = (method) => {
    const totalDuration = getAverageDuration(shippingMethods[method].days);

    const stageWeights = {
        oceanTransit: 0.55, 
        originHandling: 0.10,
        destHandling: 0.12,
        customs: 0.10,
        factoryToPort: 0.08,
        finalMile: 0.05,
    };

    let durations = {
        oceanTransit: Math.round(totalDuration * stageWeights.oceanTransit),
        originHandling: Math.round(totalDuration * stageWeights.originHandling),
        destHandling: Math.round(totalDuration * stageWeights.destHandling),
        customs: Math.round(totalDuration * stageWeights.customs),
        factoryToPort: Math.round(totalDuration * stageWeights.factoryToPort),
        finalMile: Math.round(totalDuration * stageWeights.finalMile),
    };
    
    durations.originHandling = Math.max(2, durations.originHandling);
    durations.destHandling = Math.max(2, durations.destHandling);
    durations.customs = Math.max(2, durations.customs);
    durations.factoryToPort = Math.max(1, durations.factoryToPort);
    durations.finalMile = Math.max(1, durations.finalMile);

    const currentSum = Object.values(durations).reduce((sum, d) => sum + d, 0);
    const diff = totalDuration - currentSum;
    durations.oceanTransit += diff;

    return [
        { id: 1, name: 'Factory to Port', duration: durations.factoryToPort, icon: TruckIcon, description: "Cargo is transported from the factory to the origin port warehouse for consolidation." },
        { id: 2, name: 'Origin Port Handling', duration: durations.originHandling, icon: AnchorIcon, description: "Includes loading, documentation checks, and export customs clearance at the origin port." },
        { id: 3, name: 'Ocean Transit', duration: durations.oceanTransit, icon: ShipIcon, description: "The vessel is at sea, transporting your container to the destination port." },
        { id: 4, name: 'Destination Port Handling', duration: durations.destHandling, icon: AnchorIcon, description: "Container is offloaded from the vessel and moved to the port's container yard." },
        { id: 5, name: 'Customs Clearance', duration: durations.customs, icon: CheckCircleIcon, description: "Documents are submitted to destination customs for import approval." },
        { id: 6, name: 'Final Mile Delivery', duration: durations.finalMile, icon: WarehouseIcon, description: "Cargo is transported from the destination port to the final delivery address." },
    ];
};

function AestheticProgressTimeline({ shippingMethod = 'standard' }) {
    const [stages, setStages] = useState([]);
    const [totalDuration, setTotalDuration] = useState(0);

    useEffect(() => {
        const newStages = getDynamicStages(shippingMethod);
        setStages(newStages);
        setTotalDuration(newStages.reduce((sum, s) => sum + s.duration, 0));
    }, [shippingMethod]);

    let cumulativeStart = 0;

    return (
        <div className="bg-black text-white p-8 rounded-lg shadow-2xl border-2 border-gray-700">
            <h3 className="text-2xl font-black mb-6 text-cyan-300">Progress Timeline ({totalDuration} days total)</h3>
            <div className="space-y-6">
                {stages.map((stage, index) => {
                    const stageStart = cumulativeStart;
                    cumulativeStart += stage.duration;
                    const StageIcon = stage.icon;
                    const colors = ['from-pink-500 to-rose-500', 'from-rose-500 to-orange-500', 'from-orange-500 to-amber-500', 'from-amber-500 to-lime-500', 'from-lime-500 to-emerald-500', 'from-emerald-500 to-cyan-500'];
                    return (
                        <motion.div key={stage.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.15 }} className="flex flex-col md:flex-row gap-6 items-start bg-black p-4 rounded-lg border-l-4 border-cyan-500">
                            <div className="w-full md:w-7/12">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center font-bold text-lg"><StageIcon /><span className="ml-3">{stage.name}</span></div>
                                    <div className="text-cyan-300 font-black text-lg">{stage.duration} {stage.duration === 1 ? 'day' : 'days'}</div>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2.5">
                                    <motion.div className={`bg-gradient-to-r ${colors[index % colors.length]} h-2.5 rounded-full`} style={{ marginLeft: `${(stageStart / totalDuration) * 100}%`, width: `${(stage.duration / totalDuration) * 100}%` }} initial={{ width: 0 }} animate={{ width: `${(stage.duration / totalDuration) * 100}%`}} transition={{ type: "spring", stiffness: 100, damping: 20, delay: index * 0.2 }} />
                                </div>
                            </div>
                            <div className="w-full md:w-5/12"><p className="text-gray-300 text-md">{stage.description}</p></div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

function getDeliveryRange(method, shippingDate) {
  const match = shippingMethods[method].days.match(/(\d+)-(\d+)/);
  if (!match || !shippingDate) return '';
  const [minDays, maxDays] = [parseInt(match[1]), parseInt(match[2])];
  const minDate = new Date(shippingDate);
  const maxDate = new Date(shippingDate);
  minDate.setDate(minDate.getDate() + minDays);
  maxDate.setDate(maxDate.getDate() + maxDays);
  return `${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`;
}

const NotifyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const DocumentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const PreserveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-1.414 1.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-1.414-1.414A1 1 0 006.586 13H4" /></svg>;
const FileClaimIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

function InsuranceSection({ selectedInsurance, onChange, currentSymbol }) {
  const INSURANCE_OPTIONS = [
    { label: 'None', value: 'none', surcharge: 0, description: 'No coverage for your shipment.' },
    { label: 'Basic Coverage', value: 'basic', surcharge: 50, description: 'Covers major losses like sinking or fire.' },
    { label: 'Standard Coverage', value: 'standard', surcharge: 100, description: 'Includes coverage for theft and physical damage.' },
    { label: 'Premium Coverage', value: 'premium', surcharge: 200, description: 'All-risk coverage for maximum protection.' },
  ];

  const insuranceBenefits = [
    { title: 'Protection Against Losses', description: 'Offers financial protection against potential losses your shipment may incur, minimizing economic impact.' },
    { title: 'Business Stability', description: 'Proceeds from a policy can help a business regain its footing and provide financial stability after a loss.' },
    { title: 'Legal Compliance', description: 'Many countries mandate marine insurance to comply with maritime laws and regulations.' },
    { title: 'Risk Management', description: 'Effectively manage the various risks associated with transporting cargo across international waters.' }
  ];

  const coverageDetails = [
      { feature: 'Vessel Sinking / Fire', basic: true, standard: true, premium: true },
      { feature: 'Collision or Grounding', basic: true, standard: true, premium: true },
      { feature: 'Theft / Pilferage', basic: false, standard: true, premium: true },
      { feature: 'Water Damage (Sea/Rain)', basic: false, standard: true, premium: true },
      { feature: 'Loading/Unloading Damage', basic: false, standard: false, premium: true },
      { feature: 'Accidental Damage', basic: false, standard: false, premium: true },
  ];
  
  const claimSteps = [
      { icon: NotifyIcon, title: "Notify Immediately", text: "Contact us and the carrier upon discovery." },
      { icon: DocumentIcon, title: "Document Damage", text: "Take detailed photos of cargo and packaging." },
      { icon: PreserveIcon, title: "Preserve Evidence", text: "Do not discard damaged items until advised." },
      { icon: FileClaimIcon, title: "File Claim", text: "Submit all required documents promptly." }
  ];

  return (
    <div className="bg-black p-8 rounded-lg shadow-lg">
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="w-full md:w-3/5">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white mb-2">Marine Insurance Coverage</h2>
            <p className="text-gray-400">Select a plan to protect your shipment. The surcharge will be added to your total cost.</p>
          </div>
          <div className="flex flex-col gap-4">
            {INSURANCE_OPTIONS.map(option => (
              <motion.label key={option.value} whileHover={{ scale: 1.02 }} className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-all duration-300 border-2 ${selectedInsurance === option.value ? 'bg-blue-900 border-blue-500 shadow-lg' : 'border-gray-700 hover:border-blue-600'}`}>
                <input type="radio" name="insurance" value={option.value} checked={selectedInsurance === option.value} onChange={() => onChange(option)} className="mt-1 h-5 w-5 accent-blue-500" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-lg text-gray-100">{option.label}</span>
                    <span className="font-bold text-lg text-green-400">{option.surcharge > 0 ? `+${currentSymbol}${(option.surcharge).toFixed(2)}` : 'No Extra Cost'}</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{option.description}</p>
                </div>
              </motion.label>
            ))}
          </div>

          <div className="mt-6 flex gap-4">
            <img src="https://www.paisabazaar.com/wp-content/uploads/2018/12/Marine-Insurance.jpg" alt="Marine Insurance Coverage" className="w-1/2 h-auto object-cover rounded-lg shadow-lg" />
            <img src="https://globesecure.co.in/assets/img/newimg/marine.png" alt="Additional Marine Insurance" className="w-1/2 h-auto object-cover rounded-lg shadow-lg" />
          </div>
        </div>

        <div className="w-full md:w-2/5 bg-lime-900 p-6 rounded-lg border border-lime-700">
          <h3 className="font-black text-2xl mb-4 text-white">Why It Matters</h3>
           <img src="https://smcinsurance.com/SocialImages/2024/October/marine-insurance.jpg" alt="Marine Insurance Illustration" className="rounded-lg mb-4 w-full h-40 object-cover" />
          <p className="text-lime-200 mb-6 text-sm">A marine insurance policy is essential for the following reasons:</p>
          <div className="space-y-4">
            {insuranceBenefits.map((item, index) => (
              <motion.div key={index} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.15 }} className="flex items-start gap-4 p-3 bg-black rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-lime-700 text-white font-black text-md rounded-full">{index + 1}</div>
                <div>
                  <h4 className="font-bold text-white">{item.title}</h4>
                  <p className="text-lime-200 text-sm">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-black p-4 rounded-lg border border-gray-700">
              <h3 className="font-black text-xl mb-3 text-green-400">Coverage Comparison</h3>
              <table className="w-full text-left text-sm text-gray-300">
                  <thead>
                      <tr className="border-b border-gray-600">
                          <th className="py-1 px-2">Feature</th>
                          <th className="py-1 text-center">Basic</th>
                          <th className="py-1 text-center">Standard</th>
                          <th className="py-1 text-center">Premium</th>
                      </tr>
                  </thead>
                  <tbody>
                      {coverageDetails.map(item => (
                           <tr key={item.feature} className="border-b border-gray-800 hover:bg-gray-700">
                              <td className="py-2 font-semibold px-2">{item.feature}</td>
                              <td className="py-2 text-center">{item.basic ? '✔️' : '❌'}</td>
                              <td className="py-2 text-center">{item.standard ? '✔️' : '❌'}</td>
                              <td className="py-2 text-center">{item.premium ? '✔️' : '❌'}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
          <div className="bg-black p-4 rounded-lg">
              <h3 className="font-black text-xl mb-3 text-yellow-400">In Case of a Claim</h3>
              <div className="space-y-3">
                  {claimSteps.map((step, index) => {
                      const StepIcon = step.icon;
                      return (
                          <motion.div key={index} whileHover={{ scale: 1.01 }} className="bg-black p-3 rounded-lg flex items-center gap-4 transition-all duration-300 border-2 border-gray-800 hover:border-yellow-600 cursor-pointer">
                              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-yellow-600 rounded-full">
                                  <StepIcon className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                  <h4 className="font-bold text-white text-md">{step.title}</h4>
                                  <p className="text-gray-400 text-sm">{step.text}</p>
                              </div>
                              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-yellow-700 text-white font-black text-sm rounded-full">
                                  {index + 1}
                              </div>
                          </motion.div>
                      );
                  })}
              </div>
          </div>
      </div>
    </div>
  );
}

function Calculator() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [origin, setOrigin] = useState(() => localStorage.getItem('selectedOrigin') || 'Dubai, UAE');
  const [destination, setDestination] = useState(() => localStorage.getItem('selectedDestination') || 'Singapore');
  const [weight, setWeight] = useState(200);
  const [quantity, setQuantity] = useState(() => { const storedQty = localStorage.getItem('selectedQuantity'); return storedQty ? Number(storedQty) : 1; });
  const [method, setMethod] = useState('standard');
  const [containerType, setContainerType] = useState(() => localStorage.getItem('selectedContainerType') || '20ft');
  const [cargoType, setCargoType] = useState('normal');
  const [temperatureControl, setTemperatureControl] = useState(false);
  const [costs, setCosts] = useState({});
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currency, setCurrency] = useState('USD');
  const [carbonFootprint, setCarbonFootprint] = useState(0);
  const [ecoFootprint, setEcoFootprint] = useState(0);
  const [shippingDate, setShippingDate] = useState(() => { const stored = localStorage.getItem('shippingDate'); return stored ? stored : new Date().toISOString().split('T')[0]; });
  const [selectedInsurance, setSelectedInsurance] = useState('none');
  const [insuranceSurcharge, setInsuranceSurcharge] = useState(0);

  useEffect(() => { localStorage.setItem('selectedOrigin', origin) }, [origin]);
  useEffect(() => { localStorage.setItem('selectedDestination', destination) }, [destination]);
  useEffect(() => { localStorage.setItem('selectedQuantity', quantity.toString()) }, [quantity]);
  useEffect(() => { localStorage.setItem('selectedContainerType', containerType) }, [containerType]);
  useEffect(() => { localStorage.setItem('shippingDate', shippingDate) }, [shippingDate]);

  const calculateDistance = (origin, destination) => {
    if (!ports[origin] || !ports[destination]) return 0;
    const R = 6371;
    const dLat = (ports[destination].lat - ports[origin].lat) * Math.PI / 180;
    const dLon = (ports[destination].lon - ports[origin].lon) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(ports[origin].lat * Math.PI / 180) * Math.cos(ports[destination].lat * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };
  
  const distance = calculateDistance(origin, destination);
  const totalWeight = weight * quantity;

  useEffect(() => {
    if (distance > 0 && totalWeight > 0) {
      const baseCarbon = (distance * totalWeight * 0.0001) / containerSizeMap[containerType];
      const adjustedCarbon = baseCarbon * shippingMethods[method].carbonMultiplier;
      const ecoCarbon = baseCarbon * shippingMethods['eco'].carbonMultiplier;
      
      setCarbonFootprint(adjustedCarbon);
      setEcoFootprint(ecoCarbon);
    } else {
      setCarbonFootprint(0);
      setEcoFootprint(0);
    }
  }, [distance, totalWeight, containerType, method]);

  useEffect(() => {
    const fetchPricing = async () => {
      setLoading(true);
      setError(null);
      try {
        const payload = {
          distance,
          weight: totalWeight,
          containerSize: containerSizeMap[containerType],
          cargoType,
          method,
        };

        const res = await fetch(`${API_BASE}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch shipping quote');
        }
        const data = await res.json();
        let finalCosts = data.costs;
        let finalTotal = data.totalCost;

        if (temperatureControl) {
          const tempSurcharge = finalTotal * 0.35;
          finalCosts['Temperature Control'] = tempSurcharge;
          finalTotal += tempSurcharge;
        }

        if (selectedInsurance !== 'none' && insuranceSurcharge > 0) {
          finalCosts['Insurance'] = insuranceSurcharge;
          finalTotal += insuranceSurcharge;
        }
        setCosts(finalCosts);
        setTotalCost(finalTotal);
      } catch (err) {
        setError(err.message || 'Failed to calculate shipping cost. Please try again.');
        console.error('Calculation Error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (distance > 0) {
      fetchPricing();
    }
  }, [distance, totalWeight, containerType, cargoType, method, temperatureControl, selectedInsurance, insuranceSurcharge]);
  
  const currentRate = conversionRates[currency].rate;
  const currentSymbol = conversionRates[currency].symbol;
  const convertedCosts = Object.fromEntries(Object.entries(costs).map(([key, value]) => [key, value * currentRate]));
  const convertedTotalCost = totalCost * currentRate;
  
  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (value === '' || value === '0') setQuantity(0);
    else setQuantity(parseInt(value, 10));
  };
  
  const handleInsuranceChange = (option) => {
    setSelectedInsurance(option.value);
    setInsuranceSurcharge(option.surcharge);
  };
  
  const progressData = [
    { name: 'Departure', cost: (convertedCosts['Base Container Cost'] || 0), stage: 'Origin Port' },
    { name: 'Processing', cost: convertedTotalCost * 0.3 || 0, stage: 'Documentation' },
    { name: 'Customs', cost: convertedTotalCost * 0.6 || 0, stage: 'Clearance' },
    { name: 'Transit', cost: convertedTotalCost * 0.8 || 0, stage: 'Shipping' },
    { name: 'Arrival', cost: convertedTotalCost || 0, stage: 'Destination' }
  ];
  const emissionsComparisonData = [
    { name: 'Standard Ocean Freight', emissions: ((distance * totalWeight * 0.0001) / containerSizeMap[containerType]) * 1.0, efficiency: 85, cost: 1200, description: 'Traditional container shipping via cargo vessels' },
    { name: 'Express Sea Transport', emissions: ((distance * totalWeight * 0.0001) / containerSizeMap[containerType]) * 1.8, efficiency: 65, cost: 2100, description: 'Faster shipping with higher fuel consumption' },
    { name: 'Premium Air-Sea', emissions: ((distance * totalWeight * 0.0001) / containerSizeMap[containerType]) * 2.5, efficiency: 50, cost: 3200, description: 'Combined air and sea transport for speed' },
    { name: 'Eco-Friendly Green', emissions: ((distance * totalWeight * 0.0001) / containerSizeMap[containerType]) * 0.6, efficiency: 95, cost: 980, description: 'Low-emission vessels with renewable energy' }
  ];
  const containerEmissionsData = [
    { name: '20ft Standard', emissions: (distance * totalWeight * 0.0001) / 20, capacity: 33, costEfficiency: 90, carbonPerCubicMeter: ((distance * totalWeight * 0.0001) / 20) / 33, description: 'Most common container size for general cargo' },
    { name: '40ft Standard', emissions: (distance * totalWeight * 0.0001) / 40, capacity: 67, costEfficiency: 95, carbonPerCubicMeter: ((distance * totalWeight * 0.0001) / 40) / 67, description: 'High capacity container for bulk shipments' },
    { name: '40ft High Cube', emissions: (distance * totalWeight * 0.0001) / 45, capacity: 76, costEfficiency: 92, carbonPerCubicMeter: ((distance * totalWeight * 0.0001) / 45) / 76, description: 'Extra height for lightweight bulky goods' },
    { name: '45ft High Cube', emissions: (distance * totalWeight * 0.0001) / 50, capacity: 86, costEfficiency: 88, carbonPerCubicMeter: ((distance * totalWeight * 0.0001) / 50) / 86, description: 'Maximum capacity for large shipments' },
    { name: 'Reefer 20ft', emissions: (distance * totalWeight * 0.0001) / 18, capacity: 28, costEfficiency: 75, carbonPerCubicMeter: ((distance * totalWeight * 0.0001) / 18) / 28, description: 'Temperature-controlled for perishables' },
    { name: 'Reefer 40ft', emissions: (distance * totalWeight * 0.0001) / 38, capacity: 59, costEfficiency: 78, carbonPerCubicMeter: ((distance * totalWeight * 0.0001) / 38) / 59, description: 'Large refrigerated container' }
  ];
  const containerAnimation = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
  
  const QuotePdfDocument = ({ quoteData }) => (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}><Text style={pdfStyles.title}>Green Shipping Compass - Shipping Quote</Text></View>
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.heading}>Quote Details</Text>
          <View style={pdfStyles.detailRow}><Text style={pdfStyles.detailLabel}>Date:</Text><Text style={pdfStyles.detailValue}>{new Date().toLocaleDateString()}</Text></View>
          <View style={pdfStyles.detailRow}><Text style={pdfStyles.detailLabel}>Origin:</Text><Text style={pdfStyles.detailValue}>{quoteData.origin}</Text></View>
          <View style={pdfStyles.detailRow}><Text style={pdfStyles.detailLabel}>Destination:</Text><Text style={pdfStyles.detailValue}>{quoteData.destination}</Text></View>
          <View style={pdfStyles.detailRow}><Text style={pdfStyles.detailLabel}>Container Type:</Text><Text style={pdfStyles.detailValue}>{quoteData.containerType}</Text></View>
          <View style={pdfStyles.detailRow}><Text style={pdfStyles.detailLabel}>Total Weight:</Text><Text style={pdfStyles.detailValue}>{quoteData.totalWeight} kg</Text></View>
          <View style={pdfStyles.detailRow}><Text style={pdfStyles.detailLabel}>Shipping Method:</Text><Text style={pdfStyles.detailValue}>{shippingMethods[quoteData.method].name}</Text></View>
          <View style={pdfStyles.detailRow}><Text style={pdfStyles.detailLabel}>Preferred Shipping Date:</Text><Text style={pdfStyles.detailValue}>{quoteData.shippingDate ? new Date(quoteData.shippingDate).toLocaleDateString() : 'N/A'}</Text></View>
          <View style={pdfStyles.detailRow}><Text style={pdfStyles.detailLabel}>Estimated Delivery:</Text><Text style={pdfStyles.detailValue}>{quoteData.deliveryRange}</Text></View>
          <View style={pdfStyles.detailRow}><Text style={pdfStyles.detailLabel}>Temperature Control:</Text><Text style={pdfStyles.detailValue}>{quoteData.temperatureControl ? 'Yes' : 'No'}</Text></View>
          <View style={pdfStyles.detailRow}><Text style={pdfStyles.detailLabel}>Carbon Footprint:</Text><Text style={pdfStyles.detailValue}>{quoteData.carbonFootprint.toFixed(2)} kg CO2e</Text></View>
        </View>
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.heading}>Cost Breakdown</Text>
          {Object.entries(quoteData.costs).map(([key, value]) => (<View key={key} style={pdfStyles.detailRow}><Text style={pdfStyles.detailLabel}>{key}:</Text><Text style={pdfStyles.detailValue}>{quoteData.currentSymbol}{value.toFixed(2)}</Text></View>))}
          <View style={pdfStyles.totalCostRow}><Text style={pdfStyles.totalCostLabel}>Total Estimated Cost:</Text><Text style={pdfStyles.totalCostValue}>{quoteData.currentSymbol}{quoteData.totalCost.toFixed(2)}</Text></View>
        </View>
        <View style={pdfStyles.footer}><Text style={pdfStyles.footerText}>Green Shipping Compass | Committed to sustainable logistics.</Text></View>
      </Page>
    </Document>
  );
  
  const pdfStyles = StyleSheet.create({
    page: { flexDirection: 'column', backgroundColor: '#f8fafc', padding: 30, fontFamily: 'Helvetica' },
    header: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#cbd5e1', paddingBottom: 10 },
    title: { fontSize: 24, textAlign: 'center', color: '#16a34a', fontWeight: 'bold' },
    section: { marginBottom: 20, padding: 10, backgroundColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
    heading: { fontSize: 18, marginBottom: 10, fontWeight: 'bold', color: '#16a34a', borderBottomWidth: 1, borderBottomColor: '#d1d5db', paddingBottom: 5 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    detailLabel: { fontSize: 12, color: '#4b5563', fontWeight: 'bold' },
    detailValue: { fontSize: 12, color: '#1f2937' },
    totalCostRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#d1d5db' },
    totalCostLabel: { fontSize: 14, fontWeight: 'bold', color: '#16a34a' },
    totalCostValue: { fontSize: 14, fontWeight: 'bold', color: '#1f2937' },
    footer: { position: 'absolute', bottom: 30, left: 30, right: 30, textAlign: 'center', borderTopWidth: 1, borderTopColor: '#cbd5e1', paddingTop: 10 },
    footerText: { fontSize: 9, color: '#6b7280', marginBottom: 3 },
  });

  return (
    <div className="w-full bg-gradient-to-br from-blue-300 via-green-200 to-amber-200">
      <ImageCarousel />
      <ShippingStats />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-8">
          <h1 className="text-5xl font-black text-primary-600 mb-4">Green Shipping Compass</h1>
          <p className="text-black text-xl font-bold">Calculate eco-friendly shipping costs with real-time container and route optimization.</p>
        </motion.div>
        
        <motion.div ref={ref} initial="hidden" animate={inView ? "visible" : "hidden"} variants={containerAnimation} transition={{ duration: 0.5 }} className="bg-amber-100 p-8 rounded-lg shadow-xl mb-8">
          <h2 className="text-4xl font-black text-gray-800 mb-6">1. Ports, Container, Cargo Type Selector</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div variants={containerAnimation} className="bg-gradient-to-br from-green-100 to-amber-100 p-6 rounded-lg">
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-black text-gray-700 mb-2">Origin Port</label>
                  <select value={origin} onChange={(e) => setOrigin(e.target.value)} className="block w-full pl-3 pr-10 py-3 text-base font-bold border-blue-300 focus:outline-none focus:ring-blue-100 focus:border-blue-100 rounded-lg shadow-sm bg-blue-50">
                    {Object.keys(ports).map(port => (<option key={port} value={port}>{port}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-lg font-black text-gray-700 mb-2">Destination Port</label>
                  <select value={destination} onChange={(e) => setDestination(e.target.value)} className="block w-full pl-3 pr-10 py-3 text-base font-bold border-blue-300 focus:outline-none focus:ring-blue-100 focus:border-blue-100 rounded-lg shadow-sm bg-blue-50">
                    {Object.keys(ports).map(port => (<option key={port} value={port}>{port}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-lg font-black text-gray-700 mb-2">Preferred Shipping Date</label>
                  <input type="date" value={shippingDate} onChange={e => setShippingDate(e.target.value)} className="block w-full pl-3 pr-10 py-3 text-base font-bold border-blue-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 rounded-lg shadow-md bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 transition" min={new Date().toISOString().split('T')[0]} style={{ fontSize: '1.15rem', borderWidth: '2px' }}/>
                </div>
                <div className="flex flex-col space-y-4 pt-4">
                  <img src="https://media.istockphoto.com/id/1055169608/photo/aerial-view-of-san-francisco-skyline-with-holiday-city-lights.jpg?s=612x612&w=0&k=20&c=0BB1S1iH4AMR0E2JXsrKxp1b7ZZvblT5NLFoXthOpLo=" alt="San Francisco Skyline" className="rounded-lg object-cover w-full h-40 shadow-md" />
                  <img src="https://media.istockphoto.com/id/1939500219/photo/singapore-cityscape-at-night-twilight-drone-flight-panorama.jpg?s=612x612&w=0&k=20&c=WzBoQ0MoFPfwXVjICcjSGJHUOWlCvARaDIbhBK7hBig=" alt="Singapore Cityscape" className="rounded-lg object-cover w-full h-40 shadow-md" />
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrCvLvcDShNz2179ooFCEjiqF_ZefMHkiwCA&s" alt="Shipping Container" className="rounded-lg object-cover w-full h-40 shadow-md" />
                </div>
              </div>
            </motion.div>
            <motion.div variants={containerAnimation} className="bg-gradient-to-br from-green-100 to-amber-100 p-6 rounded-lg">
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-black text-gray-700 mb-4">Container Type</label>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(containerTypes).map(([type, details]) => (
                      <motion.button key={type} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setContainerType(type)} className={`p-4 rounded-lg text-center transition duration-300 ${containerType === type ? 'bg-blue-100 border-2 border-green-1000 shadow-lg' : 'bg-gray-50 border border-gray-200 hover:bg-amber-100 hover:border-primary-300'}`}>
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
                      <motion.button key={type} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setCargoType(type)} className={`p-4 rounded-lg text-center transition duration-300 ${cargoType === type ? 'bg-blue-100 border-2 border-green-1000 shadow-lg' : 'bg-gray-50 border border-gray-200 hover:bg-amber-100 hover:border-primary-300'}`}>
                        <div className="text-2xl mb-2">{details.icon}</div>
                        <div className="font-black">{details.name}</div>
                        {details.surcharge > 0 && <div className="text-sm font-bold text-red-500">+{details.surcharge * 100}% surcharge</div>}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input type="checkbox" checked={temperatureControl} onChange={(e) => setTemperatureControl(e.target.checked)} className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" />
                      <div className="flex-1">
                        <div className="text-lg font-black text-gray-700 flex items-center"><span className="mr-2">🌡️</span>My shipment requires temperature control</div>
                        <div className="text-sm font-bold text-gray-600 mt-1">For fresh seafood, fruits, vegetables, chilled beverages, dairy products, medical injections, pharmaceuticals, vaccines, frozen foods, ice cream, meat products, and other temperature-sensitive cargo</div>
                        {temperatureControl && <div className="text-sm font-bold text-blue-600 mt-2">+35% surcharge for refrigerated container service</div>}
                      </div>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-lg font-black text-gray-700 mb-2">Weight per Item: {weight} kg</label>
                  <input type="range" min="1" max="1000" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full h-2 bg-primary-200 rounded-lg appearance-none cursor-pointer" />
                  <div className="flex justify-between text-sm font-bold text-black mt-1"><span>1 kg</span><span>500 kg</span><span>1000 kg</span></div>
                </div>
                <div>
                  <label className="block text-lg font-black text-gray-700 mb-2">Select Quantity</label>
                  <div className="flex items-center space-x-4">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1 bg-blue-100 rounded-lg hover:bg-primary-200 transition-colors font-bold">-</button>
                    <input type="number" min="1" value={quantity === 0 ? '' : quantity} onChange={handleQuantityChange} className="w-24 text-center py-2 text-base font-bold border-green-300 focus:outline-none focus:ring-green-1000 focus:border-green-1000 rounded-lg" />
                    <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-1 bg-blue-100 rounded-lg hover:bg-primary-200 transition-colors font-bold">+</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          <motion.div variants={containerAnimation} className="mt-8">
            <h2 className="text-3xl font-black text-primary-600 mb-6 flex items-center"><span>📋</span> Selected Container Information</h2>
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-6 rounded-lg border-2 border-blue-200 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-2xl font-black text-primary-600 mb-4 flex items-center">{containerTypes[containerType].icon} {containerType} Container</h3>
                  <p className="text-gray-700 font-bold mb-4">{containerTypes[containerType].description}</p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-white rounded-lg"><span>Dimensions:</span><span>{containerTypes[containerType].dimensions}</span></div>
                    <div className="flex justify-between items-center p-2 bg-white rounded-lg"><span>Capacity:</span><span>{containerTypes[containerType].capacity} m³</span></div>
                    <div className="flex justify-between items-center p-2 bg-white rounded-lg"><span>Max Weight:</span><span>{containerTypes[containerType].maxWeight}</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-black text-primary-600 mb-4">Key Advantages</h4>
                  <div className="space-y-2">
                    {containerTypes[containerType].advantages.map((advantage, index) => (
                      <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex items-center p-2 bg-green-100 rounded-lg">
                        <span className="text-green-600 mr-2 font-bold">✓</span>
                        <span className="font-bold text-gray-700">{advantage}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-amber-100 rounded-lg border-l-4 border-amber-500">
                    <h5 className="font-black text-amber-700 mb-2">Pro Tip:</h5>
                    <p className="text-amber-700 font-bold text-sm"> {containerType === '20ft' && "Perfect for first-time shippers or smaller businesses. Lowest entry cost with maximum flexibility."}
                      {containerType === '40ft' && "The sweet spot for most international shipments. Offers the best balance of cost and capacity."}
                      {containerType === '40ft-hc' && "Ideal for lightweight but bulky items like furniture, textiles, or oversized equipment."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div variants={containerAnimation} className="mt-8">
            <h2 className="text-3xl font-black text-primary-600 mb-6 flex items-center"><span>🚢</span> Shipping Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Object.entries(shippingMethods).map(([key, value]) => (
                <motion.button key={key} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setMethod(key)} className={`p-6 rounded-lg text-center transition duration-300 ${method === key ? 'bg-indigo-200 border-2 border-green-1000 shadow-lg transform scale-105' : 'bg-gray-50 border border-gray-200 hover:bg-amber-100 hover:border-primary-300'}`}>
                  <div className="text-3xl mb-2">{value.icon}</div>
                  <div className="font-black text-lg">{value.name}</div>
                  <div className="text-md font-bold text-black mb-2">{value.days}</div>
                  <div className="text-sm font-bold text-black">{value.description}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <div className="mb-8">
          <h2 className="text-4xl font-black text-gray-800 mb-4">2. Insurance Selection</h2>
          <InsuranceSection 
            selectedInsurance={selectedInsurance} 
            onChange={handleInsuranceChange} 
            currentSymbol={currentSymbol}
          />
        </div>

        <div className="mb-8">
            <h2 className="text-4xl font-black text-gray-800 mb-4">3. Vessel Type Explorer</h2>
            <VesselTypeExplorer />
        </div>
        
        <div className="mb-8">
            <h2 className="text-4xl font-black text-gray-800 mb-4">4. Weather Reports</h2>
            <Weather origin={origin} destination={destination} />
        </div>

        <div className="mb-8">
            <h2 className="text-4xl font-black text-gray-800 mb-4">5. Documentation / Legal</h2>
            <RegulatoryInfo origin={origin} destination={destination} />
        </div>

        <div className="mb-8">
            <h2 className="text-4xl font-black text-gray-800 mb-4">6. Demurrage, Detention & Stakeholders</h2>
            <Demurrage />
        </div>

        <div className="mb-8">
            <h2 className="text-4xl font-black text-gray-800 mb-4">7. Progress Gantt Chart</h2>
            <AestheticProgressTimeline shippingMethod={method} />
        </div>

        <div className="mb-8">
          <h2 className="text-4xl font-black text-gray-800 mb-4">8. Carbon Emissions Visualization</h2>
          <CarbonImpactVisualizer
            carbonFootprint={carbonFootprint}
            ecoFootprint={ecoFootprint}
            ecoRating={shippingMethods[method].ecoRating}
            onSwitchToEco={() => setMethod('eco')}
          />
        </div>

        <div className="mb-8">
          <h2 className="text-4xl font-black text-gray-800 mb-4">9. Map & Risk Factors</h2>
          <RouteMap origin={origin} destination={destination} />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="bg-amber-100 p-8 rounded-lg shadow-xl mb-8">
          <h2 className="text-4xl font-black text-gray-800 mb-6">10. Final Quote & Cost Breakdown</h2>
          
          {error && (
            <motion.div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <p className="font-bold">Calculation Error</p>
              <p>{error}</p>
            </motion.div>
          )}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-black text-primary-600 flex items-center">
              <span className="mr-2">💰</span>
              {loading ? (<div className="flex items-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mr-3"></div><span className="font-black">Calculating...</span></div>)
              : (<motion.span key={convertedTotalCost} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="font-black">Estimated Cost: {currentSymbol}{convertedTotalCost.toFixed(2)}</motion.span>)}
            </h2>
            <div>
              <label htmlFor="currency-select" className="sr-only">Choose Currency</label>
              <select id="currency-select" value={currency} onChange={(e) => setCurrency(e.target.value)} className="block w-full pl-3 pr-10 py-3 text-base font-bold border-blue-500 focus:outline-none focus:ring-blue-200 focus:border-blue-200 rounded-lg shadow-lg bg-blue-100 text-blue-800">
                {Object.entries(conversionRates).map(([key, value]) => (<option key={key} value={key}>{value.name} ({value.symbol} {key})</option>))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <motion.div variants={containerAnimation} className="bg-gradient-to-br from-green-100 to-amber-100 p-6 rounded-lg shadow-md lg:col-span-1 w-full">
              <h3 className="font-black text-xl mb-4 flex items-center"><span>🛣️</span> Route Details</h3>
              <div className="space-y-3 text-md">
                <div className="flex items-center justify-between p-2 hover:bg-blue-100 rounded-lg"><span className="text-primary-600 font-black">From:</span><span className="font-bold">{origin}</span></div>
                <div className="flex items-center justify-between p-2 hover:bg-blue-100 rounded-lg"><span className="text-primary-600 font-black">To:</span><span className="font-bold">{destination}</span></div>
                <div className="flex items-center justify-between p-2 hover:bg-blue-100 rounded-lg"><span className="text-primary-600 font-black">Container:</span><span className="font-bold">{containerType} ({containerTypes[containerType].capacity}m³)</span></div>
                <div className="flex items-center justify-between p-2 hover:bg-blue-100 rounded-lg"><span className="text-primary-600 font-black">Distance:</span><span className="font-bold">{distance.toLocaleString()} km</span></div>
                <div className="flex items-center justify-between p-2 hover:bg-blue-100 rounded-lg"><span className="text-primary-600 font-black">Preferred Shipping Date:</span><span className="font-bold">{shippingDate ? new Date(shippingDate).toLocaleDateString() : 'N/A'}</span></div>
                <div className="flex items-center justify-between p-2 hover:bg-blue-100 rounded-lg"><span className="text-primary-600 font-black">Estimated Delivery:</span><span className="font-bold">{getDeliveryRange(method, shippingDate)}</span></div>
              </div>
            </motion.div>
            <motion.div variants={containerAnimation} className="bg-gradient-to-br from-green-100 to-amber-100 p-6 rounded-lg shadow-md lg:col-span-1 w-full">
              <h3 className="font-black text-xl mb-4 flex items-center"><span>📊</span> Shipping Details</h3>
              <div className="space-y-3 text-md">
                <div className="flex items-center justify-between p-2 hover:bg-blue-100 rounded-lg"><span className="text-primary-600 font-black">Method:</span><span className="font-bold">{shippingMethods[method].name}</span></div>
                <div className="flex items-center justify-between p-2 hover:bg-blue-100 rounded-lg"><span className="text-primary-600 font-black">Cargo Type:</span><span className="font-bold">{cargoTypes[cargoType].name}</span></div>
                <div className="flex items-center justify-between p-2 hover:bg-blue-100 rounded-lg"><span className="text-primary-600 font-black">Temperature Control:</span><span className="font-bold">{temperatureControl ? 'Yes' : 'No'}</span></div>
                <div className="flex items-center justify-between p-2 hover:bg-blue-100 rounded-lg"><span className="text-primary-600 font-black">Delivery:</span><span className="font-bold">{shippingMethods[method].days}</span></div>
                <div className="flex items-center justify-between p-2 hover:bg-blue-100 rounded-lg"><span className="text-primary-600 font-black">Cargo:</span><span className="font-bold">{quantity} item(s) ({totalWeight} kg total)</span></div>
              </div>
            </motion.div>
            <motion.div variants={containerAnimation} className="bg-gradient-to-br from-green-100 to-amber-100 p-6 rounded-lg shadow-md col-span-1 flex flex-col justify-center items-center overflow-hidden w-3/4 mx-auto">
              <img src="https://media.istockphoto.com/id/1324388948/photo/trade-port-shipping-cargo-to-harbor-aerial-view-from-drone-international-transportation.jpg?s=612x612&w=0&k=20&c=r5oYImtp9EqPTHtsujbwDwzu_0F84TnzVfayfOCa3Hs=" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/300x300/000000/FFFFFF?text=Image+Load+Error"; }} alt="Trade Port Shipping Cargo" className="object-cover w-full h-full"/>
            </motion.div>
          </div>
          <motion.div variants={containerAnimation} className="mt-8">
            <h2 className="text-3xl font-black text-primary-600 mb-6 flex items-center"><span>📊</span> Emissions Comparison Charts</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-black rounded-lg shadow-lg p-6 border-2 border-green-400">
                <div className="border-b border-green-400 pb-4 mb-4">
                  <h3 className="text-xl font-bold text-green-400 flex items-center"><span>🚢</span> Shipping Methods Carbon Analysis</h3>
                  <p className="text-sm text-gray-300 mt-1">CO₂ emissions comparison across different shipping methods for your route</p>
                </div>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={emissionsComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#d1d5db" fontSize={11} fontWeight="600" tickLine={false} axisLine={{ stroke: '#6b7280', strokeWidth: 1 }} angle={-45} textAnchor="end" height={80} interval={0}/>
                      <YAxis stroke="#d1d5db" fontSize={12} fontWeight="600" tickLine={false} axisLine={{ stroke: '#6b7280', strokeWidth: 1 }} label={{ value: 'CO₂ Emissions (kg)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#d1d5db', fontSize: '12px', fontWeight: '600' } }} />
                      <Tooltip formatter={(value, name, props) => [`${value.toFixed(2)} kg CO₂`, 'Carbon Emissions']} labelFormatter={(label, payload) => { const item = payload?.[0]?.payload; return item ? `${label}: ${item.description}` : label; }} contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #10b981', borderRadius: '8px', padding: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.4)', color: '#ffffff' }} labelStyle={{ fontWeight: '600', color: '#10b981' }} itemStyle={{ color: '#d1d5db' }}/>
                      <Bar dataKey="emissions" fill="#10b981" radius={[4, 4, 0, 0]} name="emissions"/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-black rounded-lg shadow-lg p-6 border-2 border-blue-400">
                <div className="border-b border-blue-400 pb-4 mb-4">
                  <h3 className="text-xl font-bold text-blue-400 flex items-center"><span>📦</span> Container Types Environmental Impact</h3>
                  <p className="text-sm text-gray-300 mt-1">Carbon efficiency analysis across different container types for your shipment</p>
                </div>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={containerEmissionsData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#d1d5db" fontSize={10} fontWeight="600" tickLine={false} axisLine={{ stroke: '#6b7280', strokeWidth: 1 }} angle={-45} textAnchor="end" height={80} interval={0}/>
                      <YAxis stroke="#d1d5db" fontSize={12} fontWeight="600" tickLine={false} axisLine={{ stroke: '#6b7280', strokeWidth: 1 }} label={{ value: 'CO₂ Emissions (kg)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#d1d5db', fontSize: '12px', fontWeight: '600' } }} />
                      <Tooltip formatter={(value, name, props) => { const item = props.payload; if (name === 'emissions') return [`${value.toFixed(2)} kg CO₂`, 'Total Carbon Emissions']; if (name === 'carbonPerCubicMeter') return [`${value.toFixed(3)} kg CO₂/m³`, 'Emissions per Cubic Meter']; return [value, name]; }} labelFormatter={(label, payload) => { const item = payload?.[0]?.payload; return item ? `${label}: ${item.description}` : label; }} contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #3b82f6', borderRadius: '8px', padding: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.4)', color: '#ffffff' }} labelStyle={{ fontWeight: '600', color: '#3b82f6' }} itemStyle={{ color: '#d1d5db' }}/>
                      <Line type="monotone" dataKey="emissions" stroke="#22c55e" strokeWidth={3} activeDot={{ r: 6, fill: '#22c55e', stroke: '#000000', strokeWidth: 2 }} dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}/><Line type="monotone" dataKey="carbonPerCubicMeter" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" activeDot={{ r: 5, fill: '#f59e0b', stroke: '#000000', strokeWidth: 2 }} dot={{ fill: '#f59e0b', strokeWidth: 1, r: 3 }}/></LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex justify-center space-x-6 text-sm">
                  <div className="flex items-center"><div className="w-4 h-0.5 bg-green-500 mr-2"></div><span className="text-gray-300 font-medium">Total Emissions</span></div>
                  <div className="flex items-center"><div className="w-4 h-0.5 bg-amber-500 border-dashed border-t mr-2"></div><span className="text-gray-300 font-medium">Emissions per m³</span></div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 bg-black p-8 rounded-lg">
            <motion.div variants={containerAnimation} className="bg-gray-900 p-6 rounded-lg shadow-lg">
              <h3 className="font-black text-xl mb-6 flex items-center text-green-400"><span>📈</span> Cost Progression</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progressData} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
                    <defs><linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/><stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="name" stroke="#ccc" tickLine={false} axisLine={{ stroke: '#666', strokeWidth: 1 }} interval={0} tick={{ fill: '#a3e635', fontWeight: 'bold', fontSize: 12 }} padding={{ left: 10, right: 10 }} label={{ value: "Progression Stage", position: "insideBottom", offset: 40, fill: '#a3e635', fontSize: 14, fontWeight: 'bold' }}/><YAxis stroke="#ccc" tickLine={false} axisLine={{ stroke: '#666', strokeWidth: 1 }} label={{ value: `Cost (${currentSymbol})`, angle: -90, position: "insideLeft", fill: '#a3e635', fontSize: 14, fontWeight: 'bold' }}/><Tooltip formatter={(value) => `${currentSymbol}${value.toFixed(2)}`} contentStyle={{ backgroundColor: '#222', border: '1px solid #4ade80', borderRadius: '8px', padding: '10px' }} labelStyle={{ fontWeight: 'bold', color: '#a3e635' }} itemStyle={{ color: '#d1fae5' }}/><Legend wrapperStyle={{ color: '#a3e635' }} /><Area type="monotone" dataKey="cost" name={`Cumulative Cost (${currentSymbol})`} stroke="#22c55e" fillOpacity={1} fill="url(#costGradient)" activeDot={{ r: 8, fill: '#22c55e', stroke: '#000', strokeWidth: 2 }}/></AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-4 text-green-300 text-sm max-w-md">This chart shows the progression of cumulative costs over different stages of your shipping process. Each point represents the total cost accumulated up to that stage.</p>
            </motion.div>
            <motion.div variants={containerAnimation} className="bg-gray-900 p-6 rounded-lg shadow-lg">
              <h3 className="font-black text-xl mb-6 flex items-center text-yellow-400"><span>💵</span> Cost Breakdown</h3>
              <div className="space-y-4">
                {Object.entries(convertedCosts).map(([key, value], index) => (
                  <motion.div key={key} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex justify-between items-center p-3 bg-gradient-to-r from-green-800 to-yellow-800 rounded-lg hover:shadow-lg">
                    <span className="font-black text-green-300">{key}</span>
                    <span className="font-black text-yellow-300">{currentSymbol}{value.toFixed(2)}</span>
                  </motion.div>
                ))}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center p-4 bg-blue-900 rounded-lg font-black text-xl text-green-400">
                  <span>Total Cost</span>
                  <span>{currentSymbol}{convertedTotalCost.toFixed(2)}</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
          <div className="text-center mt-8 flex justify-center gap-4">
            <PDFDownloadLink document={<QuotePdfDocument quoteData = {{ origin, destination, containerType, totalWeight, method, temperatureControl, carbonFootprint, costs: convertedCosts, totalCost: convertedTotalCost, currentSymbol, shippingMethods, shippingDate, deliveryRange: getDeliveryRange(method, shippingDate) }}/>} fileName={`GreenShippingQuote_${origin}_to_${destination}_${new Date().toISOString().slice(0,10)}.pdf`}>
              {({ loading }) => (<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="py-3 px-8 bg-blue-600 text-white font-black rounded-lg hover:bg-blue-700 transition-colors shadow-lg text-lg" disabled={loading}>{loading ? 'Generating PDF...' : 'Download PDF Quote'}</motion.button>)}
            </PDFDownloadLink>
          </div>
        </motion.div>
      </div>
      <Features />
      <MaritimeQuotes />
    </div>
  );
}

export default Calculator;
