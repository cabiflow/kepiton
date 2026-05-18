import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { isSupabaseConfigured, supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, sendError } from '../utils/http.js';
import { authEmailPasswordSchema, forgotPasswordSchema } from '../utils/validation.js';

export const authRouter = Router();

authRouter.post(
  '/register',
  asyncHandler(async (request, response) => {
    if (!isSupabaseConfigured()) {
      sendError(
        response,
        500,
        'Hệ thống chưa được cấu hình đăng nhập, vui lòng thử lại sau.',
        'AUTH_NOT_CONFIGURED',
      );
      return;
    }

    const body = authEmailPasswordSchema.parse(request.body);
    const { data, error } = await supabaseAdmin.auth.signUp({
      email: body.email,
      password: body.password,
    });

    if (error || !data.user?.email) {
      sendError(response, 400, 'Không thể đăng ký tài khoản, vui lòng thử lại.', 'REGISTER_FAILED');
      return;
    }

    const user = await prisma.user.upsert({
      where: { id: data.user.id },
      create: {
        id: data.user.id,
        email: data.user.email,
      },
      update: {
        email: data.user.email,
      },
    });

    response.status(201).json({ user, session: data.session });
  }),
);

authRouter.post(
  '/login',
  asyncHandler(async (request, response) => {
    if (!isSupabaseConfigured()) {
      sendError(
        response,
        500,
        'Hệ thống chưa được cấu hình đăng nhập, vui lòng thử lại sau.',
        'AUTH_NOT_CONFIGURED',
      );
      return;
    }

    const body = authEmailPasswordSchema.parse(request.body);
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (error || !data.user?.email) {
      sendError(response, 401, 'Email hoặc mật khẩu không đúng.', 'LOGIN_FAILED');
      return;
    }

    const user = await prisma.user.upsert({
      where: { id: data.user.id },
      create: {
        id: data.user.id,
        email: data.user.email,
      },
      update: {
        email: data.user.email,
      },
    });

    response.json({ user, session: data.session });
  }),
);

authRouter.post(
  '/logout',
  requireAuth,
  asyncHandler(async (request, response) => {
    const token = request.header('authorization')?.replace('Bearer ', '');
    if (!token) {
      sendError(response, 401, 'Vui lòng đăng nhập để tiếp tục.', 'UNAUTHORIZED');
      return;
    }

    const { error } = await supabaseAdmin.auth.admin.signOut(token);
    if (error) {
      sendError(response, 400, 'Không thể đăng xuất, vui lòng thử lại.', 'LOGOUT_FAILED');
      return;
    }

    response.status(204).send();
  }),
);

authRouter.post(
  '/forgot-password',
  asyncHandler(async (request, response) => {
    if (!isSupabaseConfigured()) {
      sendError(
        response,
        500,
        'Hệ thống chưa được cấu hình đăng nhập, vui lòng thử lại sau.',
        'AUTH_NOT_CONFIGURED',
      );
      return;
    }

    const body = forgotPasswordSchema.parse(request.body);
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(body.email);

    if (error) {
      sendError(
        response,
        400,
        'Không thể gửi email đặt lại mật khẩu, vui lòng thử lại.',
        'RESET_PASSWORD_FAILED',
      );
      return;
    }

    response.json({ ok: true });
  }),
);

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (request, response) => {
    if (!request.user) {
      sendError(response, 401, 'Vui lòng đăng nhập để tiếp tục.', 'UNAUTHORIZED');
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
      select: {
        id: true,
        email: true,
        tier: true,
        timezone: true,
        isAdmin: true,
        uploadCount: true,
        remindAt7Days: true,
        remindAt3Days: true,
        remindAt1Day: true,
        remindAtDeadline: true,
        dailyDigest: true,
        darkMode: true,
        createdAt: true,
      },
    });

    if (!user) {
      sendError(response, 401, 'Vui lòng đăng nhập để tiếp tục.', 'UNAUTHORIZED');
      return;
    }

    response.json({ user });
  }),
);
