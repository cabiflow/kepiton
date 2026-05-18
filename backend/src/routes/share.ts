import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { notImplemented } from '../utils/http.js';

export const shareRouter = Router();

shareRouter.get('/:uuid', notImplemented);
shareRouter.delete('/:uuid', requireAuth, notImplemented);
