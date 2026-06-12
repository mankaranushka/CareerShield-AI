require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB Database
connectDB();

// Auto-create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Global Middlewares & CORS Protection
// FRONTEND_URL can be a comma-separated list of allowed origins for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  ...(process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(u => u.trim())
    : [])
];

if (!process.env.FRONTEND_URL) {
  console.warn('⚠️  FRONTEND_URL is not set. CORS will only allow localhost origins. Set it in .env for production.');
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(null, false); // Standard way to disallow origin in cors package without throwing Express error
    }
  },
  credentials: true
}));

app.use(express.json());
// Serve frontend static assets if they exist (for unified local deployments)
const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// API Routes
const analysisRoutes = require('./routes/analysisRoutes');
const profileRoutes = require('./routes/profileRoutes');

app.use('/api', analysisRoutes);
app.use('/api', profileRoutes);

// Root Health Route & SPA Fallback Handler
app.get('*', (req, res) => {
  const indexHtmlPath = path.join(__dirname, '../frontend/dist/index.html');
  if (fs.existsSync(indexHtmlPath)) {
    res.sendFile(indexHtmlPath);
  } else {
    // Return a clean API Health Status JSON response for backend-only deployments (like Render)
    res.json({
      status: 'active',
      api: 'CareerShield AI Express Backend API',
      database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      environment: process.env.NODE_ENV || 'production'
    });
  }
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Listen
app.listen(PORT, () => {
  console.log(`CareerShield AI server running on http://localhost:${PORT}`);
});
