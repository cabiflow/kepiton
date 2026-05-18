import { ProjectStatus, TaskStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, sendError } from '../utils/http.js';
import { taskUpdateSchema, toDate } from '../utils/validation.js';

export const tasksRouter = Router();

function getTaskId(request: { params: { id?: string } }) {
  return request.params.id;
}

tasksRouter.put(
  '/:id',
  requireAuth,
  asyncHandler(async (request, response) => {
    if (!request.user) {
      sendError(response, 401, 'Vui lòng đăng nhập để tiếp tục.', 'UNAUTHORIZED');
      return;
    }

    const body = taskUpdateSchema.parse(request.body);
    const taskId = getTaskId(request);
    if (!taskId) {
      sendError(response, 400, 'Mã công việc không hợp lệ.', 'INVALID_TASK_ID');
      return;
    }

    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          userId: request.user.id,
          status: { not: ProjectStatus.DELETED },
        },
      },
      select: {
        id: true,
        projectId: true,
      },
    });

    if (!existingTask) {
      sendError(response, 404, 'Không tìm thấy công việc.', 'TASK_NOT_FOUND');
      return;
    }

    if (body.milestoneId) {
      const milestone = await prisma.milestone.findFirst({
        where: {
          id: body.milestoneId,
          projectId: existingTask.projectId,
        },
        select: { id: true },
      });

      if (!milestone) {
        sendError(response, 404, 'Không tìm thấy giai đoạn.', 'MILESTONE_NOT_FOUND');
        return;
      }
    }

    const data: Prisma.TaskUpdateInput = {};
    if (body.name !== undefined) {
      data.name = body.name;
    }
    if (body.deadline !== undefined) {
      data.deadline = toDate(body.deadline);
    }
    if (Object.hasOwn(body, 'milestoneId')) {
      data.milestone = body.milestoneId
        ? { connect: { id: body.milestoneId } }
        : { disconnect: true };
    }
    if (body.assigneeName !== undefined) {
      data.assigneeName = body.assigneeName;
    }
    if (body.notes !== undefined) {
      data.notes = body.notes;
    }

    const task = await prisma.task.update({
      where: { id: existingTask.id },
      data,
    });

    response.json({ task });
  }),
);

tasksRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (request, response) => {
    if (!request.user) {
      sendError(response, 401, 'Vui lòng đăng nhập để tiếp tục.', 'UNAUTHORIZED');
      return;
    }

    const taskId = getTaskId(request);
    if (!taskId) {
      sendError(response, 400, 'Mã công việc không hợp lệ.', 'INVALID_TASK_ID');
      return;
    }

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          userId: request.user.id,
          status: { not: ProjectStatus.DELETED },
        },
      },
      select: { id: true },
    });

    if (!task) {
      sendError(response, 404, 'Không tìm thấy công việc.', 'TASK_NOT_FOUND');
      return;
    }

    await prisma.task.delete({ where: { id: task.id } });
    response.status(204).send();
  }),
);

tasksRouter.patch(
  '/:id/complete',
  requireAuth,
  asyncHandler(async (request, response) => {
    if (!request.user) {
      sendError(response, 401, 'Vui lòng đăng nhập để tiếp tục.', 'UNAUTHORIZED');
      return;
    }

    const taskId = getTaskId(request);
    if (!taskId) {
      sendError(response, 400, 'Mã công việc không hợp lệ.', 'INVALID_TASK_ID');
      return;
    }

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          userId: request.user.id,
          status: { not: ProjectStatus.DELETED },
        },
      },
      select: { id: true },
    });

    if (!task) {
      sendError(response, 404, 'Không tìm thấy công việc.', 'TASK_NOT_FOUND');
      return;
    }

    const completedTask = await prisma.task.update({
      where: { id: task.id },
      data: { status: TaskStatus.COMPLETED },
    });

    response.json({ task: completedTask });
  }),
);

tasksRouter.patch(
  '/:id/reopen',
  requireAuth,
  asyncHandler(async (request, response) => {
    if (!request.user) {
      sendError(response, 401, 'Vui lòng đăng nhập để tiếp tục.', 'UNAUTHORIZED');
      return;
    }

    const taskId = getTaskId(request);
    if (!taskId) {
      sendError(response, 400, 'Mã công việc không hợp lệ.', 'INVALID_TASK_ID');
      return;
    }

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          userId: request.user.id,
          status: { not: ProjectStatus.DELETED },
        },
      },
      select: { id: true },
    });

    if (!task) {
      sendError(response, 404, 'Không tìm thấy công việc.', 'TASK_NOT_FOUND');
      return;
    }

    const reopenedTask = await prisma.task.update({
      where: { id: task.id },
      data: { status: TaskStatus.ACTIVE },
    });

    response.json({ task: reopenedTask });
  }),
);
