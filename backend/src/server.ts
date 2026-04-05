import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app: Express = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import authRoutes from './routes/auth.js';
import profRoutes from './routes/professors.js';
import userRoutes from './routes/users.js';
import stockRoutes from './routes/stocks.js';

app.use('/api/auth', authRoutes);
app.use('/api/professors', profRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stocks', stockRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
