import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useResumeStore from '../hooks/useResumeStore';
import API_BASE from '../config/api';

const ResumeScanner = () => {
  const {
    profileData,
    syncProfile,
    updateAtsReport,
    updateResumeData
  } = useResumeStore();

  const [file, setFile] = useState(null);
  const [jd, setJd] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, results
  const [loadingStep, setLoadingStep] = useState(0);
  const [score, setScore] = useState(0);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState(null);
  const [isInvalidDoc, setIsInvalidDoc] = useState(false);
  const [activeTab, setActiveTab] = useState('skills'); // skills, analysis, details

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer?.files[0] || e.target.files[0];
    if (droppedFile) {
      const ext = droppedFile.name.split('.').pop().toLowerCase();
      if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) {
        setFile(droppedFile);
        setError(null);
        setIsInvalidDoc(false);
      } else {
        setError('Only PDF, DOC, DOCX, and TXT files are allowed');
      }
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please upload a resume first');
      return;
    }
    if (jd.trim().length < 20) {
      setError('Job description must be at least 20 characters long');
      return;
    }

    setStatus('loading');
    setError(null);
    setIsInvalidDoc(false);
    setLoadingStep(0);

    const steps = [
      'Uploading document safely...',
      'Validating resume format...',
      'Extracting skills & context...',
      'Matching against job requirements...',
      'Formulating ATS score & improvements...'
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setLoadingStep(currentStep);
      }
    }, 1200);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jd);

    // If a cached userId exists in profile, send it to allow DB save and sync
    if (profileData.userId) {
      formData.append('userId', profileData.userId);
    }

    try {
      const response = await fetch(`${API_BASE}/api/analyze-resume`, {
        method: 'POST',
        body: formData
      });

      clearInterval(interval);

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned an unexpected response. Please try again in a moment.');
      }

      const data = await response.json();

      if (response.status === 422 && data.status === 'invalid_document') {
        setIsInvalidDoc(true);
        const details = data.validationScore !== undefined 
          ? ` (Score: ${data.validationScore}/3. Detected matches: ${data.indicators && data.indicators.length > 0 ? data.indicators.join(', ') : 'none'})` 
          : '';
        setError((data.error || 'Uploaded file is not a valid resume/CV.') + details);
        setStatus('idle');
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scan resume. Please try again.');
      }

      setAnalysisData(data);
      setStatus('results');
      animateScore(data.ats_score || data.score || 0);

      // Save latest data to central store
      updateAtsReport(data);
      if (data.extractedData) {
        updateResumeData(data.extractedData);
        // Sync the profile locally in useResumeStore if user is signed in
        if (profileData.userId) {
          syncProfile(data.extractedData);
        }
      }
    } catch (err) {
      clearInterval(interval);
      console.error(err);
      setError(err.message);
      setStatus('idle');
    }
  };

  const animateScore = (targetScore) => {
    let current = 0;
    const timer = setInterval(() => {
      if (targetScore === 0) {
        setScore(0);
        clearInterval(timer);
        return;
      }
      current += 2;
      if (current >= targetScore) {
        setScore(targetScore);
        clearInterval(timer);
      } else {
        setScore(current);
      }
    }, 15);
  };

  const handlePrint = () => {
    window.print();
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    out: { opacity: 0, y: -20, transition: { duration: 0.6 } }
  };

  return (
    <motion.div 
      initial="initial" animate="in" exit="out" variants={pageVariants}
      className="pt-24 pb-20 min-h-screen bg-gray-950 text-gray-200 print:bg-white print:text-black print:pt-4 print:pb-4"
    >
      {/* Print-only Header */}
      <div className="hidden print:block mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold">CareerShield AI — ATS Analyzer Report</h1>
        <p className="text-sm text-gray-600">Generated on: {new Date().toLocaleDateString()} for Resume: {analysisData?.fileName || file?.name}</p>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-center mb-12 print:hidden"
        >
          <div className="text-emerald-400 font-semibold uppercase tracking-wider mb-2 text-sm">AI Resume & ATS Optimizer</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Beat the Bots.<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Land the Interview.</span></h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">Upload your resume and paste a job description — our AI will score your ATS compatibility, parse structured fields, sync your profile, and give you an actionable optimization plan.</p>
        </motion.div>

        <div className={`grid ${status === 'results' ? 'lg:grid-cols-12' : 'lg:grid-cols-2'} gap-8 max-w-6xl mx-auto print:block`}>
          {/* Inputs Section */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.4 }} 
            className={`space-y-6 print:hidden ${status === 'results' ? 'lg:col-span-5' : ''}`}
          >
            {status !== 'results' ? (
              <>
                <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-rounded text-emerald-400 text-2xl">description</span>
                    <h3 className="text-xl font-bold text-white">Upload Your Resume</h3>
                  </div>
                  
                  <AnimatePresence mode="wait">
                    {!file ? (
                      <motion.div 
                        key="upload"
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        whileHover={{ scale: 1.01, borderColor: "#10b981", backgroundColor: "rgba(16, 185, 129, 0.03)" }}
                        className="border-2 border-dashed border-gray-700 bg-gray-900/40 rounded-xl p-8 text-center cursor-pointer transition-all duration-200"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleFileDrop}
                        onClick={() => document.getElementById('file-upload').click()}
                      >
                        <motion.span whileHover={{ y: -3 }} className="material-symbols-rounded text-4xl text-gray-500 mb-3 block">upload_file</motion.span>
                        <p className="text-white font-medium mb-1">Drag & drop your resume here</p>
                        <p className="text-gray-400 text-sm mb-3">or click to browse</p>
                        <p className="text-gray-500 text-xs font-medium">PDF, DOCX, DOC, TXT — Max 5MB</p>
                        <input type="file" id="file-upload" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleFileDrop} />
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="file"
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="material-symbols-rounded text-emerald-400 text-2xl flex-shrink-0 animate-bounce">description</span>
                          <div className="min-w-0">
                            <p className="text-white font-medium truncate pr-4">{file.name}</p>
                            <p className="text-gray-400 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <motion.button 
                          whileHover={{ scale: 1.15, color: "#f87171" }} 
                          onClick={() => { setFile(null); setError(null); setIsInvalidDoc(false); }} 
                          className="text-gray-400 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-rounded text-lg">close</span>
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-rounded text-emerald-400 text-2xl">work</span>
                    <h3 className="text-xl font-bold text-white">Paste Job Description</h3>
                  </div>
                  <textarea 
                    className="w-full bg-gray-900/60 border border-gray-700 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 min-h-[200px] transition-all text-sm leading-relaxed"
                    placeholder="Paste the full job description here to get a tailored ATS match score and keyword suggestions..."
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                  ></textarea>
                  <div className="text-right text-xs text-gray-500 mt-2">{jd.length} characters (min 20)</div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl text-sm text-center font-medium ${isInvalidDoc ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <span className="material-symbols-rounded text-lg">
                        {isInvalidDoc ? 'warning' : 'error'}
                      </span>
                      <span className="font-bold">{isInvalidDoc ? 'Document Validation Error' : 'Error'}</span>
                    </div>
                    {error}
                  </motion.div>
                )}

                <motion.button 
                  whileHover={file && jd.trim().length >= 20 && status !== 'loading' ? { scale: 1.02, boxShadow: "0 0 25px rgba(16,185,129,0.4)" } : {}}
                  whileTap={file && jd.trim().length >= 20 && status !== 'loading' ? { scale: 0.98 } : {}}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${file && jd.trim().length >= 20 && status !== 'loading' ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-gray-800 text-gray-500 cursor-not-allowed shadow-none'}`}
                  disabled={!file || jd.trim().length < 20 || status === 'loading'}
                  onClick={handleAnalyze}
                >
                  <span className="material-symbols-rounded">psychology</span>
                  Analyze My Resume
                </motion.button>
              </>
            ) : (
              /* Extracted Profile Details Card in results state */
              <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-rounded text-emerald-400 text-2xl">account_box</span>
                    <h3 className="text-xl font-bold text-white">Parsed Profile</h3>
                  </div>
                  {profileData.userId ? (
                    <span className="text-xs px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-medium">
                      ✓ Merged to Profile
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-1 bg-gray-800 border border-gray-700 text-gray-400 rounded-full">
                      Guest Scan
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {analysisData.extractedData?.full_name && (
                    <div>
                      <div className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Parsed Name</div>
                      <div className="text-white font-medium">{analysisData.extractedData.full_name}</div>
                    </div>
                  )}

                  {analysisData.extractedData?.email && (
                    <div>
                      <div className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Parsed Email</div>
                      <div className="text-white font-medium">{analysisData.extractedData.email}</div>
                    </div>
                  )}

                  {analysisData.extractedData?.phone && (
                    <div>
                      <div className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Parsed Mobile</div>
                      <div className="text-white font-medium">{analysisData.extractedData.phone}</div>
                    </div>
                  )}

                  {analysisData.extractedData?.location && (
                    <div>
                      <div className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Parsed Location</div>
                      <div className="text-white font-medium">{analysisData.extractedData.location}</div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4 pt-2">
                    {analysisData.extractedData?.linkedin && (
                      <a 
                        href={analysisData.extractedData.linkedin} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs text-emerald-400 flex items-center gap-1.5 hover:underline"
                      >
                        <span className="material-symbols-rounded text-sm">link</span> LinkedIn
                      </a>
                    )}
                    {analysisData.extractedData?.github && (
                      <a 
                        href={analysisData.extractedData.github} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs text-emerald-400 flex items-center gap-1.5 hover:underline"
                      >
                        <span className="material-symbols-rounded text-sm">link</span> GitHub
                      </a>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-700/50 pt-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Metadata Summary</h4>
                  <div className="text-xs text-gray-400 space-y-1.5">
                    <div><strong>File Name:</strong> {analysisData.fileName}</div>
                    {analysisData.resumeVersion && (
                      <div><strong>Resume Version:</strong> v{analysisData.resumeVersion}</div>
                    )}
                    {analysisData.syncDiff && Object.keys(analysisData.syncDiff).length > 0 && (
                      <div className="text-emerald-400 font-medium pt-1">
                        ✓ Imported {Object.keys(analysisData.syncDiff).length} new field(s) into your account!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Results / Report Panel */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.6 }} 
            className={`bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 flex flex-col min-h-[500px] shadow-xl print:border-none print:shadow-none print:bg-transparent print:p-0 ${status === 'results' ? 'lg:col-span-7' : ''}`}
          >
            <AnimatePresence mode="wait">
              {status === 'idle' && (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}
                  className="flex-1 flex flex-col items-center justify-center text-center"
                >
                  <motion.span 
                    animate={{ y: [0, -10, 0] }} 
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} 
                    className="material-symbols-rounded text-6xl text-emerald-500/30 mb-5 select-none"
                  >
                    analytics
                  </motion.span>
                  <h3 className="text-xl font-bold text-white mb-2">Your ATS Report Will Appear Here</h3>
                  <p className="text-gray-400 max-w-sm text-sm leading-relaxed">Upload a resume and paste a job description, then click "Analyze" to get your detailed ATS compatibility report.</p>
                </motion.div>
              )}

              {status === 'loading' && (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  className="flex-1 flex flex-col items-center justify-center text-center"
                >
                  <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                  <h3 className="text-xl font-bold text-white mb-2">Analyzing Your Resume...</h3>
                  <motion.p 
                    key={loadingStep}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="text-emerald-400 mb-6 text-sm font-medium"
                  >
                    {[
                      'Uploading document safely...',
                      'Validating resume format...',
                      'Extracting skills & context...',
                      'Matching against job requirements...',
                      'Formulating ATS score & improvements...'
                    ][loadingStep]}
                  </motion.p>
                  <div className="w-full max-w-xs bg-gray-800 rounded-full h-2 overflow-hidden border border-gray-700/50">
                    <motion.div 
                      className="bg-emerald-500 h-full" 
                      initial={{ width: 0 }}
                      animate={{ width: `${(loadingStep + 1) * 20}%` }}
                      transition={{ duration: 0.5 }}
                    ></motion.div>
                  </div>
                </motion.div>
              )}

              {status === 'results' && analysisData && (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col items-center mb-4 text-center">
                    <div className="relative w-44 h-44 mb-3">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                        <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="10"/>
                        <motion.circle 
                          cx="80" cy="80" r="70" fill="none" stroke="#10b981" strokeWidth="10" strokeLinecap="round" 
                          strokeDasharray="440" 
                          initial={{ strokeDashoffset: 440 }}
                          animate={{ strokeDashoffset: 440 - (440 * score) / 100 }} 
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-black text-white">{score}</span>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">ATS Score</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-400">GRADE:</span>
                      <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8, type: "spring" }}
                        className="px-3.5 py-1 rounded bg-emerald-500/20 text-emerald-400 font-extrabold border border-emerald-500/30 text-lg tracking-wider"
                      >
                        {analysisData.grade}
                      </motion.div>
                      <span className="text-gray-600">|</span>
                      <span className="text-emerald-400 font-bold tracking-wide">{analysisData.match_level || analysisData.verdict}</span>
                    </div>
                  </div>

                  {/* Navigation Tabs */}
                  <div className="flex border-b border-gray-700/50 pt-2 print:hidden">
                    <button 
                      onClick={() => setActiveTab('skills')}
                      className={`flex-1 pb-3 text-sm font-semibold transition-colors border-b-2 text-center cursor-pointer ${activeTab === 'skills' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-white'}`}
                    >
                      Skills & Keywords
                    </button>
                    <button 
                      onClick={() => setActiveTab('analysis')}
                      className={`flex-1 pb-3 text-sm font-semibold transition-colors border-b-2 text-center cursor-pointer ${activeTab === 'analysis' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-white'}`}
                    >
                      Metrics Breakdown
                    </button>
                    <button 
                      onClick={() => setActiveTab('details')}
                      className={`flex-1 pb-3 text-sm font-semibold transition-colors border-b-2 text-center cursor-pointer ${activeTab === 'details' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-white'}`}
                    >
                      JD Match Analysis
                    </button>
                  </div>

                  {/* Tab Contents */}
                  <div className="space-y-6">
                    {/* TAB 1: Skills & Keywords */}
                    {(activeTab === 'skills' || window.matchMedia('print').matches) && (
                      <div className="space-y-6">
                        {/* Matched / Missing Skills */}
                        <div className="bg-gray-900/40 border border-gray-700/30 rounded-xl p-5 space-y-4">
                          <div>
                            <h4 className="font-bold text-white mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-emerald-400">
                              Matched Skills
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {analysisData.matched_skills?.length > 0 ? (
                                analysisData.matched_skills.map((s) => (
                                  <span key={s} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-xs font-medium">
                                    {s}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-500 text-xs italic">No skills matched directly from the job description.</span>
                              )}
                            </div>
                          </div>

                          <div className="pt-2">
                            <h4 className="font-bold text-white mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-red-400">
                              Missing Target Skills
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {analysisData.missing_skills?.length > 0 ? (
                                analysisData.missing_skills.map((s) => (
                                  <span key={s} className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md text-xs font-medium">
                                    + {s}
                                  </span>
                                ))
                              ) : (
                                <span className="text-emerald-400 text-xs font-semibold">✓ Meets all skill requirements!</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Matched / Missing Keywords */}
                        <div className="bg-gray-900/40 border border-gray-700/30 rounded-xl p-5 space-y-4">
                          <div>
                            <h4 className="font-bold text-white mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-teal-400">
                              Matched Keywords
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {analysisData.matched_keywords?.length > 0 ? (
                                analysisData.matched_keywords.map((k) => (
                                  <span key={k} className="px-2.5 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-md text-xs font-medium">
                                    {k}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-500 text-xs italic">No keyword overlap detected.</span>
                              )}
                            </div>
                          </div>

                          <div className="pt-2">
                            <h4 className="font-bold text-white mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-red-400">
                              Missing Critical JD Keywords
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {analysisData.missing_keywords?.length > 0 ? (
                                analysisData.missing_keywords.map((k) => (
                                  <span key={k} className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md text-xs font-medium">
                                    + {k}
                                  </span>
                                ))
                              ) : (
                                <span className="text-emerald-400 text-xs font-semibold">✓ High keyword density match!</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: Metrics Breakdown */}
                    {(activeTab === 'analysis' || window.matchMedia('print').matches) && (
                      <div className="bg-gray-900/40 border border-gray-700/30 rounded-xl p-5 shadow-inner">
                        <h4 className="font-bold text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                          <span className="material-symbols-rounded text-emerald-400 text-lg">bar_chart</span> 
                          Weighted Scoring Breakdown
                        </h4>
                        <div className="space-y-4">
                          {analysisData.categories.map((cat, idx) => {
                            const getProgressColor = (pct) => {
                              if (pct >= 80) return 'bg-emerald-500';
                              if (pct >= 50) return 'bg-teal-500';
                              return 'bg-blue-500';
                            };
                            
                            return (
                              <div key={cat.name}>
                                <div className="flex justify-between text-xs mb-1.5">
                                  <span className="text-gray-400 font-semibold">{cat.name} ({cat.weight})</span>
                                  <span className="text-white font-bold">{cat.pct}% <span className="text-gray-500 font-normal">({cat.raw}/{cat.max} pts)</span></span>
                                </div>
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700/20">
                                  <motion.div 
                                    className={`h-full ${getProgressColor(cat.pct)}`}
                                    initial={{ width: 0 }} 
                                    animate={{ width: `${cat.pct}%` }} 
                                    transition={{ duration: 1, delay: idx * 0.05 }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* TAB 3: Match Details / Explanations */}
                    {(activeTab === 'details' || window.matchMedia('print').matches) && (
                      <div className="space-y-4">
                        <div className="bg-gray-900/40 border border-gray-700/30 rounded-xl p-4">
                          <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Experience Assessment</div>
                          <p className="text-white text-sm leading-relaxed">{analysisData.experience_analysis}</p>
                        </div>

                        <div className="bg-gray-900/40 border border-gray-700/30 rounded-xl p-4">
                          <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Education Assessment</div>
                          <p className="text-white text-sm leading-relaxed">{analysisData.education_analysis}</p>
                        </div>

                        <div className="bg-gray-900/40 border border-gray-700/30 rounded-xl p-4">
                          <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Certifications Assessment</div>
                          <p className="text-white text-sm leading-relaxed">{analysisData.certification_analysis}</p>
                        </div>
                      </div>
                    )}

                    {/* Strengths & Weaknesses */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-5">
                        <h4 className="font-bold text-emerald-400 mb-3 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                          <span className="material-symbols-rounded text-sm">thumb_up</span> Strengths
                        </h4>
                        <ul className="space-y-2">
                          {analysisData.strengths?.map((str, i) => (
                            <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                              <span className="text-emerald-400 font-bold">✓</span>
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-5">
                        <h4 className="font-bold text-red-400 mb-3 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                          <span className="material-symbols-rounded text-sm">warning</span> Gaps / Risks
                        </h4>
                        <ul className="space-y-2">
                          {analysisData.weaknesses?.length > 0 ? (
                            analysisData.weaknesses.map((weak, i) => (
                              <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                                <span className="text-red-400 font-bold">!</span>
                                <span>{weak}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-xs text-emerald-400 flex items-start gap-2">
                              <span className="font-bold">✓</span>
                              <span>No major parsing risks or gaps detected!</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* Recommendations Checklist */}
                    <div className="bg-gray-900/40 border border-gray-700/30 rounded-xl p-5">
                      <h4 className="font-bold text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <span className="material-symbols-rounded text-emerald-400 text-lg">tips_and_updates</span> 
                        Actionable Optimization Plan
                      </h4>
                      <ul className="space-y-3">
                        {analysisData.recommendations?.map((tip, idx) => (
                          <motion.li 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: idx * 0.05 }}
                            key={idx} 
                            className="flex items-start gap-2.5 text-sm text-gray-300"
                          >
                            <span className="material-symbols-rounded text-emerald-400 text-base mt-0.5 select-none">circle</span>
                            <span className="leading-relaxed">{tip}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    {/* Reset and Print Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-6 print:hidden">
                      <motion.button 
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} 
                        onClick={handlePrint}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-semibold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-rounded text-base">print</span>
                        Print / Download PDF Report
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.02, backgroundColor: "#374151" }} whileTap={{ scale: 0.98 }}
                        className="flex-1 bg-gray-800 text-white py-3 rounded-lg font-semibold transition-all cursor-pointer text-sm"
                        onClick={() => { setStatus('idle'); setFile(null); setJd(''); setScore(0); setAnalysisData(null); setError(null); }}
                      >
                        Analyze Another Resume
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResumeScanner;
