import type { NextFunction, Request, Response } from 'express';
import { isSupabaseConfigured, supabaseAdmin } from '../lib/supabase.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function requireAuth(request: Request, response: Response, next: NextFunction) {
  if (!isSupabaseConfigured()) {
    response.status(500).json({
      error: 'Hệ thống chưa được cấu hình đăng nhập, vui lòng thử lại sau.',
      code: 'AUTH_NOT_CONFIGURED',
    });
    return;
  }

  const token = request.header('authorization')?.replace('Bearer ', '');

  if (!token) {
    response.status(401).json({ error: 'Vui lòng đăng nhập để tiếp tục.', code: 'UNAUTHORIZED' });
    return;
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user.email) {
    response.status(401).json({ error: 'Vui lòng đăng nhập để tiếp tục.', code: 'UNAUTHORIZED' });
    return;
  }

  request.user = {
    id: data.user.id,
    email: data.user.email,
  };
  next();
}
