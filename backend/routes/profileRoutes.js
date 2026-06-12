const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// POST /api/profile — Save or update a profile
router.post('/profile', profileController.saveProfile);

// GET /api/profile/:userId — Fetch a profile by userId
router.get('/profile/:userId', profileController.getProfile);

// GET /api/profile/:userId/resume-history — Fetch resume upload history for a profile
router.get('/profile/:userId/resume-history', profileController.getResumeHistory);

module.exports = router;
