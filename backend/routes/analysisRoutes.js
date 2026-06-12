const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const analysisController = require('../controllers/analysisController');
const fs = require('fs');

// Multer upload configurations
const uploadsDir = path.join(__dirname, '../uploads');

// Smart Multer storage engine selection (diskStorage with memoryStorage fallback)
let storage;
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  fs.accessSync(uploadsDir, fs.constants.W_OK);
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
  });
} catch (err) {
  console.log('Upload directory not writable. Falling back to Memory Storage (Serverless friendly).');
  storage = multer.memoryStorage();
}

const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.pdf', '.docx', '.doc', '.txt'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, DOC, and TXT files are allowed'));
    }
  }
});

const uploadSingle = upload.single('resume');

// Optional JWT authentication middleware: extracts user details if valid token present,
// but does not fail if token is missing or invalid.
const optionalAuthenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return next();
  }
  
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    return next();
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err && user) {
      req.user = user;
    }
    next();
  });
};

// POST /api/analyze-resume (With optional JWT auth + file upload)
router.post('/analyze-resume', optionalAuthenticateToken, (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, analysisController.analyzeResume);

// GET /api/ats-reports/:userId (Fetch past ATS reports for user)
router.get('/ats-reports/:userId', optionalAuthenticateToken, analysisController.getAtsReports);

module.exports = router;
