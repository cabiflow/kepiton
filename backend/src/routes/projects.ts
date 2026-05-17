import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { enforceFreeProjectLimit } from '../middleware/freeTierGate.js';
import { notImplemented } from '../utils/http.js';

export const projectsRouter = Router();

projectsRouter.get('/', requireAuth, notImplemented);
projectsRouter.post('/', requireAuth, enforceFreeProjectLimit, notImplemented);
projectsRouter.get('/:id', requireAuth, notImplemented);
projectsRouter.put('/:id', requireAuth, notImplemented);
projectsRouter.delete('/:id', requireAuth, notImplemented);
projectsRouter.post('/:id/archive', requireAuth, notImplemented);
projectsRouter.post('/:id/milestone', requireAuth, notImplemented);
projectsRouter.put('/:id/milestone', requireAuth, notImplemented);
projectsRouter.post('/:id/tasks', requireAuth, notImplemented);
projectsRouter.post('/:id/share', requireAuth, notImplemented);
