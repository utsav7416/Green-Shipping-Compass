import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const quotes = [
  {
    text: "The ocean stirs the heart, inspires the imagination and brings eternal joy to the soul.",
    author: "Robert Wyland",
    image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=300&q=80"
  },
  {
    text: "A smooth sea never made a skilled sailor.",
    author: "Franklin D. Roosevelt",
    image: "https://plus.unsplash.com/premium_photo-1661882520489-a3e2029aca9f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=300&q=80"
  },
  {
    text: "We must free ourselves of the hope that the sea will ever rest. We must learn to sail in high winds.",
    author: "Aristotle Onassis",
    image: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=300&q=80"
  }
];

function MaritimeQuotes() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <div className="relative bg-gradient-to-b from-green-300 via-sky-100 to-cyan-200 py-24 overflow-hidden">
      <div className="absolute inset-0">
        <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <motion.path
            d="M0,300 Q250,200 500,300 T1000,300 L1000,0 L0,0 Z"
            fill="rgba(255,255,255,0.1)"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : {}}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          <motion.path
            d="M0,400 Q250,350 500,400 T1000,400 L1000,1000 L0,1000 Z"
            fill="rgba(255,255,255,0.05)"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : {}}
            transition={{ duration: 2.5, ease: "easeInOut", delay: 0.3 }}
          />
        </svg>
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <div className="inline-block">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Voices of the Sea
              <motion.span
                className="inline-block ml-3 text-5xl"
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                🌊
              </motion.span>
            </h2>
            <motion.div
              className="h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent rounded-full"
              initial={{ width: 0 }}
              animate={inView ? { width: "300px" } : {}}
              transition={{ duration: 1.5, delay: 0.5 }}
            />
          </div>
          <p className="text-md font-bold text-black mt-6 max-w-xl mx-auto leading-relaxed">
            Let these maritime words drift through your thoughts like a calming tide.
          </p>
        </motion.div>

        <div ref={ref} className="space-y-24">
          {quotes.map((quote, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 1, delay: index * 0.4, ease: "easeOut" }}
              className={`flex items-center gap-12 ${
                index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
              } ${index === 1 ? 'md:px-16' : ''}`}
            >
              <motion.div
                className="flex-shrink-0"
                whileHover={{ scale: 1.05, rotate: index % 2 === 0 ? 2 : -2 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-full blur-xl scale-110" />
                  <img
                    src={quote.image}
                    alt={`${quote.author}`}
                    className="relative w-36 h-36 md:w-48 md:h-48 rounded-full object-cover border-4 border-white/50 shadow-2xl"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full border-2 border-white shadow-lg" />
                </div>
              </motion.div>

              <div className="flex-1 relative">
                <motion.div
                  className="absolute -top-8 -left-4 text-8xl text-sky-300/40 font-serif"
                  initial={{ scale: 0, rotate: -20 }}
                  animate={inView ? { scale: 1, rotate: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.4 + 0.3 }}
                >
                  "
                </motion.div>
                
                <div className="relative bg-white/30 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/40 shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent rounded-3xl" />
                  
                  <motion.p
                    className="relative text-lg md:text-xl text-gray-800 leading-relaxed mb-8 font-medium"
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 1, delay: index * 0.4 + 0.6 }}
                  >
                    {quote.text}
                  </motion.p>
                  
                  <motion.div
                    className={`relative flex items-center ${
                      index % 2 === 0 ? 'justify-end' : 'justify-start'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: index * 0.4 + 0.8 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-px bg-gradient-to-r from-sky-400 to-teal-500" />
                      <span className="text-gray-700 font-semibold text-sm md:text-base">
                        {quote.author}
                      </span>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  className="absolute -bottom-4 -right-4 text-6xl text-sky-300/40 font-serif"
                  initial={{ scale: 0, rotate: 20 }}
                  animate={inView ? { scale: 1, rotate: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.4 + 0.9 }}
                >
                  "
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 2 }}
        >
          <div className="inline-flex items-center space-x-2 text-gray-600 text-sm">
            <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" />
            <span>Maritime wisdom spanning centuries</span>
            <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default MaritimeQuotes;