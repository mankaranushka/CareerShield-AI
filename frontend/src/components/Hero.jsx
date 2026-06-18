import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const Hero = () => {
  const [scanStep, setScanStep] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [atsScore, setAtsScore] = useState(45);
  
  // Simulated scan steps for the mock dashboard
  const scanLogs = [
    { text: 'Analyzing metadata for listing: Senior React Developer...', status: 'info' },
    { text: 'Checking registrar details... Created 3 days ago.', status: 'warn' },
    { text: 'Validating host IP addresses and MX mail configurations...', status: 'info' },
    { text: 'Running linguistic pattern matching on descriptions...', status: 'info' },
    { text: 'Scam pattern found: Unprofessional domain & email domain mismatch.', status: 'danger' },
  ];

  useEffect(() => {
    // Progress interval for the simulated scanner
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          setScanStep(0);
          return 0;
        }
        const nextProgress = prev + 1.5;
        // Map progress to steps
        const step = Math.min(Math.floor((nextProgress / 100) * scanLogs.length), scanLogs.length - 1);
        setScanStep(step);
        return nextProgress;
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Slowly increment ATS Score in the dashboard mock-up to feel alive
    const scoreInterval = setInterval(() => {
      setAtsScore((prev) => {
        if (prev >= 92) return 55;
        return prev + 1;
      });
    }, 400);
    return () => clearInterval(scoreInterval);
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-24 overflow-hidden bg-slate-950">
      
      {/* 1. Grid Backdrop & Ambient Radial Mask */}
      <div className="absolute inset-0 bg-grid-pattern opacity-25 z-0 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950 z-0 pointer-events-none"></div>
      
      {/* Radial spotlight effect */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full pointer-events-none opacity-20 filter blur-[120px] z-0"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(59, 130, 246, 0.2) 50%, transparent 100%)'
        }}
      />

      {/* 2. Ambient Floating Glowing Orbs */}
      <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-emerald-500/10 rounded-full filter blur-[80px] animate-float-slow pointer-events-none z-0"></div>
      <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-indigo-500/10 rounded-full filter blur-[100px] animate-float-medium pointer-events-none z-0"></div>
      <div className="absolute top-[40%] right-[15%] w-80 h-80 bg-teal-500/10 rounded-full filter blur-[90px] animate-float-slow pointer-events-none z-0"></div>

      <div className="container mx-auto px-6 relative z-10 text-center max-w-5xl flex flex-col items-center">
        
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium text-emerald-400 mb-8 shadow-2xl"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          🛡️ Guarding student careers with real-time AI security.
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] text-white"
        >
          A Smarter, Safer <br className="hidden sm:inline" />
          <span className="gradient-text">Career Guardian</span> for Students
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          className="text-gray-400 text-lg md:text-xl max-w-3xl mb-12 leading-relaxed"
        >
          CareerShield AI secures your job search from data-harvesting scams, analyzes resume ATS compatibility, and coaches you through technical interviews with contextual AI paths.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-20 z-20"
        >
          <Link
            to="/resume-scanner"
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold px-8 py-4 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.35)] transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
          >
            Start Secure Scan
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
          
          <Link
            to="/career-roadmap"
            className="w-full sm:w-auto bg-slate-900/60 backdrop-blur-md text-white font-medium px-8 py-4 rounded-xl border border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-900 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            Generate Career Roadmap
          </Link>
        </motion.div>

        {/* 3. Interactive Mock Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, cubicBezier: [0.16, 1, 0.3, 1], delay: 0.45 }}
          className="w-full max-w-4xl relative glass-card p-1 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.6)] border border-slate-800/60 overflow-hidden group"
        >
          {/* Dashboard Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-950/60 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
              <span className="text-xs text-slate-500 font-mono ml-4 select-none">careershield-terminal-v1.0.sh</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                ACTIVE SHIELD
              </span>
            </div>
          </div>

          {/* Dashboard Grid Container */}
          <div className="grid md:grid-cols-5 bg-slate-950/40 divide-y md:divide-y-0 md:divide-x divide-slate-800/50 p-6 min-h-[300px]">
            
            {/* Left Module: Fake Job Scanner Logging (Simulated Live Terminal) */}
            <div className="md:col-span-3 flex flex-col pr-0 md:pr-6 pb-6 md:pb-0 font-mono text-left">
              <div className="text-slate-400 font-semibold text-xs tracking-wider uppercase mb-3 flex items-center justify-between">
                <span>🛡️ Scan Log Activity</span>
                <span className="text-[10px] text-slate-500">Progress: {Math.floor(scanProgress)}%</span>
              </div>
              
              <div className="flex-grow bg-slate-950/80 border border-slate-900 rounded-lg p-4 h-[200px] overflow-hidden flex flex-col justify-end text-[11px] sm:text-xs text-slate-300 space-y-2 leading-relaxed">
                <AnimatePresence>
                  {scanLogs.slice(0, scanStep + 1).map((log, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-start gap-2"
                    >
                      {log.status === 'info' && <span className="text-emerald-400 select-none">▶</span>}
                      {log.status === 'warn' && <span className="text-yellow-400 select-none">⚠️</span>}
                      {log.status === 'danger' && <span className="text-red-500 select-none">⚡</span>}
                      
                      <span className={
                        log.status === 'danger' ? 'text-red-400 font-semibold' : 
                        log.status === 'warn' ? 'text-yellow-400' : 'text-slate-300'
                      }>
                        {log.text}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Module: ATS Optimization Dial Mock-up */}
            <div className="md:col-span-2 flex flex-col pl-0 md:pl-6 pt-6 md:pt-0 items-center justify-center">
              <div className="text-slate-400 font-semibold text-xs tracking-wider uppercase mb-4 text-left w-full">
                <span>⚔️ Resume Match Score</span>
              </div>

              <div className="relative w-36 h-36 flex items-center justify-center mb-4">
                {/* SVG Progress Circle */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle 
                    cx="50" cy="50" r="40" 
                    className="stroke-slate-800/60" 
                    strokeWidth="8" 
                    fill="transparent" 
                  />
                  <circle 
                    cx="50" cy="50" r="40" 
                    className="stroke-emerald-400" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * atsScore) / 100}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.4s ease' }}
                  />
                </svg>
                
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white">{atsScore}%</span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">ATS Match</span>
                </div>
              </div>

              {/* Keyword metrics simulation */}
              <div className="w-full space-y-2 text-xs">
                <div className="flex justify-between items-center bg-slate-900/60 border border-slate-800/40 rounded-lg px-3 py-2">
                  <span className="text-slate-400">Identified Keywords</span>
                  <span className="text-emerald-400 font-bold">14 / 18</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/60 border border-slate-800/40 rounded-lg px-3 py-2">
                  <span className="text-slate-400">Redundancy Warnings</span>
                  <span className="text-yellow-400 font-bold">2 Found</span>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
