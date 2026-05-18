import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export async function enforceFreeProjectLimit(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    if (!request.user) {
      response.status(401).json({ error: 'Vui lòng đăng nhập để tiếp tục.', code: 'UNAUTHORIZED' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
      select: { tier: true },
    });

    if (!user) {
      response.status(401).json({ error: 'Vui lòng đăng nhập để tiếp tục.', code: 'UNAUTHORIZED' });
      return;
    }

    const totalCreated = await prisma.project.count({
      where: { userId: request.user.id },
    });

    if (user.tier === 'FREE' && totalCreated >= 3) {
      response.status(403).json({
        error: 'Bạn đã đạt giới hạn 3 dự án của gói miễn phí. Nâng cấp Pro để tạo thêm.',
        code: 'FREE_PROJECT_LIMIT',
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
}
