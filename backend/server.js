import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { getDatabaseConfig, testParameterStoreConnection } from './lib/secrets.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import trademenRoutes from './routes/tradesmen.js';
import jobRoutes from './routes/jobs.js';
import messageRoutes from './routes/messages.js';
import reviewRoutes from './routes/reviews.js';
import cityRoutes from './routes/cities.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database Connection Pool
let pool;

/**
 * Initialize database connection pool
 * Retrieves credentials from AWS Parameter Store if available, otherwise uses environment variables
 */
async function initializeDatabase() {
  try {
    let dbConfig;

    // Try to get credentials from Parameter Store (production)
    if (process.env.NODE_ENV === 'production' || process.env.USE_PARAMETER_STORE === 'true') {
      console.log('Attempting to retrieve database credentials from AWS Parameter Store...');
      const isConnected = await testParameterStoreConnection();
      
      if (isConnected) {
        dbConfig = await getDatabaseConfig();
        console.log('✅ Successfully retrieved database credentials from Parameter Store');
      } else {
        console.warn('⚠️ Parameter Store not available, falling back to environment variables');
        dbConfig = {
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          database: process.env.DB_NAME,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
        };
      }
    } else {
      // Development: use environment variables
      console.log('Using database credentials from environment variables (development mode)');
      dbConfig = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      };
    }

    // Validate required configuration
    if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
      throw new Error('Missing required database configuration');
    }

    // Create connection pool
    pool = new Pool({
      host: dbConfig.host,
      port: parseInt(dbConfig.port, 10) || 5432,
      database: dbConfig.database,
      user: dbConfig.user,
      password: dbConfig.password,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    
    console.log('✅ Database connection pool initialized successfully');
    return pool;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error.message);
    throw error;
  }
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    credentialsSource: process.env.NODE_ENV === 'production' ? 'Parameter Store' : 'Environment Variables'
  });
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

// Export pool for use in routes
export { pool };

// Start Server
async function startServer() {
  try {
    // Initialize database connection pool
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`OgaFix Backend API running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful Shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down gracefully...');
      if (pool) {
        await pool.end();
      }
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();
