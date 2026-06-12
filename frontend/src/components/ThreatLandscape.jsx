import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const Counter = ({ target, suffix }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      let current = 0;
      const step = Math.ceil(target / 60);
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(current);
        }
      }, 30);
      return () => clearInterval(timer);
    }
  }, [isInView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const ThreatLandscape = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section id="threat" className="py-24 bg-gray-900 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Your Career Deserves <span className="gradient-text">Better Guidance.</span></h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">Helping students make safer and smarter career decisions.</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-8"
        >
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -10, boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.15)" }}
            className="glass p-8 relative overflow-hidden group transition-colors duration-300 hover:border-emerald-500/50"
          >
            <div className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Build Your Roadmap
            </div>
            <p className="text-gray-300 leading-relaxed relative z-10">and explore opportunities</p>
            <motion.div
              className="absolute -right-4 -bottom-4 text-8xl opacity-10"
              whileHover={{ scale: 1.2, rotate: -10, opacity: 0.2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              👻
            </motion.div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            whileHover={{ y: -10, boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.15)" }}
            className="glass p-8 relative overflow-hidden group transition-colors duration-300 hover:border-emerald-500/50"
          >
            <div className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Step Ahead with Confidence
            </div>
            <p className="text-gray-300 leading-relaxed relative z-10">and unlock your potential</p>
            <motion.div
              className="absolute -right-4 -bottom-4 text-8xl opacity-10"
              whileHover={{ scale: 1.2, rotate: 10, opacity: 0.2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              📧
            </motion.div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            whileHover={{ y: -10, boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.15)" }}
            className="glass p-8 relative overflow-hidden group transition-colors duration-300 hover:border-emerald-500/50"
          >
            <div className="text-5xl font-extrabold text-white mb-4">
              <Counter target={75} suffix="%" />
            </div>
            <p className="text-gray-300 leading-relaxed relative z-10">Of resumes are <strong className="text-white">rejected by ATS bots</strong> before a human ever reads them. Your dream job? It never even saw your name.</p>
            <motion.div
              className="absolute -right-4 -bottom-4 text-8xl opacity-10"
              whileHover={{ scale: 1.2, rotate: -10, opacity: 0.2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              🤖
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ThreatLandscape;
