import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { notImplemented } from '../utils/http.js';

export const paymentRouter = Router();

paymentRouter.post('/request', requireAuth, notImplemented);
paymentRouter.get('/status', requireAuth, notImplemented);
