import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import CountUp from "react-countup";

function ShippingStats() {
  
  

  const stats = [
    {
      value: 90,
      suffix: "%",
      title: "Global Trade",
      description: "of world trade is carried by sea"
    },
    {
      value: 50000,
      prefix: "+",
      title: "Merchant Ships",
      description: "operating worldwide"
    },
    {
      value: 12,
      suffix: "B",
      title: "Tons of Cargo",
      description: "shipped annually"
    },
    {
      value: 1000,
      prefix: "+",
      title: "Major Ports",
      description: "connected worldwide"
    }
  ];

  return (
    <div ref={ref} className="bg-gradient-to-r from-primary-600 to-secondary-500 py-20">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="text-center text-white"
            >
              <div className="text-5xl font-extrabold mb-3 drop-shadow-md">
                {stat.prefix}
                {inView && (
                  <CountUp
                    end={stat.value}
                    duration={3.5}
                    separator=","
                  />
                )}
                {stat.suffix}
              </div>
              <h3 className="text-lg font-semibold mb-1">{stat.title}</h3>
              <p className="text-white/80 text-sm">{stat.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default ShippingStats;
