import React from 'react';
import { motion } from 'framer-motion';

const items = [
  "Resume ",
  "Learn",
  "Career Roadmap",
  "Code",
  "Build",
  "Resources",
  "Preparation",
  "Projects",
  "Grow",
];

// Duplicate the array 8 times to ensure a seamless loop even on 4K/Ultrawide monitors
const duplicatedItems = [...items, ...items, ...items, ...items, ...items, ...items, ...items, ...items];

const Marquee = ({ speed = 40 }) => {
  return (
    <div className="w-full bg-gray-950 py-3 border-y border-gray-800/50 overflow-hidden relative flex items-center">
      {/* Left and Right Fade Gradients for a premium SaaS look */}
      <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-gray-950 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-gray-950 to-transparent z-10 pointer-events-none"></div>

      <div className="flex w-full overflow-hidden">
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: speed, // customizable animation speed
          }}
        >
          {duplicatedItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12"
            >
              <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-300 tracking-tight select-none whitespace-nowrap">
                {item}
              </span>
              {/* Optional separator dot */}
              <span className="ml-6 sm:ml-8 md:ml-12 lg:ml-16 text-emerald-500/50 text-sm sm:text-lg lg:text-xl">•</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Marquee;
