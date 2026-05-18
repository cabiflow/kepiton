import { ProjectStatus } from '@prisma/client';
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, sendError } from '../utils/http.js';

export const shareRouter = Router();

function getShareUuid(request: { params: { uuid?: string } }) {
  return request.params.uuid;
}

shareRouter.get(
  '/:uuid',
  asyncHandler(async (request, response) => {
    const uuid = getShareUuid(request);
    if (!uuid) {
      sendError(response, 400, 'Mã chia sẻ không hợp lệ.', 'INVALID_SHARE_ID');
      return;
    }

    const shareLink = await prisma.shareLink.findUnique({
      where: { id: uuid },
      include: {
        project: {
          include: {
            milestone: true,
            tasks: {
              orderBy: { deadline: 'asc' },
            },
          },
        },
      },
    });

    const now = new Date();
    if (
      !shareLink ||
      shareLink.isRevoked ||
      (shareLink.expiresAt && shareLink.expiresAt <= now) ||
      shareLink.project.status === ProjectStatus.DELETED
    ) {
      sendError(response, 410, 'Liên kết này đã hết hạn hoặc đã bị thu hồi.', 'SHARE_LINK_GONE');
      return;
    }

    response.json({
      project: {
        id: shareLink.project.id,
        name: shareLink.project.name,
        description: shareLink.project.description,
        deadline: shareLink.project.deadline,
        createdAt: shareLink.project.createdAt,
        milestone: shareLink.project.milestone,
        tasks: shareLink.project.tasks,
      },
      share: {
        id: shareLink.id,
        expiresAt: shareLink.expiresAt,
        createdAt: shareLink.createdAt,
      },
    });
  }),
);

shareRouter.delete(
  '/:uuid',
  requireAuth,
  asyncHandler(async (request, response) => {
    if (!request.user) {
      sendError(response, 401, 'Vui lòng đăng nhập để tiếp tục.', 'UNAUTHORIZED');
      return;
    }

    const uuid = getShareUuid(request);
    if (!uuid) {
      sendError(response, 400, 'Mã chia sẻ không hợp lệ.', 'INVALID_SHARE_ID');
      return;
    }

    const shareLink = await prisma.shareLink.findFirst({
      where: {
        id: uuid,
        project: {
          userId: request.user.id,
          status: { not: ProjectStatus.DELETED },
        },
      },
      select: { id: true },
    });

    if (!shareLink) {
      sendError(response, 404, 'Không tìm thấy liên kết chia sẻ.', 'SHARE_LINK_NOT_FOUND');
      return;
    }

    await prisma.shareLink.update({
      where: { id: shareLink.id },
      data: { isRevoked: true },
    });

    response.status(204).send();
  }),
);
