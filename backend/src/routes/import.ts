import crypto from 'node:crypto';
import { ProjectStatus } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import multer from 'multer';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { enforceFreeImportLimit } from '../middleware/freeTierGate.js';
import { parseFileWithClaude } from '../services/claudeParser.js';
import { extractImportText } from '../services/fileImportService.js';
import { saveImportDraft, takeImportDraft } from '../services/importDraftStore.js';
import { asyncHandler, sendError } from '../utils/http.js';
import { importConfirmSchema, importProjectSchema, importSheetsSchema } from '../utils/validation.js';

export const importRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    const extension = file.originalname.split('.').pop()?.toLowerCase();
    if (extension && ['xlsx', 'csv', 'docx'].includes(extension)) {
      callback(null, true);
      return;
    }

    callback(new Error('UNSUPPORTED_FILE_TYPE'));
  },
});

function uploadSingleFile(request: Request, response: Response, next: NextFunction) {
  upload.single('file')(request, response, (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      sendError(response, 400, 'File không được vượt quá 10MB.', 'FILE_TOO_LARGE');
      return;
    }

    if (error instanceof Error && error.message === 'UNSUPPORTED_FILE_TYPE') {
      sendError(response, 400, 'Chỉ hỗ trợ file xlsx, csv hoặc docx.', 'UNSUPPORTED_FILE_TYPE');
      return;
    }

    next(error);
  });
}

importRouter.post(
  '/file',
  requireAuth,
  uploadSingleFile,
  asyncHandler(async (request, response) => {
    if (!request.user) {
      sendError(response, 401, 'Vui lòng đăng nhập để tiếp tục.', 'UNAUTHORIZED');
      return;
    }
    const body = importProjectSchema.parse(request.body);
    if (!(await enforceFreeImportLimit(body.projectId, request.user.id, response))) {
      return;
    }

    if (!request.file) {
      sendError(response, 400, 'Vui lòng chọn file để import.', 'FILE_REQUIRED');
      return;
    }

    const fileContent = await extractImportText(request.file);
    if (!fileContent) {
      sendError(response, 400, 'File không có nội dung để đọc.', 'EMPTY_FILE');
      return;
    }

    const tasks = await parseFileWithClaude(fileContent);
    const importId = crypto.randomUUID();
    saveImportDraft({
      id: importId,
      userId: request.user.id,
      projectId: body.projectId,
      tasks,
      createdAt: new Date(),
    });

    response.json({ importId, tasks });
  }),
);

importRouter.post(
  '/sheets',
  requireAuth,
  asyncHandler(async (request, response) => {
    if (!request.user) {
      sendError(response, 401, 'Vui lòng đăng nhập để tiếp tục.', 'UNAUTHORIZED');
      return;
    }

    const body = importSheetsSchema.parse(request.body);
    if (!(await enforceFreeImportLimit(body.projectId, request.user.id, response))) {
      return;
    }

    const sheetContent = await fetchGoogleSheetContent(body.url);
    const tasks = await parseFileWithClaude(sheetContent);
    const importId = crypto.randomUUID();
    saveImportDraft({
      id: importId,
      userId: request.user.id,
      projectId: body.projectId,
      tasks,
      createdAt: new Date(),
    });

    response.json({ importId, tasks });
  }),
);

importRouter.post(
  '/confirm',
  requireAuth,
  asyncHandler(async (request, response) => {
    if (!request.user) {
      sendError(response, 401, 'Vui lòng đăng nhập để tiếp tục.', 'UNAUTHORIZED');
      return;
    }
    const userId = request.user.id;

    const body = importConfirmSchema.parse(request.body);
    const draft = takeImportDraft(body.importId, userId);
    if (!draft) {
      sendError(response, 404, 'Bản import đã hết hạn, vui lòng import lại.', 'IMPORT_DRAFT_EXPIRED');
      return;
    }

    const project = await prisma.project.findFirst({
      where: {
        id: draft.projectId,
        userId: request.user.id,
        status: { not: ProjectStatus.DELETED },
      },
      select: { id: true },
    });

    if (!project) {
      sendError(response, 404, 'Không tìm thấy dự án.', 'PROJECT_NOT_FOUND');
      return;
    }

    const validTasks = draft.tasks.filter((task) => task.deadline && isValidDate(task.deadline));
    if (validTasks.length === 0) {
      sendError(response, 400, 'Không có công việc nào đủ deadline để import.', 'NO_VALID_TASKS');
      return;
    }

    const tasks = await prisma.$transaction(async (transaction) => {
      const createdTasks = await Promise.all(
        validTasks.map((task) => {
          const data = {
            projectId: project.id,
            name: task.ten_task,
            deadline: new Date(task.deadline as string),
            ...(task.nguoi_phu_trach ? { assigneeName: task.nguoi_phu_trach } : {}),
          };

          return transaction.task.create({ data });
        }),
      );

      await transaction.importUsage.upsert({
        where: {
          projectId_monthKey: {
            projectId: project.id,
            monthKey: getCurrentMonthKey(),
          },
        },
        create: {
          projectId: project.id,
          monthKey: getCurrentMonthKey(),
          count: 1,
        },
        update: {
          count: { increment: 1 },
        },
      });

      await transaction.user.update({
        where: { id: userId },
        data: { uploadCount: { increment: 1 } },
      });

      return createdTasks;
    });

    response.status(201).json({ tasks, importedCount: tasks.length });
  }),
);

async function fetchGoogleSheetContent(url: string) {
  const exportUrl = toGoogleSheetsCsvUrl(url);
  const result = await fetch(exportUrl);

  if (!result.ok) {
    throw new Error('GOOGLE_SHEETS_FETCH_FAILED');
  }

  return result.text();
}

function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

function isValidDate(value: string) {
  return !Number.isNaN(new Date(value).getTime());
}

function toGoogleSheetsCsvUrl(url: string) {
  const parsedUrl = new URL(url);
  const match = parsedUrl.pathname.match(/\/spreadsheets\/d\/([^/]+)/);

  if (!match?.[1]) {
    return url;
  }

  const gid = parsedUrl.searchParams.get('gid') ?? '0';
  return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv&gid=${gid}`;
}
