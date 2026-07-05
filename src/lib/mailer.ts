import nodemailer from 'nodemailer'

export const mailer = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: process.env.EMAIL_SERVER_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.EMAIL_FROM) {
    console.warn('EMAIL_FROM not set, skipping email send')
    return
  }
  await mailer.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  })
}
