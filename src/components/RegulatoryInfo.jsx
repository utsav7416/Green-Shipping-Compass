import React from 'react';
import { ports } from '../data/ports';

function RegulatoryInfo({ origin, destination }) {
  if (!origin || !destination) return null;

  const portList = [
    { label: 'Origin', port: ports[origin] ? { ...ports[origin], name: origin } : null },
    { label: 'Destination', port: ports[destination] ? { ...ports[destination], name: destination } : null }
  ];

  return (
    <div className="my-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {portList.map(({ label, port }) => (
          port && (
            <div key={label} className="bg-gradient-to-br from-green-50 to-amber-50 p-8 rounded-xl border-2 border-green-300 shadow-lg">
              <h3 className="text-2xl font-extrabold text-primary-700 mb-4">{label}: {port.name}</h3>
              <div className="mb-4">
                <div className="text-lg font-bold text-green-800 mb-2">Restricted Items</div>
                <ul className="list-disc pl-6 space-y-1 text-lg font-semibold text-red-700">
                  {port.restrictedItems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-800 mb-2">Key Documents / Compliance</div>
                <ul className="list-disc pl-6 space-y-1 text-lg font-semibold text-blue-700">
                  {port.documents.map((doc, idx) => (
                    <li key={idx}>{doc}</li>
                  ))}
                </ul>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

export default RegulatoryInfo;
