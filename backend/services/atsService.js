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
 *
 * Skill Extraction Rules (applied to JD content before ATS scoring):
 *   Category 1 - Technical Skills      → ALLOWED
 *   Category 2 - Professional Skills   → ALLOWED
 *   Category 3 - Company Information   → IGNORED
 *   Category 4 - JD Section Headings   → IGNORED
 *   Category 5 - Locations             → IGNORED
 *   Category 6 - Generic Business Terms→ IGNORED
 * ─────────────────────────────────────────────────────────────────────────────
 */

const {
  extractJdSkills,
  filterAndNormalizeSkills,
  normForCompare,
  validateSkill,
  DOMAIN_EXPERTISE,
} = require('./skillValidator');

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

/**
 * Score skills by:
 *   1. Extract real skills from JD using skillValidator (filters company names,
 *      section headings, locations, generic terms).
 *   2. Normalize resume skills.
 *   3. Match and find missing skills — only actual skills appear in either list.
 */
function scoreSkills(resumeSkills, jdText) {
  if (!resumeSkills || resumeSkills.length === 0) {
    return { score: 0, matched: [], missing: [], jdSkills: [] };
  }

  // ── Extract validated JD skills (Passes through all 6-category filters) ──
  const jdSkills = extractJdSkills(jdText);

  // ── Normalize resume skills through the same validator ──
  const normalizedResumeSkills = filterAndNormalizeSkills(resumeSkills);

  // ── Build lookup sets for fast comparison ──
  const resumeNormSet = new Set(normalizedResumeSkills.map(normForCompare));
  const jdNormSet     = new Set(jdSkills.map(normForCompare));

  // ── Find matched skills: resume skills that appear in JD ──
  const matched = normalizedResumeSkills.filter(rs => jdNormSet.has(normForCompare(rs)));

  // ── Find missing skills: JD skills not in resume ──
  const missing = jdSkills
    .filter(js => !resumeNormSet.has(normForCompare(js)))
    .slice(0, 15);

  // ── Score: ratio of resume skills that match JD ──
  const ratio = normalizedResumeSkills.length > 0
    ? Math.min(matched.length / Math.max(jdSkills.length, 1), 1)
    : 0;

  return {
    score:    Math.round(ratio * 35),
    matched:  matched.slice(0, 20),
    missing,
    jdSkills: jdSkills.slice(0, 30),
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

/**
 * Score keyword overlap between resume text and JD.
 * Keywords are extracted from JD, then each is passed through validateSkill
 * to ensure only actual competencies are counted — not generic business terms,
 * company names, locations, or section headings.
 */
function scoreKeywords(resumeText, jdText) {
  const resumeTokens = tokenize(resumeText);
  const jdTokens     = tokenize(jdText);
  const resumeNgrams = ngrams(resumeTokens);

  // Build frequency map of JD tokens
  const jdFreq = {};
  jdTokens.forEach(t => { jdFreq[t] = (jdFreq[t] || 0) + 1; });

  // Extract candidate keywords (words with freq >= 1, length > 3)
  const candidateKeywords = Object.entries(jdFreq)
    .filter(([word, c]) => c >= 1 && word.length > 3)
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w)
    .slice(0, 50);

  // ── Filter candidates through skill validator ──
  // Only keep tokens that are actual skills/competencies
  const validatedKeywords = candidateKeywords.filter(kw => {
    const { valid } = validateSkill(kw);
    return valid;
  });

  const matched = validatedKeywords.filter(k => resumeNgrams.has(k));
  const missing = validatedKeywords.filter(k => !resumeNgrams.has(k)).slice(0, 15);

  const ratio = validatedKeywords.length > 0
    ? matched.length / validatedKeywords.length
    : 0;

  return {
    score:   Math.round(ratio * 20),
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
  const gaps = [];

  if (requiredLevel === 0) {
    score    = education && education.length > 0 ? 8 : 5;
    analysis = 'No specific degree requirement found in job description.';
  } else if (resumeLevel >= requiredLevel) {
    score    = 10;
    analysis = `Your education level meets or exceeds the required level. ✓`;
  } else if (resumeLevel > 0) {
    score    = Math.round((resumeLevel / requiredLevel) * 10);
    analysis = `Job may prefer a higher degree level. Consider highlighting relevant coursework or certifications.`;
    const reqName = Object.keys(DEGREE_LEVELS).find(k => DEGREE_LEVELS[k] === requiredLevel) || 'higher degree';
    const hasName = Object.keys(DEGREE_LEVELS).find(k => DEGREE_LEVELS[k] === resumeLevel) || 'degree';
    gaps.push(`Education Gap: Required degree level is '${reqName}', but resume shows '${hasName}'.`);
  } else {
    score    = 3;
    analysis = `No matching education detected in resume. Consider adding your education details.`;
    const reqName = Object.keys(DEGREE_LEVELS).find(k => DEGREE_LEVELS[k] === requiredLevel) || 'degree';
    gaps.push(`Education Gap: Missing required '${reqName}' education in resume.`);
  }

  return { score, analysis, requiredLevel, resumeLevel, gaps };
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
 * Identify Job Title, Seniority Level, Department, Industry, and Role Type from JD.
 */
function understandJd(jdText) {
  if (!jdText) {
    return {
      jobTitle: 'Unknown',
      seniorityLevel: 'Mid-level',
      department: 'Engineering',
      industry: 'Tech',
      roleType: 'Full-time'
    };
  }

  const lower = jdText.toLowerCase();

  // 1. Job Title
  const titles = [
    'software engineer', 'product manager', 'marketing manager', 'hr manager',
    'finance analyst', 'sales manager', 'business analyst', 'operations manager',
    'consultant', 'designer', 'developer'
  ];
  let jobTitle = 'Software Engineer'; // sensible default
  for (const t of titles) {
    if (lower.includes(t)) {
      jobTitle = t.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      break;
    }
  }

  // 2. Seniority Level
  let seniorityLevel = 'Mid-level';
  if (/\b(senior|sr|lead|principal|staff|director|manager)\b/i.test(lower)) {
    seniorityLevel = 'Senior';
  } else if (/\b(junior|jr|entry|associate|intern)\b/i.test(lower)) {
    seniorityLevel = 'Junior';
  }

  // 3. Department
  let department = 'Engineering';
  if (lower.includes('product')) department = 'Product';
  else if (lower.includes('marketing')) department = 'Marketing';
  else if (lower.includes('sales')) department = 'Sales';
  else if (lower.includes('hr') || lower.includes('human resources')) department = 'HR';
  else if (lower.includes('finance') || lower.includes('accounting')) department = 'Finance';
  else if (lower.includes('operations')) department = 'Operations';

  // 4. Industry
  let industry = 'Tech';
  if (lower.includes('fintech')) industry = 'FinTech';
  else if (lower.includes('healthcare')) industry = 'Healthcare';
  else if (lower.includes('saas')) industry = 'SaaS';
  else if (lower.includes('e-commerce') || lower.includes('ecommerce')) industry = 'E-Commerce';
  else if (lower.includes('cybersecurity')) industry = 'Cybersecurity';

  // 5. Role Type
  let roleType = 'Full-time';
  if (lower.includes('part-time') || lower.includes('part time')) roleType = 'Part-time';
  else if (lower.includes('contract') || lower.includes('contractor')) roleType = 'Contract';
  else if (lower.includes('internship') || lower.includes('intern')) roleType = 'Internship';

  return { jobTitle, seniorityLevel, department, industry, roleType };
}

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

  // ── Step 1: Job Description Understanding ──
  const jdUnderstanding = understandJd(jobDescription);

  // ── Step 4: Education analysis gaps ──
  const education_gaps = eduResult.gaps || [];

  // ── Step 5: Experience analysis gaps ──
  const experience_gaps = [];
  const requiredExp = extractRequiredYears(jobDescription);
  const actualExp   = countResumeYears(extracted.experience || []);
  if (requiredExp > actualExp) {
    experience_gaps.push(`Experience Gap: Required ${requiredExp}+ years of experience, but resume shows ~${actualExp} years.`);
  }

  // ── Step 6: Domain gaps ──
  const jdDomains = skillsResult.jdSkills.filter(js => DOMAIN_EXPERTISE.has(js.toLowerCase()));
  const resumeDomains = filterAndNormalizeSkills(extracted.skills || []).filter(rs => DOMAIN_EXPERTISE.has(rs.toLowerCase()));
  const domain_gaps = jdDomains
    .filter(d => !resumeDomains.map(normForCompare).includes(normForCompare(d)))
    .map(d => {
      const { normalized } = validateSkill(d);
      return normalized || d;
    });

  // ── Certifications mapping ──
  const matched_certifications = (certResult.matched || []).map(c => {
    const { normalized } = validateSkill(c);
    return normalized || c;
  });
  const missing_certifications = (certResult.missing || []).map(c => {
    const { normalized } = validateSkill(c);
    return normalized || c;
  });

  return {
    // ── REQUIRED OUTPUT FORMAT ──
    matched_skills:       skillsResult.matched,
    missing_skills:       skillsResult.missing,
    matched_certifications,
    missing_certifications,
    education_gaps,
    experience_gaps,
    domain_gaps,
    ats_score:            atsScore,

    // ── Legacy / UI compatibility fields ──
    grade,
    match_level: matchLevel,
    score_breakdown: {
      skills_match:         skillsResult.score,
      experience_match:     expResult.score,
      keyword_match:        kwResult.score,
      education_match:      eduResult.score,
      certifications_match: certResult.score,
      structure_score:      structResult.score,
    },
    matched_keywords:     kwResult.matched,
    missing_keywords:     kwResult.missing,
    experience_analysis:  expResult.analysis,
    education_analysis:   eduResult.analysis,
    certification_analysis: certResult.analysis,
    strengths,
    weaknesses,
    recommendations,
    categories,
    verdict:      matchLevel,
    verdictClass: grade.toLowerCase().replace('+', '-plus'),
    missing: [...new Set([...skillsResult.missing, ...kwResult.missing])].slice(0, 10),
    tips:    recommendations,
    job_understanding: jdUnderstanding,
  };
}

module.exports = { analyze };
