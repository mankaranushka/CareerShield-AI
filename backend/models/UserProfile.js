const mongoose = require('mongoose');

// ─── Sub-schemas ────────────────────────────────────────────────────────────

const educationSchema = new mongoose.Schema({
  institution: { type: String, trim: true, default: '' },
  degree:      { type: String, trim: true, default: '' },
  field:       { type: String, trim: true, default: '' },
  startDate:   { type: String, trim: true, default: '' },
  endDate:     { type: String, trim: true, default: '' },
  gpa:         { type: String, trim: true, default: '' },
}, { _id: false });

const experienceSchema = new mongoose.Schema({
  company:     { type: String, trim: true, default: '' },
  title:       { type: String, trim: true, default: '' },
  location:    { type: String, trim: true, default: '' },
  startDate:   { type: String, trim: true, default: '' },
  endDate:     { type: String, trim: true, default: '' },
  description: { type: String, trim: true, default: '' },
  bullets:     [{ type: String, trim: true }],
}, { _id: false });

const projectSchema = new mongoose.Schema({
  name:        { type: String, trim: true, default: '' },
  description: { type: String, trim: true, default: '' },
  tech:        [{ type: String, trim: true }],
  url:         { type: String, trim: true, default: '' },
}, { _id: false });

const certificationSchema = new mongoose.Schema({
  name:   { type: String, trim: true, default: '' },
  issuer: { type: String, trim: true, default: '' },
  date:   { type: String, trim: true, default: '' },
  url:    { type: String, trim: true, default: '' },
}, { _id: false });

// ─── Main Schema ─────────────────────────────────────────────────────────────

const userProfileSchema = new mongoose.Schema(
  {
    // ── Basic Identity ──────────────────────────────────────────────────────
    userId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // allows multiple docs with empty userId without conflict
    },
    firstName:  { type: String, trim: true, default: '' },
    middleName: { type: String, trim: true, default: '' },
    lastName:   { type: String, trim: true, default: '' },
    email:      { type: String, trim: true, lowercase: true, default: '' },
    mobile:     { type: String, trim: true, default: '' },

    // ── Extended Contact / Links ────────────────────────────────────────────
    location:  { type: String, trim: true, default: '' },
    linkedin:  { type: String, trim: true, default: '' },
    github:    { type: String, trim: true, default: '' },
    portfolio: { type: String, trim: true, default: '' },

    // ── Professional Summary ────────────────────────────────────────────────
    summary: { type: String, trim: true, default: '' },

    // ── Resume Content ──────────────────────────────────────────────────────
    skills:         [{ type: String, trim: true }],
    languages:      [{ type: String, trim: true }],
    education:      [educationSchema],
    experience:     [experienceSchema],
    projects:       [projectSchema],
    certifications: [certificationSchema],

    // ── Resume Versioning ───────────────────────────────────────────────────
    resumeVersion: { type: Number, default: 0 },
    lastResumeUploadAt: { type: Date, default: null },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// Index for faster lookups
userProfileSchema.index({ userId: 1 });
userProfileSchema.index({ email: 1 });

module.exports = mongoose.model('UserProfile', userProfileSchema);
