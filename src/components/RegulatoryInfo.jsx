import React from 'react';
import { motion } from 'framer-motion';
import { FileText, AlertTriangle, CheckCircle, XCircle, Clock, Globe, Bookmark, Anchor, ShieldCheck } from 'lucide-react';
import { ports } from '../data/ports';

const RouteVisual = ({ origin, destination }) => (
  <motion.div className="my-8 relative h-28" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}>
    <div className="absolute inset-0 flex items-center justify-between px-4">
      <motion.div className="text-center" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: 'spring' }}>
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto border-2 border-green-400 shadow-md">
          <Anchor className="w-7 h-7 text-green-600"/>
        </div>
        <p className="font-black text-green-700 mt-2 text-xs">{origin}</p>
      </motion.div>
      <motion.div className="text-center" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7, type: 'spring' }}>
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto border-2 border-red-400 shadow-md">
          <Anchor className="w-7 h-7 text-red-600"/>
        </div>
        <p className="font-black text-red-700 mt-2 text-xs">{destination}</p>
      </motion.div>
    </div>
    <svg className="w-full h-full absolute top-0 left-0" viewBox="0 0 100 25" preserveAspectRatio="none">
      <motion.path d="M 10 12.5 Q 50 -2.5, 90 12.5" fill="none" strokeWidth="0.5" stroke="rgba(99, 102, 241, 0.6)" strokeDasharray="2 2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }} />
    </svg>
    <div className="absolute inset-0">
      <motion.div className="absolute text-2xl" style={{ offsetPath: 'path("M 10 12.5 Q 50 -2.5, 90 12.5")', offsetAnchor: 'center', top: 0, left: '8%', width: '84%', height: '100%' }} initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: "100%" }} transition={{ duration: 5, repeat: Infinity, ease: "linear", delay: 1.5 }}>
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
    visible: { opacity: 1, transition: { duration: 0.8, staggerChildren: 0.3 } }
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };
  const additionalInfo = [
      {
          img: "https://static.wixstatic.com/media/190f21_bca2a1deb3ab4205af8709ba45555ec9~mv2.png/v1/fill/w_400,h_270,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/190f21_bca2a1deb3ab4205af8709ba45555ec9~mv2.png",
          title: "Maritime Safety Standards",
          text: "Compliance with international maritime safety standards is crucial. This includes proper cargo securing, vessel maintenance, and crew training to prevent accidents and ensure smooth passage through international waters.",
          alt: "Maritime Safety Standards",
          color: "teal"
      },
      {
          img: "https://oceantg.com/wp-content/uploads/2024/06/Marine-Reg-2.46028456-copy.png",
          title: "Environmental Regulations",
          text: "Adherence to marine environmental laws is mandatory. This covers ballast water management, emissions control, and waste disposal to protect ocean ecosystems from pollution and invasive species.",
          alt: "Environmental Regulations",
          color: "cyan"
      }
  ];

  const pitfalls = [
    { icon: <FileText className="w-6 h-6 text-yellow-500" />, title: "Incomplete Paperwork", text: "Ensure all customs forms are filled out accurately and completely to prevent hold-ups." },
    { icon: <XCircle className="w-6 h-6 text-red-500" />, title: "Undeclared Items", text: "Verify your cargo against the restricted items list for both ports to avoid confiscation." },
    { icon: <Clock className="w-6 h-6 text-blue-500" />, title: "Ignoring Timelines", text: "Customs clearance can take time. Factor in potential delays to your shipping schedule." }
  ];

  return (
    <motion.div className="bg-gradient-to-br from-amber-50 via-amber-100 to-orange-100 p-8 rounded-xl shadow-2xl mb-8 border-2 border-amber-200" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="text-center mb-4" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
        <motion.h2 className="text-4xl font-black text-indigo-700 mb-4 flex items-center justify-center" whileHover={{ scale: 1.05 }}>
          <motion.span className="mr-3" animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            📜
          </motion.span>
          Port-Specific Regulations
        </motion.h2>
        <motion.p className="text-lg font-bold text-gray-700 max-w-2xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          Comprehensive regulatory information, restricted items, and documentation requirements for your selected shipping ports.
        </motion.p>
      </motion.div>
      <RouteVisual origin={origin} destination={destination} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {portList.map(({ label, port }, index) => (
          port && (
            <motion.div key={label} className="bg-gradient-to-br from-white via-green-50 to-amber-50 p-8 rounded-xl border-2 border-green-300 shadow-xl relative overflow-hidden" variants={cardVariants} whileHover={{ scale: 1.02, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}>
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-500 rounded-full translate-y-12 -translate-x-12"></div>
              </div>
              <div className="relative z-10">
                <motion.div className="flex items-center justify-between mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + index * 0.2 }}>
                  <div className="flex items-center">
                    <motion.div className="bg-indigo-600 p-3 rounded-full mr-4 shadow-lg" whileHover={{ scale: 1.1, rotate: 360 }} transition={{ duration: 0.3 }}>
                      <Globe className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-3xl font-black text-indigo-800">{label} Port</h3>
                      <p className="text-2xl font-extrabold text-gray-800">{port.name}</p>
                      <p className="text-md font-bold text-gray-700 mt-1">Country: <span className="font-extrabold">{port.country}</span></p>
                      <p className="text-md font-bold text-gray-700">UN/LOCODE: <span className="font-extrabold">{port.unlocode}</span></p>
                    </div>
                  </div>
                  <motion.div className="bg-green-100 p-2 rounded-full" whileHover={{ scale: 1.1 }}>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </motion.div>
                </motion.div>
                <motion.div className="mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + index * 0.2 }}>
                  <div className="flex items-center mb-4">
                    <motion.div className="bg-red-200 p-2 rounded-full mr-3" whileHover={{ scale: 1.1 }}>
                      <XCircle className="w-6 h-6 text-red-700" />
                    </motion.div>
                    <h4 className="text-xl font-extrabold text-red-800">Restricted Items</h4>
                  </div>
                  <div className="bg-red-100 p-4 rounded-lg border-2 border-red-500 shadow-inner">
                    <p className="text-sm text-red-800 mb-3 font-semibold">The following items are strictly prohibited or require special permits for this port. Failure to declare may result in seizure and penalties.</p>
                    <ul className="space-y-2">
                      {port.restrictedItems.map((item, idx) => (
                        <motion.li key={idx} className="flex items-center text-red-900 text-lg font-bold" variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 + index * 0.2 + idx * 0.1 }}>
                          <motion.div className="w-2.5 h-2.5 bg-red-600 rounded-full mr-3 flex-shrink-0" whileHover={{ scale: 1.5 }} />
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + index * 0.2 }}>
                  <div className="flex items-center mb-4">
                    <motion.div className="bg-blue-200 p-2 rounded-full mr-3" whileHover={{ scale: 1.1 }}>
                      <FileText className="w-6 h-6 text-blue-700" />
                    </motion.div>
                    <h4 className="text-xl font-extrabold text-blue-800">Required Documentation</h4>
                  </div>
                  <div className="bg-blue-100 p-4 rounded-lg border-2 border-blue-500 shadow-inner">
                    <p className="text-sm text-blue-800 mb-3 font-semibold">Ensure the following documents are accurately prepared and submitted to avoid clearance delays. Originals may be required.</p>
                    <ul className="space-y-2">
                      {port.documents.map((doc, idx) => (
                        <motion.li key={idx} className="flex items-center text-blue-900 text-lg font-bold" variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.7 + index * 0.2 + idx * 0.1 }}>
                          <motion.div className="w-2.5 h-2.5 bg-blue-600 rounded-full mr-3 flex-shrink-0" whileHover={{ scale: 1.5 }} />
                          <span>{doc}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }}>
            <div className="mt-6 bg-black p-4 rounded-xl shadow-lg">
                <motion.img 
                    src="https://www.shipuniverse.com/wp-content/uploads/2025/05/compliance-horizon.jpg" 
                    alt="DNV Regulatory 3 Keys" 
                    className="w-full rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.6 }}
                />
            </div>
            <div className="mt-6 bg-black p-4 rounded-xl shadow-lg">
                <motion.img 
                    src="https://safety4sea.com/wp-content/uploads/2023/09/dnv-regu-3-keys.png" 
                    alt="DNV Regulatory 3 Keys" 
                    className="w-full rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.6 }}
                />
                <p className="text-gray-400 text-sm mt-2 text-center">DNV's key principles for maritime regulatory compliance.</p>
            </div>
        </motion.div>

        <motion.div className="lg:col-span-3 space-y-8" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }}>
            <div>
                <h3 className="text-2xl font-black text-indigo-700 mb-4 flex items-center">
                    <ShieldCheck className="w-6 h-6 mr-3"/>
                    Compliance Guides
                </h3>
                <motion.div className="flex flex-col md:flex-row items-center gap-6 p-4 bg-black rounded-lg shadow-xl" whileHover={{ scale: 1.02, transition: { duration: 0.2 }}}>
                    <img src={additionalInfo[0].img} alt={additionalInfo[0].alt} className="w-full md:w-2/5 h-40 object-cover rounded-md flex-shrink-0" />
                    <div className="text-white">
                        <h4 className={`text-xl font-black text-${additionalInfo[0].color}-400`}>{additionalInfo[0].title}</h4>
                        <p className="text-md font-semibold text-gray-300 mt-2">{additionalInfo[0].text}</p>
                    </div>
                </motion.div>
                 <motion.div className="flex flex-col md:flex-row-reverse items-center gap-6 p-4 bg-black rounded-lg shadow-xl mt-6" whileHover={{ scale: 1.02, transition: { duration: 0.2 }}}>
                    <img src={additionalInfo[1].img} alt={additionalInfo[1].alt} className="w-full md:w-2/5 h-40 object-cover rounded-md flex-shrink-0" />
                    <div className="text-white">
                        <h4 className={`text-xl font-black text-${additionalInfo[1].color}-400`}>{additionalInfo[1].title}</h4>
                        <p className="text-md font-semibold text-gray-300 mt-2">{additionalInfo[1].text}</p>
                    </div>
                </motion.div>
            </div>
            
            <motion.div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-xl border-2 border-indigo-200 shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6 }}>
                <motion.h3 className="text-xl font-black text-indigo-700 mb-4 flex items-center" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.7 }}>
                  <motion.span className="mr-2" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                    💡
                  </motion.span>
                  Important Shipping Guidelines
                </motion.h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-bold">
                  {[
                    { icon: <Clock className="w-5 h-5" />, title: 'Processing Time', content: 'Allow 24-48 hours for documentation review and clearance.', color: 'orange' },
                    { icon: <AlertTriangle className="w-5 h-5" />, title: 'Critical Notice', content: 'Non-compliance may result in cargo delays or penalties.', color: 'red' },
                    { icon: <Bookmark className="w-5 h-5" />, title: 'Verify Updates', content: 'Regulations change frequently. Always verify requirements.', color: 'blue' },
                    { icon: <ShieldCheck className="w-5 h-5" />, title: 'Cargo Insurance', content: 'Ensure your shipment is adequately insured against all risks.', color: 'green' }
                  ].map((item, index) => (
                    <motion.div key={index} className={`p-4 bg-white rounded-lg shadow-md border-l-4 border-${item.color}-500`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 + index * 0.1 }} whileHover={{ scale: 1.05, y: -2 }}>
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
      </div>
    </motion.div>
  );
}

export default RegulatoryInfo;
