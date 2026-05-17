import { Router } from 'express';
import { adminRouter } from './admin.js';
import { authRouter } from './auth.js';
import { importRouter } from './import.js';
import { paymentRouter } from './payment.js';
import { pinnedRouter } from './pinned.js';
import { projectsRouter } from './projects.js';
import { shareRouter } from './share.js';
import { tasksRouter } from './tasks.js';

export const apiRouter = Router();

apiRouter.get('/health', (_request, response) => {
  response.json({ ok: true });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/projects', projectsRouter);
apiRouter.use('/tasks', tasksRouter);
apiRouter.use('/import', importRouter);
apiRouter.use('/share', shareRouter);
apiRouter.use('/payment', paymentRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/me/pinned', pinnedRouter);
