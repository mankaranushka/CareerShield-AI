import React from 'react';
import { motion } from 'framer-motion';

const HowItWorks = () => {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.2 }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <section id="how-it-works" className="py-24 bg-slate-950/40 relative overflow-hidden border-t border-slate-900">
      
      {/* Subtle background ambient light */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] rounded-full pointer-events-none opacity-5 filter blur-[100px] bg-emerald-500 z-0"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* Section Heading */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 mb-3 tracking-wide uppercase">
            🚀 The Shield Method
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Three Steps. <span className="gradient-text">Zero Stress.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            From file upload to complete safety scan and roadmap report in under 60 seconds.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
        >
          
          {/* Step 1 */}
          <motion.div 
            variants={stepVariants}
            className="flex-1 glass-card p-8 rounded-2xl border border-slate-800/80 hover:border-slate-700/50 relative overflow-hidden group flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-3xl font-black text-slate-800 select-none">01</span>
                <span className="text-2xl">📤</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Upload or Paste</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Drop your resume file (.pdf, .docx, .txt) or paste a recruiter listing. Our system processes it securely in memory.
              </p>
            </div>
            
            {/* Mock Drag-and-Drop Area */}
            <div className="bg-slate-950/60 border border-dashed border-slate-800/80 rounded-xl p-6 flex flex-col items-center justify-center text-[10px] text-slate-500 font-mono">
              <span className="text-lg mb-1.5">📄</span>
              <span className="text-slate-400">Drag & Drop Resume</span>
              <span className="text-slate-600 mt-0.5">PDF or Word up to 5MB</span>
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div 
            variants={stepVariants}
            className="flex-1 glass-card p-8 rounded-2xl border border-slate-800/80 hover:border-slate-700/50 relative overflow-hidden group flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-3xl font-black text-slate-800 select-none">02</span>
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI Deep Analysis</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                CareerShield runs parallel scans: matching keywords for ATS, checking threat metadata, and calculating skill alignment score.
              </p>
            </div>
            
            {/* Mock scanning loading state */}
            <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 flex flex-col justify-between font-mono text-[9px] text-slate-500 gap-1.5">
              <div className="flex justify-between items-center text-emerald-400">
                <span>[SCANNING...]</span>
                <span className="animate-pulse">●</span>
              </div>
              <div className="w-full bg-slate-900 h-1 rounded overflow-hidden">
                <div className="h-full bg-emerald-500 w-[65%] animate-pulse"></div>
              </div>
              <div className="flex justify-between">
                <span>Domain checks:</span>
                <span className="text-emerald-400">92% Done</span>
              </div>
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div 
            variants={stepVariants}
            className="flex-1 glass-card p-8 rounded-2xl border border-slate-800/80 hover:border-slate-700/50 relative overflow-hidden group flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-3xl font-black text-slate-800 select-none">03</span>
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Get Your Roadmap</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Receive an optimization scorecard, verified listings report, custom project targets, and step-by-step career milestones.
              </p>
            </div>
            
            {/* Mock final roadmap layout */}
            <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 flex flex-col justify-between font-mono text-[9px] text-slate-500 gap-1.5">
              <div className="text-emerald-400 font-bold">✓ SCAN COMPLETE</div>
              <div className="flex flex-wrap gap-1 mt-1">
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Roadmap Ready</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">92% Score</span>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
