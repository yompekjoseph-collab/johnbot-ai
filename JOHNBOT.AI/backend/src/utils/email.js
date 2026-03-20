import nodemailer from 'nodemailer';

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM,
} = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT) || 587,
  secure: false,
  auth: SMTP_USER
    ? {
        user: SMTP_USER,
        pass: SMTP_PASS,
      }
    : undefined,
});

export async function sendOtpEmail(to, code) {
  const subject = 'Your Johnblex AI verification code';
  const text = `Your verification code is: ${code}. It expires in 5 minutes.`;
  const html = `<p>Your verification code is <strong>${code}</strong>.</p><p>It expires in 5 minutes.</p>`;

  const mail = {
    from: EMAIL_FROM || 'no-reply@johnblex.ai',
    to,
    subject,
    text,
    html,
  };

  await transporter.sendMail(mail);
}
