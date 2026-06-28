import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { getDatabaseConfig, testParameterStoreConnection } from './lib/secrets.js';
import { initializeSocket } from './lib/socket.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import tradesmenRoutes from './routes/tradesmen.js';
import jobRoutes from './routes/jobs.js';
import messageRoutes from './routes/messages.js';
import reviewRoutes from './routes/reviews.js';
import cityRoutes from './routes/cities.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

let pool;

async function initializeDatabase() {
  try {
    let dbConfig;

    if (process.env.NODE_ENV === 'production' || process.env.USE_PARAMETER_STORE === 'true') {
      console.log('Attempting to retrieve database credentials from AWS Parameter Store...');
      try {
        const isConnected = await testParameterStoreConnection();

        if (isConnected) {
          dbConfig = await getDatabaseConfig();
          console.log('✅ Successfully retrieved database credentials from Parameter Store');
        } else {
          throw new Error('Parameter Store not available');
        }
      } catch (psError) {
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
      console.log('Using database credentials from environment variables (development mode)');
      dbConfig = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      };
    }

    if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
      throw new Error('Missing required database configuration');
    }

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

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tradesmen', tradesmenRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cities', cityRoutes);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

export { pool };

async function startServer() {
  try {
    await initializeDatabase();
    initializeSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`OgaFix Backend API running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('Socket.io enabled at /socket.io');
    });

    process.on('SIGINT', async () => {
      console.log('Shutting down gracefully...');
      if (pool) await pool.end();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
