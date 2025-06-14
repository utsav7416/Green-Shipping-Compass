import { useState, useEffect } from 'react';

function Privacy() {
  const [visibleSections, setVisibleSections] = useState({
    header: false,
    introduction: false,
    collect: false,
    usage: false,
    security: false,
    contact: false
  });

  useEffect(() => {
    const timeouts = [
      setTimeout(() => setVisibleSections(prev => ({ ...prev, header: true })), 100),
      setTimeout(() => setVisibleSections(prev => ({ ...prev, introduction: true })), 350),
      setTimeout(() => setVisibleSections(prev => ({ ...prev, collect: true })), 600),
      setTimeout(() => setVisibleSections(prev => ({ ...prev, usage: true })), 850),
      setTimeout(() => setVisibleSections(prev => ({ ...prev, security: true })), 1100),
      setTimeout(() => setVisibleSections(prev => ({ ...prev, contact: true })), 1350)
    ];

    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className={`text-center mb-12 transition-all duration-700 ${
        visibleSections.header ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <h1 className="text-4xl font-extrabold text-green-600 mb-2 tracking-tight">
          🛡️ Privacy Policy
        </h1>
        <p className="text-black font-extrabold max-w-2xl mx-auto text-base">
          Transparency and trust are at the heart of everything we do at Green Shipping Compass.
        </p>
      </div>

      <div className="bg-gradient-to-br from-green-900 via-slate-900 to-black rounded-2xl shadow-xl p-10 grid grid-cols-1 md:grid-cols-2 gap-10 text-gray-100 backdrop-blur-sm border border-white/10">
        <section className={`transition-all duration-700 ${
          visibleSections.introduction ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-xl font-semibold text-green-400 mb-3">Introduction</h2>
          <p>
            This Privacy Policy explains how Green Shipping Compass collects, uses, and protects your personal information when you use our shipping calculator service.
          </p>
        </section>

        <section className={`transition-all duration-700 ${
          visibleSections.collect ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-xl font-semibold text-green-400 mb-3">Information We Collect</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Shipping origin and destination details</li>
            <li>Cargo information (weight, quantity)</li>
            <li>Selected shipping preferences</li>
            <li>Usage data and analytics</li>
          </ul>
        </section>

        <section className={`transition-all duration-700 ${
          visibleSections.usage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-xl font-semibold text-green-400 mb-3">How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>To provide accurate shipping cost calculations</li>
            <li>To improve our services and user experience</li>
            <li>To analyze usage patterns and optimize our calculator</li>
            <li>To communicate important updates and changes</li>
          </ul>
        </section>

        <section className={`transition-all duration-700 ${
          visibleSections.security ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-xl font-semibold text-green-400 mb-3">Data Security</h2>
          <p>
            Your data is processed securely and is only used for the intended purposes.
          </p>
        </section>

        <section className={`md:col-span-2 transition-all duration-700 ${
          visibleSections.contact ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-xl font-semibold text-green-400 mb-3">Contact Us</h2>
          <p>
            If you have any questions about our Privacy Policy or how we handle your data, please contact us at +91 88268 34155 or at <span className="underline">privacy@greenshippingcompass.com</span>.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Privacy;