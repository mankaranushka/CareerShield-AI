import { useState, useEffect } from 'react';

const PROFILE_KEY = 'careershield_user_profile';
const ATS_KEY = 'careershield_latest_ats_report';
const RESUME_KEY = 'careershield_latest_resume_data';

/**
 * Custom hook to manage and share state of user profile, resume extraction, 
 * and ATS scoring. Uses localStorage and events for multi-component reactivity.
 */
export const useResumeStore = () => {
  const [profileData, setProfileData] = useState(() => {
    try {
      const saved = localStorage.getItem(PROFILE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [resumeData, setResumeData] = useState(() => {
    try {
      const saved = localStorage.getItem(RESUME_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [atsReport, setAtsReport] = useState(() => {
    try {
      const saved = localStorage.getItem(ATS_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [uploadState, setUploadState] = useState('idle'); // idle | uploading | validating | parsing | analyzing | done | error

  useEffect(() => {
    // Sync across tabs/windows
    const handleStorageChange = (e) => {
      if (e.key === PROFILE_KEY) {
        try {
          setProfileData(e.newValue ? JSON.parse(e.newValue) : {});
        } catch {}
      }
      if (e.key === RESUME_KEY) {
        try {
          setResumeData(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {}
      }
      if (e.key === ATS_KEY) {
        try {
          setAtsReport(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {}
      }
    };

    // Sync in the same tab via custom event
    const handleCustomUpdate = () => {
      try {
        const p = localStorage.getItem(PROFILE_KEY);
        const r = localStorage.getItem(RESUME_KEY);
        const a = localStorage.getItem(ATS_KEY);
        setProfileData(p ? JSON.parse(p) : {});
        setResumeData(r ? JSON.parse(r) : null);
        setAtsReport(a ? JSON.parse(a) : null);
      } catch {}
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('careershield_store_update', handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('careershield_store_update', handleCustomUpdate);
    };
  }, []);

  const triggerUpdate = () => {
    window.dispatchEvent(new Event('careershield_store_update'));
  };

  const updateProfile = (newProfile) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
    setProfileData(newProfile);
    triggerUpdate();
  };

  const updateResumeData = (newResume) => {
    localStorage.setItem(RESUME_KEY, JSON.stringify(newResume));
    setResumeData(newResume);
    triggerUpdate();
  };

  const updateAtsReport = (newReport) => {
    localStorage.setItem(ATS_KEY, JSON.stringify(newReport));
    setAtsReport(newReport);
    triggerUpdate();
  };

  /**
   * Merges extracted resume fields into the current profile (without overwriting user fields).
   */
  const syncProfile = (extracted) => {
    if (!extracted) return;
    const current = { ...profileData };

    const mergeField = (field, extractedVal) => {
      if (extractedVal && !current[field]) {
        current[field] = extractedVal;
      }
    };

    // Identity and links
    mergeField('firstName', extracted.first_name);
    mergeField('lastName', extracted.last_name);
    mergeField('email', extracted.email);
    mergeField('mobile', extracted.phone);
    mergeField('location', extracted.location);
    mergeField('linkedin', extracted.linkedin);
    mergeField('github', extracted.github);
    mergeField('portfolio', extracted.portfolio);
    mergeField('summary', extracted.summary);

    // Skills and languages
    const mergeArray = (field, extractedArr) => {
      if (!extractedArr || !Array.isArray(extractedArr)) return;
      if (!current[field]) current[field] = [];
      const lowerSet = new Set(current[field].map(s => s.toLowerCase().trim()));

      for (const item of extractedArr) {
        if (item && !lowerSet.has(item.toLowerCase().trim())) {
          current[field].push(item);
        }
      }
    };

    mergeArray('skills', extracted.skills);
    mergeArray('languages', extracted.languages);

    const normalizeStr = (s) => (s || '').toLowerCase().replace(/\s+/g, ' ').trim();

    // Education
    if (extracted.education && Array.isArray(extracted.education)) {
      if (!current.education) current.education = [];
      for (const edu of extracted.education) {
        const dup = current.education.some(
          e => normalizeStr(e.institution) === normalizeStr(edu.institution) &&
               normalizeStr(e.degree) === normalizeStr(edu.degree)
        );
        if (!dup) {
          current.education.push({ ...edu });
        }
      }
    }

    // Experience
    if (extracted.experience && Array.isArray(extracted.experience)) {
      if (!current.experience) current.experience = [];
      for (const exp of extracted.experience) {
        const dup = current.experience.some(
          e => normalizeStr(e.company) === normalizeStr(exp.company) &&
               normalizeStr(e.title) === normalizeStr(exp.title)
        );
        if (!dup) {
          current.experience.push({ ...exp });
        }
      }
    }

    // Projects
    if (extracted.projects && Array.isArray(extracted.projects)) {
      if (!current.projects) current.projects = [];
      for (const proj of extracted.projects) {
        const dup = current.projects.some(
          p => normalizeStr(p.name) === normalizeStr(proj.name)
        );
        if (!dup) {
          current.projects.push({ ...proj });
        }
      }
    }

    // Certifications
    if (extracted.certifications && Array.isArray(extracted.certifications)) {
      if (!current.certifications) current.certifications = [];
      for (const cert of extracted.certifications) {
        const dup = current.certifications.some(
          c => normalizeStr(c.name) === normalizeStr(cert.name)
        );
        if (!dup) {
          current.certifications.push({ ...cert });
        }
      }
    }

    updateProfile(current);
  };

  const clearStore = () => {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(RESUME_KEY);
    localStorage.removeItem(ATS_KEY);
    setProfileData({});
    setResumeData(null);
    setAtsReport(null);
    triggerUpdate();
  };

  return {
    profileData,
    resumeData,
    atsReport,
    uploadState,
    setUploadState,
    updateProfile,
    updateResumeData,
    updateAtsReport,
    syncProfile,
    clearStore,
  };
};
export default useResumeStore;
