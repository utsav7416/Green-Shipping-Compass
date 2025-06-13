import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, rotateX: -30 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const plainFeatureVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

const specificImages = [
  "https://thumbs.dreamstime.com/b/qatar-boat-show-old-doha-port-mina-district-november-resorts-world-one-cruise-ship-360359141.jpg",
  "https://media.istockphoto.com/id/186161316/photo/hong-kong-skyline-with-cruise.jpg?s=612x612&w=0&k=20&c=te6R_bYJ82wzTz-dbxZzQlBQU9UfKylSJXOeBIHzdcU=",
  "https://media.istockphoto.com/id/525122989/photo/skyline-of-hong-kong-island-at-night.jpg?s=612x612&w=0&k=20&c=xc_cME_fr3SHbn3Hlpc9bzr4opunBMcLbbSw-9Kjjd0="
];

const featuresData = [
  {
    icon: "🌍",
    title: "Global Reach, Local Expertise",
    description: "Connect to major ports worldwide with real-time tracking and updates. Your cargo, globally.",
    accent: "from-emerald-400 to-teal-500",
    image: specificImages[0]
  },
  {
    icon: "🌱",
    title: "Pioneering Sustainable Shipping",
    description: "Sustainable shipping solutions that reduce environmental impact. Green logistics for a better tomorrow.",
    accent: "from-green-400 to-emerald-500",
    image: specificImages[1]
  },
  {
    icon: "💰",
    title: "Cost Optimization, Max Value",
    description: "ML-powered pricing for competitive shipping rates, ensuring efficiency and cost-effectiveness.",
    accent: "from-blue-400 to-cyan-500",
    image: specificImages[2]
  },
  {
    icon: "⚡",
    title: "Quick Transit & Reliability",
    description: "Express shipping options for time-sensitive cargo, ensuring swift and secure delivery.",
    accent: "from-sky-400 to-blue-500",
  },
  {
    icon: "📊",
    title: "Actionable Data Analytics",
    description: "Gain deep insights into your logistics with comprehensive data and easy-to-understand reports.",
    accent: "from-cyan-400 to-teal-500",
  },
  {
    icon: "🔒",
    title: "Secure & Insured Shipping",
    description: "Advanced cargo protection and comprehensive insurance options for peace of mind.",
    accent: "from-teal-400 to-green-500",
  },
];

function Features() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.05,
  });

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-green-300 via-sky-100 to-cyan-200 py-24">
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={inView ? { width: "100px" } : {}}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-1 bg-gradient-to-r from-sky-400 to-teal-500 mx-auto mb-6 rounded-full"
          />
          <h2 className="text-5xl font-extrabold text-gray-800 mb-6 leading-tight">
            Why Choose Us
          </h2>
          <p className="text-black font-extrabold max-w-3xl mx-auto text-lg leading-relaxed">
            Experience the future of shipping with our comprehensive suite of services, designed for your success.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20"
        >
          {featuresData.slice(0, 3).map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{
                y: -10,
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              className="group relative bg-white/70 backdrop-blur-md rounded-3xl p-8 border border-white/40 shadow-2xl overflow-hidden flex flex-col items-center text-center"
            >
              <div className={`w-full h-2 rounded-t-lg bg-gradient-to-r ${feature.accent} absolute top-0 left-0`}></div>
              <div className="w-full h-64 mb-6 rounded-2xl overflow-hidden shadow-lg border-2 border-gray-100">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="text-7xl mb-6 flex justify-center items-center">
                <span className="relative">
                  {feature.icon}
                  <span className="absolute inset-0 blur-sm opacity-50">{feature.icon}</span>
                </span>
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-3 leading-tight">
                {feature.title}
              </h3>
              <p className="text-gray-700 text-base leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-8 max-w-6xl mx-auto"
        >
          {featuresData.slice(3).map((feature, index) => (
            <motion.div
              key={index}
              variants={plainFeatureVariants}
              whileHover={{
                x: 10,
                transition: { duration: 0.3 }
              }}
              className="flex items-start space-x-6 relative group"
            >
              <div className="flex-shrink-0 text-5xl mt-1 relative z-10">
                {feature.icon}
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-700 text-base leading-relaxed">
                  {feature.description}
                </p>
              </div>
              <div className={`absolute -bottom-4 left-0 w-full h-0.5 rounded-full bg-gradient-to-r from-transparent via-gray-400 to-transparent scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300`}></div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center mt-20"
        >
          <div className="inline-flex items-center space-x-4 bg-white/30 backdrop-blur-sm rounded-full px-8 py-4 border border-white/40">
            {specificImages.map((img, idx) => (
              <motion.img
                key={idx}
                src={img}
                alt=""
                className="w-16 h-10 object-cover rounded-lg shadow-md"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              />
            ))}
            <span className="text-gray-800 font-semibold text-sm">
              Trusted by leading industries worldwide
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Features;