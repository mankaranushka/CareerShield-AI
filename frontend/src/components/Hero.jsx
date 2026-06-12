import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Hero = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const yMouse = (e.clientY / window.innerHeight - 0.5) * 2;

      const orbs = containerRef.current.querySelectorAll('.orb');
      orbs.forEach((o, i) => {
        const s = (i + 1) * 20;
        o.style.transform = `translate(${x * s}px, ${yMouse * s}px)`;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section id="hero" className="relative min-h-[calc(100vh-160px)] flex items-center justify-center pb-12 overflow-hidden" ref={containerRef}>
      {/* Background Orbs */}
      <motion.div style={{ y }} className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen filter blur-[80px]">
        <div className="orb absolute top-[20%] left-[20%] w-72 h-72 bg-emerald-500 rounded-full transition-transform duration-700 ease-out"></div>
        <div className="orb absolute top-[40%] right-[20%] w-96 h-96 bg-teal-500 rounded-full transition-transform duration-700 ease-out"></div>
        <div className="orb absolute bottom-[10%] left-[40%] w-80 h-80 bg-blue-600 rounded-full transition-transform duration-700 ease-out"></div>
      </motion.div>

      <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-block bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-full px-4 py-1.5 text-sm font-medium text-emerald-400 mb-8"
        >
          Step Into Your Career With Confidence.
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight"
        >
          A Smarter, Safer<br />
          <span className="gradient-text">Career Guardian<br />for Students</span>
        </motion.h1>

      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-500"
      >
        <motion.svg
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </motion.div>
    </section>
  );
};

export default Hero;
