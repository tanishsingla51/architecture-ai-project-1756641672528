import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import errorHandler from './middleware/errorHandler.js';
import mainRouter from './routes/index.js';

const app = express();

// Core Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(helmet()); // Set various HTTP headers for security
app.use(express.json({ limit: '16kb' })); // Body parser for JSON
app.use(express.urlencoded({ extended: true, limit: '16kb' })); // Body parser for URL-encoded data
app.use(morgan('dev')); // HTTP request logger

// API Routes
app.use('/api/v1', mainRouter);

// Health Check Route
app.get('/', (req, res) => {
  res.status(200).send('API is running...');
});

// Global Error Handler
app.use(errorHandler);

export default app;
