import { PaymentStatus, Tier } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAdmin } from '../middleware/adminOnly.js';
import { requireAuth } from '../middleware/auth.js';
import {
  sendPaymentConfirmedEmail,
  sendPaymentRejectedEmail,
  sendProDeactivatedEmail,
} from '../services/emailService.js';
import { asyncHandler, sendError } from '../utils/http.js';
import { adminRejectPaymentSchema } from '../utils/validation.js';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get(
  '/payments',
  asyncHandler(async (_request, response) => {
    const paymentRequests = await prisma.paymentRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            tier: true,
          },
        },
      },
    });

    response.json({ paymentRequests });
  }),
);

adminRouter.patch(
  '/payments/:id/confirm',
  asyncHandler(async (request, response) => {
    const paymentId = request.params.id;
    if (!paymentId) {
      sendError(response, 400, 'Mã yêu cầu thanh toán không hợp lệ.', 'INVALID_PAYMENT_ID');
      return;
    }

    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { id: paymentId },
      include: {
        user: {
          select: { id: true, email: true },
        },
      },
    });

    if (!paymentRequest) {
      sendError(response, 404, 'Không tìm thấy yêu cầu thanh toán.', 'PAYMENT_NOT_FOUND');
      return;
    }

    const updatedPayment = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: paymentRequest.userId },
        data: { tier: Tier.PRO },
      });

      return tx.paymentRequest.update({
        where: { id: paymentRequest.id },
        data: { status: PaymentStatus.CONFIRMED },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              tier: true,
            },
          },
        },
      });
    });

    await sendPaymentConfirmedEmail(paymentRequest.user.email);

    response.json({ paymentRequest: updatedPayment });
  }),
);

adminRouter.patch(
  '/payments/:id/reject',
  asyncHandler(async (request, response) => {
    const paymentId = request.params.id;
    if (!paymentId) {
      sendError(response, 400, 'Mã yêu cầu thanh toán không hợp lệ.', 'INVALID_PAYMENT_ID');
      return;
    }

    const body = adminRejectPaymentSchema.parse(request.body);
    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { id: paymentId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            tier: true,
          },
        },
      },
    });

    if (!paymentRequest) {
      sendError(response, 404, 'Không tìm thấy yêu cầu thanh toán.', 'PAYMENT_NOT_FOUND');
      return;
    }

    const data: Prisma.PaymentRequestUpdateInput = {
      status: PaymentStatus.REJECTED,
    };
    if (body.note !== undefined) {
      data.note = body.note;
    }

    const updatedPayment = await prisma.paymentRequest.update({
      where: { id: paymentRequest.id },
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            tier: true,
          },
        },
      },
    });

    await sendPaymentRejectedEmail(paymentRequest.user.email, body.note);

    response.json({ paymentRequest: updatedPayment });
  }),
);

adminRouter.patch(
  '/users/:id/deactivate',
  asyncHandler(async (request, response) => {
    const userId = request.params.id;
    if (!userId) {
      sendError(response, 400, 'Mã người dùng không hợp lệ.', 'INVALID_USER_ID');
      return;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { tier: Tier.FREE },
      select: {
        id: true,
        email: true,
        tier: true,
        isAdmin: true,
        createdAt: true,
      },
    });

    await sendProDeactivatedEmail(user.email);

    response.json({ user });
  }),
);

adminRouter.get(
  '/users',
  asyncHandler(async (_request, response) => {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        tier: true,
        isAdmin: true,
        uploadCount: true,
        createdAt: true,
      },
    });

    response.json({ users });
  }),
);
