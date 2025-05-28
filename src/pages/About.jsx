function About() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-green-600 mb-2 tracking-tight">
          🌿 About Green Shipping Compass
        </h1>
        <p className="text-black font-extrabold max-w-2xl mx-auto text-base">
          Learn more about our vision, what we offer, and how our platform promotes greener logistics.
        </p>
      </div>

      <div className="bg-gradient-to-br from-orange-900 via-zinc-900 to-black rounded-2xl shadow-xl p-10 grid grid-cols-1 md:grid-cols-2 gap-10 text-gray-100 backdrop-blur-sm border border-white/10">
        <section>
          <h2 className="text-xl font-semibold text-green-400 mb-3">Our Mission</h2>
          <p>
            Green Shipping Compass is dedicated to revolutionizing the shipping industry by promoting sustainable and efficient shipping solutions. Our mission is to help businesses and individuals make informed decisions about their shipping needs while minimizing environmental impact.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-green-400 mb-3">What We Offer</h2>
          <ul className="list-disc list-inside space-y-2">
            
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-green-400 mb-3">Our Commitment to Sustainability</h2>
          <p>
            We believe in the importance of sustainable shipping practices. Our calculator helps you understand the environmental impact of your shipping choices and offers eco-friendly alternatives that reduce carbon emissions while maintaining efficiency.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-green-400 mb-3">How It Works</h2>
          <div className="space-y-2">
            <p>Our shipping calculator takes into account several key factors:</p>
            <ul className="list-disc list-inside ml-4">
              <li>Port-to-port distance calculation</li>
              <li>Cargo weight and quantity</li>
              <li>Multiple shipping methods with varying speeds</li>
              <li>Environmental impact assessment</li>
              <li>Real-time cost calculation and breakdown</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

export default About;
