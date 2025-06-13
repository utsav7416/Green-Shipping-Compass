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

const featureVariants = {
  hidden: { opacity: 0, y: 60, rotateX: 15 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.9,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const featuresData = [
  {
    icon: "🌍",
    title: "Global Reach, Local Expertise",
    description: "Connect to major ports worldwide with real-time tracking and updates. Your cargo, globally.",
    accent: "from-emerald-400 to-teal-500",
    image: "https://thumbs.dreamstime.com/b/qatar-boat-show-old-doha-port-mina-district-november-resorts-world-one-cruise-ship-360359141.jpg"
  },
  {
    icon: "🌱",
    title: "Pioneering Sustainable Shipping",
    description: "Sustainable shipping solutions that reduce environmental impact. Green logistics for a better tomorrow.",
    accent: "from-green-400 to-emerald-500",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc7PvmPC3PWr0fPc5z81QXC7uBJAY1_6lHTA&s"
  },
  {
    icon: "💰",
    title: "Cost Optimization, Max Value",
    description: "ML-powered pricing for competitive shipping rates, ensuring efficiency and cost-effectiveness.",
    accent: "from-blue-400 to-cyan-500",
    image: "https://media.istockphoto.com/id/525122989/photo/skyline-of-hong-kong-island-at-night.jpg?s=612x612&w=0&k=20&c=xc_cME_fr3SHbn3Hlpc9bzr4opunBMcLbbSw-9Kjjd0="
  },
  {
    icon: "⚡",
    title: "Quick Transit & Reliability",
    description: "Express shipping options for time-sensitive cargo, ensuring swift and secure delivery.",
    accent: "from-sky-400 to-blue-500",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRG9CygEd9VRd-UyNJNkpHHyHgubOlJMi2Vkg&s"
  },
  {
    icon: "📊",
    title: "Actionable Data Analytics",
    description: "Gain deep insights into your logistics with comprehensive data and easy-to-understand reports.",
    accent: "from-cyan-400 to-teal-500",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTN3azRNGUwirQqccdXOr_j2nEaQyJC0S8e3Q&s"
  },
  {
    icon: "🔒",
    title: "Secure & Insured Shipping",
    description: "Advanced cargo protection and comprehensive insurance options for peace of mind.",
    accent: "from-teal-400 to-green-500",
    image: "https://media.istockphoto.com/id/186161316/photo/hong-kong-skyline-with-cruise.jpg?s=612x612&w=0&k=20&c=te6R_bYJ82wzTz-dbxZzQlBQU9UfKylSJXOeBIHzdcU="
  },
];

function Features() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.05,
  });

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-green-300 via-sky-100 to-cyan-200 py-24">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-300/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-sky-200/20 rounded-full blur-3xl" />
      </div>
      
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {featuresData.map((feature, index) => (
            <motion.div
              key={index}
              variants={featureVariants}
              whileHover={{
                y: -15,
                rotateY: 5,
                transition: { duration: 0.4 }
              }}
              className="group relative overflow-hidden"
            >
              <div className="relative h-80 rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-20 group-hover:opacity-30 transition-opacity duration-500`} />
                
                <div className="absolute top-6 left-6">
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 15 }}
                    transition={{ duration: 0.3 }}
                    className="text-5xl filter drop-shadow-lg"
                  >
                    {feature.icon}
                  </motion.div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={inView ? { y: 0, opacity: 1 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.1 + 0.5 }}
                  >
                    <h3 className="text-2xl font-bold text-white mb-3 leading-tight">
                      {feature.title}
                    </h3>
                    <p className="text-gray-200 text-sm leading-relaxed opacity-90">
                      {feature.description}
                    </p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={inView ? { scaleX: 1 } : {}}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.8 }}
                    className={`h-1 bg-gradient-to-r ${feature.accent} rounded-full mt-4 origin-left`}
                  />
                </div>

                <motion.div
                  className="absolute inset-0 border-4 border-white/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(255, 255, 255, 0)",
                      "0 0 0 8px rgba(255, 255, 255, 0.1)",
                      "0 0 0 0 rgba(255, 255, 255, 0)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default Features;