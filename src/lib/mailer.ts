import nodemailer from 'nodemailer'

function getMailer() {
  const host = process.env.EMAIL_SERVER_HOST
  const port = parseInt(process.env.EMAIL_SERVER_PORT || '587', 10)
  const secure = process.env.EMAIL_SERVER_SECURE === 'true'
  const user = process.env.EMAIL_SERVER_USER
  const pass = process.env.EMAIL_SERVER_PASSWORD

  if (!host || !user || !pass) {
    throw new Error('Email server configuration is incomplete')
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  })
}

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.EMAIL_FROM) {
    console.warn('EMAIL_FROM not set, skipping email send')
    return
  }

  const mailer = getMailer()
  await mailer.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  })
}
