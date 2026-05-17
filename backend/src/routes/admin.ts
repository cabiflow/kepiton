import { Router } from 'express';
import { requireAdmin } from '../middleware/adminOnly.js';
import { requireAuth } from '../middleware/auth.js';
import { notImplemented } from '../utils/http.js';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);
adminRouter.get('/payments', notImplemented);
adminRouter.patch('/payments/:id/confirm', notImplemented);
adminRouter.patch('/payments/:id/reject', notImplemented);
adminRouter.patch('/users/:id/deactivate', notImplemented);
adminRouter.get('/users', notImplemented);
