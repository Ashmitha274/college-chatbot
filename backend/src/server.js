import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { pool } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/department', departmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);

// Global error handler middleware (must be last - 4 parameters required)
app.use((err, req, res, next) => {
  console.error('❌ Unhandled Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    query: req.query
  });
  
  // Don't send response if already sent
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`
  });
});

const PORT = process.env.PORT || 4000;

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Don't exit in development, but log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

const server = app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Handle server errors gracefully
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use!`);
    console.error(`\nTo fix this, run one of these commands:`);
    console.error(`  Windows: netstat -ano | findstr :${PORT}`);
    console.error(`  Then: taskkill /F /PID <PID_NUMBER>`);
    console.error(`\nOr use a different port by setting PORT environment variable.\n`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});


