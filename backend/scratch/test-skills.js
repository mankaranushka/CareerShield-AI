/**
 * test-skills.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Comprehensive tests for the upgraded ATS Skill Extraction & Validation Engine.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { validateSkill, extractJdSkills } = require('../services/skillValidator');
const { analyze } = require('../services/atsService');

console.log('=== STARTING UPGRADED ATS ENGINE VALIDATION TESTS ===\n');

let failedTests = 0;
let passedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
    failedTests++;
  }
}

// ─── TEST 1: STRICT REJECTION RULES (Step 3) ─────────────────────────────────
console.log('--- Test 1: Step 3 Rejection Rules ---');

const ignoredTerms = [
  // Company Info
  'Nike', 'Google', 'Microsoft', 'Amazon',
  // Locations
  'Bengaluru', 'Bangalore', 'India', 'USA', 'London', 'New York', 'Remote',
  // Section Headers
  'About Us', 'Who We Are', 'What You\'ll Do', 'What We Offer', 'Responsibilities', 'Benefits', 'Qualifications', 'About The Role',
  // Hiring Language
  'Hiring', 'Candidate', 'Candidates', 'Applicant', 'Applicants', 'Applications', 'Recruitment Drive',
  // Generic Adjectives
  'Passionate', 'Eager', 'Motivated', 'Self-Motivated', 'Dynamic', 'Dedicated', 'Enthusiastic',
  // Education Degrees
  'B.Tech', 'BCA', 'MCA', 'MBA', 'Bachelor Degree', 'Master Degree',
  // Generic Business Terms
  'Innovation', 'Technology', 'Product', 'Service', 'Services', 'Consumer Product', 'Global Technology', 'Organization', 'Business',
  // Generic Words
  'Learn', 'More', 'Board', 'Team', 'Work', 'Company', 'Department', 'Future', 'Growth'
];

for (const term of ignoredTerms) {
  const result = validateSkill(term);
  assert(result.valid === false, `"${term}" is correctly rejected (Reason: ${result.reason})`);
}

// ─── TEST 2: ALLOWED COMPETENCY CATEGORIES (Step 2) ──────────────────────────
console.log('\n--- Test 2: Step 2 Allowed Competency Categories ---');

const validCompetencies = [
  { term: 'React', cat: 'Technical' },
  { term: 'PostgreSQL', cat: 'Technical' },
  { term: 'Python', cat: 'Technical' },
  { term: 'Leadership', cat: 'Professional' },
  { term: 'Stakeholder Management', cat: 'Professional' },
  { term: 'Product Strategy', cat: 'Product' },
  { term: 'SEO', cat: 'Marketing' },
  { term: 'Talent Acquisition', cat: 'HR' },
  { term: 'Financial Modeling', cat: 'Finance' },
  { term: 'Lead Generation', cat: 'Sales' },
  { term: 'Jira', cat: 'Tools' },
  { term: 'Salesforce', cat: 'Tools' },
  { term: 'Figma', cat: 'Tools' },
  { term: 'PMP', cat: 'Certifications' },
  { term: 'FinTech', cat: 'Domain' },
  { term: 'SaaS', cat: 'Domain' }
];

for (const item of validCompetencies) {
  const result = validateSkill(item.term);
  assert(result.valid === true, `"${item.term}" is accepted as a valid ${item.cat} competency`);
}

// ─── TEST 3: JOB DESCRIPTION UNDERSTANDING (Step 1) ─────────────────────────
console.log('\n--- Test 3: Step 1 JD Understanding ---');

const mockJd = `
About Nike: Nike is a leading SaaS and FinTech organization. We are hiring a Senior Product Manager in Bengaluru.
What we expect / Responsibilities:
- Lead product strategy and roadmap planning.
- Run user research and product analytics.
- Collaborate with engineering and stakeholders.
Requirements:
- Required: 5+ years experience in FinTech or SaaS.
- B.Tech or MBA preferred.
- PMP certification is nice to have.
- Experience with Jira, Salesforce, and Figma.
`;

const mockResume = {
  summary: 'Passionate and motivated Product Manager with 3 years experience. Eager to work in FinTech.',
  skills: ['Product Strategy', 'roadmap planning', 'Jira', 'Figma', 'BCA', 'Bengaluru'], // B.Tech / BCA degrees & locations shouldn't sneak in as skills
  experience: [
    {
      title: 'Product Owner',
      company: 'Startup Ltd',
      description: 'Worked on product roadmaps and strategy.',
      bullets: ['Led a small agile team'],
      startDate: '2023',
      endDate: 'Present' // 3 years
    }
  ],
  education: [
    { degree: 'BCA', field: 'Computer Applications', institution: 'Local College' }
  ],
  projects: [],
  certifications: []
};

const report = analyze(mockResume, mockJd);

assert(report.job_understanding !== undefined, 'Job understanding block is extracted');
assert(report.job_understanding.jobTitle === 'Product Manager', `Extracted Job Title: ${report.job_understanding.jobTitle}`);
assert(report.job_understanding.seniorityLevel === 'Senior', `Extracted Seniority: ${report.job_understanding.seniorityLevel}`);
assert(report.job_understanding.department === 'Product', `Extracted Department: ${report.job_understanding.department}`);
assert(report.job_understanding.industry === 'FinTech', `Extracted Industry: ${report.job_understanding.industry}`);

// ─── TEST 4: GAP ANALYSES (Step 4, 5, 6) ─────────────────────────────────────
console.log('\n--- Test 4: Gap Analyses ---');

// Education Gap Analysis
assert(report.education_gaps.length > 0, 'Education gap was successfully detected');
assert(report.education_gaps[0].includes('Education Gap'), `Education Gap details: ${report.education_gaps[0]}`);

// Experience Gap Analysis
assert(report.experience_gaps.length > 0, 'Experience gap was successfully detected');
assert(report.experience_gaps[0].includes('Experience Gap'), `Experience Gap details: ${report.experience_gaps[0]}`);

// Domain Gap Analysis (JD mentions SaaS and FinTech; Resume mentions FinTech, missing SaaS)
assert(report.domain_gaps.length > 0, 'Domain gap (SaaS) was successfully detected');
assert(report.domain_gaps.includes('SaaS'), 'SaaS is flagged as a missing domain');

// ─── TEST 5: STRICT REQUIRED OUTPUT FORMAT ───────────────────────────────────
console.log('\n--- Test 5: Strict Required Output Format & Constraints ---');

const expectedKeys = [
  'matched_skills',
  'missing_skills',
  'matched_certifications',
  'missing_certifications',
  'education_gaps',
  'experience_gaps',
  'domain_gaps',
  'ats_score'
];

let allKeysExist = true;
for (const key of expectedKeys) {
  if (report[key] === undefined) {
    console.error(`[FAIL] Required output key "${key}" is missing from the report response!`);
    allKeysExist = false;
  }
}
assert(allKeysExist, 'All 8 required output keys exist in the report');
assert(typeof report.ats_score === 'number', 'ATS score is a valid number');

// Check that company names, locations, hiring language, generic adjectives, degrees, and section headers NEVER appear in matched/missing lists
const dirtyWordRegex = /\b(about|candidate|hiring|passionate|eager|b\.tech|bca|bengaluru|nike)\b/i;
let isClean = true;

const listsToCheck = [
  ...report.matched_skills,
  ...report.missing_skills,
  ...report.matched_certifications,
  ...report.missing_certifications
];

for (const skill of listsToCheck) {
  if (dirtyWordRegex.test(skill)) {
    console.error(`[FAIL] Forbidden word matched inside skills report: "${skill}"`);
    isClean = false;
  }
}
assert(isClean, 'No forbidden/ignored terms exist inside Matched or Missing Skills or Certifications');

console.log('\n=== TESTS SUMMARY ===');
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('\nAll upgraded ATS engine tests passed successfully!');
  process.exit(0);
}
