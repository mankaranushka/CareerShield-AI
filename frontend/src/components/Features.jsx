import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Features = ({ onOpenChat }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section id="features" className="py-24 relative overflow-hidden bg-slate-950/40">
      
      {/* Background spotlights */}
      <div className="absolute top-[30%] left-[5%] w-[600px] h-[600px] rounded-full pointer-events-none opacity-5 filter blur-[120px] bg-blue-500 z-0"></div>
      <div className="absolute bottom-[20%] right-[5%] w-[600px] h-[600px] rounded-full pointer-events-none opacity-5 filter blur-[120px] bg-emerald-500 z-0"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 mb-3 tracking-wide uppercase">
            ⚡ Platform Capabilities
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Designed to Protect. <span className="gradient-text">Built to Grow.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Conquer the modern job market with security-first AI tools designed for students and graduates.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          
          {/* Card 1: AI Resume & ATS Optimizer (Wide Card: col-span-2) */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -6, borderColor: 'rgba(59, 130, 246, 0.3)' }}
            className="md:col-span-2 glass-card p-8 rounded-2xl border border-slate-800/80 hover:border-blue-500/30 flex flex-col md:flex-row justify-between gap-8 group transition-colors duration-300"
          >
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span className="text-blue-400 font-mono text-[10px] tracking-widest uppercase mb-2 block">PILLAR // ATS SYSTEM</span>
                <h3 className="text-2xl font-bold text-white mb-3">AI Resume &amp; ATS Optimizer</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Scan and optimize your resume against any target job description. Instantly identify missing keywords, structure impact bullet-points, and beat automated filter bots.
                </p>
              </div>
              <div>
                <Link
                  to="/resume-scanner"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                >
                  Try ATS Optimizer
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transform group-hover:translate-x-1 transition-transform">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              </div>
            </div>

            {/* Simulated Resume Scanner Visual */}
            <div className="w-full md:w-64 bg-slate-950/60 border border-slate-900 rounded-xl p-4 flex flex-col justify-between font-mono text-[10px] h-48 md:h-auto">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-500">resume_v2.docx</span>
                <span className="text-emerald-400 font-semibold">MATCH 88%</span>
              </div>
              <div className="space-y-2 py-3">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Keyword density</span>
                  <span className="text-slate-300">Optimal</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Action verbs</span>
                  <span className="text-emerald-400">✓ Strong</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Formatting check</span>
                  <span className="text-emerald-400">✓ Clean</span>
                </div>
              </div>
              <div className="bg-slate-900/50 p-2 rounded border border-slate-800/40 text-[9px] text-blue-400">
                ✨ Tip: Add "Framer Motion" to boost match by 12%
              </div>
            </div>
          </motion.div>

          {/* Card 2: AI Placement Prep (Mock Interviews) */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -6, borderColor: 'rgba(16, 185, 129, 0.3)' }}
            className="glass-card p-8 rounded-2xl border border-slate-800/80 hover:border-emerald-500/30 flex flex-col justify-between group transition-colors duration-300"
          >
            <div>
              <span className="text-emerald-400 font-mono text-[10px] tracking-widest uppercase mb-2 block">PILLAR // INTERVIEWS</span>
              <h3 className="text-2xl font-bold text-white mb-3">Placement Preparation</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Ace high-pressure interviews with interactive AI coaching, custom scenario questions, and comprehensive response analytics.
              </p>
            </div>
            
            {/* Visual waveform mockup */}
            <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 mb-6 flex items-center justify-center gap-1.5 h-16 relative">
              <div className="absolute top-2 left-3 text-[9px] font-mono text-slate-500">VOICE FEEDBACK</div>
              <div className="w-1.5 h-6 bg-emerald-500/60 rounded-full animate-pulse"></div>
              <div className="w-1.5 h-9 bg-emerald-500/80 rounded-full"></div>
              <div className="w-1.5 h-12 bg-emerald-500 rounded-full"></div>
              <div className="w-1.5 h-6 bg-emerald-500/80 rounded-full"></div>
              <div className="w-1.5 h-8 bg-emerald-500/60 rounded-full"></div>
              <div className="w-1.5 h-10 bg-emerald-500/80 rounded-full"></div>
              <div className="w-1.5 h-5 bg-emerald-500/60 rounded-full"></div>
            </div>

            <div>
              <Link
                to="/placement-preparation"
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
              >
                Start AI Mock Prep
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transform group-hover:translate-x-1 transition-transform">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>
          </motion.div>

          {/* Card 3: Fake Job Detector (1x1) */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -6, borderColor: 'rgba(239, 68, 68, 0.3)' }}
            className="glass-card p-8 rounded-2xl border border-slate-800/80 hover:border-red-500/30 flex flex-col justify-between group transition-colors duration-300"
          >
            <div>
              <span className="text-red-400 font-mono text-[10px] tracking-widest uppercase mb-2 block">PILLAR // SAFETY</span>
              <h3 className="text-xl font-bold text-white mb-3">Fake Job &amp; Scam Detector</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Expose scam postings, malicious links, and phishing offers before they compromise your data.
              </p>
            </div>
            
            {/* Visual checkmark shield */}
            <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-3 font-mono text-[9px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5 text-red-400">
                <span>⚠️ Domain age check: 3 days</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span>✓ SSL Certificate Valid</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={onOpenChat}
                className="inline-flex items-center gap-2 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors cursor-pointer bg-transparent border-0 p-0 align-baseline"
              >
                Scan with AI Shield
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transform group-hover:translate-x-1 transition-transform">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </motion.div>

          {/* Card 4: AI Career Roadmap (1x1) */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -6, borderColor: 'rgba(168, 85, 247, 0.3)' }}
            className="glass-card p-8 rounded-2xl border border-slate-800/80 hover:border-purple-500/30 flex flex-col justify-between group transition-colors duration-300"
          >
            <div>
              <span className="text-purple-400 font-mono text-[10px] tracking-widest uppercase mb-2 block">PILLAR // TRAJECTORY</span>
              <h3 className="text-xl font-bold text-white mb-3">AI Career Roadmap</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Map out step-by-step career path guides tailored specifically to your ultimate career goals.
              </p>
            </div>
            
            {/* Visual roadmap nodes */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-950/60 border border-slate-900 rounded-xl text-[10px] font-mono text-slate-400">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
                <span>Learn Node</span>
              </div>
              <span>➜</span>
              <div>Build APIs</div>
              <span>➜</span>
              <div className="text-slate-600">Deploy</div>
            </div>

            <div className="mt-6">
              <Link
                to="/career-roadmap"
                className="inline-flex items-center gap-2 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
              >
                Generate Path
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transform group-hover:translate-x-1 transition-transform">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>
          </motion.div>

          {/* Card 5: AI Project Recommendations (1x1) */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -6, borderColor: 'rgba(236, 72, 153, 0.3)' }}
            className="glass-card p-8 rounded-2xl border border-slate-800/80 hover:border-pink-500/30 flex flex-col justify-between group transition-colors duration-300"
          >
            <div>
              <span className="text-pink-400 font-mono text-[10px] tracking-widest uppercase mb-2 block">PILLAR // PORTFOLIO</span>
              <h3 className="text-xl font-bold text-white mb-3">Project Recommendations</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Bridge identified skill gaps with custom targeted portfolio ideas mapped to the industries.
              </p>
            </div>
            
            {/* Tech badges visual */}
            <div className="flex flex-wrap gap-1.5">
              {['FastAPI', 'React 19', 'MongoDB', 'Docker'].map((tech, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/20 text-pink-400 font-mono text-[9px]">
                  {tech}
                </span>
              ))}
            </div>

            <div className="mt-6">
              <Link
                to="/project-recommendation"
                className="inline-flex items-center gap-2 text-xs font-semibold text-pink-400 hover:text-pink-300 transition-colors cursor-pointer"
              >
                Get Project Ideas
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transform group-hover:translate-x-1 transition-transform">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default Features;
