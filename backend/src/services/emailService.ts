import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ html, subject, to }: SendEmailInput) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'Kepiton <no-reply@kepiton.onrender.com>',
    to,
    subject,
    html,
  });
}
