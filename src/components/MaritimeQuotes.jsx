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
    <div className="relative bg-gradient-to-b from-green-300 via-sky-100 to-cyan-200 py-16 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-cyan-300/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-56 h-56 bg-sky-200/15 rounded-full blur-2xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ rotateX: -90 }}
            animate={inView ? { rotateX: 0 } : {}}
            transition={{ duration: 1, delay: 0.3 }}
            className="inline-block"
          >
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-800 mb-4">
              Voices of the Sea 🌊
            </h2>
          </motion.div>
          <p className="text-md font-bold text-black max-w-xl mx-auto">
            Let these maritime words drift through your thoughts like a calming tide.
          </p>
        </motion.div>

        <div ref={ref} className="space-y-24">
          {quotes.map((quote, index) => (
            <motion.div
              key={index}
              initial={{ 
                opacity: 0, 
                x: index % 2 === 0 ? -100 : 100,
                rotateY: index % 2 === 0 ? -15 : 15 
              }}
              animate={inView ? { 
                opacity: 1, 
                x: 0,
                rotateY: 0 
              } : {}}
              transition={{ 
                duration: 1.2, 
                delay: index * 0.4,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className={`flex items-center gap-10 ${
                index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
              } max-w-5xl mx-auto`}
            >
              <motion.div
                whileHover={{ scale: 1.05, rotateZ: 2 }}
                transition={{ duration: 0.3 }}
                className="relative flex-shrink-0"
              >
                <div className="absolute -inset-3 bg-gradient-to-br from-white/30 to-transparent rounded-2xl blur-xl" />
                <div className="relative w-40 h-40 md:w-48 md:h-48">
                  <img
                    src={quote.image}
                    alt={`${quote.author}`}
                    className="w-full h-full object-cover rounded-xl shadow-xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 rounded-xl" />
                  <motion.div
                    animate={{ 
                      scale: [1, 1.02, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute -inset-2 bg-gradient-to-br from-cyan-300/30 to-blue-400/30 rounded-2xl blur-lg"
                  />
                </div>
              </motion.div>

              <div className="flex-1 space-y-5">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: index * 0.4 + 0.3 }}
                  className="relative"
                >
                  <div className="absolute -left-5 -top-3 text-7xl text-white/20 font-serif select-none">"</div>
                  <blockquote className="text-xl md:text-2xl text-gray-800 font-medium leading-relaxed italic relative z-10 pl-7">
                    {quote.text}
                  </blockquote>
                  <div className="absolute -right-3 -bottom-3 text-7xl text-white/20 font-serif select-none rotate-180">"</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.4 + 0.6 }}
                  className={`flex items-center gap-3 ${
                    index % 2 === 0 ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div className="w-10 h-px bg-gradient-to-r from-transparent to-gray-400" />
                  <cite className="not-italic text-md text-gray-700 font-semibold">
                    {quote.author}
                  </cite>
                  <div className="w-10 h-px bg-gradient-to-l from-transparent to-gray-400" />
                </motion.div>

                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={inView ? { scaleX: 1 } : {}}
                  transition={{ duration: 1, delay: index * 0.4 + 0.8 }}
                  className={`h-0.5 bg-gradient-to-r from-cyan-300 to-blue-400 rounded-full ${
                    index % 2 === 0 ? 'origin-left' : 'origin-right'
                  }`}
                  style={{ width: '50%' }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 2 }}
          className="text-center mt-24"
        >
          <div className="inline-flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="text-xl"
            >
              ⚓
            </motion.div>
            <span className="text-gray-800 font-medium">
              Wisdom from the depths of maritime history
            </span>
            <motion.div
              animate={{ 
                y: [0, -5, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-xl"
            >
              🌊
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default MaritimeQuotes;