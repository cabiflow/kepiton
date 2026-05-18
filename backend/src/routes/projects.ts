import { ProjectStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { enforceFreeProjectLimit } from '../middleware/freeTierGate.js';
import { asyncHandler, notImplemented, sendError } from '../utils/http.js';
import {
  milestoneSchema,
  projectCreateSchema,
  projectUpdateSchema,
  taskCreateSchema,
  toDate,
} from '../utils/validation.js';

export const projectsRouter = Router();

const projectDetailInclude = {
  milestone: true,
  tasks: {
    orderBy: { deadline: 'asc' },
  },
} satisfies Prisma.ProjectInclude;

function getProjectId(request: { params: { id?: string } }) {
  return request.params.id;
}

projectsRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (request, response) => {
    if (!request.user) {
      sendError(response, 401, 'Vui lòng đăng nhập để tiếp tục.', 'UNAUTHORIZED');
      return;
    }

    const projects = await prisma.project.findMany({
      where: {
        userId: request.user.id,
        status: ProjectStatus.ACTIVE,
      },
      orderBy: { deadline: 'asc' },
      include: {
        milestone: true,
        tasks: {
          where: { status: { not: 'COMPLETED' } },
          orderBy: { deadline: 'asc' },
        },
      },
    });

    response.json({ projects });
  }),
);

projectsRouter.post(
  '/',
  requireAuth,
  enforceFreeProjectLimit,
  asyncHandler(async (request, response) => {
    if (!request.user) {
      sendError(response, 401, 'Vui lòng đăng nhập để tiếp tục.', 'UNAUTHORIZED');
      return;
    }

    const body = projectCreateSchema.parse(request.body);
    const data: Prisma.ProjectUncheckedCreateInput = {
      userId: request.user.id,
      name: body.name,
      deadline: toDate(body.deadline),
    };
    if (body.description !== undefined) {
      data.description = body.description;
    }

    const project = await prisma.project.create({
      data,
      include: projectDetailInclude,
    });

    response.status(201).json({ project });
  }),
);

projectsRouter.get(
  '/:id',
  requireAuth,
  asyncHandler(async (request, response) => {
    if (!request.user) {
      sendError(response, 401, 'Vui lòng đăng nhập để tiếp tục.', 'UNAUTHORIZED');
      return;
    }

    const projectId = getProjectId(request);
    if (!projectId) {
      sendError(response, 400, 'Mã dự án không hợp lệ.', 'INVALID_PROJECT_ID');
      return;
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: request.user.id,
        status: { not: ProjectStatus.DELETED },
      },
      include: projectDetailInclude,
    });

    if (!project) {
      sendError(response, 404, 'Không tìm thấy dự án.', 'PROJECT_NOT_FOUND');
      return;
    }

    response.json({ project });
  }),
);

projectsRouter.put(
  '/:id',
  requireAuth,
  asyncHandler(async (request, response) => {
    if (!request.user) {
      sendError(response, 401, 'Vui lòng đăng nhập để tiếp tục.', 'UNAUTHORIZED');
      return;
    }

    const body = projectUpdateSchema.parse(request.body);
    const projectId = getProjectId(request);
    if (!projectId) {
      sendError(response, 400, 'Mã dự án không hợp lệ.', 'INVALID_PROJECT_ID');
      return;
    }

    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: request.user.id,
        status: { not: ProjectStatus.DELETED },
      },
    });

    if (!existingProject) {
      sendError(response, 404, 'Không tìm thấy dự án.', 'PROJECT_NOT_FOUND');
      return;
    }

    const milestone = await prisma.milestone.findUnique({
      where: { projectId: existingProject.id },
      select: { deadline: true },
    });
    const nextDeadline = body.deadline ? toDate(body.deadline) : existingProject.deadline;
    if (milestone && milestone.deadline > nextDeadline) {
      sendError(
        response,
        400,
        'Deadline giai đoạn không được vượt quá deadline dự án.',
        'MILESTONE_TOO_LATE',
      );
      return;
    }

    const data: Prisma.ProjectUpdateInput = {};
    if (body.name !== undefined) {
      data.name = body.name;
    }
    if (body.description !== undefined) {
      data.description = body.description;
    }
    if (body.deadline !== undefined) {
      data.deadline = nextDeadline;
    }

    const project = await prisma.project.update({
      where: { id: existingProject.id },
      data,
      include: projectDetailInclude,
    });

    response.json({ project });
  }),
);

projectsRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (request, response) => {
    if (!request.user) {
      sendError(response, 401, 'Vui lòng đăng nhập để tiếp tục.', 'UNAUTHORIZED');
      return;
    }

    const projectId = getProjectId(request);
    if (!projectId) {
      sendError(response, 400, 'Mã dự án không hợp lệ.', 'INVALID_PROJECT_ID');
      return;
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: request.user.id,
        status: { not: ProjectStatus.DELETED },
      },
      select: { id: true },
    });

    if (!project) {
      sendError(response, 404, 'Không tìm thấy dự án.', 'PROJECT_NOT_FOUND');
      return;
    }

    await prisma.project.update({
      where: { id: project.id },
      data: { status: ProjectStatus.DELETED },
    });

    response.status(204).send();
  }),
);

