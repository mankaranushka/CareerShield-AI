import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ThreatLandscape from './components/ThreatLandscape';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';

import About from './components/About';
import PlacementPreparation from './components/PlacementPreparation';
import ProjectRecommendation from './components/ProjectRecommendation';
import CareerRoadmap from './components/CareerRoadmap';
import ContactUs from './components/ContactUs';
import Footer from './components/Footer';

import ResumeScanner from './components/ResumeScanner';
import Marquee from './components/Marquee';
import ChatModal from './components/ChatModal';
import { AnimatePresence } from 'framer-motion';
import NotFound from './components/NotFound';
import ScrollToTop from './components/ScrollToTop';

const Home = () => (
  <>
    <div className="pt-24 pb-4">
      <Marquee speed={35} />
    </div>
    <Hero />
    <ThreatLandscape />
    <Features />
    <HowItWorks />
    <Footer />
  </>
);

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 overflow-x-hidden font-sans">
      <ScrollToTop />
      <Navbar onOpenChat={() => setIsChatOpen(true)} />
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<ContactUs />} />

          {/* Premium AI Routes (Now Public) */}
          <Route path="/resume-scanner" element={<ResumeScanner />} />
          <Route path="/placement-preparation" element={<PlacementPreparation />} />
          <Route path="/project-recommendation" element={<ProjectRecommendation />} />
          <Route path="/career-roadmap" element={<CareerRoadmap />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      <AnimatePresence>
        {isChatOpen && <ChatModal onClose={() => setIsChatOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}

export default App;
