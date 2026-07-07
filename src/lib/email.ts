import nodemailer from 'nodemailer'

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export interface EmailTemplateData {
  [key: string]: string | number
}

// Email templates
const templates = {
  welcome: (data: EmailTemplateData) => ({
    subject: 'Welcome to PawVault!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to PawVault!</h1>
        <p>Hi ${data.name || 'there'},</p>
        <p>Thank you for joining PawVault. We're excited to have you as part of our creator marketplace community.</p>
        <p>You can now:</p>
        <ul>
          <li>Browse and purchase digital products</li>
          <li>Create your own creator storefront</li>
          <li>Connect with other creators</li>
        </ul>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Get Started
          </a>
        </p>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br>The PawVault Team</p>
      </div>
    `,
  }),

  verifyEmail: (data: EmailTemplateData) => ({
    subject: 'Verify your email address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Verify your email address</h1>
        <p>Hi ${data.name || 'there'},</p>
        <p>Please verify your email address by clicking the button below:</p>
        <p>
          <a href="${data.verifyUrl}" 
             style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">${data.verifyUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <p>Best regards,<br>The PawVault Team</p>
      </div>
    `,
  }),

  passwordReset: (data: EmailTemplateData) => ({
    subject: 'Reset your password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Reset your password</h1>
        <p>Hi ${data.name || 'there'},</p>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <p>
          <a href="${data.resetUrl}" 
             style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">${data.resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        <p>Best regards,<br>The PawVault Team</p>
      </div>
    `,
  }),

  orderConfirmation: (data: EmailTemplateData) => ({
    subject: `Order Confirmation #${data.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Order Confirmation</h1>
        <p>Hi ${data.name || 'there'},</p>
        <p>Thank you for your purchase! Your order has been confirmed.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Order ID:</strong> ${data.orderId}</p>
          <p><strong>Total:</strong> $${data.total}</p>
        </div>
        <p>You can download your purchased items from your dashboard:</p>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/downloads" 
             style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Downloads
          </a>
        </p>
        <p>Best regards,<br>The PawVault Team</p>
      </div>
    `,
  }),

  refundNotification: (data: EmailTemplateData) => ({
    subject: `Refund Processed for Order #${data.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Refund Processed</h1>
        <p>Hi ${data.name || 'there'},</p>
        <p>Your refund for order #${data.orderId} has been processed.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Refund Amount:</strong> $${data.amount}</p>
          <p><strong>Reason:</strong> ${data.reason}</p>
        </div>
        <p>The refund should appear in your account within 5-10 business days.</p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>The PawVault Team</p>
      </div>
    `,
  }),

  productUpdate: (data: EmailTemplateData) => ({
    subject: `Update: ${data.productName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Product Update</h1>
        <p>Hi ${data.name || 'there'},</p>
        <p>A product you purchased has been updated:</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Product:</strong> ${data.productName}</p>
          <p><strong>Version:</strong> ${data.version}</p>
          <p><strong>Changes:</strong> ${data.changes}</p>
        </div>
        <p>
          <a href="${data.productUrl}" 
             style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Product
          </a>
        </p>
        <p>You can download the updated version from your dashboard.</p>
        <p>Best regards,<br>The PawVault Team</p>
      </div>
    `,
  }),

  payoutNotification: (data: EmailTemplateData) => ({
    subject: `Payout Processed - $${data.amount}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Payout Processed</h1>
        <p>Hi ${data.name || 'there'},</p>
        <p>Your payout has been processed successfully.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Amount:</strong> $${data.amount}</p>
          <p><strong>Method:</strong> ${data.method}</p>
          <p><strong>Period:</strong> ${data.period}</p>
        </div>
        <p>The funds should appear in your account within 3-5 business days.</p>
        <p>You can view your payout history in your dashboard.</p>
        <p>Best regards,<br>The PawVault Team</p>
      </div>
    `,
  }),

  accountWarning: (data: EmailTemplateData) => ({
    subject: 'Account Warning',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #d9534f;">Account Warning</h1>
        <p>Hi ${data.name || 'there'},</p>
        <p>We've detected an issue with your account that requires your attention.</p>
        <div style="background-color: #f8d7da; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Reason:</strong> ${data.reason}</p>
          <p><strong>Action Required:</strong> ${data.actionRequired}</p>
        </div>
        <p>Please address this issue within 7 days to avoid account suspension.</p>
        <p>If you believe this is a mistake, please contact our support team.</p>
        <p>Best regards,<br>The PawVault Team</p>
      </div>
    `,
  }),
}

// Create email transporter
function createTransporter() {
  if (!process.env.EMAIL_SERVER) {
    console.warn('EMAIL_SERVER not configured, emails will not be sent')
    return null
  }

  return nodemailer.createTransport(process.env.EMAIL_SERVER)
}

// Send email
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const transporter = createTransporter()
  
  if (!transporter) {
    console.warn('Email transporter not available')
    return false
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@pawvault.co.uk',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

// Send template email
export async function sendTemplateEmail(
  templateName: keyof typeof templates,
  to: string,
  data: EmailTemplateData
): Promise<boolean> {
  const template = templates[templateName]
  
  if (!template) {
    console.error(`Template ${templateName} not found`)
    return false
  }

  const { subject, html } = template(data)
  
  return sendEmail({
    to,
    subject,
    html,
  })
}

// Send welcome email
export async function sendWelcomeEmail(email: string, name?: string): Promise<boolean> {
  return sendTemplateEmail('welcome', email, { name: name || '' })
}

// Send verification email
export async function sendVerificationEmail(email: string, verifyUrl: string, name?: string): Promise<boolean> {
  return sendTemplateEmail('verifyEmail', email, { name: name || '', verifyUrl })
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, resetUrl: string, name?: string): Promise<boolean> {
  return sendTemplateEmail('passwordReset', email, { name: name || '', resetUrl })
}

// Send order confirmation email
export async function sendOrderConfirmationEmail(
  email: string,
  orderId: string,
  total: number,
  name?: string
): Promise<boolean> {
  return sendTemplateEmail('orderConfirmation', email, {
    name: name || '',
    orderId,
    total: total.toString(),
  })
}

// Send refund notification email
export async function sendRefundNotificationEmail(
  email: string,
  orderId: string,
  amount: number,
  reason: string,
  name?: string
): Promise<boolean> {
  return sendTemplateEmail('refundNotification', email, {
    name: name || '',
    orderId,
    amount: amount.toString(),
    reason,
  })
}

// Send product update email
export async function sendProductUpdateEmail(
  email: string,
  productName: string,
  version: string,
  changes: string,
  productUrl: string,
  name?: string
): Promise<boolean> {
  return sendTemplateEmail('productUpdate', email, {
    name: name || '',
    productName,
    version,
    changes,
    productUrl,
  })
}

// Send payout notification email
export async function sendPayoutNotificationEmail(
  email: string,
  amount: number,
  method: string,
  period: string,
  name?: string
): Promise<boolean> {
  return sendTemplateEmail('payoutNotification', email, {
    name: name || '',
    amount: amount.toString(),
    method,
    period,
  })
}

// Send account warning email
export async function sendAccountWarningEmail(
  email: string,
  reason: string,
  actionRequired: string,
  name?: string
): Promise<boolean> {
  return sendTemplateEmail('accountWarning', email, {
    name: name || '',
    reason,
    actionRequired,
  })
}
