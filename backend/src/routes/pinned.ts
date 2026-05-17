import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { notImplemented } from '../utils/http.js';

export const pinnedRouter = Router();

pinnedRouter.get('/', requireAuth, notImplemented);
pinnedRouter.post('/', requireAuth, notImplemented);
pinnedRouter.delete('/', requireAuth, notImplemented);
