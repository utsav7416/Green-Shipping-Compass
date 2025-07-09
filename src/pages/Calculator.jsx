import React from 'react';
import { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ports } from '../data/ports';
import ImageCarousel from '../components/ImageCarousel';
import MaritimeQuotes from '../components/MaritimeQuotes';
import ShippingStats from '../components/ShippingStats';
import Features from '../components/Features';
import Weather from '../components/Weather';
import RegulatoryInfo from '../components/RegulatoryInfo';
import QRCode from 'react-qr-code';
import axios from 'axios';
import { Document, Page, Text, View, Image, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

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

function Calculator() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [origin, setOrigin] = useState(() => localStorage.getItem('selectedOrigin') || 'Dubai, UAE');
  const [destination, setDestination] = useState(() => localStorage.getItem('selectedDestination') || 'Singapore');
  const [weight, setWeight] = useState(200);
  const [quantity, setQuantity] = useState(() => {
    const storedQty = localStorage.getItem('selectedQuantity');
    return storedQty ? Number(storedQty) : 1;
  });
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
  const [shippingDate, setShippingDate] = useState(() => {
    const stored = localStorage.getItem('shippingDate');
    return stored ? stored : '';
  });
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    localStorage.setItem('selectedOrigin', origin);
  }, [origin]);

  useEffect(() => {
    localStorage.setItem('selectedDestination', destination);
  }, [destination]);

  useEffect(() => {
    localStorage.setItem('selectedQuantity', quantity.toString());
  }, [quantity]);

  useEffect(() => {
    localStorage.setItem('selectedContainerType', containerType);
  }, [containerType]);

  useEffect(() => {
    localStorage.setItem('shippingDate', shippingDate);
  }, [shippingDate]);

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

      const baseCostPerKm = 0.12;
      const baseContainerCost = containerSizeMap[containerType] * 50;
      const distanceCost = distance * baseCostPerKm;
      const weightCost = totalWeight * 0.8;
      const methodMultiplier = shippingMethods[method].carbonMultiplier * 0.8 + 0.6;

      const baseCosts = {
        'Base Container Cost': baseContainerCost,
        'Distance Cost': distanceCost,
        'Weight Cost': weightCost,
        'Method Surcharge': baseContainerCost * (methodMultiplier - 1)
      };

      let baseTotalCost = Object.values(baseCosts).reduce((sum, cost) => sum + cost, 0);
      const surcharge = cargoTypes[cargoType.toLowerCase()].surcharge;

      if (surcharge > 0) {
        baseCosts['Cargo Type Surcharge'] = baseTotalCost * surcharge;
        baseTotalCost = baseTotalCost * (1 + surcharge);
      }

      if (temperatureControl) {
        const tempSurcharge = baseTotalCost * 0.35;
        baseCosts['Temperature Control'] = tempSurcharge;
        baseTotalCost += tempSurcharge;
      }

      setCosts(baseCosts);
      setTotalCost(baseTotalCost);

      const baseCarbon = (distance * totalWeight * 0.0001) / containerSizeMap[containerType];
      const adjustedCarbon = baseCarbon * shippingMethods[method].carbonMultiplier;
      setCarbonFootprint(adjustedCarbon);

    } catch (err) {
      setError('Failed to calculate shipping cost. Please try again.');
      console.error('Calculation Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, [origin, destination, weight, quantity, method, containerType, cargoType, temperatureControl]);

  const distance = calculateDistance(origin, destination);
  const totalWeight = weight * quantity;

  const currentRate = conversionRates[currency].rate;
  const currentSymbol = conversionRates[currency].symbol;

  const convertedCosts = Object.fromEntries(
    Object.entries(costs).map(([key, value]) => [key, value * currentRate])
  );

  const convertedTotalCost = totalCost * currentRate;

  const progressData = [
    { name: 'Departure', cost: (costs['Base Container Cost'] || 0) * currentRate, stage: 'Origin Port' },
    { name: 'Processing', cost: totalCost * 0.3 * currentRate || 0, stage: 'Documentation' },
    { name: 'Clearance', cost: totalCost * 0.6 * currentRate || 0, stage: 'Customs' },
    { name: 'Transit', cost: totalCost * 0.8 * currentRate || 0, stage: 'Shipping' },
    { name: 'Arrival', cost: totalCost * currentRate || 0, stage: 'Destination' }
  ];

  const emissionsComparisonData = [
    {
      name: 'Standard',
      emissions: ((distance * totalWeight * 0.0001) / containerSizeMap[containerType]) * 1.0,
      efficiency: 85,
      cost: 1200
    },
    {
      name: 'Express',
      emissions: ((distance * totalWeight * 0.0001) / containerSizeMap[containerType]) * 1.8,
      efficiency: 65,
      cost: 2100
    },
    {
      name: 'Premium',
      emissions: ((distance * totalWeight * 0.0001) / containerSizeMap[containerType]) * 2.5,
      efficiency: 50,
      cost: 3200
    },
    {
      name: 'Eco-friendly',
      emissions: ((distance * totalWeight * 0.0001) / containerSizeMap[containerType]) * 0.6,
      efficiency: 95,
      cost: 980
    }
  ];

  const containerEmissionsData = [
    {
      name: '20ft',
      emissions: (distance * totalWeight * 0.0001) / 20,
      capacity: 33,
      costEfficiency: 90,
      carbonPerCubicMeter: ((distance * totalWeight * 0.0001) / 20) / 33
    },
    {
      name: '40ft',
      emissions: (distance * totalWeight * 0.0001) / 40,
      capacity: 67,
      costEfficiency: 95,
      carbonPerCubicMeter: ((distance * totalWeight * 0.0001) / 40) / 67
    },
    {
      name: '40ft HC',
      emissions: (distance * totalWeight * 0.0001) / 45,
      capacity: 76,
      costEfficiency: 92,
      carbonPerCubicMeter: ((distance * totalWeight * 0.0001) / 45) / 76
    },
    {
      name: '45ft HC',
      emissions: (distance * totalWeight * 0.0001) / 50,
      capacity: 86,
      costEfficiency: 88,
      carbonPerCubicMeter: ((distance * totalWeight * 0.0001) / 50) / 86
    },
    {
      name: 'Reefer 20ft',
      emissions: (distance * totalWeight * 0.0001) / 18,
      capacity: 28,
      costEfficiency: 75,
      carbonPerCubicMeter: ((distance * totalWeight * 0.0001) / 18) / 28
    },
    {
      name: 'Reefer 40ft',
      emissions: (distance * totalWeight * 0.0001) / 38,
      capacity: 59,
      costEfficiency: 78,
      carbonPerCubicMeter: ((distance * totalWeight * 0.0001) / 38) / 59
    }
  ];

  const containerAnimation = {
    hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 }
  };

  const currentEcoRating = shippingMethods[method].ecoRating;

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (value === '' || value === '0') {
      setQuantity(0);
    } else {
      setQuantity(parseInt(value, 10));
    }
  };

  const generateQRCodeData = () => {
    const qrData = {
      origin,
      destination,
      containerType,
      totalWeight,
      method,
      temperatureControl,
      carbonFootprint: carbonFootprint.toFixed(2),
      totalCost: convertedTotalCost.toFixed(2),
      currency,
      shippingDate,
      deliveryRange: getDeliveryRange(method, shippingDate),
      quoteId: `GSC-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(qrData);
  };

  const handleGenerateQR = () => {
    setShowQRCode(!showQRCode);
  };

  const QuotePdfDocument = ({ quoteData }) => (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>Green Shipping Compass - Shipping Quote</Text>
        </View>
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.heading}>Quote Details</Text>
          <View style={pdfStyles.detailRow}>
            <Text style={pdfStyles.detailLabel}>Date:</Text>
            <Text style={pdfStyles.detailValue}>{new Date().toLocaleDateString()}</Text>
          </View>
          <View style={pdfStyles.detailRow}>
            <Text style={pdfStyles.detailLabel}>Origin:</Text>
            <Text style={pdfStyles.detailValue}>{quoteData.origin}</Text>
          </View>
          <View style={pdfStyles.detailRow}>
            <Text style={pdfStyles.detailLabel}>Destination:</Text>
            <Text style={pdfStyles.detailValue}>{quoteData.destination}</Text>
          </View>
          <View style={pdfStyles.detailRow}>
            <Text style={pdfStyles.detailLabel}>Container Type:</Text>
            <Text style={pdfStyles.detailValue}>{quoteData.containerType}</Text>
          </View>
          <View style={pdfStyles.detailRow}>
            <Text style={pdfStyles.detailLabel}>Total Weight:</Text>
            <Text style={pdfStyles.detailValue}>{quoteData.totalWeight} kg</Text>
          </View>
          <View style={pdfStyles.detailRow}>
            <Text style={pdfStyles.detailLabel}>Shipping Method:</Text>
            <Text style={pdfStyles.detailValue}>{shippingMethods[quoteData.method].name}</Text>
          </View>
          <View style={pdfStyles.detailRow}>
            <Text style={pdfStyles.detailLabel}>Preferred Shipping Date:</Text>
            <Text style={pdfStyles.detailValue}>{quoteData.shippingDate ? new Date(quoteData.shippingDate).toLocaleDateString() : 'N/A'}</Text>
          </View>
          <View style={pdfStyles.detailRow}>
            <Text style={pdfStyles.detailLabel}>Estimated Delivery:</Text>
            <Text style={pdfStyles.detailValue}>{quoteData.deliveryRange}</Text>
          </View>
          <View style={pdfStyles.detailRow}>
            <Text style={pdfStyles.detailLabel}>Temperature Control:</Text>
            <Text style={pdfStyles.detailValue}>{quoteData.temperatureControl ? 'Yes' : 'No'}</Text>
          </View>
          <View style={pdfStyles.detailRow}>
            <Text style={pdfStyles.detailLabel}>Carbon Footprint:</Text>
            <Text style={pdfStyles.detailValue}>{quoteData.carbonFootprint.toFixed(2)} kg CO2e</Text>
          </View>
        </View>

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.heading}>Cost Breakdown</Text>
          {Object.entries(quoteData.costs).map(([key, value]) => (
            <View key={key} style={pdfStyles.detailRow}>
              <Text style={pdfStyles.detailLabel}>{key}:</Text>
              <Text style={pdfStyles.detailValue}>{quoteData.currentSymbol}{value.toFixed(2)}</Text>
            </View>
          ))}
          <View style={pdfStyles.totalCostRow}>
            <Text style={pdfStyles.totalCostLabel}>Total Estimated Cost:</Text>
            <Text style={pdfStyles.totalCostValue}>{quoteData.currentSymbol}{quoteData.totalCost.toFixed(2)}</Text>
          </View>
        </View>

        <View style={pdfStyles.footer}>
          <Text style={pdfStyles.footerText}>
            Green Shipping Compass | Committed to sustainable logistics.
          </Text>
        </View>
      </Page>
    </Document>
  );

  const pdfStyles = StyleSheet.create({
    page: { flexDirection: 'column', backgroundColor: '#f8fafc', padding: 30, fontFamily: 'Helvetica' },
    header: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#cbd5e1', paddingBottom: 10 },
    title: { fontSize: 24, textAlign: 'center', color: '#16a34a', fontWeight: 'bold' },
    section: { marginBottom: 20, padding: 10, backgroundColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-black text-primary-600 mb-4">Green Shipping Compass</h1>
          <p className="text-black text-xl font-bold">Calculate eco-friendly shipping costs with real-time container and route optimization.</p>
        </motion.div>

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
                    className="block w-full pl-3 pr-10 py-3 text-base font-bold border-blue-300 focus:outline-none focus:ring-blue-100 focus:border-blue-100 rounded-lg shadow-sm bg-blue-50"
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
                    className="block w-full pl-3 pr-10 py-3 text-base font-bold border-blue-300 focus:outline-none focus:ring-blue-100 focus:border-blue-100 rounded-lg shadow-sm bg-blue-50"
                  >
                    {Object.keys(ports).map(port => (
                      <option key={port} value={port}>{port}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-lg font-black text-gray-700 mb-2">Preferred Shipping Date</label>
                  <input
                    type="date"
                    value={shippingDate}
                    onChange={e => setShippingDate(e.target.value)}
                    className="block w-full pl-3 pr-10 py-3 text-base font-bold border-blue-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 rounded-lg shadow-md bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 transition"
                    min={new Date().toISOString().split('T')[0]}
                    style={{ fontSize: '1.15rem', borderWidth: '2px' }}
                  />
                </div>
                <div className="flex flex-col space-y-4 pt-4">
                  <img src="https://media.istockphoto.com/id/1055169608/photo/aerial-view-of-san-francisco-skyline-with-holiday-city-lights.jpg?s=612x612&w=0&k=20&c=0BB1S1iH4AMR0E2JXsrKxp1b7ZZvblT5NLFoXthOpLo=" alt="San Francisco Skyline" className="rounded-lg object-cover w-full h-40 shadow-md" />
                  <img src="https://media.istockphoto.com/id/1939500219/photo/singapore-cityscape-at-night-twilight-drone-flight-panorama.jpg?s=612x612&w=0&k=20&c=WzBoQ0MoFPfwXVjICcjSGJHUOWlCvARaDIbhBK7hBig=" alt="Singapore Cityscape" className="rounded-lg object-cover w-full h-40 shadow-md" />
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrCvLvcDShNz2179ooFCEjiqF_ZefMHkiwCA&s" alt="Shipping Container" className="rounded-lg object-cover w-full h-40 shadow-md" />
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
                        <div className="text-lg font-black text-gray-700 flex items-center">
                          <span className="mr-2">🌡️</span>
                          My shipment requires temperature control
                        </div>
                        <div className="text-sm font-bold text-gray-600 mt-1">
                          For fresh seafood, fruits, vegetables, chilled beverages, dairy products, medical injections, pharmaceuticals, vaccines, frozen foods, ice cream, meat products, and other temperature-sensitive cargo
                        </div>
                        {temperatureControl && <div className="text-sm font-bold text-blue-600 mt-2">+35% surcharge for refrigerated container service</div>}
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-black text-gray-700 mb-2">Weight per Item: {weight} kg</label>
                  <input type="range" min="1" max="1000" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full h-2 bg-primary-200 rounded-lg appearance-none cursor-pointer" />
                  <div className="flex justify-between text-sm font-bold text-black mt-1">
                    <span>1 kg</span><span>500 kg</span><span>1000 kg</span>
                  </div>
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
            <h2 className="text-3xl font-black text-primary-600 mb-6 flex items-center">
              <span className="mr-2">📋</span> Selected Container Information
            </h2>
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-6 rounded-lg border-2 border-blue-200 shadow-lg">
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

        <Weather origin={origin} destination={destination} />

        <RegulatoryInfo origin={origin} destination={destination} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-amber-100 p-8 rounded-lg shadow-xl mb-8"
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-black text-primary-600 flex items-center">
              <span className="mr-2">💰</span>
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mr-3"></div>
                  <span className="font-black">Calculating...</span>
                </div>
              ) : (
                <motion.span
                  key={convertedTotalCost}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="font-black"
                >
                  Estimated Cost: {currentSymbol}{convertedTotalCost.toFixed(2)}
                </motion.span>
              )}
            </h2>
            <div>
              <label htmlFor="currency-select" className="sr-only">Choose Currency</label>
              <select
                id="currency-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="block w-full pl-3 pr-10 py-3 text-base font-bold border-blue-500 focus:outline-none focus:ring-blue-200 focus:border-blue-200 rounded-lg shadow-lg bg-blue-100 text-blue-800"
              >
                {Object.entries(conversionRates).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.name} ({value.symbol} {key})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <motion.div variants={containerAnimation} className="bg-gradient-to-br from-green-100 to-amber-100 p-6 rounded-lg shadow-md lg:col-span-1 w-full">
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
                <div className="flex items-center justify-between p-2 hover:bg-blue-100 rounded-lg">
                  <span className="text-primary-600 font-black">Preferred Shipping Date:</span>
                  <span className="font-bold">{shippingDate ? new Date(shippingDate).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between p-2 hover:bg-blue-100 rounded-lg">
                  <span className="text-primary-600 font-black">Estimated Delivery:</span>
                  <span className="font-bold">{getDeliveryRange(method, shippingDate)}</span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={containerAnimation} className="bg-gradient-to-br from-green-100 to-amber-100 p-6 rounded-lg shadow-md lg:col-span-1 w-full">
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
                  <span className="text-primary-600 font-black">Temperature Control:</span>
                  <span className="font-bold">{temperatureControl ? 'Yes' : 'No'}</span>
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

            <motion.div variants={containerAnimation} className="bg-gradient-to-br from-green-100 to-amber-100 p-6 rounded-lg shadow-md col-span-1 flex flex-col justify-center items-center overflow-hidden w-3/4 mx-auto">
            <img
              src="https://media.istockphoto.com/id/1324388948/photo/trade-port-shipping-cargo-to-harbor-aerial-view-from-drone-international-transportation.jpg?s=612x612&w=0&k=20&c=r5oYImtp9EqPTHtsujbwDwzu_0F84TnzVfayfOCa3Hs="
              onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/300x300/000000/FFFFFF?text=Image+Load+Error"; }}
              alt="Trade Port Shipping Cargo"
              className="object-cover w-full h-full"
            />
          </motion.div>
          </div>

          <motion.div variants={containerAnimation} className="mt-8">
            <h2 className="text-3xl font-black text-primary-600 mb-6 flex items-center">
              <span className="mr-2">📊</span> Emissions Comparison Charts
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h3 className="font-bold text-xl mb-4 flex items-center text-gray-800">
                  <span className="mr-2">🚢</span> Shipping Methods Analysis
                </h3>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={emissionsComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#4b5563" 
                        fontSize={12} 
                        fontWeight="600"
                        tickLine={false} 
                        axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }} 
                      />
                      <YAxis 
                        stroke="#4b5563" 
                        fontSize={12} 
                        fontWeight="600"
                        tickLine={false} 
                        axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }} 
                        label={{ value: 'CO₂ Emissions (kg)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#374151', fontSize: '12px', fontWeight: '600' } }} 
                      />
                      <Tooltip 
                        formatter={(value, name) => [
                          `${value.toFixed(2)} kg CO₂`,
                          name === 'emissions' ? 'Carbon Emissions' : name
                        ]}
                        labelFormatter={(label) => `Method: ${label}`}
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e5e7eb', 
                          borderRadius: '8px', 
                          padding: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        labelStyle={{ fontWeight: '600', color: '#1f2937' }}
                        itemStyle={{ color: '#6b7280' }}
                      />
                      <Bar 
                        dataKey="emissions" 
                        fill="#3b82f6" 
                        radius={[4, 4, 0, 0]}
                        name="emissions"
                      >
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.6}/>
                          </linearGradient>
                        </defs>
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h3 className="font-bold text-xl mb-4 flex items-center text-gray-800">
                  <span className="mr-2">📦</span> Container Types Comparison
                </h3>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={containerEmissionsData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#4b5563" 
                        fontSize={11} 
                        fontWeight="600"
                        tickLine={false} 
                        axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        stroke="#4b5563" 
                        fontSize={12} 
                        fontWeight="600"
                        tickLine={false} 
                        axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }} 
                        label={{ value: 'CO₂ Emissions (kg)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#374151', fontSize: '12px', fontWeight: '600' } }} 
                      />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'emissions') return [`${value.toFixed(2)} kg CO₂`, 'Carbon Emissions'];
                          if (name === 'capacity') return [`${value} m³`, 'Capacity'];
                          if (name === 'costEfficiency') return [`${value}%`, 'Cost Efficiency'];
                          return [value, name];
                        }}
                        labelFormatter={(label) => `Container: ${label}`}
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e5e7eb', 
                          borderRadius: '8px', 
                          padding: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        labelStyle={{ fontWeight: '600', color: '#1f2937' }}
                        itemStyle={{ color: '#6b7280' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="emissions" 
                        stroke="#22c55e" 
                        strokeWidth={3} 
                        activeDot={{ r: 6, fill: '#22c55e', stroke: '#ffffff', strokeWidth: 2 }} 
                        dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="carbonPerCubicMeter" 
                        stroke="#f59e0b" 
                        strokeWidth={2} 
                        strokeDasharray="5 5"
                        activeDot={{ r: 5, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 2 }} 
                        dot={{ fill: '#f59e0b', strokeWidth: 1, r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex justify-center space-x-6 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-0.5 bg-green-500 mr-2"></div>
                    <span className="text-gray-600 font-medium">Total Emissions</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-0.5 bg-amber-500 border-dashed border-t mr-2"></div>
                    <span className="text-gray-600 font-medium">Emissions per m³</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <motion.div variants={containerAnimation} className="bg-gradient-to-br from-green-100 to-amber-100 p-6 rounded-lg shadow-md lg:col-span-1">
              <h3 className="font-black text-xl mb-4 flex items-center">
                <span className="mr-2">🌱</span> Environmental Impact
              </h3>
              <div className="space-y-3">
                <div className="flex items-center mb-2">
                  <span className="text-primary-600 mr-2 font-black">Eco Rating:</span>
                  {[...Array(5)].map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{opacity:0,scale:0}}
                      animate={{opacity:1,scale:1}}
                      transition={{delay:i*0.1}}
                      className={`text-xl ${i<currentEcoRating?'text-green-500':'text-gray-300'}`}
                    >★</motion.span>
                  ))}
                </div>

                <div className="flex items-start justify-between p-3 bg-green-100 rounded-lg border border-green-200">
                  <span className="text-green-700 text-md font-bold leading-relaxed">
                    Choosing sustainable shipping methods helps preserve marine ecosystems, reduce emissions, and protect our planet for future generations. 🌍🌊
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg border border-blue-200">
                  <span className="font-black text-blue-700">Carbon Footprint:</span>
                  <span className="font-bold text-blue-700">{carbonFootprint.toFixed(2)} kg CO2e</span>
                </div>

                {method !== 'eco' && (
                  <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                    <p className="text-sm font-semibold text-green-800 mb-3">
                      💡 Make an impact! Choose Eco-friendly shipping to significantly reduce your carbon footprint.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setMethod('eco')}
                      className="w-full py-3 bg-green-700 text-white font-black rounded-lg hover:bg-green-600 transition-colors shadow-md text-lg"
                    >
                      🌱 Switch to Eco-Friendly Now!
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div 
              variants={containerAnimation} 
              className="bg-gradient-to-br from-green-100 to-amber-100 p-6 rounded-lg shadow-md col-span-1 flex flex-col justify-center items-center space-y-4">
              <div className="w-full max-w-[250px] aspect-square">
                  <img
                      src="https://i0.wp.com/www.globaltrademag.com/wp-content/uploads/2025/02/shutterstock_2417610071-scaled.jpg?fit=2560%2C1438&ssl=1"
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/300x200/000000/FFFFFF?text=Image+1+Load+Error"; }}
                      alt="Green Shipping Image 1"
                      className="rounded-lg object-cover w-full h-full shadow-md"
                  />
              </div>
              <div className="w-full max-w-[250px] aspect-square">
                  <img
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQogpd7JAjs7KDbGx_ga_vCQIZS7ALwstspog&s"
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/300x200/000000/FFFFFF?text=Image+2+Load+Error"; }}
                      alt="Green Shipping Image 2"
                      className="rounded-lg object-cover w-full h-full shadow-md"
                  />
              </div>
          </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <motion.div variants={containerAnimation} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h3 className="font-bold text-xl mb-6 flex items-center text-gray-800">
                <span className="mr-2">📈</span> Cost Progression
              </h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progressData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <defs>
                      <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#4b5563" 
                      fontSize={11} 
                      fontWeight="600"
                      tickLine={false} 
                      axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                    />
                    <YAxis 
                      stroke="#4b5563" 
                      fontSize={12} 
                      fontWeight="600"
                      tickLine={false} 
                      axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }} 
                      label={{ value: `Cost (${currentSymbol})`, angle: -90, position: "insideLeft", style: { textAnchor: 'middle', fill: '#374151', fontSize: '12px', fontWeight: '600' } }} 
                    />
                    <Tooltip 
                      formatter={(value) => [`${currentSymbol}${value.toFixed(2)}`, 'Cumulative Cost']} 
                      labelFormatter={(label) => `Stage: ${label}`}
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px', 
                        padding: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }} 
                      labelStyle={{ fontWeight: '600', color: '#1f2937' }} 
                      itemStyle={{ color: '#6b7280' }} 
                    />
                    <Area
                      type="monotone"
                      dataKey="cost"
                      stroke="#22c55e"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#costGradient)"
                      activeDot={{ r: 6, fill: '#22c55e', stroke: '#ffffff', strokeWidth: 2 }}
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
                {Object.entries(convertedCosts).map(([key, value], index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex justify-between items-center p-3 bg-gradient-to-r from-green-100 to-amber-100 rounded-lg hover:shadow-md"
                  >
                    <span className="font-black">{key}</span>
                    <span className="font-black">{currentSymbol}{value.toFixed(2)}</span>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-between items-center p-4 bg-blue-100 rounded-lg font-black text-xl"
                >
                  <span>Total Cost</span>
                  <span>{currentSymbol}{convertedTotalCost.toFixed(2)}</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
          <div className="text-center mt-8 flex justify-center gap-4">
            <PDFDownloadLink document={<QuotePdfDocument quoteData={{origin,destination,containerType,totalWeight,method,temperatureControl,carbonFootprint,costs:convertedCosts,totalCost:convertedTotalCost,currentSymbol,shippingMethods,shippingDate,deliveryRange:getDeliveryRange(method,shippingDate)}} />} fileName={`GreenShippingQuote_${origin}_to_${destination}_${new Date().toISOString().slice(0,10)}.pdf`}>
              {({loading})=>(
                <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} className="py-3 px-8 bg-blue-600 text-white font-black rounded-lg hover:bg-blue-700 transition-colors shadow-lg text-lg" disabled={loading}>
                  {loading?'Generating PDF...':'Download PDF Quote'}
                </motion.button>
              )}
            </PDFDownloadLink>
            
            <motion.button 
              whileHover={{scale:1.05}} 
              whileTap={{scale:0.95}} 
              onClick={handleGenerateQR}
              className="py-3 px-8 bg-green-600 text-white font-black rounded-lg hover:bg-green-700 transition-colors shadow-lg text-lg flex items-center gap-2"
            >
              <span>Generate QR Code</span>
            </motion.button>
          </div>

          {showQRCode && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 flex justify-center"
            >
              <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-green-200">
                <h3 className="text-lg font-bold text-center mb-4 text-gray-800">Share Your Quote</h3>
                <div className="flex flex-col items-center space-y-4">
                  <QRCode
                    value={generateQRCodeData()}
                    size={200}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="M"
                  />
                  <p className="text-sm text-gray-600 text-center max-w-xs">
                    Scan this QR code to share your shipping quote or save it for later reference.
                  </p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        const qrCanvas = document.querySelector('canvas');
                        if (qrCanvas) {
                          const link = document.createElement('a');
                          link.download = `shipping-quote-qr-${Date.now()}.png`;
                          link.href = qrCanvas.toDataURL();
                          link.click();
                        }
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      Download QR
                    </button>
                    <button 
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: 'Green Shipping Quote',
                            text: `Shipping quote from ${origin} to ${destination}`,
                            url: window.location.href
                          });
                        } else {
                          navigator.clipboard.writeText(generateQRCodeData());
                          alert('Quote data copied to clipboard!');
                        }
                      }}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm font-medium"
                    >
                      Share Quote
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
      <Features />
      <MaritimeQuotes />
    </div>
  );
}

export default Calculator;