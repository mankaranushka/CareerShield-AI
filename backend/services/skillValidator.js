/**
 * skillValidator.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized skill classification, normalization, and validation.
 *
 * Implements the six-category classification rule:
 *   Category 1: Technical Skills      → ALLOWED (ATS scoring)
 *   Category 2: Professional Skills   → ALLOWED (ATS scoring)
 *   Category 3: Company Information   → IGNORE
 *   Category 4: JD Section Headings   → IGNORE
 *   Category 5: Locations             → IGNORE
 *   Category 6: Generic Business Terms→ IGNORE
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Category 1: Known Technical Skills ──────────────────────────────────────
const TECHNICAL_SKILLS = new Set([
  // Languages
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'c', 'ruby',
  'go', 'golang', 'rust', 'swift', 'kotlin', 'php', 'scala', 'r', 'matlab',
  'perl', 'haskell', 'elixir', 'dart', 'groovy', 'lua', 'clojure', 'f#',
  'vba', 'assembly', 'cobol', 'fortran', 'objective-c',

  // Web Frameworks & Libraries
  'react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt.js', 'gatsby',
  'remix', 'astro', 'ember', 'backbone', 'jquery', 'alpinejs',
  'node.js', 'express', 'fastify', 'nestjs', 'koa', 'hapi',
  'django', 'flask', 'fastapi', 'spring', 'spring boot', 'laravel',
  'rails', 'ruby on rails', 'asp.net', '.net', 'blazor', 'phoenix',
  'htmx', 'strapi', 'directus',

  // Mobile
  'react native', 'flutter', 'ios', 'android', 'expo', 'ionic', 'cordova',
  'swiftui', 'jetpack compose', 'xamarin',

  // Databases
  'sql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'mongodb', 'redis',
  'elasticsearch', 'cassandra', 'dynamodb', 'firestore', 'couchdb',
  'mariadb', 'oracle db', 'ms sql', 'mssql', 'neo4j', 'influxdb',
  'supabase', 'planetscale', 'cockroachdb',

  // Cloud & DevOps
  'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'k8s',
  'terraform', 'ansible', 'puppet', 'chef', 'jenkins', 'github actions',
  'gitlab ci', 'circleci', 'travis ci', 'argocd', 'helm', 'prometheus',
  'grafana', 'datadog', 'newrelic', 'splunk', 'pagerduty',
  'ci/cd', 'devops', 'devsecops', 'sre', 'linux', 'bash', 'shell',
  'powershell', 'nginx', 'apache', 'haproxy', 'vagrant', 'pulumi',
  'serverless', 'lambda', 'cloudformation', 'bicep',

  // AI/ML & Data
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras',
  'scikit-learn', 'sklearn', 'nlp', 'natural language processing',
  'computer vision', 'opencv', 'pandas', 'numpy', 'scipy', 'matplotlib',
  'seaborn', 'plotly', 'hugging face', 'transformers', 'bert', 'gpt',
  'llm', 'rag', 'langchain', 'mlops', 'airflow', 'spark', 'hadoop',
  'kafka', 'flink', 'dbt', 'snowflake', 'databricks', 'mlflow',
  'xgboost', 'lightgbm', 'catboost', 'a/b testing',

  // APIs & Protocols
  'rest api', 'rest', 'restful', 'graphql', 'grpc', 'websocket', 'soap',
  'oauth', 'jwt', 'openapi', 'swagger', 'webhook',

  // Architecture
  'microservices', 'monolith', 'event-driven', 'domain-driven design',
  'ddd', 'cqrs', 'event sourcing', 'clean architecture',
  'solid principles', 'design patterns', 'system design',

  // Version Control & Collaboration
  'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'trello',
  'linear', 'notion', 'slack', 'azure devops',

  // Testing
  'unit testing', 'integration testing', 'e2e testing', 'tdd', 'bdd',
  'jest', 'mocha', 'chai', 'cypress', 'playwright', 'selenium',
  'pytest', 'junit', 'testng', 'postman', 'insomnia',

  // Security
  'cybersecurity', 'penetration testing', 'pentest', 'owasp',
  'siem', 'soc', 'iam', 'zero trust', 'encryption', 'pki', 'ssl', 'tls',

  // Design & Tooling
  'figma', 'sketch', 'adobe xd', 'invision', 'zeplin', 'photoshop',
  'illustrator', 'blender', 'unity', 'unreal engine',

  // Data & Analytics
  'tableau', 'power bi', 'looker', 'metabase', 'excel', 'google analytics',
  'mixpanel', 'amplitude', 'segment', 'sql server', 'bigquery', 'redshift',

  // Methodologies & Frameworks (technical)
  'agile', 'scrum', 'kanban', 'lean', 'waterfall', 'safe', 'prince2',
  'itil', 'six sigma',

  // Certifications (treated as skills)
  'aws certified', 'azure certified', 'gcp certified', 'pmp', 'cpa',
  'cissp', 'ceh', 'cism', 'cisa', 'comptia', 'ccna', 'ccnp', 'cka',
  'ckad', 'google cloud professional', 'salesforce certified',
  'hubspot certified', 'tensorflow developer',

  // Additional technical tools/skills
  'vite', 'bun', 'deno', 'prettier', 'eslint', 'webpack', 'babel', 'yarn', 'pnpm', 'npm', 'web3', 'ethers'
]);

// ─── Category 2: Professional Skills ─────────────────────────────────────────
const PROFESSIONAL_SKILLS = new Set([
  'leadership', 'communication', 'team management', 'stakeholder management',
  'product strategy', 'problem solving', 'critical thinking', 'decision making',
  'strategic thinking', 'strategic planning', 'project management',
  'program management', 'product management', 'cross-functional collaboration',
  'collaboration', 'teamwork', 'mentoring', 'coaching', 'negotiation',
  'presentation', 'public speaking', 'documentation', 'technical writing',
  'analytical skills', 'data analysis', 'business analysis',
  'requirements gathering', 'client management', 'customer success',
  'account management', 'vendor management', 'budget management',
  'risk management', 'change management', 'conflict resolution',
  'time management', 'prioritization', 'adaptability', 'ownership',
  'attention to detail', 'multitasking', 'proactive',
  'continuous improvement', 'innovation management',
  'performance management', 'okrs', 'kpis', 'metrics-driven',
  'user research', 'ux research', 'product roadmap', 'roadmapping',
  'go-to-market', 'market analysis', 'competitive analysis',
  'consumer product management', 'technical leadership',
  'engineering management', 'release management', 'incident management',
]);

// ─── Category 2b: Product Skills ─────────────────────────────────────────────
const PRODUCT_SKILLS = new Set([
  'product strategy', 'roadmap planning', 'user research', 'product analytics', 'market analysis',
  'product roadmap', 'roadmapping', 'ux research', 'product optimization', 'product lifecycle'
]);

// ─── Category 2c: Marketing Skills ───────────────────────────────────────────
const MARKETING_SKILLS = new Set([
  'seo', 'sem', 'content marketing', 'brand strategy', 'campaign management',
  'digital marketing', 'social media marketing', 'email marketing', 'copywriting', 'growth marketing'
]);

// ─── Category 2d: HR Skills ──────────────────────────────────────────────────
const HR_SKILLS = new Set([
  'talent acquisition', 'recruitment', 'employee relations', 'hr operations',
  'human resources', 'onboarding', 'performance evaluation', 'workforce planning'
]);

// ─── Category 2e: Finance Skills ─────────────────────────────────────────────
const FINANCE_SKILLS = new Set([
  'financial modeling', 'budgeting', 'forecasting', 'risk analysis',
  'financial analysis', 'accounting', 'valuation', 'corporate finance'
]);

// ─── Category 2f: Sales Skills ───────────────────────────────────────────────
const SALES_SKILLS = new Set([
  'lead generation', 'negotiation', 'crm management', 'account management',
  'sales strategy', 'b2b sales', 'business development', 'client acquisition'
]);

// ─── Category 2g: Tools & Platforms ──────────────────────────────────────────
const TOOLS_PLATFORMS = new Set([
  'jira', 'salesforce', 'sap', 'tableau', 'power bi', 'figma', 'trello', 'asana', 'notion', 'slack'
]);

// ─── Category 2h: Certifications ─────────────────────────────────────────────
const CERTIFICATIONS = new Set([
  'aws certified solutions architect', 'pmp', 'scrum master', 'cfa', 'cpa',
  'aws certified', 'azure certified', 'gcp certified', 'cissp', 'ceh', 'cism', 'cisa',
  'comptia', 'ccna', 'ccnp', 'cka', 'ckad', 'google cloud professional', 'salesforce certified',
  'hubspot certified', 'tensorflow developer'
]);

// ─── Category 2i: Domain Expertise ───────────────────────────────────────────
const DOMAIN_EXPERTISE = new Set([
  'fintech', 'healthcare', 'saas', 'e-commerce', 'ecommerce', 'cybersecurity'
]);

// ─── Unified Allowed Competencies Set ────────────────────────────────────────
const ALL_KNOWN_SKILLS = new Set([
  ...TECHNICAL_SKILLS,
  ...PROFESSIONAL_SKILLS,
  ...PRODUCT_SKILLS,
  ...MARKETING_SKILLS,
  ...HR_SKILLS,
  ...FINANCE_SKILLS,
  ...SALES_SKILLS,
  ...TOOLS_PLATFORMS,
  ...CERTIFICATIONS,
  ...DOMAIN_EXPERTISE
]);

// ─── Category 3: Company Information (IGNORE) ─────────────────────────────────
const COMPANY_NAMES = new Set([
  'nike', 'google', 'microsoft', 'amazon', 'apple', 'meta', 'facebook',
  'netflix', 'uber', 'airbnb', 'twitter', 'x', 'linkedin', 'salesforce',
  'oracle', 'sap', 'ibm', 'accenture', 'deloitte', 'mckinsey', 'pwc',
  'kpmg', 'ey', 'infosys', 'wipro', 'tcs', 'cognizant', 'capgemini',
  'hcl', 'flipkart', 'paytm', 'swiggy', 'zomato', 'byju', 'razorpay',
  'stripe', 'shopify', 'atlassian', 'twilio', 'databricks', 'snowflake',
  'palantir', 'splunk', 'zendesk', 'hubspot', 'workday', 'servicenow',
  'about us', 'about company', 'company overview', 'who we are',
  'our mission', 'our culture', 'our values', 'our story',
]);

// ─── Category 4: JD Section Headings (IGNORE) ────────────────────────────────
const JD_SECTION_HEADINGS = new Set([
  "what you'll do", "what you will do", "what we offer", "what we're looking for",
  "who we are looking for", "responsibilities", "benefits", "perks",
  "preferred qualifications", "required qualifications", "minimum qualifications",
  "basic qualifications", "about the role", "about the team", "about this role",
  "about the job", "about this position", "role overview", "your role",
  "your responsibilities", "what you bring", "what we expect",
  "duties", "key responsibilities", "what you need", "requirements",
  "qualifications", "nice to have", "must have", "day to day",
  "you will", "you'll", "we offer", "we provide", "we are looking",
  "the team", "the role", "job summary", "position summary",
  "overview", "position overview", "job overview',",
]);

// ─── Category 5: Locations (IGNORE) ──────────────────────────────────────────
const LOCATIONS = new Set([
  'bengaluru', 'bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai',
  'pune', 'kolkata', 'ahmedabad', 'noida', 'gurugram', 'gurgaon',
  'new york', 'san francisco', 'seattle', 'austin', 'chicago', 'boston',
  'los angeles', 'london', 'berlin', 'amsterdam', 'toronto', 'sydney',
  'singapore', 'dubai', 'india', 'usa', 'us', 'uk', 'canada', 'australia',
  'remote', 'hybrid', 'onsite', 'on-site', 'work from home', 'wfh',
  'relocation', 'worldwide', 'global', 'worldwide',
]);

// ─── Category 6: Generic Business Terms (IGNORE) ─────────────────────────────
const GENERIC_BUSINESS_TERMS = new Set([
  'innovation', 'consumer product', 'footwear', 'apparel', 'technology',
  'business', 'product', 'service', 'services', 'global technology',
  'solutions', 'platform', 'ecosystem', 'transformation', 'digital',
  'enterprise', 'startup', 'scale', 'growth', 'revenue', 'profit',
  'market', 'industry', 'sector', 'vertical', 'domain',
  'company', 'organization', 'organisation', 'team', 'group',
  'department', 'division', 'unit', 'function', 'practice',
  'experience', 'background', 'knowledge', 'understanding',
  'ability', 'capability', 'capacity', 'proficiency', 'expertise',
  'skills', 'skill', 'required', 'preferred', 'desired', 'ideal',
  'strong', 'excellent', 'good', 'proven', 'demonstrated',
  'years', 'year', 'minimum', 'least', 'plus', 'etc',
  'work', 'working', 'job', 'role', 'position', 'opportunity',
  'candidate', 'applicant', 'professional', 'expert', 'specialist',
  'engineer', 'developer', 'manager', 'analyst', 'architect',
  'lead', 'senior', 'junior', 'mid', 'entry', 'level',
  'full-time', 'part-time', 'contract', 'permanent', 'temp',
  'compensation', 'salary', 'equity', 'bonus', 'benefits', 'perks',
  'insurance', 'health', 'dental', 'vision', 'pto', 'vacation',
  'culture', 'environment', 'diversity', 'inclusion', 'equity',
  // Standalone ambiguous words (only meaningful in compound terms)
  'cloud', 'consumer', 'data', 'platform', 'portal', 'application',
  'app', 'system', 'software', 'hardware', 'program', 'project',
  'digital', 'code', 'tech', 'core', 'stack', 'tools', 'tool',
  'do', 'will', 'what', 'our', 'who', 'where', 'when', 'how','like',
  'must-have','nice-to-have','responsible'
]);

// ─── Hiring Language (IGNORE) ────────────────────────────────────────────────
const HIRING_LANGUAGE = new Set([
  'hiring', 'candidate', 'candidates', 'applicant', 'applicants', 'applications', 'recruitment drive', 'recruitment', 'recruit', 'drive'
]);

// ─── Generic Adjectives (IGNORE) ─────────────────────────────────────────────
const GENERIC_ADJECTIVES = new Set([
  'passionate', 'eager', 'motivated', 'self-motivated', 'dynamic', 'dedicated', 'enthusiastic'
]);

// ─── Education Degrees (IGNORE) ──────────────────────────────────────────────
const EDUCATION_DEGREES = new Set([
  'b.tech', 'bca', 'mca', 'mba', 'bachelor degree', 'master degree', 'bachelor', 'master', 'degree', 'b.sc', 'm.sc', 'b.e', 'm.tech', 'phd'
]);

// ─── Generic Words (IGNORE) ──────────────────────────────────────────────────
const GENERIC_WORDS = new Set([
  'learn', 'more', 'board', 'team', 'work', 'company', 'department', 'future', 'growth', 'about'
]);

// ─── Skill Normalization Map ──────────────────────────────────────────────────
// Maps common aliases / alternate forms to a canonical name.
const NORMALIZATION_MAP = {
  // JavaScript ecosystem
  'js': 'JavaScript', 'javascript': 'JavaScript',
  'ts': 'TypeScript', 'typescript': 'TypeScript',
  'react': 'React', 'reactjs': 'React', 'react.js': 'React', 'react js': 'React',
  'vue': 'Vue', 'vuejs': 'Vue', 'vue.js': 'Vue',
  'angular': 'Angular', 'angularjs': 'Angular', 'angular.js': 'Angular',
  'nodejs': 'Node.js', 'node.js': 'Node.js', 'node js': 'Node.js', 'node': 'Node.js',
  'nextjs': 'Next.js', 'next.js': 'Next.js',
  'nuxtjs': 'Nuxt.js', 'nuxt.js': 'Nuxt.js',
  'express': 'Express', 'expressjs': 'Express', 'express.js': 'Express',
  'nestjs': 'NestJS',

  // Python
  'py': 'Python', 'python3': 'Python',
  'django rest framework': 'Django', 'drf': 'Django',
  'scikit learn': 'scikit-learn', 'sklearn': 'scikit-learn',

  // Java ecosystem
  'springboot': 'Spring Boot', 'spring-boot': 'Spring Boot',

  // Cloud
  'amazon web services': 'AWS', 'aws cloud': 'AWS', 'aws': 'AWS',
  'microsoft azure': 'Azure', 'azure cloud': 'Azure', 'azure': 'Azure',
  'google cloud platform': 'GCP', 'google cloud': 'GCP', 'gcp': 'GCP',

  // Kubernetes
  'kubernetes': 'Kubernetes', 'k8s': 'Kubernetes', 'k8': 'Kubernetes',

  // Databases
  'postgres': 'PostgreSQL', 'postgresql': 'PostgreSQL',
  'mongo': 'MongoDB', 'mongodb': 'MongoDB',
  'ms sql': 'MSSQL', 'sql server': 'MSSQL', 'microsoft sql server': 'MSSQL',

  // CI/CD
  'cicd': 'CI/CD', 'ci cd': 'CI/CD', 'ci/cd': 'CI/CD', 'continuous integration': 'CI/CD',
  'continuous deployment': 'CI/CD', 'continuous delivery': 'CI/CD',

  // Version Control
  'git': 'Git', 'github': 'GitHub', 'gitlab': 'GitLab',

  // ML
  'ml': 'Machine Learning', 'machine learning': 'Machine Learning',
  'dl': 'Deep Learning', 'deep learning': 'Deep Learning',
  'nlp': 'NLP', 'natural language processing': 'NLP',
  'computer vision': 'Computer Vision', 'cv': null, // cv is ambiguous — skip

  // Other
  'golang': 'Go', 'c plus plus': 'C++', 'cplusplus': 'C++',
  'c sharp': 'C#', 'csharp': 'C#',
  'ruby on rails': 'Ruby on Rails', 'ror': 'Ruby on Rails',
  'react native': 'React Native',
  'rest': 'REST API', 'restful': 'REST API', 'rest api': 'REST API',
  'graphql': 'GraphQL', 'grpc': 'gRPC',
  'agile methodology': 'Agile', 'agile methodologies': 'Agile', 'agile': 'Agile',
  'scrum methodology': 'Scrum', 'scrum': 'Scrum',
  'devops': 'DevOps', 'dev ops': 'DevOps',
  'devsecops': 'DevSecOps',
  'microservice': 'Microservices', 'micro services': 'Microservices',
  'power bi': 'Power BI',
  'tableau': 'Tableau',
  'docker': 'Docker',

  // Professional / Core Skills
  'leadership': 'Leadership',
  'communication': 'Communication',
  'problem solving': 'Problem Solving',
  'technical leadership': 'Technical Leadership',
};

// ─── Core Helpers ─────────────────────────────────────────────────────────────

/**
 * Normalize a raw skill string to its canonical form.
 * Returns null if the normalization explicitly maps to null (ambiguous).
 */
