import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { apiRouter } from './routes/index.js';
import { logger } from './lib/logger.js';

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use('/api/v1', apiRouter);

app.listen(port, () => {
  logger.info(`Kepiton API is running on port ${port}`);
});
