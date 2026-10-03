import express from 'express';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth';
import { watchlistRouter } from './routes/watchlist';
import { errorHandler } from './middleware/error-handler';

export const app = express();

app.set('trust proxy', 1);
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/watchlist', watchlistRouter);

app.use(errorHandler);
