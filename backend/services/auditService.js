const AuditLog = require('../models/AuditLog');

/**
 * Creates and saves an audit log entry.
 * Errors inside this service are caught and logged to console rather than breaking the request,
 * to ensure that auditing failure doesn't break main user journeys.
 * 
 * @param {object} params
 * @param {string} params.userId - User ID or 'guest'
 * @param {string} params.action - Action enum value
 * @param {object} params.details - Details object to store
 * @param {string} [params.ip] - IP address of the request
 * @returns {Promise<object|null>} The saved AuditLog document, or null on error
 */
async function logAction({ userId, action, details = {}, ip = '' }) {
  try {
    const log = new AuditLog({
      userId: userId || 'guest',
      action,
      details,
      ip,
    });
    await log.save();
    return log;
  } catch (error) {
    console.error(`[AuditService Error] Failed to write audit log for action "${action}":`, error.message);
    return null;
  }
}

module.exports = { logAction };
