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