projectsRouter.post(
  '/:id/archive',
  requireAuth,
  asyncHandler(async (request, response) => {
    if (!request.user) {
      sendError(response, 401, 'Vui lòng đăng nhập để tiếp tục.', 'UNAUTHORIZED');
      return;
    }

    const projectId = getProjectId(request);
    if (!projectId) {
      sendError(response, 400, 'Mã dự án không hợp lệ.', 'INVALID_PROJECT_ID');
      return;
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: request.user.id,
        status: ProjectStatus.ACTIVE,
      },
      select: { id: true },
    });

    if (!project) {
      sendError(response, 404, 'Không tìm thấy dự án.', 'PROJECT_NOT_FOUND');
      return;
    }

    const archivedProject = await prisma.project.update({
      where: { id: project.id },
      data: { status: ProjectStatus.ARCHIVED },
      include: projectDetailInclude,
    });

    response.json({ project: archivedProject });
  }),
);

projectsRouter.post(
  '/:id/milestone',
  requireAuth,
  asyncHandler(async (request, response) => {
    if (!request.user) {
      sendError(response, 401, 'Vui lòng đăng nhập để tiếp tục.', 'UNAUTHORIZED');
      return;
    }

    const body = milestoneSchema.parse(request.body);
    const projectId = getProjectId(request);
    if (!projectId) {
      sendError(response, 400, 'Mã dự án không hợp lệ.', 'INVALID_PROJECT_ID');
      return;
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: request.user.id,
        status: { not: ProjectStatus.DELETED },
      },
    });

    if (!project) {
      sendError(response, 404, 'Không tìm thấy dự án.', 'PROJECT_NOT_FOUND');
      return;
    }

    const existingMilestone = await prisma.milestone.findUnique({
      where: { projectId: project.id },
      select: { id: true },
    });

    if (existingMilestone) {
      sendError(response, 409, 'Dự án này đã có giai đoạn.', 'MILESTONE_EXISTS');
      return;
    }

    const milestoneDeadline = toDate(body.deadline);
    if (milestoneDeadline > project.deadline) {
      sendError(
        response,
        400,
        'Deadline giai đoạn không được vượt quá deadline dự án.',
        'MILESTONE_TOO_LATE',
      );
      return;
    }

    const milestone = await prisma.milestone.create({
      data: {
        projectId: project.id,
        name: body.name,
        deadline: milestoneDeadline,
      },
    });

    response.status(201).json({ milestone });
  }),
);

projectsRouter.put(
  '/:id/milestone',
  requireAuth,
  asyncHandler(async (request, response) => {
    if (!request.user) {
      sendError(response, 401, 'Vui lòng đăng nhập để tiếp tục.', 'UNAUTHORIZED');
      return;
    }

    const body = milestoneSchema.parse(request.body);
    const projectId = getProjectId(request);
    if (!projectId) {
      sendError(response, 400, 'Mã dự án không hợp lệ.', 'INVALID_PROJECT_ID');
      return;
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: request.user.id,
        status: { not: ProjectStatus.DELETED },
      },
    });

    if (!project) {
      sendError(response, 404, 'Không tìm thấy dự án.', 'PROJECT_NOT_FOUND');
      return;
    }

    const existingMilestone = await prisma.milestone.findUnique({
      where: { projectId: project.id },
      select: { id: true },
    });

    if (!existingMilestone) {
      sendError(response, 404, 'Không tìm thấy giai đoạn.', 'MILESTONE_NOT_FOUND');
      return;
    }

    const milestoneDeadline = toDate(body.deadline);
    if (milestoneDeadline > project.deadline) {
      sendError(
        response,
        400,
        'Deadline giai đoạn không được vượt quá deadline dự án.',
        'MILESTONE_TOO_LATE',
      );
      return;
    }

    const milestone = await prisma.milestone.update({
      where: { projectId: project.id },
      data: {
        name: body.name,
        deadline: milestoneDeadline,
      },
    });

    response.json({ milestone });
  }),
);

projectsRouter.post(
  '/:id/tasks',
  requireAuth,
  asyncHandler(async (request, response) => {
    if (!request.user) {
      sendError(response, 401, 'Vui lòng đăng nhập để tiếp tục.', 'UNAUTHORIZED');
      return;
    }

    const body = taskCreateSchema.parse(request.body);
    const projectId = getProjectId(request);
    if (!projectId) {
      sendError(response, 400, 'Mã dự án không hợp lệ.', 'INVALID_PROJECT_ID');
      return;
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: request.user.id,
        status: { not: ProjectStatus.DELETED },
      },
      select: { id: true },
    });

    if (!project) {
      sendError(response, 404, 'Không tìm thấy dự án.', 'PROJECT_NOT_FOUND');
      return;
    }

    if (body.milestoneId) {
      const milestone = await prisma.milestone.findFirst({
        where: {
          id: body.milestoneId,
          projectId: project.id,
        },
        select: { id: true },
      });

      if (!milestone) {
        sendError(response, 404, 'Không tìm thấy giai đoạn.', 'MILESTONE_NOT_FOUND');
        return;
      }
    }

    const data: Prisma.TaskUncheckedCreateInput = {
      projectId: project.id,
      name: body.name,
      deadline: toDate(body.deadline),
    };
    if (body.milestoneId) {
      data.milestoneId = body.milestoneId;
    }
    if (body.assigneeName) {
      data.assigneeName = body.assigneeName;
    }
    if (body.notes) {
      data.notes = body.notes;
    }

    const task = await prisma.task.create({ data });

    response.status(201).json({ task });
  }),
);

projectsRouter.post('/:id/share', requireAuth, notImplemented);
