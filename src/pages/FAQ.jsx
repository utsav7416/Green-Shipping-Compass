import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, Clock, FileText, Globe, Truck } from 'lucide-react';

function FAQ() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState({});
  const [visibleSections, setVisibleSections] = useState([]);

  const faqData = [
    {
      category: 'Transit Times',
      icon: <Clock className="w-5 h-5" />,
      items: [
        {
          question: 'How long does sea freight typically take?',
          answer: 'Sea freight transit times vary by route: Asia to US West Coast (14-21 days), Asia to US East Coast (28-35 days), Europe to US (10-14 days), Asia to Europe (20-30 days). These are port-to-port times and don\'t include inland transportation or customs clearance.'
        },
        {
          question: 'What factors affect shipping transit times?',
          answer: 'Transit times are affected by: shipping route and distance, vessel schedule and frequency, port congestion, weather conditions, customs clearance procedures, inland transportation, and peak shipping seasons (especially before Chinese New Year and holiday seasons).'
        },
        {
          question: 'How can I track my shipment?',
          answer: 'You can track your shipment using: Bill of Lading (B/L) number, Container number, Booking reference number. Most shipping lines provide online tracking portals, and you can also use third-party tracking services for consolidated tracking across multiple carriers.'
        }
      ]
    },
    {
      category: 'Documentation',
      icon: <FileText className="w-5 h-5" />,
      items: [
        {
          question: 'What documents are required for international shipping?',
          answer: 'Essential documents include: Commercial Invoice, Packing List, Bill of Lading (B/L), Certificate of Origin, Export/Import licenses (if required), Insurance certificate, Customs declaration forms. Additional documents may be required based on product type and destination country.'
        },
        {
          question: 'What is a Bill of Lading (B/L)?',
          answer: 'A Bill of Lading is a legal document that serves as: Receipt of goods from the shipper, Contract of carriage between shipper and carrier, Document of title that can be used to claim goods at destination. There are different types including Straight B/L, To Order B/L, and Bearer B/L.'
        },
        {
          question: 'Do I need a Certificate of Origin?',
          answer: 'A Certificate of Origin is required when: Importing goods into countries with preferential trade agreements, Customs authorities require proof of manufacturing origin, Banking requirements for Letters of Credit, Insurance claims require origin verification. Check with destination country requirements.'
        }
      ]
    },
    {
      category: 'Incoterms',
      icon: <Globe className="w-5 h-5" />,
      items: [
        {
          question: 'What are Incoterms and why are they important?',
          answer: 'Incoterms (International Commercial Terms) define: Who is responsible for shipping costs, Risk transfer points between buyer and seller, Insurance responsibilities, Customs clearance obligations. They prevent disputes by clearly defining responsibilities for each party in the transaction.'
        },
        {
          question: 'What is the difference between FOB and CIF?',
          answer: 'FOB (Free On Board): Seller delivers goods on board the vessel, buyer pays for main carriage and insurance, risk transfers when goods cross ship\'s rail. CIF (Cost, Insurance, Freight): Seller pays for main carriage and insurance, but risk still transfers at ship\'s rail, buyer handles import customs and delivery.'
        },
        {
          question: 'Which Incoterm should I choose?',
          answer: 'Choice depends on: Your experience with international trade, Control desired over logistics, Risk tolerance, Cost considerations. Beginners often prefer CIF/CIP (seller handles more), experienced traders may choose FOB/FCA for better control and potentially lower costs.'
        }
      ]
    },
    {
      category: 'Shipping Costs',
      icon: <Truck className="w-5 h-5" />,
      items: [
        {
          question: 'How are shipping costs calculated?',
          answer: 'Shipping costs are based on: Base freight rate (per container or per ton), Fuel surcharges (BAF - Bunker Adjustment Factor), Port handling charges, Documentation fees, Customs clearance fees, Inland transportation costs, Insurance (if required), Peak season surcharges.'
        },
        {
          question: 'What additional costs should I expect?',
          answer: 'Additional costs may include: Terminal handling charges, Customs brokerage fees, Duty and taxes, Storage/demurrage fees, Inspection fees, Late documentation penalties, Currency adjustment factors, Security surcharges, Peak season premiums.'
        },
        {
          question: 'How can I reduce shipping costs?',
          answer: 'Cost reduction strategies: Consolidate shipments to achieve better rates, Choose slower transit options, Optimize packaging to reduce volume, Book during off-peak seasons, Negotiate annual contracts for regular shipments, Use FCL instead of LCL when volume justifies, Compare multiple carriers and routes.'
        }
      ]
    },
    {
      category: 'Container Types',
      icon: <Truck className="w-5 h-5" />,
      items: [
        {
          question: 'What container types are available?',
          answer: 'Common container types: 20ft Standard (33 CBM), 40ft Standard (67 CBM), 40ft High Cube (76 CBM), 20ft/40ft Refrigerated (Reefer), Open Top containers, Flat Rack containers, Tank containers for liquids. Choose based on cargo type, volume, and special requirements.'
        },
        {
          question: 'When should I use FCL vs LCL?',
          answer: 'Use FCL (Full Container Load) when: You have enough cargo to fill most of a container, Need faster transit times, Shipping fragile/valuable goods, Want better control over handling. Use LCL (Less than Container Load) when: Cargo volume is small, Cost is primary concern, Flexible on timing.'
        },
        {
          question: 'What are container weight limits?',
          answer: 'Standard weight limits: 20ft container: Max gross weight 24,000 kg (payload ~21,600 kg), 40ft container: Max gross weight 30,480 kg (payload ~26,680 kg). Actual limits may vary by shipping line and route. Always verify weight restrictions with your carrier and consider road weight limits in origin/destination countries.'
        }
      ]
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      faqData.forEach((_, index) => {
        setTimeout(() => {
          setVisibleSections(prev => [...prev, index]);
        }, index * 200);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const filteredFAQ = useMemo(() => {
    if (!searchTerm) return faqData;
    
    return faqData.map(category => ({
      ...category,
      items: category.items.filter(item => 
        item.question.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(category => category.items.length > 0);
  }, [searchTerm]);

  const toggleExpanded = (categoryIndex, itemIndex) => {
    const key = `${categoryIndex}-${itemIndex}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12 opacity-0 animate-fade-in-up" style={{animation: 'fadeInUp 0.8s ease-out forwards'}}>
        <h1 className="text-4xl font-extrabold text-green-600 mb-2 tracking-tight">
          📋 Shipping Frequently Asked Questions
        </h1>
        <p className="text-black font-extrabold max-w-2xl mx-auto text-base">
          Find quick answers to common questions about transit times, documentation, incoterms, and shipping costs.
        </p>
      </div>

      <div className="mb-8 max-w-2xl mx-auto opacity-0" style={{animation: 'fadeInUp 0.8s ease-out 0.2s forwards'}}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search FAQ... (e.g., 'transit times', 'bill of lading', 'incoterms')"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-700 bg-white shadow-lg transition-all duration-300 hover:shadow-xl focus:scale-105"
          />
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-900 via-zinc-900 to-black rounded-2xl shadow-xl p-10 text-gray-100 backdrop-blur-sm border border-white/10 opacity-0" style={{animation: 'fadeInUp 0.8s ease-out 0.4s forwards'}}>
        {filteredFAQ.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xl text-gray-300">No FAQ items found matching your search.</p>
            <p className="text-gray-400 mt-2">Try different keywords or browse all categories.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredFAQ.map((category, categoryIndex) => (
              <section 
                key={categoryIndex}
                className={`transform transition-all duration-700 ${
                  visibleSections.includes(categoryIndex)
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-8 opacity-0'
                }`}
              >
                <div className="flex items-center mb-6 group">
                  <div className="text-green-400 mr-3 transform transition-transform duration-300 group-hover:scale-110">
                    {category.icon}
                  </div>
                  <h2 className="text-2xl font-semibold text-green-400 transition-colors duration-300 group-hover:text-green-300">
                    {category.category}
                  </h2>
                </div>
                
                <div className="space-y-4">
                  {category.items.map((item, itemIndex) => {
                    const key = `${categoryIndex}-${itemIndex}`;
                    const isExpanded = expandedItems[key];
                    
                    return (
                      <div key={itemIndex} className="border border-white/10 rounded-lg overflow-hidden bg-black/20 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-green-400/30">
                        <button
                          onClick={() => toggleExpanded(categoryIndex, itemIndex)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-all duration-300"
                        >
                          <h3 className="text-xl font-medium text-white pr-4 transition-colors duration-300 hover:text-green-300">
                            {item.question}
                          </h3>
                          <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-green-400 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-green-400 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                        
                        <div className={`transition-all duration-500 ease-in-out ${
                          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        } overflow-hidden`}>
                          <div className="px-6 pb-6">
                            <div className="border-t border-white/10 pt-4">
                              <p className="text-gray-300 leading-relaxed text-lg">
                                {item.answer}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default FAQ;