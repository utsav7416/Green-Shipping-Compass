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
    <div
      ref={ref}
      className="bg-gradient-to-b from-green-300 via-sky-100 to-cyan-200 py-20"
    >
      <div className="max-w-7xl mx-auto px-4 text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
          className="text-3xl md:text-4xl font-semibold text-gray-800"
        >
          Voices of the Sea 🌊
        </motion.h2>
        <p className="text-md font-bold text-black mt-3 max-w-xl mx-auto">
          Let these maritime words drift through your thoughts like a calming tide.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-10 px-4"
      >
        {quotes.map((quote, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="relative p-8 rounded-2xl shadow-lg bg-gradient-to-br from-blue-100 to-blue-200 border border-gray-200 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 to-orange-400 rounded-t-2xl" />

            <div className="mb-6">
              <img
                src={quote.image}
                alt={`Image for ${quote.author}`}
                className="mx-auto rounded-xl border border-gray-300 shadow-md w-32 h-32 object-cover"
              />
            </div>

            <div className="text-5xl text-amber-400 mb-6 leading-none">“</div>
            <p className="text-lg text-gray-800 mb-6 italic leading-relaxed">{quote.text}</p>
            <p className="text-sm text-gray-700 font-semibold text-right">— {quote.author}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default MaritimeQuotes;
