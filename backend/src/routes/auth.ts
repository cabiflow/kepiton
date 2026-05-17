import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

authRouter.get('/me', requireAuth, (request, response) => {
  response.json({ user: request.user });
});
