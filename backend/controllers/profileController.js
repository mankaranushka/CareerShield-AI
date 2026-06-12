const UserProfile = require('../models/UserProfile');
const Resume = require('../models/Resume');
const auditService = require('../services/auditService');

/**
 * POST /api/profile
 * Create or update a user profile (upsert by userId).
 */
exports.saveProfile = async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      userId,
      email,
      mobile,
      location,
      linkedin,
      github,
      portfolio,
      summary,
      skills,
      languages,
      education,
      experience,
      projects,
      certifications
    } = req.body;

    if (!userId || !userId.trim()) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    const trimmedUserId = userId.trim();

    // Check what is currently in DB (for detailed auditing of changes, optional)
    const existingProfile = await UserProfile.findOne({ userId: trimmedUserId });

    // Upsert: find by userId and update, or create if it doesn't exist
    const profile = await UserProfile.findOneAndUpdate(
      { userId: trimmedUserId },
      {
        userId: trimmedUserId,
        firstName: firstName !== undefined ? (firstName?.trim() || '') : '',
        middleName: middleName !== undefined ? (middleName?.trim() || '') : '',
        lastName: lastName !== undefined ? (lastName?.trim() || '') : '',
        email: email !== undefined ? (email?.trim() || '') : '',
        mobile: mobile !== undefined ? (mobile?.trim() || '') : '',
        location: location !== undefined ? (location?.trim() || '') : '',
        linkedin: linkedin !== undefined ? (linkedin?.trim() || '') : '',
        github: github !== undefined ? (github?.trim() || '') : '',
        portfolio: portfolio !== undefined ? (portfolio?.trim() || '') : '',
        summary: summary !== undefined ? (summary?.trim() || '') : '',
        skills: Array.isArray(skills) ? skills : [],
        languages: Array.isArray(languages) ? languages : [],
        education: Array.isArray(education) ? education : [],
        experience: Array.isArray(experience) ? experience : [],
        projects: Array.isArray(projects) ? projects : [],
        certifications: Array.isArray(certifications) ? certifications : [],
      },
      {
        new: true,           // return the updated document
        upsert: true,        // create if not found
        runValidators: true,  // enforce schema validations
      }
    );

    // Audit log
    await auditService.logAction({
      userId: trimmedUserId,
      action: 'profile_edit',
      details: {
        isNew: !existingProfile,
        fieldsEdited: Object.keys(req.body).filter(k => k !== 'userId'),
      },
      ip: req.ip
    });

    res.status(200).json({
      message: 'Profile saved successfully.',
      profile,
    });
  } catch (err) {
    console.error('Error saving profile:', err);

    // Handle duplicate key error (userId already taken by another doc)
    if (err.code === 11000) {
      return res.status(409).json({ error: 'This User ID is already taken.' });
    }

    res.status(500).json({ error: 'Failed to save profile. Please try again.' });
  }
};

/**
 * GET /api/profile/:userId
 * Fetch a user profile by userId.
 */
exports.getProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || !userId.trim()) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    const profile = await UserProfile.findOne({ userId: userId.trim() });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    res.status(200).json({ profile });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Failed to fetch profile. Please try again.' });
  }
};

/**
 * GET /api/profile/:userId/resume-history
 * Fetch resume upload history.
 */
exports.getResumeHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || !userId.trim()) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    const resumes = await Resume.find({ userId: userId.trim() })
      .select('fileName mimeType fileSize version isValidResume validationScore createdAt')
      .sort({ version: -1 });

    // Write audit log
    await auditService.logAction({
      userId: userId.trim(),
      action: 'resume_history_fetch',
      details: { count: resumes.length },
      ip: req.ip
    });

    res.status(200).json({ resumes });
  } catch (err) {
    console.error('Error fetching resume history:', err);
    res.status(500).json({ error: 'Failed to fetch resume history. Please try again.' });
  }
};
