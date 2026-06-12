const fs = require('fs');
const resumeParserService = require('../services/resumeParserService');
const atsService = require('../services/atsService');
const profileSyncService = require('../services/profileSyncService');
const auditService = require('../services/auditService');
const Resume = require('../models/Resume');
const AtsReport = require('../models/AtsReport');

exports.analyzeResume = async (req, res) => {
  const jobDescription = req.body.jobDescription || '';
  const userId = req.body.userId || req.user?.userId || req.user?.id || null;

  if (!req.file) {
    return res.status(400).json({ error: 'No resume uploaded' });
  }
  if (jobDescription.trim().length < 20) {
    // Clean up file if present
    try {
      if (req.file.path) fs.unlinkSync(req.file.path);
    } catch (e) {}
    return res.status(400).json({ error: 'Job description too short (minimum 20 characters)' });
  }

  try {
    // 1. Run parser which extracts, validates and parses
    const parseResult = await resumeParserService.parse(req.file);

    console.log(`[Resume Analysis] File: ${req.file.originalname}, Size: ${req.file.size} bytes`);
    console.log(`[Resume Analysis] Text length: ${parseResult.rawText ? parseResult.rawText.length : 0}`);
    console.log(`[Resume Analysis] Validation score: ${parseResult.score}, Indicators:`, parseResult.indicators);
    if (!parseResult.isResume) {
      console.log(`[Resume Analysis] Extracted Text Snippet: "${parseResult.rawText ? parseResult.rawText.slice(0, 500) : ''}"`);
    }

    // 2. Validate resume structure
    if (!parseResult.isResume) {
      if (userId) {
        await auditService.logAction({
          userId,
          action: 'resume_validation_failed',
          details: {
            fileName: req.file.originalname,
            validationScore: parseResult.score,
            indicators: parseResult.indicators
          },
          ip: req.ip
        });
      }

      // Cleanup uploaded file
      try {
        if (req.file.path) fs.unlinkSync(req.file.path);
      } catch (e) {}

      let errorMsg = 'Uploaded file is not a valid resume.';
      if (!parseResult.rawText || parseResult.rawText.trim().length < 50) {
        errorMsg = 'Uploaded file contains no readable text. Please ensure it is a digital text document (not a scanned image, photo, or empty document).';
      }

      return res.status(422).json({
        error: errorMsg,
        status: 'invalid_document',
        validationScore: parseResult.score,
        indicators: parseResult.indicators
      });
    }

    // 3. Save Resume doc to DB if userId provided
    let resumeDoc = null;
    let syncResult = null;

    if (userId) {
      // Find current version number
      let version = 1;
      const lastResume = await Resume.findOne({ userId }).sort({ version: -1 });
      if (lastResume) {
        version = lastResume.version + 1;
      }

      resumeDoc = new Resume({
        userId,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        version,
        extractedData: parseResult.extracted,
        rawText: parseResult.rawText,
        isValidResume: true,
        validationScore: parseResult.score,
        validationIndicators: parseResult.indicators
      });
      await resumeDoc.save();

      // Log upload & parse
      await auditService.logAction({
        userId,
        action: 'resume_upload',
        details: { fileName: req.file.originalname, fileSize: req.file.size },
        ip: req.ip
      });
      await auditService.logAction({
        userId,
        action: 'resume_parsed',
        details: { resumeId: resumeDoc._id, version },
        ip: req.ip
      });

      // 4. Sync profile with extracted data
      syncResult = await profileSyncService.syncProfile(userId, parseResult.extracted);
      if (syncResult && Object.keys(syncResult.diff).length > 0) {
        await auditService.logAction({
          userId,
          action: 'profile_sync',
          details: {
            diff: syncResult.diff,
            resumeVersion: syncResult.profile.resumeVersion
          },
          ip: req.ip
        });
      }
    }

    // 5. Call ATS analysis service
    const atsResult = atsService.analyze(parseResult.extracted, jobDescription);

    // 6. Save ATS report if userId provided
    if (userId && resumeDoc) {
      const reportDoc = new AtsReport({
        userId,
        resumeId: resumeDoc._id,
        jobDescription,
        atsScore: atsResult.ats_score,
        grade: atsResult.grade,
        matchLevel: atsResult.match_level,
        scoreBreakdown: {
          skillsMatch: atsResult.score_breakdown.skills_match,
          experienceMatch: atsResult.score_breakdown.experience_match,
          keywordMatch: atsResult.score_breakdown.keyword_match,
          educationMatch: atsResult.score_breakdown.education_match,
          certificationsMatch: atsResult.score_breakdown.certifications_match,
          structureScore: atsResult.score_breakdown.structure_score,
        },
        reportData: atsResult
      });
      await reportDoc.save();

      await auditService.logAction({
        userId,
        action: 'ats_analysis',
        details: {
          reportId: reportDoc._id,
          score: atsResult.ats_score,
          grade: atsResult.grade,
          matchLevel: atsResult.match_level
        },
        ip: req.ip
      });
    }

    // Clean up file if present
    try {
      if (req.file.path) fs.unlinkSync(req.file.path);
    } catch (e) {}

    // 7. Return complete report response
    return res.json({
      ...atsResult,
      // Compatibility fields for the frontend
      score: atsResult.ats_score,
      fileName: req.file.originalname,
      extractedData: parseResult.extracted,
      syncDiff: syncResult ? syncResult.diff : null,
      resumeVersion: syncResult ? syncResult.profile.resumeVersion : null
    });

  } catch (error) {
    console.error('Error in analyzeResume controller:', error);
    // Cleanup uploaded file
    try {
      if (req.file.path) fs.unlinkSync(req.file.path);
    } catch (e) {}
    return res.status(500).json({ error: `Analysis failed: ${error.message}` });
  }
};

/**
 * GET /api/ats-reports/:userId
 * Fetch all past ATS reports for a user.
 */
exports.getAtsReports = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || !userId.trim()) {
      return res.status(400).json({ error: 'User ID is required.' });
    }
    const reports = await AtsReport.find({ userId: userId.trim() })
      .populate('resumeId', 'fileName version')
      .sort({ createdAt: -1 });

    res.status(200).json({ reports });
  } catch (err) {
    console.error('Error fetching ATS reports:', err);
    res.status(500).json({ error: 'Failed to fetch ATS reports.' });
  }
};
