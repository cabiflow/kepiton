import { PaymentStatus } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { sendPaymentReceivedEmail } from '../services/emailService.js';
import { asyncHandler, sendError } from '../utils/http.js';

export const paymentRouter = Router();

function getPaymentAmountVnd() {
  return Number(process.env.PAYMENT_AMOUNT_VND ?? 299000);
}

function getBankInfo() {
  return {
    bankName: process.env.BANK_NAME ?? 'Ngân hàng TMCP Sài Gòn Hà Nội (SHB)',
    accountNumber: process.env.BANK_ACCOUNT_NUMBER ?? '0356476269',
    accountName: process.env.BANK_ACCOUNT_NAME ?? 'NGUYEN ANH DUC',
  };
}

function createReferenceCode() {
  return randomBytes(4).toString('hex').toUpperCase();
}

paymentRouter.post(
  '/request',
  requireAuth,
  asyncHandler(async (request, response) => {
    if (!request.user) {
      sendError(response, 401, 'Vui lòng đăng nhập để tiếp tục.', 'UNAUTHORIZED');
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
      select: { email: true, tier: true },
    });

    if (!user) {
      sendError(response, 401, 'Vui lòng đăng nhập để tiếp tục.', 'UNAUTHORIZED');
      return;
    }

    if (user.tier === 'PRO') {
      sendError(response, 409, 'Tài khoản của bạn đã là gói Pro.', 'ALREADY_PRO');
      return;
    }

    const pendingRequest = await prisma.paymentRequest.findFirst({
      where: {
        userId: request.user.id,
        status: PaymentStatus.PENDING,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (pendingRequest) {
      response.json({
        paymentRequest: pendingRequest,
        amountVnd: pendingRequest.amountVnd,
        bankInfo: getBankInfo(),
        transferContent: `KEPITON ${pendingRequest.referenceCode}`,
      });
      return;
    }

    const paymentRequest = await prisma.paymentRequest.create({
      data: {
        userId: request.user.id,
        amountVnd: getPaymentAmountVnd(),
        referenceCode: createReferenceCode(),
      },
    });

    await sendPaymentReceivedEmail(user.email, paymentRequest.referenceCode);

    response.status(201).json({
      paymentRequest,
      amountVnd: paymentRequest.amountVnd,
      bankInfo: getBankInfo(),
      transferContent: `KEPITON ${paymentRequest.referenceCode}`,
    });
  }),
);

paymentRouter.get(
  '/status',
  requireAuth,
  asyncHandler(async (request, response) => {
    if (!request.user) {
      sendError(response, 401, 'Vui lòng đăng nhập để tiếp tục.', 'UNAUTHORIZED');
      return;
    }

    const paymentRequest = await prisma.paymentRequest.findFirst({
      where: { userId: request.user.id },
      orderBy: { createdAt: 'desc' },
    });

    response.json({
      paymentRequest,
      amountVnd: getPaymentAmountVnd(),
      bankInfo: getBankInfo(),
      transferContent: paymentRequest ? `KEPITON ${paymentRequest.referenceCode}` : null,
    });
  }),
);
