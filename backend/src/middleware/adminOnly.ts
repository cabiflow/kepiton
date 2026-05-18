import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export async function requireAdmin(request: Request, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      response.status(401).json({ error: 'Vui lòng đăng nhập để tiếp tục.', code: 'UNAUTHORIZED' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      response.status(403).json({
        error: 'Bạn không có quyền thực hiện thao tác này.',
        code: 'FORBIDDEN',
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
}
