import React from 'react';
import { motion } from 'framer-motion';

const CareerRoadmap = () => {
  return (
    <section className="pt-32 pb-24 bg-gray-950 min-h-[80vh] flex flex-col justify-center relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[100px]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-emerald-500/5 blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="text-emerald-500 font-semibold uppercase tracking-wider mb-2 text-sm">Career Roadmap</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Navigate Your <span className="gradient-text">Future.</span></h2>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-xl mx-auto glass p-6 md:p-10 text-center border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.05)]"
        >
          <div className="text-5xl mb-6">🗺️</div>
          <h3 className="text-2xl font-bold text-white mb-3">Coming Soon</h3>
          <p className="text-gray-400 leading-relaxed">
            We are building personalized, step-by-step career roadmaps powered by AI. Whether you want to be a Frontend Developer, Data Scientist, or Cloud Engineer, we will guide your learning journey.
            <br /><br />
            This feature will be available in an upcoming update!
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CareerRoadmap;
