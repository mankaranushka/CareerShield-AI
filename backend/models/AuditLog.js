const mongoose = require('mongoose');

/**
 * AuditLog — lightweight audit trail for all significant system actions.
 * Used for debugging, compliance, and feature analytics.
 */
const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: String, trim: true, index: true, default: 'guest' },

    // Action type enum
    action: {
      type: String,
      enum: [
        'resume_upload',
        'resume_validation_failed',
        'resume_parsed',
        'profile_sync',
        'profile_edit',
        'ats_analysis',
        'resume_history_fetch',
      ],
      required: true,
    },

    // Flexible details object (what changed, what was extracted, etc.)
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // IP address for security auditing (optional)
    ip: { type: String, default: '' },
  },
  {
    // Only createdAt is needed; no updatedAt for immutable audit records
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// TTL index: auto-delete audit logs older than 90 days (optional; comment out if you want to keep all)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
