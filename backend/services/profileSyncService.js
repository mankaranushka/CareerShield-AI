const UserProfile = require('../models/UserProfile');

/**
 * Normalizes a string for robust matching (lowercase, trimmed, collapsed whitespace)
 */
function normalize(str) {
  return (str || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Compares and merges extracted resume data into an existing UserProfile.
 * Only updates fields if they are currently empty/falsy in the DB and non-empty in extracted data.
 * Merges arrays (skills, languages, education, experience, projects, certifications)
 * without deleting existing entries.
 * 
 * @param {string} userId - The unique user profile ID
 * @param {object} extracted - The parsed resume object
 * @returns {Promise<{ profile: object, diff: object }>} The updated profile and a diff object
 */
async function syncProfile(userId, extracted) {
  if (!userId) {
    throw new Error('userId is required for profile synchronization');
  }

  // Find or create profile
  let profile = await UserProfile.findOne({ userId });
  if (!profile) {
    profile = new UserProfile({ userId });
  }

  const diff = {};
  const previousVersion = profile.resumeVersion || 0;

  // Helper to sync simple text fields
  const syncTextField = (dbField, extractedVal) => {
    const currentVal = profile[dbField];
    if (extractedVal && !currentVal) {
      profile[dbField] = extractedVal;
      diff[dbField] = { from: currentVal || '', to: extractedVal };
    }
  };

  // Sync basic identity and contact details (only if DB field is empty/falsy)
  if (extracted.first_name) syncTextField('firstName', extracted.first_name);
  if (extracted.last_name) syncTextField('lastName', extracted.last_name);
  if (extracted.email) syncTextField('email', extracted.email);
  if (extracted.phone) syncTextField('mobile', extracted.phone);
  if (extracted.location) syncTextField('location', extracted.location);
  if (extracted.linkedin) syncTextField('linkedin', extracted.linkedin);
  if (extracted.github) syncTextField('github', extracted.github);
  if (extracted.portfolio) syncTextField('portfolio', extracted.portfolio);
  if (extracted.summary) syncTextField('summary', extracted.summary);

  // Sync / Merge simple arrays (case-insensitive deduplication)
  const syncStringArray = (dbField, extractedArr) => {
    if (!extractedArr || !Array.isArray(extractedArr)) return;
    const existingSet = new Set(profile[dbField].map(item => normalize(item)));
    const added = [];

    for (const item of extractedArr) {
      if (item && !existingSet.has(normalize(item))) {
        profile[dbField].push(item);
        added.push(item);
      }
    }

    if (added.length > 0) {
      diff[dbField] = { added };
    }
  };

  syncStringArray('skills', extracted.skills);
  syncStringArray('languages', extracted.languages);

  // Sync / Merge complex object arrays
  
  // Education merge
  if (extracted.education && Array.isArray(extracted.education)) {
    const addedEdu = [];
    for (const edu of extracted.education) {
      if (!edu.institution) continue;
      const isDuplicate = profile.education.some(
        existing => normalize(existing.institution) === normalize(edu.institution) &&
                    normalize(existing.degree) === normalize(edu.degree)
      );
      if (!isDuplicate) {
        profile.education.push({
          institution: edu.institution,
          degree: edu.degree || '',
          field: edu.field || '',
          startDate: edu.startDate || '',
          endDate: edu.endDate || '',
          gpa: edu.gpa || '',
        });
        addedEdu.push(edu);
      }
    }
    if (addedEdu.length > 0) {
      diff.education = { added: addedEdu };
    }
  }

  // Experience merge
  if (extracted.experience && Array.isArray(extracted.experience)) {
    const addedExp = [];
    for (const exp of extracted.experience) {
      if (!exp.company) continue;
      const isDuplicate = profile.experience.some(
        existing => normalize(existing.company) === normalize(exp.company) &&
                    normalize(existing.title) === normalize(exp.title)
      );
      if (!isDuplicate) {
        profile.experience.push({
          company: exp.company,
          title: exp.title || '',
          location: exp.location || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          description: exp.description || '',
          bullets: exp.bullets || [],
        });
        addedExp.push(exp);
      }
    }
    if (addedExp.length > 0) {
      diff.experience = { added: addedExp };
    }
  }

  // Projects merge
  if (extracted.projects && Array.isArray(extracted.projects)) {
    const addedProj = [];
    for (const proj of extracted.projects) {
      if (!proj.name) continue;
      const isDuplicate = profile.projects.some(
        existing => normalize(existing.name) === normalize(proj.name)
      );
      if (!isDuplicate) {
        profile.projects.push({
          name: proj.name,
          description: proj.description || '',
          tech: proj.tech || [],
          url: proj.url || '',
        });
        addedProj.push(proj);
      }
    }
    if (addedProj.length > 0) {
      diff.projects = { added: addedProj };
    }
  }

  // Certifications merge
  if (extracted.certifications && Array.isArray(extracted.certifications)) {
    const addedCert = [];
    for (const cert of extracted.certifications) {
      if (!cert.name) continue;
      const isDuplicate = profile.certifications.some(
        existing => normalize(existing.name) === normalize(cert.name)
      );
      if (!isDuplicate) {
        profile.certifications.push({
          name: cert.name,
          issuer: cert.issuer || '',
          date: cert.date || '',
          url: cert.url || '',
        });
        addedCert.push(cert);
      }
    }
    if (addedCert.length > 0) {
      diff.certifications = { added: addedCert };
    }
  }

  // If there are any changes (diff is not empty) or it's a new profile
  const hasChanges = Object.keys(diff).length > 0;
  if (hasChanges || profile.isNew) {
    profile.resumeVersion = previousVersion + 1;
    profile.lastResumeUploadAt = new Date();
    await profile.save();
    diff.resumeVersion = { from: previousVersion, to: profile.resumeVersion };
    diff.lastResumeUploadAt = { to: profile.lastResumeUploadAt };
  }

  return { profile, diff };
}

module.exports = { syncProfile };
