const mongoose = require('mongoose');

/**
 * Resume — stores uploaded resume metadata and extracted structured data.
 * One doc per upload; users can have multiple versions (version field increments).
 */
const resumeSchema = new mongoose.Schema(
  {
    userId:   { type: String, trim: true, index: true }, // optional (guest upload has no userId)
    fileName: { type: String, trim: true, required: true },
    fileUrl:  { type: String, trim: true, default: '' }, // path or cloud URL; empty if deleted after parse
    mimeType: { type: String, trim: true, default: '' },
    fileSize: { type: Number, default: 0 }, // bytes

    version: { type: Number, default: 1 }, // increments per userId

    // Full structured extraction result from resumeParserService
    extractedData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Raw text extracted (truncated to 20k chars for storage)
    rawText: { type: String, default: '' },

    // Validation result
    isValidResume:      { type: Boolean, default: true },
    validationScore:    { type: Number, default: 0 },   // 0-10
    validationIndicators: [{ type: String }],            // which indicators were found
  },
  {
    timestamps: true,
  }
);

resumeSchema.index({ userId: 1, version: -1 });

module.exports = mongoose.model('Resume', resumeSchema);
