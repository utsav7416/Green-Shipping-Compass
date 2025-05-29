function Privacy() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-green-600 mb-2 tracking-tight">
          🛡️ Privacy Policy
        </h1>
        <p className="text-black font-extrabold max-w-2xl mx-auto text-base">
          Transparency and trust are at the heart of everything we do at Green Shipping Compass.
        </p>
      </div>

      <div className="bg-gradient-to-br from-green-900 via-slate-900 to-black rounded-2xl shadow-xl p-10 grid grid-cols-1 md:grid-cols-2 gap-10 text-gray-100 backdrop-blur-sm border border-white/10">
        <section>
          <h2 className="text-xl font-semibold text-green-400 mb-3">Introduction</h2>
          <p>
            This Privacy Policy explains how Green Shipping Compass collects, uses, and protects your personal information when you use our shipping calculator service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-green-400 mb-3">Information We Collect</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Shipping origin and destination details</li>
            <li>Cargo information (weight, quantity)</li>
            <li>Selected shipping preferences</li>
            <li>Usage data and analytics</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-green-400 mb-3">How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>To provide accurate shipping cost calculations</li>
            <li>To improve our services and user experience</li>
            <li>To analyze usage patterns and optimize our calculator</li>
            <li>To communicate important updates and changes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-green-400 mb-3">Data Security</h2>
          <p>
            We implement appropriate security measures to protect your information from unauthorized access, alteration, or disclosure. Your data is processed securely and is only used for the intended purposes.
          </p>
        </section>

        <section className="md:col-span-2">
          <h2 className="text-xl font-semibold text-green-400 mb-3">Contact Us</h2>
          <p>
            If you have any questions about our Privacy Policy or how we handle your data, please contact us at <span className="underline">privacy@greenshippingcompass.com</span>.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Privacy;
