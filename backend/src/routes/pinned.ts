import { EntityType, ProjectStatus } from '@prisma/client';
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, sendError } from '../utils/http.js';
import { pinnedDeadlineSchema } from '../utils/validation.js';

export const pinnedRouter = Router();

async function findPinnedEntity(entityType: EntityType, entityId: string, userId: string) {
  if (entityType === EntityType.PROJECT) {
    const project = await prisma.project.findFirst({
      where: {
        id: entityId,
        userId,
        status: { not: ProjectStatus.DELETED },
      },
      select: {
        id: true,
        name: true,
        deadline: true,
        createdAt: true,
      },
    });

    if (!project) {
      return null;
    }

    return {
      entityType,
      entityId: project.id,
      name: project.name,
      deadline: project.deadline,
      createdAt: project.createdAt,
    };
  }

  const task = await prisma.task.findFirst({
    where: {
      id: entityId,
      project: {
        userId,
        status: { not: ProjectStatus.DELETED },
      },
    },
    select: {
      id: true,
      name: true,
      deadline: true,
      createdAt: true,
    },
  });

  if (!task) {
    return null;
  }

  return {
    entityType,
    entityId: task.id,
    name: task.name,
    deadline: task.deadline,
    createdAt: task.createdAt,
  };
}

pinnedRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (request, response) => {
    if (!request.user) {
      sendError(response, 401, 'Vui lòng đăng nhập để tiếp tục.', 'UNAUTHORIZED');
      return;
    }

    const pinnedDeadline = await prisma.pinnedDeadline.findUnique({
      where: { userId: request.user.id },
    });

    if (!pinnedDeadline) {
      response.json({ pinned: null });
      return;
    }

    const pinned = await findPinnedEntity(
      pinnedDeadline.entityType,
      pinnedDeadline.entityId,
      request.user.id,
    );

    if (!pinned) {
      await prisma.pinnedDeadline.delete({ where: { userId: request.user.id } });
      response.json({ pinned: null });
      return;
    }

    response.json({ pinned });
  }),
);

pinnedRouter.post(
  '/',
  requireAuth,
  asyncHandler(async (request, response) => {
    if (!request.user) {
      sendError(response, 401, 'Vui lòng đăng nhập để tiếp tục.', 'UNAUTHORIZED');
      return;
    }

    const body = pinnedDeadlineSchema.parse(request.body);
    const entityType = body.entityType === 'PROJECT' ? EntityType.PROJECT : EntityType.TASK;
    const pinned = await findPinnedEntity(entityType, body.entityId, request.user.id);

    if (!pinned) {
      sendError(response, 404, 'Không tìm thấy deadline cần ghim.', 'PINNED_ENTITY_NOT_FOUND');
      return;
    }

    await prisma.pinnedDeadline.upsert({
      where: { userId: request.user.id },
      create: {
        userId: request.user.id,
        entityType,
        entityId: body.entityId,
      },
      update: {
        entityType,
        entityId: body.entityId,
      },
    });

    response.json({ pinned });
  }),
);

pinnedRouter.delete(
  '/',
  requireAuth,
  asyncHandler(async (request, response) => {
    if (!request.user) {
      sendError(response, 401, 'Vui lòng đăng nhập để tiếp tục.', 'UNAUTHORIZED');
      return;
    }

    await prisma.pinnedDeadline.deleteMany({ where: { userId: request.user.id } });
    response.status(204).send();
  }),
);
