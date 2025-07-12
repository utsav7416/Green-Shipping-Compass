import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, AlertTriangle, CheckCircle, XCircle, Clock, Globe, Bookmark, Anchor } from 'lucide-react';
import { ports } from '../data/ports';

const RouteVisual = ({ origin, destination }) => (
  <motion.div
    className="my-8 relative h-28"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4, duration: 0.6 }}
  >
    <div className="absolute inset-0 flex items-center justify-between px-4">
      <motion.div
        className="text-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.6, type: 'spring' }}
      >
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto border-2 border-green-400 shadow-md">
          <Anchor className="w-7 h-7 text-green-600"/>
        </div>
        <p className="font-black text-green-700 mt-2 text-xs">{origin}</p>
      </motion.div>
      <motion.div
        className="text-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.7, type: 'spring' }}
      >
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto border-2 border-red-400 shadow-md">
          <Anchor className="w-7 h-7 text-red-600"/>
        </div>
        <p className="font-black text-red-700 mt-2 text-xs">{destination}</p>
      </motion.div>
    </div>

    <svg className="w-full h-full absolute top-0 left-0" viewBox="0 0 100 25" preserveAspectRatio="none">
      <motion.path
        d="M 10 12.5 Q 50 -2.5, 90 12.5"
        fill="none"
        strokeWidth="0.5"
        stroke="rgba(99, 102, 241, 0.6)"
        strokeDasharray="2 2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
      />
    </svg>
    
    <div className="absolute inset-0">
      <motion.div
        className="absolute text-2xl"
        style={{
          offsetPath: 'path("M 10 12.5 Q 50 -2.5, 90 12.5")',
          offsetAnchor: 'center',
          top: 0,
          left: '8%',
          width: '84%',
          height: '100%',
        }}
        initial={{ offsetDistance: "0%" }}
        animate={{ offsetDistance: "100%" }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear", delay: 1.5 }}
      >
        🚢
      </motion.div>
    </div>
  </motion.div>
);

function RegulatoryInfo({ origin, destination }) {
  if (!origin || !destination) return null;

  const portList = [
    { label: 'Origin', port: ports[origin] ? { ...ports[origin], name: origin } : null },
    { label: 'Destination', port: ports[destination] ? { ...ports[destination], name: destination } : null }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.3
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-amber-50 via-amber-100 to-orange-100 p-8 rounded-xl shadow-2xl mb-8 border-2 border-amber-200"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="text-center mb-4"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.h2 
          className="text-4xl font-black text-indigo-700 mb-4 flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
        >
          <motion.span 
            className="mr-3"
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            📜
          </motion.span>
          Port-Specific Regulations
        </motion.h2>
        <motion.p 
          className="text-lg font-bold text-gray-700 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Comprehensive regulatory information, restricted items, and documentation requirements for your selected shipping ports.
        </motion.p>
      </motion.div>

      <RouteVisual origin={origin} destination={destination} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {portList.map(({ label, port }, index) => (
          port && (
            <motion.div
              key={label}
              className="bg-gradient-to-br from-white via-green-50 to-amber-50 p-8 rounded-xl border-2 border-green-300 shadow-xl relative overflow-hidden"
              variants={cardVariants}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
              }}
            >
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-500 rounded-full translate-y-12 -translate-x-12"></div>
              </div>

              <div className="relative z-10">
                <motion.div
                  className="flex items-center justify-between mb-6"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.2 }}
                >
                  <div className="flex items-center">
                    <motion.div
                      className="bg-indigo-600 p-3 rounded-full mr-4 shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Globe className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-2xl font-black text-indigo-700">{label} Port</h3>
                      <p className="text-xl font-bold text-gray-700">{port.name}</p>
                    </div>
                  </div>
                  <motion.div
                    className="bg-green-100 p-2 rounded-full"
                    whileHover={{ scale: 1.1 }}
                  >
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </motion.div>
                </motion.div>

                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.2 }}
                >
                  <div className="flex items-center mb-4">
                    <motion.div
                      className="bg-red-100 p-2 rounded-full mr-3"
                      whileHover={{ scale: 1.1 }}
                    >
                      <XCircle className="w-5 h-5 text-red-600" />
                    </motion.div>
                    <h4 className="text-lg font-black text-red-700">Restricted Items</h4>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                    <ul className="space-y-2">
                      {port.restrictedItems.map((item, idx) => (
                        <motion.li
                          key={idx}
                          className="flex items-center text-red-700 font-semibold"
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: 0.5 + index * 0.2 + idx * 0.1 }}
                        >
                          <motion.div
                            className="w-2 h-2 bg-red-500 rounded-full mr-3 flex-shrink-0"
                            whileHover={{ scale: 1.5 }}
                          />
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.2 }}
                >
                  <div className="flex items-center mb-4">
                    <motion.div
                      className="bg-blue-100 p-2 rounded-full mr-3"
                      whileHover={{ scale: 1.1 }}
                    >
                      <FileText className="w-5 h-5 text-blue-600" />
                    </motion.div>
                    <h4 className="text-lg font-black text-blue-700">Required Documentation</h4>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                    <ul className="space-y-2">
                      {port.documents.map((doc, idx) => (
                        <motion.li
                          key={idx}
                          className="flex items-center text-blue-700 font-semibold"
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: 0.7 + index * 0.2 + idx * 0.1 }}
                        >
                          <motion.div
                            className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"
                            whileHover={{ scale: 1.5 }}
                          />
                          <span>{doc}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )
        ))}
      </div>

      <motion.div
        className="mt-8 bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-xl border-2 border-indigo-200 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <motion.h3 
          className="text-xl font-black text-indigo-700 mb-4 flex items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.1 }}
        >
          <motion.span 
            className="mr-2"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            💡
          </motion.span>
          Important Shipping Guidelines
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-bold">
          {[
            { 
              icon: <Clock className="w-5 h-5" />, 
              title: 'Processing Time', 
              content: 'Allow 24-48 hours for documentation review and clearance procedures.',
              color: 'orange'
            },
            { 
              icon: <AlertTriangle className="w-5 h-5" />, 
              title: 'Critical Notice', 
              content: 'Failure to comply with regulations may result in cargo delays or penalties.',
              color: 'red'
            },
            { 
              icon: <Bookmark className="w-5 h-5" />, 
              title: 'Updates', 
              content: 'Regulations change frequently. Verify current requirements before shipping.',
              color: 'blue'
            }
          ].map((item, index) => (
            <motion.div 
              key={index}
              className={`p-4 bg-white rounded-lg shadow-md border-l-4 border-${item.color}-500`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <div className="flex items-center mb-2">
                <div className={`text-${item.color}-600 mr-2`}>
                  {item.icon}
                </div>
                <h4 className={`font-black text-${item.color}-700`}>{item.title}</h4>
              </div>
              <p className="text-gray-700">{item.content}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default RegulatoryInfo;




