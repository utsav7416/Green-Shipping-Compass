import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const mindMapNodes = {
    shipper: { name: 'Shipper', details: 'Owner of the cargo being transported.', connections: ['forwarder', 'carrier'] },
    forwarder: { name: 'Freight Forwarder', details: 'Organizes the shipment for the shipper.', connections: ['shipper', 'carrier', 'broker'] },
    carrier: { name: 'Carrier', details: 'Transports the container via sea.', connections: ['shipper', 'forwarder', 'customs', 'port'] },
    broker: { name: 'Customs Broker', details: 'Manages customs clearance.', connections: ['forwarder', 'customs'] },
    customs: { name: 'Customs', details: 'Inspects and clears goods.', connections: ['carrier', 'broker'] },
    port: { name: 'Port', details: 'Manages terminal operations.', connections: ['carrier']}
};

const StakeholderMindMap = () => {
    const [activeNode, setActiveNode] = useState('carrier');
    const nodeKeys = Object.keys(mindMapNodes);
    const angleStep = (2 * Math.PI) / nodeKeys.length;
    const radius = 120;

    return (
        <div className="bg-black p-6 rounded-2xl border border-teal-500/30 w-full min-h-[350px] flex flex-col items-center justify-center">
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-green-400 mb-4">Supply Chain Network</h3>
            <div className="relative w-full h-[250px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeNode}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        className="text-center z-10 w-40"
                    >
                        <h4 className="font-bold text-teal-300 text-lg">{mindMapNodes[activeNode].name}</h4>
                        <p className="text-sm text-slate-300 h-12">{mindMapNodes[activeNode].details}</p>
                    </motion.div>
                </AnimatePresence>
                
                {nodeKeys.map((key, index) => {
                    const angle = angleStep * index - Math.PI / 2;
                    const x = radius * Math.cos(angle);
                    const y = radius * Math.sin(angle);
                    const isActive = activeNode === key;
                    const isConnected = mindMapNodes[activeNode].connections.includes(key);

                    return (
                        <motion.button
                            key={key}
                            onMouseEnter={() => setActiveNode(key)}
                            animate={{
                                x: x,
                                y: y,
                                scale: isActive ? 1.2 : 1,
                                opacity: isActive || isConnected ? 1 : 0.6
                            }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className={`absolute px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-colors ${isActive ? 'bg-teal-400 text-slate-900' : 'bg-slate-700 text-slate-300'}`}
                        >
                            {mindMapNodes[key].name}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

function Demurrage() {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-black text-white p-4 md:p-8 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        
        <header className="text-center mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-white leading-relaxed pb-2">Delay Terminologies and the Stakeholder Web</h1>
          <p className="text-white mt-3 text-lg">
            Understanding key roles of <span className="text-2xl font-bold text-teal-300">Demurrage</span> and <span className="text-2xl font-bold text-amber-400">Detention</span> fees in the shipping lifecycle.
          </p>
        </header>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          <div className="bg-black p-6 rounded-2xl border border-teal-500/30 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-28 h-28 bg-black rounded-full flex items-center justify-center relative flex-shrink-0 border border-teal-500/20">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute w-1 h-12 bg-teal-400" style={{ top: '50%', left: '50%', transformOrigin: 'bottom' }}/>
              <div className="w-2 h-2 bg-white rounded-full"/>
            </div>
            <div>
              <h3 className="font-bold text-2xl text-teal-400">Demurrage</h3>
              <p className="text-slate-400 mt-2 text-lg">Fees for using port equipment beyond the "free time" after vessel arrival.</p>
              <p className="text-sm text-center sm:text-left text-slate-300 mt-2 bg-black px-2 py-1 rounded border border-slate-700">Timeline: Starts when container is discharged from vessel.</p>
            </div>
          </div>

          <div className="bg-black p-6 rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-28 h-28 bg-black rounded-full flex items-center justify-center relative flex-shrink-0 border border-amber-500/20">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute w-1 h-12 bg-amber-400" style={{ top: '50%', left: '50%', transformOrigin: 'bottom' }}/>
                <div className="w-2 h-2 bg-white rounded-full"/>
            </div>
            <div>
              <h3 className="font-bold text-2xl text-amber-400">Detention</h3>
              <p className="text-slate-400 mt-2 text-lg">Fees for using the carrier's container outside the port beyond "free time".</p>
              <p className="text-sm text-center sm:text-left text-slate-300 mt-2 bg-black px-2 py-1 rounded border border-slate-700">Timeline: Starts when container is picked up from port.</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mb-8 bg-black p-6 rounded-2xl border border-slate-700"
        >
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-green-500 mb-4 text-center">
            Key Differences Between Demurrage and Detention
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div className="bg-black p-4 rounded-xl border border-teal-500/30">
              <h3 className="text-xl font-bold text-teal-400 mb-3">Demurrage</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0"><div className="w-2 h-2 bg-teal-400 rounded-full"></div></div>
                  <p className="text-slate-300 text-sm"><span className="font-bold text-teal-400 mr-2">Location:</span>Container remains at port/terminal</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0"><div className="w-2 h-2 bg-teal-400 rounded-full"></div></div>
                  <p className="text-slate-300 text-sm"><span className="font-bold text-teal-400 mr-2">Responsibility:</span>Port authority charges for storage space</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0"><div className="w-2 h-2 bg-teal-400 rounded-full"></div></div>
                  <p className="text-slate-300 text-sm"><span className="font-bold text-teal-400 mr-2">Timeline:</span>Begins after vessel discharge</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0"><div className="w-2 h-2 bg-teal-400 rounded-full"></div></div>
                  <p className="text-slate-300 text-sm"><span className="font-bold text-teal-400 mr-2">Purpose:</span>Compensates port for yard space usage</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0"><div className="w-2 h-2 bg-teal-400 rounded-full"></div></div>
                  <p className="text-slate-300 text-sm"><span className="font-bold text-teal-400 mr-2">Control:</span>Limited shipper/consignee control</p>
                </div>
              </div>
            </div>
            
            <div className="bg-black p-4 rounded-xl border border-amber-500/30">
              <h3 className="text-xl font-bold text-amber-400 mb-3">Detention</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0"><div className="w-2 h-2 bg-amber-400 rounded-full"></div></div>
                  <p className="text-slate-300 text-sm"><span className="font-bold text-amber-400 mr-2">Location:</span>Container outside port premises</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0"><div className="w-2 h-2 bg-amber-400 rounded-full"></div></div>
                  <p className="text-slate-300 text-sm"><span className="font-bold text-amber-400 mr-2">Responsibility:</span>Shipping line charges for equipment use</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0"><div className="w-2 h-2 bg-amber-400 rounded-full"></div></div>
                  <p className="text-slate-300 text-sm"><span className="font-bold text-amber-400 mr-2">Timeline:</span>Begins after container pickup from port</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0"><div className="w-2 h-2 bg-amber-400 rounded-full"></div></div>
                  <p className="text-slate-300 text-sm"><span className="font-bold text-amber-400 mr-2">Purpose:</span>Compensates carrier for container usage</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0"><div className="w-2 h-2 bg-amber-400 rounded-full"></div></div>
                  <p className="text-slate-300 text-sm"><span className="font-bold text-amber-400 mr-2">Control:</span>Full shipper/consignee control</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="bg-black p-4 rounded-xl border border-slate-600">
              <h3 className="text-lg font-bold text-slate-200 mb-3">Critical Understanding</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0"><div className="w-2 h-2 bg-teal-400 rounded-full"></div></div>
                  <p className="text-slate-300 text-sm"><span className="font-bold text-teal-400 mr-2">Demurrage:</span>"Parking fee" for containers at port beyond free time</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0"><div className="w-2 h-2 bg-amber-400 rounded-full"></div></div>
                  <p className="text-slate-300 text-sm"><span className="font-bold text-amber-400 mr-2">Detention:</span>"Equipment rental fee" for containers outside port</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0"><div className="w-2 h-2 bg-green-400 rounded-full"></div></div>
                  <p className="text-slate-300 text-sm"><span className="font-bold text-green-400 mr-2">Purpose:</span>Encourage efficient container turnover</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0"><div className="w-2 h-2 bg-green-400 rounded-full"></div></div>
                   <p className="text-slate-300 text-sm"><span className="font-bold text-green-400 mr-2">Impact:</span>Different phases, different entities charging</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <img 
                src="https://i0.wp.com/www.shiplyst.com/blog/wp-content/uploads/2018/08/blog-6.jpg?resize=600%2C381" 
                alt="Global Shipping Journey" 
                className="w-full max-w-sm h-auto object-cover rounded-xl shadow-2xl border border-slate-700" 
              />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8 items-start">
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2"
          >
            <StakeholderMindMap />
          </motion.div>

          <div className="lg:col-span-3 grid grid-cols-2 gap-4">
            <motion.div
              variants={itemVariants}
              className="bg-black p-4 rounded-2xl border border-slate-700"
            >
              <h3 className="text-xl font-bold text-amber-400 mb-3">Cost Comparison</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-3 h-3 bg-teal-400 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-teal-400 text-sm">Per day demurrage</div>
                      <div className="text-teal-400 font-bold text-lg">$50-200</div>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Port/terminal charges</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-amber-400 text-sm">Per day detention</div>
                      <div className="text-amber-400 font-bold text-lg">$75-300</div>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Carrier equipment charges</div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Costs vary by port location, container type, and shipping line policies
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-black p-4 rounded-2xl border border-slate-700"
            >
              <h3 className="text-xl font-bold text-green-400 mb-3">Free Time Periods</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-green-400 text-sm">Import Demurrage</div>
                      <div className="text-green-400 font-bold text-sm">3-7 days</div>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">After vessel discharge</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-green-400 text-sm">Export Demurrage</div>
                      <div className="text-green-400 font-bold text-sm">5-10 days</div>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Before vessel loading</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-green-400 text-sm">Container Detention</div>
                      <div className="text-green-400 font-bold text-sm">7-14 days</div>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">After port pickup</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Demurrage;
