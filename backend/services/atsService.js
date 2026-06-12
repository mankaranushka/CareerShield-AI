/**
 * atsService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Calculates a transparent, deterministic ATS score (0-100) by comparing
 * a parsed resume against a job description.
 *
 * Weight breakdown:
 *   Skills Match         = 35%
 *   Experience Match     = 25%
 *   Keyword Match        = 20%
 *   Education Match      = 10%
 *   Certifications Match =  5%
 *   Resume Structure     =  5%
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Tokenise text into meaningful words (remove stop words) */
const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with','by',
  'from','is','are','was','were','be','been','being','have','has','had',
  'do','does','did','will','would','could','should','may','might','shall',
  'this','that','these','those','i','we','you','he','she','they','it',
  'our','your','their','its','my','his','her','we','us',
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP_WORDS.has(t));
}

/** Extract n-grams (1 and 2) from tokens */
function ngrams(tokens) {
  const result = new Set(tokens);
  for (let i = 0; i < tokens.length - 1; i++) {
    result.add(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return result;
}

/** Normalise skill name for comparison */
function normSkill(s) {
  return s.toLowerCase().replace(/[\s.\-_]/g, '');
}

// ─── Degree Level Detection ───────────────────────────────────────────────────

const DEGREE_LEVELS = {
  high_school: 1,
  associate:   2,
  bachelor:    3,
  master:      4,
  phd:         5,
};

function detectDegreeLevel(text) {
  const t = text.toLowerCase();
  if (/phd|ph\.?d|doctorate|doctor of/.test(t)) return 5;
  if (/master|m\.?sc|m\.?tech|m\.?s\.?|mba|m\.?eng/.test(t)) return 4;
  if (/bachelor|b\.?sc|b\.?tech|b\.?e\.?|b\.?a\.?|b\.?eng|undergraduate/.test(t)) return 3;
  if (/associate/.test(t)) return 2;
  if (/high school|secondary|12th|diploma/.test(t)) return 1;
  return 0;
}

// ─── Skills Matching (35 points) ─────────────────────────────────────────────

function scoreSkills(resumeSkills, jdText) {
  if (!resumeSkills || resumeSkills.length === 0) return { score: 0, matched: [], missing: [], jdSkills: [] };

  const jdTokens = tokenize(jdText);
  const jdNgrams = ngrams(jdTokens);

  // Extract skill-like terms from JD (capitalised words, known tech terms)
  const techPattern = /\b([A-Z][a-zA-Z+#.]*(?:\s[A-Z][a-zA-Z+#.]*)?)\b/g;
  const jdSkillCandidates = new Set();
  let m;
  while ((m = techPattern.exec(jdText)) !== null) {
    if (m[1].length > 2 && !STOP_WORDS.has(m[1].toLowerCase())) {
      jdSkillCandidates.add(m[1].trim());
    }
  }

  // Also add all words > 3 chars from JD as possible skill requirements
  tokenize(jdText).forEach(t => { if (t.length > 3) jdSkillCandidates.add(t); });

  const matched = [];
  const missing = [];
  const resumeNormSet = new Set(resumeSkills.map(normSkill));

  for (const jdSkill of jdSkillCandidates) {
    const n = normSkill(jdSkill);
    if (resumeNormSet.has(n) || jdNgrams.has(jdSkill.toLowerCase())) {
      // Check if resume skill matches this JD term
      const hit = resumeSkills.find(rs => normSkill(rs) === n || jdSkill.toLowerCase().includes(normSkill(rs)));
      if (hit && !matched.includes(hit)) matched.push(hit);
    }
  }

  // Skills in resume that appear in JD text directly
  for (const rs of resumeSkills) {
    const n = normSkill(rs);
    const inJd = jdNgrams.has(rs.toLowerCase()) || [...jdSkillCandidates].some(c => normSkill(c) === n);
    if (inJd && !matched.includes(rs)) matched.push(rs);
  }

  // Missing: JD skill candidates not in resume
  const missingCandidates = [...jdSkillCandidates]
    .filter(c => c.length > 2 && !resumeNormSet.has(normSkill(c)))
    .slice(0, 15);

  // Score: ratio of resume skills that match JD
  const ratio = resumeSkills.length > 0
    ? Math.min(matched.length / Math.max(resumeSkills.length, 1), 1)
    : 0;

  return {
    score: Math.round(ratio * 35),
    matched: matched.slice(0, 20),
    missing: missingCandidates.slice(0, 15),
    jdSkills: [...jdSkillCandidates].slice(0, 30),
  };
}

// ─── Experience Matching (25 points) ─────────────────────────────────────────

const YEAR_PATTERNS = [
  /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)/i,
  /minimum\s*(\d+)\s*years?/i,
  /at\s*least\s*(\d+)\s*years?/i,
];

function extractRequiredYears(jdText) {
  for (const p of YEAR_PATTERNS) {
    const m = jdText.match(p);
    if (m) return parseInt(m[1], 10);
  }
  return 0; // Not specified
}

function countResumeYears(experience) {
  if (!experience || experience.length === 0) return 0;
  let total = 0;
  for (const exp of experience) {
    const start = parseInt(exp.startDate);
    const end = exp.endDate?.toLowerCase().includes('present') || exp.endDate?.toLowerCase().includes('current')
      ? new Date().getFullYear()
      : parseInt(exp.endDate);
    if (!isNaN(start) && !isNaN(end) && end >= start) {
      total += end - start;
    }
  }
  return Math.min(total, 30);
}

function scoreExperience(experience, jdText) {
  const required = extractRequiredYears(jdText);
  const actual   = countResumeYears(experience);

  let score;
  if (required === 0) {
    // JD doesn't specify years — score based on having some experience
    score = experience && experience.length > 0 ? 20 : 10;
  } else {
    const ratio = Math.min(actual / required, 1);
    score = Math.round(ratio * 25);
  }

  const analysis = required > 0
    ? `Job requires ${required}+ years of experience. Your resume shows approximately ${actual} year(s).${actual >= required ? ' ✓ Meets requirement.' : ` ✗ Gap of ${required - actual} year(s).`}`
    : `No specific years of experience required. You have ${actual} year(s) of experience listed.`;

  return { score, actual, required, analysis };
}

// ─── Keyword Matching (20 points) ────────────────────────────────────────────

function scoreKeywords(resumeText, jdText) {
  // Build a full resume text blob
  const resumeTokens = tokenize(resumeText);
  const jdTokens     = tokenize(jdText);
  const resumeNgrams = ngrams(resumeTokens);
  const jdNgrams2    = ngrams(jdTokens);

  // Important JD keywords: words that appear ≥2 times in JD are "key"
  const jdFreq = {};
  jdTokens.forEach(t => { jdFreq[t] = (jdFreq[t] || 0) + 1; });
  const importantKeywords = Object.entries(jdFreq)
    .filter(([word, c]) => c >= 2 && !STOP_WORDS.has(word))
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w)
    .slice(0, 30);

  // Fix the filter (use proper variable name)
  const keyImportant = Object.entries(jdFreq)
    .filter(([word, c]) => c >= 1 && word.length > 3)
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w)
    .slice(0, 30);

  const matched = keyImportant.filter(k => resumeNgrams.has(k));
  const missing = keyImportant.filter(k => !resumeNgrams.has(k)).slice(0, 15);

  const ratio = keyImportant.length > 0
    ? matched.length / keyImportant.length
    : 0;

  return {
    score: Math.round(ratio * 20),
    matched: matched.slice(0, 20),
    missing: missing.slice(0, 15),
  };
}

// ─── Education Matching (10 points) ──────────────────────────────────────────

function scoreEducation(education, jdText) {
  const requiredLevel = detectDegreeLevel(jdText);
  const resumeLevel   = education && education.length > 0
    ? Math.max(...education.map(e => detectDegreeLevel((e.degree || '') + ' ' + (e.field || ''))))
    : 0;

  let score;
  let analysis;

  if (requiredLevel === 0) {
    score    = education && education.length > 0 ? 8 : 5;
    analysis = 'No specific degree requirement found in job description.';
  } else if (resumeLevel >= requiredLevel) {
    score    = 10;
    analysis = `Your education level meets or exceeds the required level. ✓`;
  } else if (resumeLevel > 0) {
    score    = Math.round((resumeLevel / requiredLevel) * 10);
    analysis = `Job may prefer a higher degree level. Consider highlighting relevant coursework or certifications.`;
  } else {
    score    = 3;
    analysis = `No matching education detected in resume. Consider adding your education details.`;
  }

  return { score, analysis, requiredLevel, resumeLevel };
}

// ─── Certifications Matching (5 points) ──────────────────────────────────────

const COMMON_CERTS = [
  'aws', 'azure', 'gcp', 'google cloud', 'pmp', 'cpa', 'cissp', 'ceh',
  'comptia', 'cisco', 'ccna', 'ccnp', 'scrum', 'safe', 'prince2',
  'oracle', 'salesforce', 'hubspot', 'tensorflow', 'pytorch',
];

function scoreCertifications(certifications, jdText) {
  const jdLower = jdText.toLowerCase();
  const resumeCertNames = (certifications || []).map(c => (c.name || '').toLowerCase());

  const matched = COMMON_CERTS.filter(cert =>
    jdLower.includes(cert) && resumeCertNames.some(rc => rc.includes(cert))
  );

  const missingFromJD = COMMON_CERTS.filter(cert =>
    jdLower.includes(cert) && !resumeCertNames.some(rc => rc.includes(cert))
  ).slice(0, 5);

  let score;
  if (matched.length > 0) score = 5;
  else if (certifications && certifications.length > 0) score = 3;
  else score = 1;

  const analysis = matched.length > 0
    ? `Matched ${matched.length} certification(s) from job description.`
    : certifications && certifications.length > 0
      ? 'You have certifications but none specifically mentioned in this job description.'
      : 'No certifications found. Adding relevant certifications can improve your score.';

  return { score, matched, missing: missingFromJD, analysis };
}

// ─── Resume Structure Score (5 points) ───────────────────────────────────────

function scoreStructure(extracted) {
  const sections = [
    extracted.summary,
    extracted.skills?.length > 0,
    extracted.experience?.length > 0,
    extracted.education?.length > 0,
    extracted.projects?.length > 0,
    extracted.certifications?.length > 0,
    extracted.email,
    extracted.phone,
    extracted.linkedin || extracted.github,
  ];

  const present = sections.filter(Boolean).length;
  const score = Math.round((present / sections.length) * 5);

  const missing = [];
  if (!extracted.summary)                  missing.push('Professional Summary');
  if (!extracted.skills?.length)           missing.push('Skills Section');
  if (!extracted.experience?.length)       missing.push('Work Experience');
  if (!extracted.education?.length)        missing.push('Education');
  if (!extracted.email)                    missing.push('Email Address');
  if (!extracted.phone)                    missing.push('Phone Number');
  if (!extracted.linkedin && !extracted.github) missing.push('LinkedIn/GitHub Profile');

  return { score, present, total: sections.length, missingSections: missing };
}

// ─── Grade & Match Level ──────────────────────────────────────────────────────

function getGrade(score) {
  if (score >= 90) return { grade: 'A+', matchLevel: 'Excellent Match' };
  if (score >= 80) return { grade: 'A',  matchLevel: 'Strong Match' };
  if (score >= 70) return { grade: 'B',  matchLevel: 'Good Match' };
  if (score >= 60) return { grade: 'C',  matchLevel: 'Moderate Match' };
  if (score >= 50) return { grade: 'D',  matchLevel: 'Weak Match' };
  return               { grade: 'F',  matchLevel: 'Poor Match' };
}

// ─── Strengths & Weaknesses ───────────────────────────────────────────────────

function deriveStrengths(skillsResult, expResult, kwResult, eduResult, certResult, structResult) {
  const strengths = [];
  if (skillsResult.score >= 28)        strengths.push('Strong technical skills alignment with job requirements');
  if (skillsResult.matched.length > 5) strengths.push(`${skillsResult.matched.length} relevant skills matched to job description`);
  if (expResult.score >= 20)           strengths.push('Experience level meets or exceeds job requirements');
  if (kwResult.score >= 16)            strengths.push('Strong keyword density matching the ATS requirements');
  if (eduResult.score >= 8)            strengths.push('Education background aligns with role requirements');
  if (certResult.matched.length > 0)   strengths.push(`Relevant certifications: ${certResult.matched.join(', ')}`);
  if (structResult.score >= 4)         strengths.push('Well-structured resume with all key sections present');
  return strengths.length > 0 ? strengths : ['Resume has foundational structure'];
}

function deriveWeaknesses(skillsResult, expResult, kwResult, eduResult, certResult, structResult) {
  const weaknesses = [];
  if (skillsResult.missing.length > 3) weaknesses.push(`Missing ${skillsResult.missing.length} skills mentioned in job description`);
  if (expResult.required > expResult.actual && expResult.required > 0) weaknesses.push(`Experience gap: need ${expResult.required} years, have ~${expResult.actual}`);
  if (kwResult.missing.length > 5)     weaknesses.push(`${kwResult.missing.length} important keywords from JD not found in resume`);
  if (eduResult.score < 7)             weaknesses.push('Education may not fully meet job requirements');
  if (certResult.missing.length > 0)   weaknesses.push(`Missing certifications: ${certResult.missing.join(', ')}`);
  if (structResult.missingSections.length > 0) weaknesses.push(`Missing resume sections: ${structResult.missingSections.join(', ')}`);
  return weaknesses;
}

// ─── Recommendations ──────────────────────────────────────────────────────────

function buildRecommendations(skillsResult, kwResult, expResult, structResult, atsScore) {
  const recs = [];

  if (skillsResult.missing.length > 0) {
    recs.push(`Add missing skills to your Skills section: ${skillsResult.missing.slice(0, 5).join(', ')}`);
  }
  if (kwResult.missing.length > 0) {
    recs.push(`Incorporate these missing keywords naturally into your experience bullets: ${kwResult.missing.slice(0, 5).join(', ')}`);
  }
  if (!structResult.missingSections.includes('Professional Summary') === false) {
    recs.push('Add a tailored Professional Summary that mirrors the job description language');
  }
  if (structResult.missingSections.includes('LinkedIn/GitHub Profile')) {
    recs.push('Add your LinkedIn and/or GitHub profile URL to increase credibility');
  }
  recs.push('Quantify achievements with metrics: "Increased X by Y%" instead of generic descriptions');
  recs.push('Use the exact job title from the posting in your resume header or summary');
  recs.push('Ensure ATS-friendly formatting: no tables, graphics, or multi-column layouts');
  if (atsScore < 70) {
    recs.push('Tailor this resume specifically for this role — generic resumes score 20-30% lower');
    recs.push('Mirror the exact phrasing from the job description in your bullet points');
  }

  return recs.slice(0, 8);
}

// ─── Main Analyze Function ────────────────────────────────────────────────────

/**
 * analyze(extracted, jobDescription) → full ATS report object
 *
 * @param {Object} extracted - output from resumeParserService.parse().extracted
 * @param {string} jobDescription - raw job description text
 * @returns {Object} complete ATS report
 */
function analyze(extracted, jobDescription) {
  if (!extracted || !jobDescription) {
    throw new Error('Both extracted resume data and job description are required.');
  }

  // Build a full resume text blob for keyword matching
  const resumeTextBlob = [
    extracted.summary || '',
    (extracted.skills || []).join(' '),
    (extracted.experience || []).map(e => `${e.title} ${e.company} ${e.description} ${(e.bullets || []).join(' ')}`).join(' '),
    (extracted.education || []).map(e => `${e.degree} ${e.field} ${e.institution}`).join(' '),
    (extracted.projects || []).map(p => `${p.name} ${p.description}`).join(' '),
    (extracted.certifications || []).map(c => c.name).join(' '),
  ].join(' ');

  // ── Individual component scores ──
  const skillsResult = scoreSkills(extracted.skills || [], jobDescription);
  const expResult    = scoreExperience(extracted.experience || [], jobDescription);
  const kwResult     = scoreKeywords(resumeTextBlob, jobDescription);
  const eduResult    = scoreEducation(extracted.education || [], jobDescription);
  const certResult   = scoreCertifications(extracted.certifications || [], jobDescription);
  const structResult = scoreStructure(extracted);

  // ── Total score ──
  const rawScore = skillsResult.score + expResult.score + kwResult.score +
                   eduResult.score + certResult.score + structResult.score;
  const atsScore = Math.min(100, Math.max(0, rawScore));

  const { grade, matchLevel } = getGrade(atsScore);

  // ── Categories for UI bar chart ──
  const categories = [
    { name: 'Skills Match',         pct: Math.round((skillsResult.score / 35) * 100), weight: '35%', raw: skillsResult.score, max: 35 },
    { name: 'Experience Match',     pct: Math.round((expResult.score / 25) * 100),    weight: '25%', raw: expResult.score,    max: 25 },
    { name: 'Keyword Match',        pct: Math.round((kwResult.score / 20) * 100),     weight: '20%', raw: kwResult.score,     max: 20 },
    { name: 'Education Match',      pct: Math.round((eduResult.score / 10) * 100),    weight: '10%', raw: eduResult.score,    max: 10 },
    { name: 'Certifications Match', pct: Math.round((certResult.score / 5) * 100),    weight: '5%',  raw: certResult.score,  max: 5  },
    { name: 'Resume Structure',     pct: Math.round((structResult.score / 5) * 100),  weight: '5%',  raw: structResult.score, max: 5 },
  ];

  const strengths    = deriveStrengths(skillsResult, expResult, kwResult, eduResult, certResult, structResult);
  const weaknesses   = deriveWeaknesses(skillsResult, expResult, kwResult, eduResult, certResult, structResult);
  const recommendations = buildRecommendations(skillsResult, kwResult, expResult, structResult, atsScore);

  return {
    // ── Top-level summary ──
    ats_score:  atsScore,
    grade,
    match_level: matchLevel,

    // ── Score breakdown ──
    score_breakdown: {
      skills_match:         skillsResult.score,
      experience_match:     expResult.score,
      keyword_match:        kwResult.score,
      education_match:      eduResult.score,
      certifications_match: certResult.score,
      structure_score:      structResult.score,
    },

    // ── Report data ──
    matched_skills:       skillsResult.matched,
    missing_skills:       skillsResult.missing,
    matched_keywords:     kwResult.matched,
    missing_keywords:     kwResult.missing,
    experience_analysis:  expResult.analysis,
    education_analysis:   eduResult.analysis,
    certification_analysis: certResult.analysis,
    strengths,
    weaknesses,
    recommendations,

    // ── UI data ──
    categories,

    // ── Verdict (legacy field for UI compatibility) ──
    verdict:      matchLevel,
    verdictClass: grade.toLowerCase().replace('+', '-plus'),

    // ── Legacy missing keywords (for UI compatibility) ──
    missing: [...new Set([...skillsResult.missing, ...kwResult.missing])].slice(0, 10),
    tips:    recommendations,
  };
}

module.exports = { analyze };
