/**
 * resumeParserService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Responsible for:
 *   1. Extracting raw text from PDF / DOCX / TXT file buffers
 *   2. Validating whether the document is a genuine resume/CV
 *   3. Parsing structured fields from the raw text
 *
 * No external APIs. Pure Node.js NLP: regex + section detection + heuristics.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { PDFParse } = require('pdf-parse');
const mammoth  = require('mammoth');
const { filterAndNormalizeSkills } = require('./skillValidator');

// ─── Text Extraction ──────────────────────────────────────────────────────────

/**
 * extractText(file) → Promise<string>
 * Accepts a multer file object (has .buffer for memoryStorage or .path for diskStorage).
 */
async function extractText(file) {
  const ext = (file.originalname || '').split('.').pop().toLowerCase();

  let buffer;
  if (file.buffer) {
    buffer = file.buffer;
  } else if (file.path) {
    const fs = require('fs');
    buffer = fs.readFileSync(file.path);
  } else {
    throw new Error('Cannot read file: no buffer or path available.');
  }

  if (ext === 'pdf') {
    try {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      return result.text || '';
    } catch (e) {
      throw new Error(`PDF parsing failed: ${e.message}`);
    }
  }

  if (ext === 'docx' || ext === 'doc') {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || '';
    } catch (e) {
      throw new Error(`DOCX parsing failed: ${e.message}`);
    }
  }

  if (ext === 'txt') {
    return buffer.toString('utf-8');
  }

  throw new Error(`Unsupported file type: .${ext}`);
}

// ─── Resume Validation ────────────────────────────────────────────────────────

const RESUME_INDICATORS = [
  { name: 'email',      pattern: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/i,     weight: 2 },
  { name: 'phone',      pattern: /(\+?\d[\d\s\-().]{7,15}\d)/,                               weight: 2 },
  { name: 'experience', pattern: /\b(work\s*experience|professional\s*experience|employment|experience|work\s*history|career\s*history|employment\s*history)\b/i, weight: 2 },
  { name: 'education',  pattern: /\b(education|academic|university|college|bachelor|master|degree|diploma|b\.?tech|m\.?tech|b\.?sc|m\.?sc|b\.?e|mba|phd|studies|qualifications)\b/i, weight: 2 },
  { name: 'skills',     pattern: /\b(skills|technical\s*skills|core\s*competencies|competencies|technologies|tools|expertise|tech\s*stack)\b/i, weight: 2 },
  { name: 'summary',    pattern: /\b(summary|objective|profile|about\s*me|career\s*objective|professional\s*summary|overview)\b/i, weight: 1 },
  { name: 'projects',   pattern: /\b(projects?|personal\s*projects?|academic\s*projects?)\b/i, weight: 1 },
  { name: 'certifications', pattern: /\b(certifications?|certificates?|certified|accreditations?)\b/i, weight: 1 },
  { name: 'cv_resume',  pattern: /\b(resume|cv|curriculum\s*vitae)\b/i,                       weight: 1 },
  { name: 'linkedin',   pattern: /linkedin\.com\/in\//i,                                     weight: 1 },
  { name: 'github',     pattern: /github\.com\//i,                                           weight: 1 },
];

const RESUME_VALIDATION_THRESHOLD = 3; // min weighted score to be considered a resume (lenient to avoid false negatives)

/**
 * validateResume(text) → { isResume, confidence, indicators, score }
 */
function validateResume(text) {
  if (!text || text.trim().length < 50) {
    return { isResume: false, confidence: 0, indicators: [], score: 0 };
  }

  let score = 0;
  const foundIndicators = [];

  for (const indicator of RESUME_INDICATORS) {
    if (indicator.pattern.test(text)) {
      score += indicator.weight;
      foundIndicators.push(indicator.name);
    }
  }

  const maxScore = RESUME_INDICATORS.reduce((sum, i) => sum + i.weight, 0);
  const confidence = Math.round((score / maxScore) * 100);
  const isResume = score >= RESUME_VALIDATION_THRESHOLD;

  return { isResume, confidence, indicators: foundIndicators, score };
}

// ─── Field Extraction Helpers ─────────────────────────────────────────────────

function extractEmail(text) {
  const match = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  return match ? match[0].toLowerCase().trim() : '';
}

function extractPhone(text) {
  // Match common phone formats: +91 98765-43210, (123) 456-7890, etc.
  const match = text.match(/(\+?\d[\d\s\-().]{7,15}\d)/);
  if (!match) return '';
  return match[0].replace(/\s+/g, ' ').trim();
}

function extractName(text) {
  // Strategy: first non-empty line that looks like a human name (2-4 words, title case)
  const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 10)) {
    // Skip lines that are clearly not names
    if (line.length > 60) continue;
    if (/@|http|www|\d{3,}|resume|cv\b/i.test(line)) continue;
    // Must be 2-4 words, mostly letters
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4) {
      if (words.every(w => /^[A-Za-z.\-']{2,}$/.test(w))) {
        return line;
      }
    }
  }
  return '';
}

function extractLocation(text) {
  // Look for city, state/country patterns
  const patterns = [
    /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*([A-Z]{2}|[A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/,
    /(?:location|address|city)[:\s]+([^\n,]+)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return (m[1] + (m[2] ? ', ' + m[2] : '')).trim();
  }
  return '';
}

function extractLinkedIn(text) {
  const m = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9\-_%]+)/i);
  return m ? `https://linkedin.com/in/${m[1]}` : '';
}

