import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env'), override: true });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createSessionConfig } from './config/session.js';
import authRoutes from './routes/auth.routes.js';
import tasksRoutes from './routes/tasks.routes.js';
import calendarRoutes from './routes/calendar.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API-only backend
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
}));
app.use(express.json());
app.use(createSessionConfig());

// Routes
app.use('/auth', authRoutes);
app.use('/tasks', tasksRoutes);
app.use('/calendar', calendarRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
