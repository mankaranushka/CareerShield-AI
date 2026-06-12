// Central API base URL configuration.
// In development, Vite's proxy handles '/api' requests to localhost:3000.
// In production, set VITE_API_URL to the backend's deployed URL (e.g. https://api.careershield.ai).
// If unset, defaults to '' (relative paths — works when frontend is served by the Express backend itself).
const API_BASE = import.meta.env.VITE_API_URL || '';

export default API_BASE;
