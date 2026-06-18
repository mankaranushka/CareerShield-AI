import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

const Counter = ({ target, suffix }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      let current = 0;
      const step = Math.ceil(target / 45);
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(current);
        }
      }, 40);
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
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section id="threat" className="py-24 bg-slate-950/70 border-t border-b border-slate-900 overflow-hidden relative">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full pointer-events-none opacity-10 filter blur-[100px] bg-red-500/20 z-0"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400 mb-3 tracking-wide uppercase">
            🚨 Job Search Threat Intelligence
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Your Career Deserves <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Better Protection.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Scammers, data harvesters, and automated algorithms filter out talented students before they get a chance. Here is the reality.
          </p>
        </motion.div>

        {/* 3 Bento Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-8"
        >
          
          {/* Card 1: ATS Bots Rejection Stats */}
          <motion.div
            variants={cardVariants}
            className="glass-card p-8 relative overflow-hidden group transition-all duration-300 border border-slate-800/80 hover:border-red-500/30 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">METRIC // BOTS</span>
                <span className="text-2xl">🤖</span>
              </div>
              <div className="text-6xl font-black text-red-400 mb-4 tracking-tight">
                <Counter target={75} suffix="%" />
              </div>
              <p className="text-slate-300 leading-relaxed text-sm">
                Of resumes are <strong className="text-white">auto-rejected by ATS algorithms</strong> before a human recruiter ever sees them. Missing keywords and wrong formatting are the main causes.
              </p>
            </div>
            
            {/* Live Visual Widget for ATS rejection */}
            <div className="mt-8 pt-4 border-t border-slate-900">
              <div className="bg-slate-950 border border-slate-900 rounded-lg p-3 font-mono text-[10px] space-y-1.5">
                <div className="flex justify-between text-slate-500">
                  <span>applicant_profile.pdf</span>
                  <span className="text-red-400 font-bold">REJECTED</span>
                </div>
                <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 w-[42%]"></div>
                </div>
                <div className="text-slate-400">🚨 Reason: Missing 4 Core Keywords</div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Fake Listings & Scam Checks */}
          <motion.div
            variants={cardVariants}
            className="glass-card p-8 relative overflow-hidden group transition-all duration-300 border border-slate-800/80 hover:border-red-500/30 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">THREAT // SCAMS</span>
                <span className="text-2xl">⚡</span>
              </div>
              <div className="text-6xl font-black text-orange-400 mb-4 tracking-tight">
                3.4x
              </div>
              <p className="text-slate-300 leading-relaxed text-sm">
                Increase in <strong className="text-white">fake job & internship listings</strong> designed to harvest personal student data, request payment, or commit financial scams.
              </p>
            </div>

            {/* Live Visual Widget for Listing Check */}
            <div className="mt-8 pt-4 border-t border-slate-900">
              <div className="bg-slate-950 border border-slate-900 rounded-lg p-3 font-mono text-[10px] space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span className="truncate">Internship Posting @ TechGroup...</span>
                  <span className="text-orange-400 font-bold">WARNING</span>
                </div>
                <ul className="text-slate-500 list-disc list-inside space-y-1">
                  <li>Domain registered &lt; 30 days ago</li>
                  <li>Requests WhatsApp redirect</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Target Match/Security Pillar */}
          <motion.div
            variants={cardVariants}
            className="glass-card p-8 relative overflow-hidden group transition-all duration-300 border border-slate-800/80 hover:border-emerald-500/30 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">PILLAR // SAFETY</span>
                <span className="text-2xl">🛡️</span>
              </div>
              <div className="text-6xl font-black text-emerald-400 mb-4 tracking-tight">
                100%
              </div>
              <p className="text-slate-300 leading-relaxed text-sm">
                Protected and optimized navigation. CareerShield AI acts as your personal secure firewall, validating listings and optimizing resumes to bypass automated filters safely.
              </p>
            </div>

            {/* Live Visual Widget for Verified Path */}
            <div className="mt-8 pt-4 border-t border-slate-900">
              <div className="bg-slate-950 border border-slate-900 rounded-lg p-3 font-mono text-[10px] space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>shield_active_scan.exe</span>
                  <span className="text-emerald-400 font-bold">SECURED</span>
                </div>
                <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[100%] animate-pulse"></div>
                </div>
                <div className="text-emerald-500">✓ Security rating optimized: 10/10</div>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default ThreatLandscape;
