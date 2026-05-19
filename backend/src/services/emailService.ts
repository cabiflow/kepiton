import { Resend } from 'resend';
import { logger } from '../lib/logger.js';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ html, subject, to }: SendEmailInput) {
  if (!process.env.RESEND_API_KEY) {
    logger.info(`Email chưa được gửi vì thiếu RESEND_API_KEY: ${subject}`);
    return { id: null };
  }

  return resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'Kepiton <no-reply@kepiton.onrender.com>',
    to,
    subject,
    html,
  });
}

function buildEmailHtml(title: string, body: string) {
  return `
    <div style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.6; max-width: 560px;">
      <h1 style="font-size: 22px; margin: 0 0 12px;">${title}</h1>
      <p style="font-size: 15px; margin: 0 0 16px;">${body}</p>
      <a href="https://kepiton.onrender.com" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 10px 14px; border-radius: 8px; font-weight: 700;">Mở Kepiton</a>
    </div>
  `;
}

export async function sendPaymentReceivedEmail(to: string, referenceCode: string) {
  await sendEmail({
    to,
    subject: 'Kepiton đã nhận yêu cầu nâng cấp của bạn',
    html: buildEmailHtml(
      'Kepiton đã nhận yêu cầu nâng cấp',
      `Yêu cầu nâng cấp Pro của bạn đã được tạo. Vui lòng chuyển khoản với nội dung KEPITON ${referenceCode}. PO sẽ kiểm tra và kích hoạt Pro sau khi nhận được thanh toán.`,
    ),
  });
}

export async function sendPaymentConfirmedEmail(to: string) {
  await sendEmail({
    to,
    subject: '🎉 Tài khoản Pro của bạn đã được kích hoạt!',
    html: buildEmailHtml(
      'Tài khoản Pro đã được kích hoạt',
      'Cảm ơn bạn đã nâng cấp Kepiton Pro. Tài khoản của bạn hiện đã có quyền Pro.',
    ),
  });
}

export async function sendPaymentRejectedEmail(to: string, note?: string | null) {
  await sendEmail({
    to,
    subject: 'Thông báo về yêu cầu nâng cấp Kepiton',
    html: buildEmailHtml(
      'Yêu cầu nâng cấp chưa được xác nhận',
      note
        ? `Yêu cầu nâng cấp của bạn đã bị từ chối. Lý do: ${note}`
        : 'Yêu cầu nâng cấp của bạn đã bị từ chối. Vui lòng kiểm tra lại thông tin chuyển khoản và thử lại.',
    ),
  });
}

export async function sendProDeactivatedEmail(to: string) {
  await sendEmail({
    to,
    subject: 'Thông báo: Tài khoản Pro của bạn đã kết thúc',
    html: buildEmailHtml(
      'Tài khoản Pro đã kết thúc',
      'Tài khoản của bạn đã được chuyển về gói Free. Bạn vẫn có thể tiếp tục dùng Kepiton với giới hạn của gói miễn phí.',
    ),
  });
}
