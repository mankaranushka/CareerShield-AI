import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Features = () => {
  const pillarVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 30 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6 } },
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow: "0 20px 40px -10px rgba(16, 185, 129, 0.15)",
      borderColor: "rgba(16, 185, 129, 0.5)",
      transition: { type: "spring", stiffness: 400, damping: 25 }
    }
  };

  const swordCardHover = {
    y: -8,
    scale: 1.02,
    boxShadow: "0 20px 40px -10px rgba(59, 130, 246, 0.15)",
    borderColor: "rgba(59, 130, 246, 0.5)",
    transition: { type: "spring", stiffness: 400, damping: 25 }
  };

  const MotionLink = motion(Link);

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">

        {/* Pillar 2 */}
        <div id="resume-scanner">
          <motion.div
            initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-center gap-6 mb-12 flex-row-reverse text-right"
          >
            <motion.div
              whileHover={{ rotate: -15, scale: 1.1 }}
              className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(59,130,246,0.2)]"
            >
              ⚔️
            </motion.div>
            <div>
              <div className="text-blue-400 font-semibold uppercase tracking-wider mb-1 text-sm">Pillar</div>
              <h2 className="text-3xl md:text-4xl font-bold">The Sword — <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Growth</span></h2>
              <p className="text-gray-400 mt-2">Don't just survive the job market — conquer it with AI-powered career tools built for your generation.</p>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Card 1: AI Resume & ATS Optimizer */}
            <MotionLink
              to="/resume-scanner"
              initial="hidden" whileInView="visible" whileHover={swordCardHover} whileTap={{ scale: 0.98 }} viewport={{ once: true, margin: "-50px" }} variants={cardVariants}
              className="block glass p-8 transition-colors duration-300 group"
            >
              <div className="text-4xl mb-6">📄</div>
              <h3 className="text-2xl font-bold mb-4 text-white">AI Resume &amp; ATS Optimizer</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">Upload your resume and a target job description. CareerShield AI will score your ATS compatibility, highlight missing keywords, restructure bullet points for impact, and serve up a tailored version that gets past the bots and into human hands. Beat the algorithm. Get the interview.</p>
              <ul className="space-y-3 mb-8">
                {['Precise ATS match score (0-100)', 'Missing keyword suggestions', 'Bullet point impact rewriting', 'Tailored resume generation'].map((item, i) => (
                  <motion.li key={i} whileHover={{ x: 5 }} className="flex items-center gap-3 text-gray-300 transition-transform">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    {item}
                  </motion.li>
                ))}
              </ul>
              <span className="inline-flex items-center gap-2 text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
                Try It Now <motion.svg className="w-4 h-4" initial={{ x: 0 }} whileHover={{ x: 5 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></motion.svg>
              </span>
            </MotionLink>

            {/* Card 2: Placement Preparation */}
            <MotionLink
              to="/placement-preparation"
              initial="hidden" whileInView="visible" whileHover={swordCardHover} whileTap={{ scale: 0.98 }} viewport={{ once: true, margin: "-50px" }} variants={cardVariants} transition={{ delay: 0.1 }}
              className="block glass p-8 transition-colors duration-300 group"
            >
              <div className="text-4xl mb-6">💼</div>
              <h3 className="text-2xl font-bold mb-4 text-white">Placement Preparation</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">Ace your upcoming interviews with AI-powered mock interviews and tailor-made prep materials. Practice real-time responses and get instant, actionable feedback to sharpen your skills. Walk into every interview battle-tested.</p>
              <ul className="space-y-3 mb-8">
                {['Personalized career path mapping', 'Real-time answer feedback', 'Confidence & clarity scoring'].map((item, i) => (
                  <motion.li key={i} whileHover={{ x: 5 }} className="flex items-center gap-3 text-gray-300 transition-transform">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    {item}
                  </motion.li>
                ))}
              </ul>
              <span className="inline-flex items-center gap-2 text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
                Try It Now <motion.svg className="w-4 h-4" initial={{ x: 0 }} whileHover={{ x: 5 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></motion.svg>
              </span>
            </MotionLink>

            {/* Card 3: Career Roadmap */}
            <MotionLink
              to="/career-roadmap"
              initial="hidden" whileInView="visible" whileHover={swordCardHover} whileTap={{ scale: 0.98 }} viewport={{ once: true, margin: "-50px" }} variants={cardVariants} transition={{ delay: 0.2 }}
              className="block glass p-8 transition-colors duration-300 group"
            >
              <div className="text-4xl mb-6">🗺️</div>
              <h3 className="text-2xl font-bold mb-4 text-white">Career Roadmap</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">Visualize and plan your career trajectory with step-by-step guidance. Get a personalized roadmap tailored to your dream job, highlighting key skills, certifications, and milestones you need to achieve.</p>
              <ul className="space-y-3 mb-8">
                {['Personalized step-by-step career path', 'Skill gap analysis & recommendations', 'Milestone tracking & goal setting', 'Industry trends & insights'].map((item, i) => (
                  <motion.li key={i} whileHover={{ x: 5 }} className="flex items-center gap-3 text-gray-300 transition-transform">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    {item}
                  </motion.li>
                ))}
              </ul>
              <span className="inline-flex items-center gap-2 text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
                Try It Now <motion.svg className="w-4 h-4" initial={{ x: 0 }} whileHover={{ x: 5 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></motion.svg>
              </span>
            </MotionLink>

            {/* Card 4: Project Recommendation */}
            <MotionLink
              to="/project-recommendation"
              initial="hidden" whileInView="visible" whileHover={swordCardHover} whileTap={{ scale: 0.98 }} viewport={{ once: true, margin: "-50px" }} variants={cardVariants} transition={{ delay: 0.3 }}
              className="block glass p-8 transition-colors duration-300 group"
            >
              <div className="text-4xl mb-6">💻</div>
              <h3 className="text-2xl font-bold mb-4 text-white">Project Recommendation</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">Get personalized coding and technical project recommendations designed to boost your portfolio. Stand out to recruiters with projects that align with your career goals and bridge key skill gaps.</p>
              <ul className="space-y-3 mb-8">
                {['Custom project ideas tailored for you', 'Technology stack recommendations', 'Step-by-step development guidelines', 'Portfolio-building best practices'].map((item, i) => (
                  <motion.li key={i} whileHover={{ x: 5 }} className="flex items-center gap-3 text-gray-300 transition-transform">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    {item}
                  </motion.li>
                ))}
              </ul>
              <span className="inline-flex items-center gap-2 text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
                Try It Now <motion.svg className="w-4 h-4" initial={{ x: 0 }} whileHover={{ x: 5 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></motion.svg>
              </span>
            </MotionLink>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Features;
