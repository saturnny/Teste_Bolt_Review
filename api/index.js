/**
 * Vercel Serverless Function - Node.js Entry Point
 * Time Tracking System - Node.js Version
 */
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/static', express.static(path.join(__dirname, '../static')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../templates'));

// Routes
app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/api/test', (req, res) => {
  res.json({ msg: 'deploy funcionando', status: 'ok' });
});

// Root route - redirect to login or dashboard
app.get('/', (req, res) => {
  const token = req.cookies.access_token;
  if (token) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start local server if run directly (e.g. node api/index.js)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Development server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
