import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

function Features() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const features = [
    {
      icon: "🌍",
      title: "Global Coverage",
      description: "Access to major ports worldwide with real-time tracking and updates",
    },
    {
      icon: "🌱",
      title: "Eco-Friendly Options",
      description: "Sustainable shipping solutions that reduce environmental impact",
    },
    {
      icon: "💰",
      title: "Cost Optimization",
      description: "ML-powered pricing for the most competitive shipping rates",
    },
    {
      icon: "⚡",
      title: "Quick Transit",
      description: "Express shipping options for time-sensitive cargo",
    },
    {
      icon: "📊",
      title: "Analytics",
      description: "Detailed insights and reporting on your shipping operations",
    },
    {
      icon: "🔒",
      title: "Secure Shipping",
      description: "Advanced cargo protection and insurance options",
    },
  ];

  return (
    <div
      ref={ref}
      className="bg-gradient-to-b from-green-300 via-sky-100 to-cyan-200 py-20"
    >
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl font-extrabold text-gray-800 mb-4">Why Choose Us</h2>
          <p className="text-black font-extrabold max-w-2xl mx-auto">
            Experience the future of shipping with our comprehensive suite of services
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="relative p-8 rounded-2xl shadow-xl bg-white/60 backdrop-blur-sm border border-white/30 hover:shadow-[0_20px_30px_rgba(0,0,0,0.1)] transition-all duration-300"
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [-2, 2, -2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-6xl mb-6 text-center"
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                {feature.title}
              </h3>
              <p className="text-gray-700 text-center">{feature.description}</p>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-300 to-teal-400 rounded-t-2xl" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default Features;
