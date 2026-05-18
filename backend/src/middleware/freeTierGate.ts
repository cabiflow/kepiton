import type { NextFunction, Request, Response } from 'express';
import { Tier } from '@prisma/client';
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

export async function enforceFreeImportLimit(
  projectId: string,
  userId: string,
  response: Response,
) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
      status: { not: 'DELETED' },
    },
    select: {
      id: true,
      user: {
        select: { tier: true },
      },
    },
  });

  if (!project) {
    response.status(404).json({ error: 'Không tìm thấy dự án.', code: 'PROJECT_NOT_FOUND' });
    return false;
  }

  if (project.user.tier === Tier.PRO) {
    return true;
  }

  const usage = await prisma.importUsage.findUnique({
    where: {
      projectId_monthKey: {
        projectId,
        monthKey: getCurrentMonthKey(),
      },
    },
    select: { count: true },
  });

  if ((usage?.count ?? 0) >= 10) {
    response.status(403).json({
      error: 'Bạn đã dùng hết 10 lượt import tháng này. Sẽ được đặt lại vào ngày 1 tháng sau.',
      code: 'FREE_IMPORT_LIMIT',
    });
    return false;
  }

  return true;
}

export async function incrementImportUsage(projectId: string) {
  await prisma.importUsage.upsert({
    where: {
      projectId_monthKey: {
        projectId,
        monthKey: getCurrentMonthKey(),
      },
    },
    create: {
      projectId,
      monthKey: getCurrentMonthKey(),
      count: 1,
    },
    update: {
      count: { increment: 1 },
    },
  });
}

function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}
