import { useState, useEffect } from 'react';

function Terms() {
  const [visibleSections, setVisibleSections] = useState({
    header: false,
    agreement: false,
    license: false,
    disclaimer: false,
    limitations: false,
    changes: false
  });

  useEffect(() => {
    const timeouts = [
      setTimeout(() => setVisibleSections(prev => ({ ...prev, header: true })), 100),
      setTimeout(() => setVisibleSections(prev => ({ ...prev, agreement: true })), 350),
      setTimeout(() => setVisibleSections(prev => ({ ...prev, license: true })), 600),
      setTimeout(() => setVisibleSections(prev => ({ ...prev, disclaimer: true })), 850),
      setTimeout(() => setVisibleSections(prev => ({ ...prev, limitations: true })), 1100),
      setTimeout(() => setVisibleSections(prev => ({ ...prev, changes: true })), 1350)
    ];

    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className={`text-center mb-12 transition-all duration-700 ${
        visibleSections.header ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <h1 className="text-4xl font-extrabold text-green-600 mb-2 tracking-tight">
          📜 Terms of Service
        </h1>
        <p className="text-black font-extrabold max-w-2xl mx-auto text-base">
          Please review the following terms carefully before using Green Shipping Compass.
        </p>
      </div>

      <div className="bg-gradient-to-br from-green-900 via-slate-900 to-black rounded-2xl shadow-xl p-10 grid grid-cols-1 md:grid-cols-2 gap-10 text-gray-100 backdrop-blur-sm border border-white/10">
        <section className={`transition-all duration-700 ${
          visibleSections.agreement ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-xl font-semibold text-green-400 mb-3">Agreement to Terms</h2>
          <p>
            By accessing and using Green Shipping Compass, you agree to be bound by these Terms of Service and all applicable laws and regulations.
          </p>
        </section>

        <section className={`transition-all duration-700 ${
          visibleSections.license ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-xl font-semibold text-green-400 mb-3">Use License</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>The shipping calculator is provided for informational purposes only</li>
            <li>Calculations are estimates and may vary from actual shipping costs</li>
            <li>Users must verify final costs with shipping providers</li>
            <li>Unauthorized commercial use is prohibited</li>
          </ul>
        </section>

        <section className={`transition-all duration-700 ${
          visibleSections.disclaimer ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-xl font-semibold text-green-400 mb-3">Disclaimer</h2>
          <p>
            The information provided by our calculator is for estimation purposes only. We make no warranties about the accuracy, reliability, or availability of the service. Users should verify all information with their shipping providers.
          </p>
        </section>

        <section className={`transition-all duration-700 ${
          visibleSections.limitations ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-xl font-semibold text-green-400 mb-3">Limitations</h2>
          <p>
            We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
          </p>
        </section>

        <section className={`md:col-span-2 transition-all duration-700 ${
          visibleSections.changes ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-xl font-semibold text-green-400 mb-3">Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Terms;