function extractGitHub(text) {
  const m = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9\-_]+)/i);
  return m ? `https://github.com/${m[1]}` : '';
}

function extractPortfolio(text) {
  // Match URLs that are NOT linkedin/github
  const m = text.match(/https?:\/\/(?!(?:www\.)?(?:linkedin|github)\.com)[^\s,<>"']+/i);
  return m ? m[0].trim() : '';
}

/**
 * extractSection(text, sectionNames) → section text or ''
 * Extracts text between a section header and the next section header.
 */
function extractSection(text, sectionNames) {
  const allSectionHeaders = [
    'experience', 'work experience', 'professional experience', 'employment',
    'education', 'academic background',
    'skills', 'technical skills', 'core competencies', 'technologies',
    'projects', 'personal projects', 'academic projects',
    'certifications', 'certificates',
    'summary', 'objective', 'profile', 'about', 'professional summary',
    'languages', 'publications', 'awards', 'achievements', 'interests', 'hobbies',
    'references', 'volunteer', 'extracurricular',
  ];

  // Build pattern for target section
  const sectionPattern = new RegExp(
    `^\\s*(${sectionNames.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\s*[:\\-]?\\s*$`,
    'im'
  );

  const match = sectionPattern.exec(text);
  if (!match) return '';

  const start = match.index + match[0].length;

  // Find next section header
  const otherSections = allSectionHeaders.filter(
    s => !sectionNames.some(n => n.toLowerCase() === s.toLowerCase())
  );
  const nextSectionPattern = new RegExp(
    `^\\s*(${otherSections.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\s*[:\\-]?\\s*$`,
    'im'
  );

  const rest = text.slice(start);
  const nextMatch = nextSectionPattern.exec(rest);
  const end = nextMatch ? nextMatch.index : rest.length;

  return rest.slice(0, end).trim();
}

/**
 * extractSkills(text) → string[]
 * Extracts skills from the skills section, then supplements with common tech keyword detection.
 */
const COMMON_TECH_SKILLS = [
  // Languages
  'JavaScript','TypeScript','Python','Java','C++','C#','C','Ruby','Go','Rust','Swift','Kotlin','PHP','Scala','R','MATLAB',
  // Web
  'HTML','CSS','React','Vue','Angular','Next.js','Nuxt.js','Svelte','Node.js','Express','Django','Flask','FastAPI','Spring','Laravel','Rails',
  // Data
  'SQL','MySQL','PostgreSQL','MongoDB','Redis','Elasticsearch','Cassandra','DynamoDB','SQLite',
  // Cloud / DevOps
  'AWS','Azure','GCP','Docker','Kubernetes','Terraform','Jenkins','GitHub Actions','CI/CD','Linux','Bash','Git',
  // AI/ML
  'Machine Learning','Deep Learning','TensorFlow','PyTorch','scikit-learn','NLP','Computer Vision','Pandas','NumPy','Keras',
  // Other
  'REST API','GraphQL','Microservices','Agile','Scrum','Jira','Figma','Tableau','Power BI','Excel',
  'React Native','Flutter','iOS','Android','Unity',
];

function extractSkills(text) {
  const skillsText = extractSection(text, [
    'skills', 'technical skills', 'core competencies', 'technologies', 'tools', 'tech stack',
  ]);

  const rawFound = new Set();

  // Parse from skills section: split by commas, pipes, bullets, newlines
  if (skillsText) {
    const tokens = skillsText.split(/[,|\n•\-·▪▸►✓✔◦‣⁃]+/).map(t => t.trim()).filter(t => t.length > 0 && t.length < 50);
    for (const token of tokens) {
      if (!/^\d+$/.test(token) && token.length > 1) {
        rawFound.add(normalizeSkill(token));
      }
    }
  }

  // Also scan full text for known tech keywords (case-insensitive)
  for (const skill of COMMON_TECH_SKILLS) {
    const pattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (pattern.test(text)) {
      rawFound.add(skill); // Use canonical casing
    }
  }

  // ── Filter through skill validator to remove junk, normalize, and deduplicate ──
  const validated = filterAndNormalizeSkills([...rawFound].filter(s => s && s.length > 0));

  return validated.slice(0, 40); // Cap at 40 skills
}

function normalizeSkill(skill) {
  // Map lowercase variations to canonical names
  const canonical = {
    'js': 'JavaScript', 'ts': 'TypeScript', 'py': 'Python',
    'node': 'Node.js', 'nodejs': 'Node.js', 'reactjs': 'React',
    'react.js': 'React', 'vue.js': 'Vue', 'next.js': 'Next.js',
    'postgres': 'PostgreSQL', 'mongo': 'MongoDB', 'k8s': 'Kubernetes',
  };
  return canonical[skill.toLowerCase()] || skill;
}

/**
 * extractEducation(text) → education[]
 */
function extractEducation(text) {
  const section = extractSection(text, ['education', 'academic background', 'academic qualifications']);
  if (!section) return [];

  const entries = [];
  const lines = section.split('\n').map(l => l.trim()).filter(Boolean);

  // Group lines into blocks (blank line separates entries)
  const blocks = [];
  let current = [];
  for (const line of lines) {
    if (line === '') {
      if (current.length) { blocks.push(current); current = []; }
    } else {
      current.push(line);
    }
  }
  if (current.length) blocks.push(current);

  for (const block of blocks) {
    if (!block.length) continue;
    const blockText = block.join(' ');

    const degreePatterns = [
      /\b(bachelor(?:\'s)?|b\.?tech|b\.?e\.?|b\.?sc|b\.?a\.?|b\.?com|b\.?eng)\b/i,
      /\b(master(?:\'s)?|m\.?tech|m\.?sc|m\.?a\.?|m\.?s\.?|mba|m\.?eng)\b/i,
      /\b(phd|ph\.?d\.?|doctorate|doctor of philosophy)\b/i,
      /\b(diploma|associate|high school|secondary|12th|10th)\b/i,
    ];

    let degree = '';
    for (const p of degreePatterns) {
      const m = blockText.match(p);
      if (m) { degree = m[0]; break; }
    }

    // Date range
    const dateMatch = blockText.match(/(\b\d{4}\b)\s*[-–to]+\s*(\b\d{4}\b|present|current)/i);

    // GPA
    const gpaMatch = blockText.match(/(?:gpa|cgpa|grade)[:\s]*(\d+\.?\d*\/?\d*)/i);

    entries.push({
      institution: block[0] || '',
      degree: degree,
      field: extractField(blockText),
      startDate: dateMatch ? dateMatch[1] : '',
      endDate: dateMatch ? dateMatch[2] : '',
      gpa: gpaMatch ? gpaMatch[1] : '',
    });
  }

  return entries.slice(0, 5); // Max 5 education entries
}

function extractField(text) {
  const m = text.match(/(?:in|of)\s+([\w\s&]{3,40})(?:,|\.|$)/i);
  return m ? m[1].trim() : '';
}

/**
 * extractExperience(text) → experience[]
 */
function extractExperience(text) {
  const section = extractSection(text, [
    'experience', 'work experience', 'professional experience', 'employment history', 'employment',
  ]);
  if (!section) return [];

  const entries = [];
  const lines = section.split('\n').map(l => l.trim()).filter(Boolean);

  const blocks = [];
  let current = [];
  for (const line of lines) {
    if (line === '') {
      if (current.length) { blocks.push(current); current = []; }
    } else {
      current.push(line);
    }
  }
  if (current.length) blocks.push(current);

  for (const block of blocks.slice(0, 6)) { // Max 6 experience entries
    if (!block.length) continue;
    const blockText = block.join(' ');

    const dateMatch = blockText.match(/(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s*\d{4})\s*[-–to]+\s*(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s*\d{4}|present|current)/i);

    // Bullet points
    const bullets = block
      .filter(l => /^[•\-·▪▸►✓✔◦‣⁃]/.test(l))
      .map(l => l.replace(/^[•\-·▪▸►✓✔◦‣⁃]\s*/, '').trim());

    entries.push({
      company: block[0] || '',
      title: block[1] || '',
      location: '',
      startDate: dateMatch ? dateMatch[1] : '',
      endDate: dateMatch ? dateMatch[2] : '',
      description: block.slice(0, 2).join(' '),
      bullets,
    });
  }

  return entries;
}

/**
 * extractProjects(text) → project[]
 */
function extractProjects(text) {
  const section = extractSection(text, ['projects', 'personal projects', 'academic projects', 'key projects']);
  if (!section) return [];

  const lines = section.split('\n').map(l => l.trim()).filter(Boolean);
  const entries = [];
  let current = null;

  for (const line of lines) {
    // New project: line without leading bullet, not too long
    if (!/^[•\-·▪▸►✓✔◦‣⁃]/.test(line) && line.length < 80 && current !== null) {
      entries.push(current);
      current = { name: line, description: '', tech: [], url: '' };
    } else if (current === null) {
      current = { name: line, description: '', tech: [], url: '' };
    } else {
      current.description += ' ' + line.replace(/^[•\-·▪▸►✓✔◦‣⁃]\s*/, '');
    }
  }
  if (current) entries.push(current);

  return entries.slice(0, 8).map(p => ({
    ...p,
    description: p.description.trim(),
    tech: extractSkillsFromText(p.description),
  }));
}

function extractSkillsFromText(text) {
  return COMMON_TECH_SKILLS.filter(skill => {
    const pattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return pattern.test(text);
  }).slice(0, 8);
}

/**
 * extractCertifications(text) → certification[]
 */
function extractCertifications(text) {
  const section = extractSection(text, ['certifications', 'certificates', 'professional certifications']);
  if (!section) return [];

  const lines = section.split('\n').map(l => l.trim()).filter(l => l.length > 2);
  return lines.slice(0, 10).map(l => {
    const dateM = l.match(/\b(\d{4})\b/);
    const clean = l.replace(/^[•\-·▪▸►✓✔◦‣⁃]\s*/, '').trim();
    return {
      name: clean,
      issuer: '',
      date: dateM ? dateM[1] : '',
      url: '',
    };
  });
}

/**
 * extractSummary(text) → string
 */
function extractSummary(text) {
  const section = extractSection(text, [
    'summary', 'professional summary', 'objective', 'career objective', 'profile', 'about me', 'about',
  ]);
  return section ? section.slice(0, 500).trim() : '';
}

/**
 * extractLanguages(text) → string[]
 */
function extractLanguages(text) {
  const section = extractSection(text, ['languages', 'spoken languages']);
  if (!section) return [];
  const tokens = section.split(/[,|\n•\-·▪▸►]+/).map(t => t.trim()).filter(t => t.length > 1 && t.length < 25);
  return tokens.slice(0, 8);
}

// ─── Main Public API ──────────────────────────────────────────────────────────

/**
 * parse(file) → Promise<{ isResume, confidence, indicators, extracted }>
 *
 * Main entry point. Extracts text → validates → parses all fields.
 */
async function parse(file) {
  const rawText = await extractText(file);
  const validation = validateResume(rawText);

  if (!validation.isResume) {
    return {
      isResume: false,
      confidence: validation.confidence,
      indicators: validation.indicators,
      score: validation.score,
      rawText: rawText.slice(0, 500),
      extracted: null,
    };
  }

  const fullName = extractName(rawText);
  const nameParts = fullName.split(/\s+/);

  const extracted = {
    full_name:      fullName,
    first_name:     nameParts[0] || '',
    last_name:      nameParts.slice(1).join(' ') || '',
    email:          extractEmail(rawText),
    phone:          extractPhone(rawText),
    location:       extractLocation(rawText),
    linkedin:       extractLinkedIn(rawText),
    github:         extractGitHub(rawText),
    portfolio:      extractPortfolio(rawText),
    summary:        extractSummary(rawText),
    skills:         extractSkills(rawText),
    education:      extractEducation(rawText),
    experience:     extractExperience(rawText),
    projects:       extractProjects(rawText),
    certifications: extractCertifications(rawText),
    languages:      extractLanguages(rawText),
  };

  return {
    isResume: true,
    confidence: validation.confidence,
    indicators: validation.indicators,
    score: validation.score,
    rawText: rawText.slice(0, 20000), // store up to 20k chars
    extracted,
  };
}

module.exports = { parse, extractText, validateResume };
