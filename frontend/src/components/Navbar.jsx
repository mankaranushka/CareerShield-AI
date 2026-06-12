import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import API_BASE from '../config/api';

const STORAGE_KEY = 'careershield_user_profile';

const defaultProfile = {
  firstName: '',
  middleName: '',
  lastName: '',
  userId: '',
  email: '',
  mobile: '',
  location: '',
  linkedin: '',
  github: '',
  portfolio: '',
  summary: '',
  skills: [],
  languages: [],
  education: [],
  experience: [],
  projects: [],
  certifications: [],
  resumeVersion: 0,
  lastResumeUploadAt: null,
};

const Navbar = ({ onOpenChat }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [profile, setProfile] = useState(defaultProfile);
  const [savedProfile, setSavedProfile] = useState(null);
  const [saveStatus, setSaveStatus] = useState(''); // '', 'saving', 'saved', 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [mobileAccountExpanded, setMobileAccountExpanded] = useState(false);
  const accountRef = useRef(null);
  const location = useLocation();

  // Load saved profile from localStorage on mount and register listeners for reactive updates
  useEffect(() => {
    const loadFromLocalStorage = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const normalized = {
            ...defaultProfile,
            ...parsed,
            skills: parsed.skills || [],
            languages: parsed.languages || [],
            education: parsed.education || [],
            experience: parsed.experience || [],
            projects: parsed.projects || [],
            certifications: parsed.certifications || [],
          };
          setProfile(normalized);
          setSavedProfile(normalized);
        }
      } catch (e) {
        console.error('Failed to load profile from cache:', e);
      }
    };

    loadFromLocalStorage();

    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY) {
        loadFromLocalStorage();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('careershield_store_update', loadFromLocalStorage);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('careershield_store_update', loadFromLocalStorage);
    };
  }, []);

  // Close account panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    };
    if (accountOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [accountOpen]);

  const handleLogoOrHomeClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg transition-all block font-medium border ${isActive
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
      : 'text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-400 border-transparent'
    }`;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClear = () => {
    setProfile({ ...defaultProfile });
    setSaveStatus('');
    setErrorMsg('');
  };

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setSaveStatus('');
    setErrorMsg('');
  };

  const handleSave = async () => {
    // Validate userId is provided
    if (!profile.userId || !profile.userId.trim()) {
      setSaveStatus('error');
      setErrorMsg('User ID is required.');
      return;
    }

    setSaveStatus('saving');
    setErrorMsg('');

    try {
      const response = await fetch(`${API_BASE}/api/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      // Guard: ensure response is JSON before parsing (Render cold-start can return HTML)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server is starting up. Please try again in a moment.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save profile.');
      }

      // Update state with the saved profile from the server
      const saved = data.profile;
      const profileData = {
        firstName: saved.firstName || '',
        middleName: saved.middleName || '',
        lastName: saved.lastName || '',
        userId: saved.userId || '',
        email: saved.email || '',
        mobile: saved.mobile || '',
        location: saved.location || '',
        linkedin: saved.linkedin || '',
        github: saved.github || '',
        portfolio: saved.portfolio || '',
        summary: saved.summary || '',
        skills: saved.skills || [],
        languages: saved.languages || [],
        education: saved.education || [],
        experience: saved.experience || [],
        projects: saved.projects || [],
        certifications: saved.certifications || [],
        resumeVersion: saved.resumeVersion || 0,
        lastResumeUploadAt: saved.lastResumeUploadAt || null,
      };
      setProfile(profileData);
      setSavedProfile(profileData);

      // Cache in localStorage as a fallback
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profileData));

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2500);
    } catch (err) {
      console.error('Error saving profile:', err);
      setSaveStatus('error');
      setErrorMsg(err.message || 'Failed to save. Please try again.');
    }
  };

  // Fetch profile from DB when user opens the account panel and has a cached userId
  const handleAccountToggle = async () => {
    const opening = !accountOpen;
    setAccountOpen(opening);

    if (opening && savedProfile?.userId) {
      try {
        const response = await fetch(`${API_BASE}/api/profile/${encodeURIComponent(savedProfile.userId)}`);
        const contentType = response.headers.get('content-type');
        if (response.ok && contentType && contentType.includes('application/json')) {
          const data = await response.json();
          const fetched = data.profile;
          const profileData = {
            firstName: fetched.firstName || '',
            middleName: fetched.middleName || '',
            lastName: fetched.lastName || '',
            userId: fetched.userId || '',
            email: fetched.email || '',
            mobile: fetched.mobile || '',
            location: fetched.location || '',
            linkedin: fetched.linkedin || '',
            github: fetched.github || '',
            portfolio: fetched.portfolio || '',
            summary: fetched.summary || '',
            skills: fetched.skills || [],
            languages: fetched.languages || [],
            education: fetched.education || [],
            experience: fetched.experience || [],
            projects: fetched.projects || [],
            certifications: fetched.certifications || [],
            resumeVersion: fetched.resumeVersion || 0,
            lastResumeUploadAt: fetched.lastResumeUploadAt || null,
          };
          setProfile(profileData);
          setSavedProfile(profileData);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(profileData));
        }
      } catch (err) {
        // Silently fail — we already have cached data
        console.warn('Could not fetch latest profile from server:', err);
      }
    }
  };

  const hasChanges = JSON.stringify(profile) !== JSON.stringify(savedProfile || defaultProfile);

  const getInitials = () => {
    if (savedProfile?.firstName) {
      return savedProfile.firstName.charAt(0).toUpperCase();
    }
    return null;
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${scrolled ? 'bg-gray-900/90 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'}`}
    >
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.location.href = '/'}>
          <motion.svg
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            viewBox="0 0 32 32" width="32" height="32" className="transform"
          >
            <path d="M16 2L4 8v8c0 7.18 5.12 13.9 12 15.4C22.88 29.9 28 23.18 28 16V8L16 2z" fill="url(#shield-grad)" opacity="0.9" />
            <path d="M14 17l-3-3 1.4-1.4L14 14.2l5.6-5.6L21 10l-7 7z" fill="#fff" />
            <defs>
              <linearGradient id="shield-grad" x1="4" y1="2" x2="28" y2="32">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
          </motion.svg>
          <span className="text-xl font-bold tracking-tight text-white">CareerShield <span className="text-emerald-400">AI</span></span>
        </div>

        {/* Desktop Nav */}
        <ul className="hidden lg:flex items-center gap-2 text-sm font-medium">
          <motion.li whileHover={{ scale: 1.05 }}><NavLink to="/" onClick={handleLogoOrHomeClick} className={getLinkClass}>Home</NavLink></motion.li>
          <motion.li whileHover={{ scale: 1.05 }}><NavLink to="/resume-scanner" className={getLinkClass}>Resume Analysis</NavLink></motion.li>
          <motion.li whileHover={{ scale: 1.05 }}><NavLink to="/career-roadmap" className={getLinkClass}>Career Roadmap</NavLink></motion.li>
          <motion.li whileHover={{ scale: 1.05 }}><NavLink to="/placement-preparation" className={getLinkClass}>Placement Preparation</NavLink></motion.li>
          <motion.li whileHover={{ scale: 1.05 }}><NavLink to="/project-recommendation" className={getLinkClass}>Project</NavLink></motion.li>
          <motion.li whileHover={{ scale: 1.05 }}><NavLink to="/about" className={getLinkClass}>About</NavLink></motion.li>
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          {/* User ID Badge - shown after save */}
          <AnimatePresence>
            {savedProfile?.userId && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="text-xs font-semibold text-emerald-400 max-w-[100px] truncate">{savedProfile.userId}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(16, 185, 129, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenChat}
            className="bg-emerald-500 text-white px-6 py-2 rounded-full font-medium shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-colors cursor-pointer"
          >
            Contact Us
          </motion.button>

          {/* Account Button */}
          <div className="relative" ref={accountRef}>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAccountToggle}
              id="account-toggle-btn"
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                accountOpen
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                  : 'bg-gray-800/80 text-gray-300 border-gray-700 hover:border-emerald-500/50 hover:text-emerald-400'
              }`}
            >
              {getInitials() ? (
                <span className="text-sm font-bold">{getInitials()}</span>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </motion.button>

            {/* Account Dropdown Panel */}
            <AnimatePresence>
              {accountOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  id="account-panel"
                  className="absolute right-0 top-14 w-[380px] rounded-2xl border border-gray-700/60 bg-gray-900/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                  {/* Header */}
                  <div className="px-6 pt-5 pb-4 border-b border-gray-800/80">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                          {getInitials() ? (
                            <span className="text-white text-sm font-bold">{getInitials()}</span>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h3 className="text-white text-sm font-semibold flex items-center gap-1.5">
                            My Account
                            {profile.resumeVersion > 0 && (
                              <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-bold">
                                Sync v{profile.resumeVersion}
                              </span>
                            )}
                          </h3>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {profile.lastResumeUploadAt
                              ? `Last Sync: ${new Date(profile.lastResumeUploadAt).toLocaleDateString()}`
                              : 'Manage your profile'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setAccountOpen(false)}
                        className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Form */}
                  <div className="px-6 py-4 space-y-3 max-h-[400px] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                    {/* Name Row */}
                    <div className="grid grid-cols-3 gap-2">
                      <AccountField
                        label="First Name"
                        id="account-first-name"
                        value={profile.firstName}
                        onChange={(v) => handleProfileChange('firstName', v)}
                        placeholder="John"
                      />
                      <AccountField
                        label="Middle"
                        id="account-middle-name"
                        value={profile.middleName}
                        onChange={(v) => handleProfileChange('middleName', v)}
                        placeholder="M."
                      />
                      <AccountField
                        label="Last Name"
                        id="account-last-name"
                        value={profile.lastName}
                        onChange={(v) => handleProfileChange('lastName', v)}
                        placeholder="Doe"
                      />
                    </div>

                    {/* User ID */}
                    <AccountField
                      label="User ID"
                      id="account-user-id"
                      value={profile.userId}
                      onChange={(v) => handleProfileChange('userId', v)}
                      placeholder="e.g. johndoe123"
                      icon={
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                          <rect x="3" y="4" width="18" height="16" rx="2" />
                          <path d="M7 8h4" /><path d="M7 12h10" /><path d="M7 16h6" />
                        </svg>
                      }
                    />

                    {/* Email */}
                    <AccountField
                      label="Email"
                      id="account-email"
                      type="email"
                      value={profile.email}
                      onChange={(v) => handleProfileChange('email', v)}
                      placeholder="john@example.com"
                      icon={
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                      }
                    />

                    {/* Mobile */}
                    <AccountField
                      label="Mobile"
                      id="account-mobile"
                      type="tel"
                      value={profile.mobile}
                      onChange={(v) => handleProfileChange('mobile', v)}
                      placeholder="+91 98765 43210"
                      icon={
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                          <line x1="12" y1="18" x2="12.01" y2="18" />
                        </svg>
                      }
                    />

                    {/* Location */}
                    <AccountField
                      label="Location"
                      id="account-location"
                      value={profile.location}
                      onChange={(v) => handleProfileChange('location', v)}
                      placeholder="City, Country"
                      icon={
                        <span className="material-symbols-rounded text-gray-500 text-sm">location_on</span>
                      }
                    />

                    {/* Links Grid */}
                    <div className="grid grid-cols-3 gap-2">
                      <AccountField
                        label="LinkedIn"
                        id="account-linkedin"
                        value={profile.linkedin}
                        onChange={(v) => handleProfileChange('linkedin', v)}
                        placeholder="https://..."
                      />
                      <AccountField
                        label="GitHub"
                        id="account-github"
                        value={profile.github}
                        onChange={(v) => handleProfileChange('github', v)}
                        placeholder="https://..."
                      />
                      <AccountField
                        label="Portfolio"
                        id="account-portfolio"
                        value={profile.portfolio}
                        onChange={(v) => handleProfileChange('portfolio', v)}
                        placeholder="https://..."
                      />
                    </div>

                    {/* Summary */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor="account-summary" className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        Professional Summary
                      </label>
                      <textarea
                        id="account-summary"
                        value={profile.summary}
                        onChange={(e) => handleProfileChange('summary', e.target.value)}
                        placeholder="A short summary of your professional background..."
                        className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg text-xs text-white placeholder-gray-600 px-3 py-1.5 transition-all focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:bg-gray-800/80 min-h-[60px]"
                      />
                    </div>

                    {/* Read-only Skills Chips */}
                    {profile.skills && profile.skills.length > 0 && (
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                          Skills ({profile.skills.length})
                        </span>
                        <div className="flex flex-wrap gap-1 max-h-[100px] overflow-y-auto p-1.5 bg-gray-800/30 rounded-lg border border-gray-800/80">
                          {profile.skills.map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md text-[10px] font-semibold">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Read-only Languages Chips */}
                    {profile.languages && profile.languages.length > 0 && (
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                          Languages ({profile.languages.length})
                        </span>
                        <div className="flex flex-wrap gap-1 max-h-[60px] overflow-y-auto p-1.5 bg-gray-800/30 rounded-lg border border-gray-800/80">
                          {profile.languages.map((l, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-md text-[10px] font-semibold">
                              {l}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="px-6 py-4 border-t border-gray-800/80 flex flex-col gap-2">
                    {/* Error Message */}
                    <AnimatePresence>
                      {saveStatus === 'error' && errorMsg && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                          </svg>
                          {errorMsg}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex items-center justify-between">
                      <AnimatePresence mode="wait">
                        {saveStatus === 'saved' && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Saved to database
                          </motion.div>
                        )}
                        {saveStatus !== 'saved' && saveStatus !== 'error' && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-gray-500 text-xs"
                          >
                            {hasChanges ? 'Unsaved changes' : 'All changes saved'}
                          </motion.span>
                        )}
                        {saveStatus === 'error' && !errorMsg && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-red-400 text-xs"
                          >
                            Save failed
                          </motion.span>
                        )}
                      </AnimatePresence>

                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleClear}
                          id="account-clear-btn"
                          className="px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer bg-gray-800 text-gray-400 border border-gray-700 hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/5"
                        >
                          Clear
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleSave}
                          disabled={saveStatus === 'saving'}
                          id="account-save-btn"
                          className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                            hasChanges
                              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]'
                              : 'bg-gray-800 text-gray-400 border border-gray-700'
                          }`}
                        >
                          {saveStatus === 'saving' ? (
                            <span className="flex items-center gap-2">
                              <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                              />
                              Saving…
                            </span>
                          ) : (
                            'Save Changes'
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden flex flex-col justify-center gap-1.5 w-8 h-8 z-30 relative focus:outline-none"
          onClick={() => setMobileMenuOpen(true)}
        >
          <span className="block w-6 h-0.5 bg-white"></span>
          <span className="block w-6 h-0.5 bg-white"></span>
          <span className="block w-6 h-0.5 bg-white"></span>
        </button>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              />

              {/* Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: "100%" }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-[100dvh] w-full max-w-sm bg-gray-900 border-l border-gray-800 z-50 flex flex-col p-6 overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-8">
                  <span className="text-xl font-bold tracking-tight text-white">CareerShield <span className="text-emerald-400">AI</span></span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                  >
                    <span className="material-symbols-rounded">close</span>
                  </button>
                </div>

                <ul className="flex flex-col gap-3 text-base font-medium text-gray-300 w-full flex-grow">
                  <motion.li className="w-full" whileHover={{ scale: 1.02 }}><NavLink to="/" onClick={(e) => { setMobileMenuOpen(false); handleLogoOrHomeClick(e); }} className={getLinkClass}>Home</NavLink></motion.li>
                  <motion.li className="w-full" whileHover={{ scale: 1.02 }}><NavLink to="/resume-scanner" onClick={() => setMobileMenuOpen(false)} className={getLinkClass}>Resume Analysis</NavLink></motion.li>
                  <motion.li className="w-full" whileHover={{ scale: 1.02 }}><NavLink to="/career-roadmap" onClick={() => setMobileMenuOpen(false)} className={getLinkClass}>Career Roadmap</NavLink></motion.li>
                  <motion.li className="w-full" whileHover={{ scale: 1.02 }}><NavLink to="/placement-preparation" onClick={() => setMobileMenuOpen(false)} className={getLinkClass}>Placement Preparation</NavLink></motion.li>
                  <motion.li className="w-full" whileHover={{ scale: 1.02 }}><NavLink to="/project-recommendation" onClick={() => setMobileMenuOpen(false)} className={getLinkClass}>Project Recommendation</NavLink></motion.li>
                  <motion.li className="w-full" whileHover={{ scale: 1.02 }}><NavLink to="/about" onClick={() => setMobileMenuOpen(false)} className={getLinkClass}>About</NavLink></motion.li>
                </ul>

                {/* Mobile Account Section — Collapsible */}
                <div className="mt-6 pt-5 border-t border-gray-800 w-full">
                  {/* Clickable Account Header */}
                  <button
                    onClick={() => setMobileAccountExpanded(!mobileAccountExpanded)}
                    className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-emerald-500/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md">
                        {getInitials() ? (
                          <span className="text-white text-xs font-bold">{getInitials()}</span>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        )}
                      </div>
                      <div className="text-left">
                        <p className="text-white text-sm font-semibold">
                          {savedProfile?.firstName
                            ? `${savedProfile.firstName} ${savedProfile.lastName || ''}`
                            : 'My Account'}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {savedProfile?.userId
                            ? <span className="text-emerald-400 font-medium">@{savedProfile.userId}</span>
                            : 'Tap to add your details'}
                        </p>
                      </div>
                    </div>
                    <motion.svg
                      animate={{ rotate: mobileAccountExpanded ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </motion.svg>
                  </button>

                  {/* Expandable Profile Form */}
                  <AnimatePresence>
                    {mobileAccountExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 space-y-2.5">
                          <div className="grid grid-cols-3 gap-2">
                            <AccountField label="First" id="mobile-first-name" value={profile.firstName} onChange={(v) => handleProfileChange('firstName', v)} placeholder="First" />
                            <AccountField label="Middle" id="mobile-middle-name" value={profile.middleName} onChange={(v) => handleProfileChange('middleName', v)} placeholder="Mid" />
                            <AccountField label="Last" id="mobile-last-name" value={profile.lastName} onChange={(v) => handleProfileChange('lastName', v)} placeholder="Last" />
                          </div>
                          <AccountField label="User ID" id="mobile-user-id" value={profile.userId} onChange={(v) => handleProfileChange('userId', v)} placeholder="userid123" />
                          <AccountField label="Email" id="mobile-email" type="email" value={profile.email} onChange={(v) => handleProfileChange('email', v)} placeholder="email@example.com" />
                           <AccountField label="Mobile" id="mobile-mobile" type="tel" value={profile.mobile} onChange={(v) => handleProfileChange('mobile', v)} placeholder="+91 98765 43210" />
                           <AccountField label="Location" id="mobile-location" value={profile.location} onChange={(v) => handleProfileChange('location', v)} placeholder="City, Country" />
                           <AccountField label="LinkedIn" id="mobile-linkedin" value={profile.linkedin} onChange={(v) => handleProfileChange('linkedin', v)} placeholder="LinkedIn URL" />
                           <AccountField label="GitHub" id="mobile-github" value={profile.github} onChange={(v) => handleProfileChange('github', v)} placeholder="GitHub URL" />
                           <AccountField label="Portfolio" id="mobile-portfolio" value={profile.portfolio} onChange={(v) => handleProfileChange('portfolio', v)} placeholder="Portfolio URL" />
                           <div className="flex flex-col gap-1">
                             <label htmlFor="mobile-summary" className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Professional Summary</label>
                             <textarea
                               id="mobile-summary"
                               value={profile.summary}
                               onChange={(e) => handleProfileChange('summary', e.target.value)}
                               placeholder="Summary..."
                               className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg text-sm text-white placeholder-gray-600 px-3 py-2 min-h-[60px]"
                             />
                           </div>
                           {profile.skills && profile.skills.length > 0 && (
                             <div className="flex flex-col gap-1">
                               <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Skills ({profile.skills.length})</span>
                               <div className="flex flex-wrap gap-1 max-h-[80px] overflow-y-auto p-1.5 bg-gray-800/30 rounded-lg border border-gray-800/80">
                                 {profile.skills.map((s, idx) => (
                                   <span key={idx} className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md text-[10px] font-semibold">{s}</span>
                                 ))}
                               </div>
                             </div>
                           )}

                          {/* Mobile error message */}
                          <AnimatePresence>
                            {saveStatus === 'error' && errorMsg && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10" />
                                  <line x1="15" y1="9" x2="9" y2="15" />
                                  <line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                                {errorMsg}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="flex gap-2 pt-1">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleClear}
                              className="flex-1 bg-gray-800 text-gray-400 border border-gray-700 hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/5 px-4 py-2.5 rounded-xl font-medium transition-colors cursor-pointer text-sm"
                            >
                              Clear
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleSave}
                              disabled={saveStatus === 'saving'}
                              className="flex-[2] bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-colors cursor-pointer text-sm"
                            >
                              {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? '✓ Saved to DB!' : 'Save Changes'}
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-800 w-full flex flex-col items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setMobileMenuOpen(false); onOpenChat(); }}
                    className="w-full bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-colors"
                  >
                    Contact Us
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

/* ─── Reusable Input Field ─── */
const AccountField = ({ label, id, value, onChange, placeholder, type = 'text', icon }) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={id} className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
          {icon}
        </div>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-gray-800/60 border border-gray-700/50 rounded-lg text-sm text-white placeholder-gray-600 py-2 transition-all focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:bg-gray-800/80 ${
          icon ? 'pl-8 pr-3' : 'px-3'
        }`}
      />
    </div>
  </div>
);

export default Navbar;
