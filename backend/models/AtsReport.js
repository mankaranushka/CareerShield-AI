const mongoose = require('mongoose');

/**
 * AtsReport — stores one complete ATS analysis result.
 * Each upload+jobDescription pair produces one report.
 */
const atsReportSchema = new mongoose.Schema(
  {
    userId:         { type: String, trim: true, index: true }, // optional
    resumeId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', default: null },
    jobDescription: { type: String, default: '' },

    // ── Score summary ──────────────────────────────────────────────────────
    atsScore:   { type: Number, default: 0 },  // 0-100
    grade:      { type: String, default: '' },  // A, B, C, D, F
    matchLevel: { type: String, default: '' },  // "Strong Match", "Good Match", etc.

    // ── Score breakdown ────────────────────────────────────────────────────
    scoreBreakdown: {
      skillsMatch:        { type: Number, default: 0 }, // weighted points
      experienceMatch:    { type: Number, default: 0 },
      keywordMatch:       { type: Number, default: 0 },
      educationMatch:     { type: Number, default: 0 },
      certificationsMatch:{ type: Number, default: 0 },
      structureScore:     { type: Number, default: 0 },
    },

    // ── Full report data (all arrays and text analysis) ────────────────────
    reportData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

atsReportSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('AtsReport', atsReportSchema);
