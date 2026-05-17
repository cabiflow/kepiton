import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { notImplemented } from '../utils/http.js';

export const tasksRouter = Router();

tasksRouter.put('/:id', requireAuth, notImplemented);
tasksRouter.delete('/:id', requireAuth, notImplemented);
tasksRouter.patch('/:id/complete', requireAuth, notImplemented);
tasksRouter.patch('/:id/reopen', requireAuth, notImplemented);
