import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const services = [
    { title: "Personalised Roadmaps", desc: "Structured, role-specific learning paths so you never wonder what to learn next.", icon: "🗺️" },
    { title: "Resume Analysis", desc: "Instant AI feedback that turns a generic resume into a placement-ready one.", icon: "📄" },
    { title: "Placement Preparation", desc: "Targeted guidance on interviews, aptitude, and domain-specific skills.", icon: "🎯" },
    { title: "Smart Project Recommendations", desc: "Curated project ideas matched to your skill level and target role.", icon: "💡" }
  ];

  const problems = [
    "Career Confusion — No clear direction after graduation",
    "Lack of Guidance — No mentor, no structured advice",
    "Weak Resumes — Generic CVs ignored by recruiters",
    "Poor Placement Prep — Unsure what to study or practise",
    "Difficulty Finding Projects — No idea what to build for portfolio",
    "Unstructured Learning — Random tutorials with no career focus"
  ];

  return (
    <section id="about" className="py-24 bg-gray-950 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={containerVariants}
          className="max-w-5xl mx-auto"
        >
          {/* Header & Tagline */}
          <motion.div variants={itemVariants} className="text-center mb-16 max-w-4xl mx-auto">
            <div className="text-emerald-500 font-semibold uppercase tracking-wider mb-2 text-sm">About Us</div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Bridging the gap between learning and <span className="gradient-text">landing your first tech job.</span></h2>
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed">
              We are an AI-powered career companion built exclusively for students and freshers navigating the challenging journey from college to career. We are not built for everyone — we are built for those at the start of their professional journey who need structure, direction, and smart tools to succeed.
            </p>
          </motion.div>

          {/* What We Do - Grid */}
          <motion.div variants={itemVariants} className="mb-20">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">What We Do</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {services.map((service, idx) => (
                <motion.div key={idx} whileHover={{ y: -5, borderColor: "rgba(16, 185, 129, 0.4)" }} className="glass p-6 transition-all duration-300">
                  <div className="text-3xl mb-4">{service.icon}</div>
                  <h4 className="text-xl font-bold text-white mb-2">{service.title}</h4>
                  <p className="text-gray-400">{service.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Problems We Solve & Who This Is For */}
          <div className="grid md:grid-cols-2 gap-8 mb-20 items-stretch">
            <motion.div variants={itemVariants} className="glass p-8 border-red-500/10 flex flex-col h-full">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-red-400">⚠️</span> Problems We Solve
              </h3>
              <ul className="space-y-4 flex-grow">
                {problems.map((prob, idx) => {
                  const [title, desc] = prob.split(' — ');
                  return (
                    <li key={idx} className="flex items-start gap-3 text-gray-300">
                      <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                      <div>
                        <strong className="text-white block">{title}</strong>
                        <span className="text-gray-400 text-sm">{desc}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </motion.div>

            <motion.div variants={itemVariants} className="glass p-8 border-blue-500/10 flex flex-col h-full">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-blue-400">🎯</span> Who This Is For
              </h3>
              <div className="space-y-6 text-gray-300 leading-relaxed flex-grow">
                <p>A 2nd or 3rd year CS student — or any fresher — who knows they need to prepare for placements but does not know where to start.</p>
                <div>
                  <strong className="text-white mb-2 block">Someone who wants:</strong>
                  <ul className="space-y-2 list-disc list-inside text-gray-400">
                    <li>Better projects on their resume</li>
                    <li>Structured career guidance</li>
                    <li>A clear, actionable path forward</li>
                  </ul>
                </div>
                <div className="p-4 mt-auto rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-100 italic">
                  "Not a professional. Not a senior developer. A student taking their first serious step."
                </div>
              </div>
            </motion.div>
          </div>

          {/* Mission Statement */}
          <motion.div variants={itemVariants} className="text-center bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 bg-emerald-500 h-full"></div>
            <h3 className="text-emerald-400 font-semibold uppercase tracking-wider mb-4 text-sm">Our Mission</h3>
            <p className="text-2xl md:text-3xl font-bold text-white leading-tight">
              "To ensure no student loses an opportunity simply because they lacked guidance."
            </p>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default About;