function normalizeSkill(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();

  // Explicit normalization map
  if (Object.prototype.hasOwnProperty.call(NORMALIZATION_MAP, lower)) {
    return NORMALIZATION_MAP[lower]; // may be null for ambiguous terms
  }

  // Common suffix cleanup
  const cleaned = trimmed
    .replace(/\s*\(.*?\)/g, '')        // Remove parentheticals
    .replace(/[™®©]/g, '')             // Remove trademark symbols
    .trim();

  return cleaned || null;
}

/**
 * Check if a string is in a given Set (case-insensitive).
 */
function inSetCI(str, set) {
  return set.has(str.toLowerCase().trim());
}

/**
 * Validate whether a given term is an actual skill.
 *
 * Returns:
 *   { valid: true,  normalized: string }   — the term is a valid skill
 *   { valid: false, reason: string }        — the term should be ignored
 */
function validateSkill(raw) {
  if (!raw || typeof raw !== 'string') {
    return { valid: false, reason: 'empty or non-string' };
  }

  // Strip leading/trailing punctuation (periods, commas, semicolons, etc.)
  const trimmed = raw.trim().replace(/^[.,;:!?()\[\]{}'"-]+|[.,;:!?()\[\]{}'"-]+$/g, '').trim();

  if (trimmed.length < 2) {
    return { valid: false, reason: 'too short' };
  }
  if (trimmed.length > 60) {
    return { valid: false, reason: 'too long to be a skill' };
  }

  const lower = trimmed.toLowerCase();

  // ── Pure numbers / year patterns ──
  if (/^\d+(\+)?$/.test(trimmed)) {
    return { valid: false, reason: 'numeric' };
  }

  // ── Normalize ──
  const normalized = normalizeSkill(trimmed);
  if (normalized === null) {
    // Explicitly ambiguous (e.g., 'cv')
    return { valid: false, reason: 'ambiguous abbreviation' };
  }
  const normalizedLower = normalized.toLowerCase();

  // ── Check against all known categories first (e.g. Salesforce, SAP) ──
  if (ALL_KNOWN_SKILLS.has(normalizedLower)) {
    return { valid: true, normalized };
  }

  // ── Category 3: Company Info ──
  if (inSetCI(lower, COMPANY_NAMES)) {
    return { valid: false, reason: 'company name' };
  }

  // ── Category 4: JD Section Headings ──
  if (inSetCI(lower, JD_SECTION_HEADINGS)) {
    return { valid: false, reason: 'jd section heading' };
  }

  // ── Category 5: Locations ──
  if (inSetCI(lower, LOCATIONS)) {
    return { valid: false, reason: 'location' };
  }

  // ── Category 6: Generic Business Terms ──
  if (inSetCI(lower, GENERIC_BUSINESS_TERMS)) {
    return { valid: false, reason: 'generic business term' };
  }

  // ── Category 7: Hiring Language ──
  if (inSetCI(lower, HIRING_LANGUAGE)) {
    return { valid: false, reason: 'hiring language' };
  }

  // ── Category 8: Generic Adjectives ──
  if (inSetCI(lower, GENERIC_ADJECTIVES)) {
    return { valid: false, reason: 'generic adjective' };
  }

  // ── Category 9: Education Degrees ──
  if (inSetCI(lower, EDUCATION_DEGREES)) {
    return { valid: false, reason: 'education degree' };
  }

  // ── Category 10: Generic Words ──
  if (inSetCI(lower, GENERIC_WORDS)) {
    return { valid: false, reason: 'generic word' };
  }

  // ── Check via normalization map — if it resolved to something canonical ──
  if (Object.prototype.hasOwnProperty.call(NORMALIZATION_MAP, lower) && normalized) {
    return { valid: true, normalized };
  }

  // ── Heuristic: terms that look like tech (contain . + # / special chars used by tech) ──
  // E.g. "C++", "ASP.NET", "CI/CD", "gRPC", "OAuth2"
  if (/[+#/.]/.test(trimmed) && trimmed.length <= 30) {
    return { valid: true, normalized };
  }

  // ── Heuristic: multi-word professional phrases ──
  // We allow 2-4 word capitalized phrases that are not in the ignore lists
  // (e.g. "Team Leadership", "Cross-functional Teams")
  const words = trimmed.split(/\s+/);
  if (words.length >= 2 && words.length <= 5) {
    // All words should be mostly alphabetic
    const allAlpha = words.every(w => /^[A-Za-z\-.+#/]+$/.test(w));
    if (allAlpha) {
      return { valid: true, normalized };
    }
  }

  // ── Single meaningful words (length >= 3) ──
  if (words.length === 1 && trimmed.length >= 3 && /^[A-Za-z][A-Za-z0-9.+#-]*$/.test(trimmed)) {
    return { valid: true, normalized };
  }

  return { valid: false, reason: 'not a recognized skill, technology, or competency' };
}

/**
 * Filter and normalize an array of raw skill strings.
 * Returns an array of valid, normalized, deduplicated skill strings.
 */
function filterAndNormalizeSkills(rawSkills) {
  if (!Array.isArray(rawSkills)) return [];
  const seen = new Set();
  const result = [];

  for (const raw of rawSkills) {
    const { valid, normalized } = validateSkill(raw);
    if (valid && normalized) {
      const key = normalized.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(normalized);
      }
    }
  }
  return result;
}

/**
 * Helper to determine if a standalone capitalized word looks like a technology term
 * (e.g. gRPC, NestJS, AWS, C++, REST, etc.) rather than a standard capitalized English word.
 */
function isTechLooking(word) {
  // 1. Contains a special character common in tech names
  if (/[+#/.]/.test(word)) return true;
  // 2. Contains digits (e.g., OAuth2, Web3, Angular17)
  if (/\d/.test(word)) return true;
  // 3. Has uppercase letters at index >= 1 (mixed case / CamelCase, e.g., TypeScript, JavaScript, gRPC, GitLab)
  const sub = word.slice(1);
  if (/[A-Z]/.test(sub)) return true;
  // 4. Entirely uppercase and has length >= 3 (e.g. AWS, GCP, SDK, API, REST, JWT)
  if (word === word.toUpperCase() && word.length >= 3) return true;

  return false;
}

/**
 * Extract and validate skills from raw JD text.
 *
 * Strategy:
 *   1. Match capitalized multi-word phrases (likely tech names) using regex.
 *   2. Match all known technical and professional skills from the text.
 *   3. Filter each candidate through validateSkill.
 *   4. Return deduplicated, normalized list.
 *
 * @param {string} jdText - Raw job description text.
 * @returns {string[]} - Validated, normalized JD skills.
 */
function extractJdSkills(jdText) {
  if (!jdText || typeof jdText !== 'string') return [];

  const found = new Set();

  // ── Pass 1: Scan for all known skills/competencies in JD ──
  for (const skill of ALL_KNOWN_SKILLS) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      const re = new RegExp(`(?:^|[\\s,/|•(\\[])${escaped}(?:$|[\\s,/|)\\].!?;:])`, 'i');
      if (re.test(jdText)) {
        const canonical = normalizeSkill(skill) || skill;
        if (canonical) found.add(canonical);
      }
    } catch (_) { /* skip malformed regex */ }
  }

  // ── Pass 3: Capitalized tech-looking single words (e.g., "OAuth2", "gRPC") ──
  // Only match single capitalized words to avoid spanning sentence boundaries.
  // Multi-word terms are handled exclusively by Pass 1 & 2 against known lists.
  const COMMON_ENGLISH_WORDS = new Set([
    'the','and','for','are','but','not','you','all','can','had','her','was','one',
    'our','out','day','get','has','him','his','how','its','new','now','old','see',
    'two','way','who','did','its','let','put','say','she','too','use','will','with',
    'from','they','been','have','here','just','know','like','make','many','over',
    'such','than','them','then','they','this','time','very','when','come','could',
    'each','even','find','give','here','into','long','make','much','only','open',
    'other','some','their','these','what','your','about','after','again','being',
    'bring','build','every','first','found','given','going','great','group','large',
    'never','often','place','right','small','sound','still','those','three','under',
    'until','where','which','while','would','years','including','looking','required',
    'minimum','preferred','experience','work','strong','excellent','good','proven',
    'demonstrated','skills','ability','knowledge','understanding','proficiency',
    'mission','culture','values','story','overview','summary','minimum','must','need',
    'join','help','drive','lead','build','grow','scale','bring','take','love','enjoy',
    'play','hire','seek','apply','want','looking','offer','opportunity','passionate',
    'excited','focused','dedicated','committed','collaborate','working','deliver',
    'senior','junior','principal','staff','associate','director','head','vice',
  ]);
  const techPattern = /(?:^|[\s,/|([\n])([A-Z][a-zA-Z0-9+#.]{1,29})(?=$|[\s,/|)\].!?;:\n])/g;
  let m;
  while ((m = techPattern.exec(jdText)) !== null) {
    let candidate = m[1].trim();
    // Trim trailing/leading punctuation first (e.g. "York." becomes "York")
    candidate = candidate.replace(/^[.,;:!?()\[\]{}'"-]+|[.,;:!?()\[\]{}'"-]+$/g, '').trim();
    // Skip short or common English words
    if (candidate.length < 3) continue;
    if (COMMON_ENGLISH_WORDS.has(candidate.toLowerCase())) continue;
    // Skip words that are standard title case (not tech-looking)
    if (!isTechLooking(candidate)) continue;
    const { valid, normalized } = validateSkill(candidate);
    if (valid && normalized) {
      found.add(normalized);
    }
  }

  // ── Case-insensitive deduplication ──
  // Pass 1 & 2 produce lowercase; Pass 3 may produce canonical-cased forms.
  // Keep first occurrence for each normalized key.
  const seen = new Map(); // lower -> preferred
  for (const s of found) {
    const key = s.toLowerCase();
    if (!seen.has(key)) {
      seen.set(key, s);
    } else {
      // Prefer the version with correct capitalization (not all lowercase)
      const existing = seen.get(key);
      if (existing === existing.toLowerCase() && s !== s.toLowerCase()) {
        seen.set(key, s);
      }
    }
  }

  return [...seen.values()];
}

/**
 * Normalize a skill for fuzzy comparison (remove spaces, dots, dashes, case).
 */
function normForCompare(s) {
  return (s || '').toLowerCase().replace(/[\s.\-_]/g, '');
}

module.exports = {
  validateSkill,
  filterAndNormalizeSkills,
  extractJdSkills,
  normalizeSkill,
  normForCompare,
  TECHNICAL_SKILLS,
  PROFESSIONAL_SKILLS,
  PRODUCT_SKILLS,
  MARKETING_SKILLS,
  HR_SKILLS,
  FINANCE_SKILLS,
  SALES_SKILLS,
  TOOLS_PLATFORMS,
  CERTIFICATIONS,
  DOMAIN_EXPERTISE,
};
