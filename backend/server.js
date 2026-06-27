import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import tradesmen Routes from './routes/tradesmen.js';
import jobRoutes from './routes/jobs.js';
import messageRoutes from './routes/messages.js';
import reviewRoutes from './routes/reviews.js';
import cityRoutes from './routes/cities.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database Connection Pool
export const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tradesmen', trademenRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cities', cityRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`OgaFix Backend API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Graceful Shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});
