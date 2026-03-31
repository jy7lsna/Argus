import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import http from 'http';
import 'dotenv/config';

import sequelize from './config/database';
import authRoutes from './routes/authRoutes';
import analysisRoutes from './routes/analysisRoutes';
import MonitoringService from './services/monitoringService';
import { init as initSocket } from './utils/socket';
import { csrfMiddleware } from './middleware/csrfMiddleware';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Set security HTTP headers
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:8080',
    process.env.FRONTEND_URL || ''
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(csrfMiddleware);

// Rate Limiting for Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate Limiting for Analysis (expensive operations)
const analysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Stricter limit — scans are resource-intensive
  message: 'Too many analysis requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api', analysisLimiter, analysisRoutes);

// Health Check for monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Database Initialization and Server Start
const startServer = async () => {
  try {
    // Authenticate and sync DB
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL successfully.');

    const shouldSync = process.env.DB_SYNC === 'true';
    if (shouldSync) {
      await sequelize.sync();
      console.log('Models synchronized with database.');
    } else {
      console.log('DB sync skipped. Run migrations to update schema.');
    }

    // Start background services
    MonitoringService.start();

    // Create HTTP Server and bind Socket.IO
    const server = http.createServer(app);
    initSocket(server);

    // Start listening
    server.listen(PORT, () => {
      console.log(`Argus API & WebSocket server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
