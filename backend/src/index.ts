import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { apiRouter } from './routes/index.js';
import { logger } from './lib/logger.js';
import { startReminderJob } from './services/reminderJob.js';
import { handleRouteError } from './utils/http.js';

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use('/api/v1', apiRouter);
app.use(
  (
    error: unknown,
    _request: express.Request,
    response: express.Response,
    _next: express.NextFunction,
  ) => {
    void _next;
    handleRouteError(error, response);
  },
);

app.listen(port, () => {
  logger.info(`Kepiton API is running on port ${port}`);
  startReminderJob();
});
