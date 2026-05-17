import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { notImplemented } from '../utils/http.js';

export const importRouter = Router();

importRouter.post('/file', requireAuth, notImplemented);
importRouter.post('/sheets', requireAuth, notImplemented);
importRouter.post('/confirm', requireAuth, notImplemented);
