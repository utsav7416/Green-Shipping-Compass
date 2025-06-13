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
  hidden: { opacity: 0, x: -40, rotateY: -15 },
  visible: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

function Features() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.05,
  });

  const features = [
    {
      icon: "🌍",
      title: "Global Coverage",
      description: "Access to major ports worldwide with real-time tracking and updates",
      accent: "from-emerald-400 to-teal-500",
    },
    {
      icon: "🌱",
      title: "Eco-Friendly Options", 
      description: "Sustainable shipping solutions that reduce environmental impact",
      accent: "from-green-400 to-emerald-500",
    },
    {
      icon: "💰",
      title: "Cost Optimization",
      description: "ML-powered pricing for the most competitive shipping rates",
      accent: "from-blue-400 to-cyan-500",
    },
    {
      icon: "⚡",
      title: "Quick Transit",
      description: "Express shipping options for time-sensitive cargo",
      accent: "from-sky-400 to-blue-500",
    },
    {
      icon: "📊",
      title: "Analytics",
      description: "Detailed insights and reporting on your shipping operations",
      accent: "from-cyan-400 to-teal-500",
    },
    {
      icon: "🔒",
      title: "Secure Shipping",
      description: "Advanced cargo protection and insurance options",
      accent: "from-teal-400 to-green-500",
    },
  ];

  const backgroundImages = [
    "https://thumbs.dreamstime.com/b/qatar-boat-show-old-doha-port-mina-district-november-resorts-world-one-cruise-ship-360359141.jpg",
    "https://media.istockphoto.com/id/186161316/photo/hong-kong-skyline-with-cruise.jpg?s=612x612&w=0&k=20&c=te6R_bYJ82wzTz-dbxZzQlBQU9UfKylSJXOeBIHzdcU=",
    "https://media.istockphoto.com/id/525122989/photo/skyline-of-hong-kong-island-at-night.jpg?s=612x612&w=0&k=20&c=xc_mME_fr3SHbn3Hlpc9bzr4opunBMcLbbSw-9Kjjd0="
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-green-300 via-sky-100 to-cyan-200">
      <div className="absolute inset-0 opacity-5">
        {backgroundImages.map((img, idx) => (
          <motion.img
            key={idx}
            src={img}
            alt=""
            className="absolute w-48 h-32 object-cover rounded-lg"
            style={{
              top: `${20 + idx * 25}%`,
              left: `${10 + idx * 30}%`,
              transform: `rotate(${-10 + idx * 5}deg)`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [-10 + idx * 5, -5 + idx * 5, -10 + idx * 5],
            }}
            transition={{
              duration: 8 + idx * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/20 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6 py-24">
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
              Experience the future of shipping with our comprehensive suite of services
            </p>
          </motion.div>

          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 rounded-3xl blur-xl" />
                
                <div className="relative bg-white/70 backdrop-blur-md rounded-3xl p-8 border border-white/40 shadow-2xl overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${feature.accent} opacity-80`} />
                  
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-2xl" />
                  
                  <motion.div
                    whileHover={{ 
                      scale: 1.1,
                      rotate: [0, -5, 5, 0],
                    }}
                    transition={{ duration: 0.3 }}
                    className="relative z-10 text-7xl mb-8 flex justify-center"
                  >
                    <div className="relative">
                      {feature.icon}
                      <div className="absolute inset-0 blur-sm opacity-50">{feature.icon}</div>
                    </div>
                  </motion.div>

                  <div className="relative z-10 text-center space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  <motion.div
                    className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="text-center mt-16"
          >
            <div className="inline-flex items-center space-x-4 bg-white/30 backdrop-blur-sm rounded-full px-8 py-4 border border-white/40">
              {backgroundImages.slice(0, 3).map((img, idx) => (
                <motion.img
                  key={idx}
                  src={img}
                  alt=""
                  className="w-12 h-8 object-cover rounded-lg shadow-md"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                />
              ))}
              <span className="text-gray-800 font-semibold text-sm">
                Trusted by ports worldwide
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Features;