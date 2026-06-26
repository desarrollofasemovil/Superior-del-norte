const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./repositories/dbRepository');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const publicRoutes = require('./routes/publicRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Force UTF-8 encoding header for all API responses except binary downloads
app.use((req, res, next) => {
  if (!req.path.includes('/certificate/download')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }
  next();
});

// --- Register Routers ---
app.use('/api/auth', authRoutes);
app.use('/api', publicRoutes);     // Public routes FIRST (no auth middleware)
app.use('/api/admin', adminRoutes);
app.use('/api', studentRoutes);    // Authenticated routes after public

// Root Status check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

// --- Centralized Error Handler ---
app.use(errorHandler);

// Initialize database and start server
db.initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
