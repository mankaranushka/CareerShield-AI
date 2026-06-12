import React from 'react';
import { motion } from 'framer-motion';

const HowItWorks = () => {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.3 }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 300, damping: 24 } 
    },
    hover: { 
      y: -15, 
      scale: 1.05, 
      boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.25)",
      transition: { type: "spring", stiffness: 400, damping: 25 }
    }
  };

  const connectorVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1, 
      transition: { duration: 1, ease: "easeInOut" } 
    }
  };

  return (
    <section id="how-it-works" className="py-24 bg-gray-900">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="text-emerald-500 font-semibold uppercase tracking-wider mb-2 text-sm">How It Works</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Three Steps. <span className="gradient-text">Zero Stress.</span></h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">From upload to action plan in under 60 seconds.</p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col md:flex-row items-center justify-between gap-8 relative"
        >
          {/* Step 1 */}
          <motion.div 
            variants={stepVariants}
            whileHover="hover"
            className="flex-1 text-center glass p-8 w-full max-w-sm relative z-10"
          >
            <div className="text-6xl font-black text-gray-800 absolute -top-6 -left-2 opacity-50">01</div>
            <motion.div 
              whileHover={{ rotate: [0, -10, 10, -10, 0] }} 
              transition={{ duration: 0.5 }}
              className="text-4xl mb-4 relative inline-block"
            >
              📤
            </motion.div>
            <h3 className="text-xl font-bold mb-3 text-white">Upload or Paste</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Drop your resume, paste, or forwaed a recruiter email. We accept it all.</p>
          </motion.div>

          {/* Connector 1 */}
          <div className="hidden md:block w-24 flex-shrink-0">
            <svg width="100%" height="24" viewBox="0 0 60 24">
              <motion.path 
                variants={connectorVariants}
                d="M0 12h50m-8-8l8 8-8 8" 
                stroke="url(#arrow-grad)" 
                strokeWidth="2" 
                fill="none" 
              />
              <defs>
                <linearGradient id="arrow-grad" x1="0" y1="0" x2="60" y2="0">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Step 2 */}
          <motion.div 
            variants={stepVariants}
            whileHover="hover"
            className="flex-1 text-center glass p-8 w-full max-w-sm relative z-10"
          >
            <div className="text-6xl font-black text-gray-800 absolute -top-6 -left-2 opacity-50">02</div>
            <motion.div 
              whileHover={{ scale: 1.2, rotate: 180 }} 
              transition={{ type: "spring", stiffness: 300 }}
              className="text-4xl mb-4 relative inline-block"
            >
              ⚡
            </motion.div>
            <h3 className="text-xl font-bold mb-3 text-white">AI Deep Analysis</h3>
            <p className="text-gray-400 text-sm leading-relaxed">CareerShield AI runs deep security scans, ATS optimization algorithms, and career-matching intelligence — simultaneously.</p>
          </motion.div>

          {/* Connector 2 */}
          <div className="hidden md:block w-24 flex-shrink-0">
            <svg width="100%" height="24" viewBox="0 0 60 24">
              <motion.path 
                variants={connectorVariants}
                d="M0 12h50m-8-8l8 8-8 8" 
                stroke="url(#arrow-grad2)" 
                strokeWidth="2" 
                fill="none" 
              />
              <defs>
                <linearGradient id="arrow-grad2" x1="0" y1="0" x2="60" y2="0">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Step 3 */}
          <motion.div 
            variants={stepVariants}
            whileHover="hover"
            className="flex-1 text-center glass p-8 w-full max-w-sm relative z-10"
          >
            <div className="text-6xl font-black text-gray-800 absolute -top-6 -left-2 opacity-50">03</div>
            <motion.div 
              whileHover={{ scale: 1.2 }} 
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="text-4xl mb-4 relative inline-block"
            >
              ✅
            </motion.div>
            <h3 className="text-xl font-bold mb-3 text-white">Get Your Roadmap</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Receive an instant safety verification, a precise ATS score, keyword fixes, and an actionable career roadmap — all in one report.</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
