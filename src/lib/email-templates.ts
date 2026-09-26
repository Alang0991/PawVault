import {
  EmailTemplateKey,
  EmailTemplateData,
} from "./email-types"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
const FROM_EMAIL = process.env.EMAIL_FROM || "noreply@pawvault.co.uk"
const BRAND_NAME = "PawVault"

function wrapHtml(html: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>${BRAND_NAME}</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f8f9fa;color:#1a1a2e;">
  <div style="max-width:600px;margin:0 auto;padding:20px;background-color:#ffffff;">
    <div style="padding:24px 0;border-bottom:2px solid #7c3aed;text-align:center;">
      <h1 style="margin:0;font-size:24px;color:#7c3aed;">PawVault</h1>
    </div>
    <div style="padding:24px 0;">
${html}
    </div>
    <div style="padding:24px 0;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px;text-align:center;">
      <p style="margin:0 0 8px;">
        &copy; ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.
      </p>
      <p style="margin:0 0 8px;">
        <a href="${APP_URL}" style="color:#7c3aed;text-decoration:none;">${APP_URL}</a>
      </p>
      <p style="margin:0;">
        <a href="${APP_URL}/privacy" style="color:#6b7280;text-decoration:none;">Privacy Policy</a>
        &nbsp;&middot;&nbsp;
        <a href="${APP_URL}/terms" style="color:#6b7280;text-decoration:none;">Terms of Service</a>
      </p>
    </div>
  </div>
</body>
</html>`
}

function button(text: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;padding:12px 24px;background-color:#7c3aed;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;margin:8px 0;">${text}</a>`
}

function header(text: string): string {
  return `<h2 style="color:#1a1a2e;margin:0 0 16px;font-size:20px;">${text}</h2>`
}

function paragraph(text: string): string {
  return `<p style="color:#374151;line-height:1.6;margin:0 0 16px;">${text}</p>`
}

function warning(text: string): string {
  return `<div style="background-color:#fef3c7;border:1px solid #f59e0b;border-radius:6px;padding:16px;margin:16px 0;">${text}</div>`
}

function errorBox(text: string): string {
  return `<div style="background-color:#fee2e2;border:1px solid #ef4444;border-radius:6px;padding:16px;margin:16px 0;">${text}</div>`
}

function successBox(text: string): string {
  return `<div style="background-color:#d1fae5;border:1px solid #10b981;border-radius:6px;padding:16px;margin:16px 0;">${text}</div>`
}

export interface RenderedEmail {
  subject: string
  html: string
  text: string
  from: string
}

type TemplateRenderer = (data: EmailTemplateData) => RenderedEmail

const templates: Partial<Record<EmailTemplateKey, TemplateRenderer>> = {
  EMAIL_VERIFICATION: (d) => ({
    subject: "Verify your email address",
    html: wrapHtml(`
      ${header("Verify Your Email Address")}
      ${paragraph(`Hi ${d.name || "there"},`)}
      ${paragraph("Please verify your email address by clicking the button below:")}
      <div style="text-align:center;margin:24px 0;">
        ${button("Verify Email", d.verifyUrl as string)}
      </div>
      ${paragraph(`Or copy and paste this link into your browser:<br><a href="${d.verifyUrl}" style="color:#7c3aed;word-break:break-all;">${d.verifyUrl}</a>`)}
      ${warning(`<strong>Important:</strong> This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.`)}
    `),
    text: `Hi ${d.name || "there"},\n\nPlease verify your email address by visiting:\n${d.verifyUrl}\n\nThis link will expire in 24 hours.\nIf you didn't create an account, you can safely ignore this email.\n\n${BRAND_NAME}`,
    from: FROM_EMAIL,
  }),

  PASSWORD_RESET: (d) => ({
    subject: "Reset your password",
    html: wrapHtml(`
      ${header("Reset Your Password")}
      ${paragraph(`Hi ${d.name || "there"},`)}
      ${paragraph("We received a request to reset your password. Click the button below to reset it:")}
      <div style="text-align:center;margin:24px 0;">
        ${button("Reset Password", d.resetUrl as string)}
      </div>
      ${paragraph(`Or copy and paste this link into your browser:<br><a href="${d.resetUrl}" style="color:#7c3aed;word-break:break-all;">${d.resetUrl}</a>`)}
      ${warning(`<strong>Important:</strong> This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.`)}
    `),
    text: `Hi ${d.name || "there"},\n\nWe received a request to reset your password.\nVisit this URL to reset it:\n${d.resetUrl}\n\nThis link will expire in 1 hour.\nIf you didn't request a password reset, you can safely ignore this email.\n\n${BRAND_NAME}`,
    from: FROM_EMAIL,
  }),

  PASSWORD_CHANGED: (d) => ({
    subject: "Your password has been changed",
    html: wrapHtml(`
      ${header("Password Changed")}
      ${paragraph(`Hi ${d.name || "there"},`)}
      ${successBox(`<strong>Your password was successfully changed.</strong>`)}
      ${paragraph("If this was you, no further action is needed.")}
      ${warning(`If this was <strong>not</strong> you, please contact support immediately.`)}
    `),
    text: `Hi ${d.name || "there"},\n\nYour password was successfully changed.\n\nIf this was you, no further action is needed.\nIf this was not you, please contact support immediately.\n\n${BRAND_NAME}`,
    from: FROM_EMAIL,
  }),

  ACCOUNT_WARNING: (d) => ({
    subject: "Account Warning - Action Required",
    html: wrapHtml(`
      ${header("Account Warning")}
      ${paragraph(`Hi ${d.name || "there"},`)}
      ${errorBox(`<strong>We've detected an issue with your account that requires your attention.</strong>`)}
      ${paragraph(`<strong>Reason:</strong> ${d.reason || "Please review your account."}`)}
      ${d.actionRequired ? paragraph(`<strong>Action Required:</strong> ${d.actionRequired}`) : ""}
      ${paragraph("Please address this issue within 7 days to avoid account suspension.")}
      ${paragraph("If you believe this is a mistake, please contact our support team.")}
      <div style="text-align:center;margin:24px 0;">
        ${button("Contact Support", `${APP_URL}/support`)}
      </div>
    `),
    text: `Hi ${d.name || "there"},\n\nWe've detected an issue with your account that requires your attention.\n\nReason: ${d.reason || "Please review your account."}\n${d.actionRequired ? `Action Required: ${d.actionRequired}\n` : ""}Please address this issue within 7 days to avoid account suspension.\nIf you believe this is a mistake, please contact support.\n\n${BRAND_NAME}`,
    from: FROM_EMAIL,
  }),

  ACCOUNT_BANNED: (d) => ({
    subject: "Your account has been banned",
    html: wrapHtml(`
      ${header("Account Banned")}
      ${paragraph(`Hi ${d.name || "there"},`)}
      ${errorBox(`<strong>Your account has been permanently banned from PawVault.</strong>`)}
      ${d.reason ? paragraph(`<strong>Reason:</strong> ${d.reason}`) : ""}
      ${paragraph("If you believe this decision was made in error, you may submit an appeal:")}
      <div style="text-align:center;margin:24px 0;">
        ${button("Submit Appeal", `${APP_URL}/moderation/appeal`)}
      </div>
    `),
    text: `Hi ${d.name || "there"},\n\nYour account has been permanently banned from PawVault.\n${d.reason ? `Reason: ${d.reason}\n` : ""}If you believe this decision was made in error, you may submit an appeal at:\n${APP_URL}/moderation/appeal\n\n${BRAND_NAME}`,
    from: FROM_EMAIL,
  }),

  ACCOUNT_SUSPENDED: (d) => ({
    subject: "Your account has been suspended",
    html: wrapHtml(`
      ${header("Account Suspended")}
      ${paragraph(`Hi ${d.name || "there"},`)}
      ${warning(`<strong>Your account has been temporarily suspended.</strong>`)}
      ${d.reason ? paragraph(`<strong>Reason:</strong> ${d.reason}`) : ""}
      ${d.suspendedUntil ? paragraph(`<strong>Suspension ends:</strong> ${new Date(d.suspendedUntil as string).toLocaleDateString()}`) : ""}
      ${paragraph("If you believe this decision was made in error, you may submit an appeal:")}
      <div style="text-align:center;margin:24px 0;">
        ${button("Submit Appeal", `${APP_URL}/moderation/appeal`)}
      </div>
    `),
    text: `Hi ${d.name || "there"},\n\nYour account has been temporarily suspended.\n${d.reason ? `Reason: ${d.reason}\n` : ""}${d.suspendedUntil ? `Suspension ends: ${new Date(d.suspendedUntil as string).toLocaleDateString()}\n` : ""}If you believe this was made in error, you may submit an appeal at:\n${APP_URL}/moderation/appeal\n\n${BRAND_NAME}`,
    from: FROM_EMAIL,
  }),

  WELCOME: (d) => ({
    subject: "Welcome to PawVault!",
    html: wrapHtml(`
      ${header("Welcome to PawVault!")}
      ${paragraph(`Hi ${d.name || "there"},`)}
      ${successBox(`<strong>Your account has been created successfully!</strong>`)}
      ${paragraph("Thank you for joining PawVault. We're excited to have you as part of our creator marketplace community.")}
      ${paragraph("You can now:")}
      <ul style="color:#374151;line-height:1.8;">
        <li>Browse and purchase digital products</li>
        <li>Create your own creator storefront</li>
        <li>Connect with other creators</li>
      </ul>
      <div style="text-align:center;margin:24px 0;">
        ${button("Get Started", `${APP_URL}/dashboard`)}
      </div>
    `),
    text: `Hi ${d.name || "there"},\n\nYour account has been created successfully!\n\nThank you for joining PawVault. We're excited to have you as part of our creator marketplace community.\n\nYou can now:\n- Browse and purchase digital products\n- Create your own creator storefront\n- Connect with other creators\n\nGet started: ${APP_URL}/dashboard\n\n${BRAND_NAME}`,
    from: FROM_EMAIL,
  }),

  ORDER_CONFIRMATION: (d) => ({
    subject: `Order Confirmation #${d.orderId}`,
    html: wrapHtml(`
      ${header("Order Confirmation")}
      ${paragraph(`Hi ${d.name || "there"},`)}
      ${successBox(`<strong>Thank you for your purchase!</strong> Your order has been confirmed.`)}
      <div style="background-color:#f3f4f6;border-radius:6px;padding:20px;margin:16px 0;">
        <p style="margin:0 0 8px;"><strong>Order ID:</strong> #${d.orderId}</p>
        <p style="margin:0 0 8px;"><strong>Total:</strong> ${d.currency || "USD"} ${d.total}</p>
        <p style="margin:0;"><strong>Date:</strong> ${d.orderDate || new Date().toLocaleDateString()}</p>
      </div>
      ${d.items ? `<div style="margin:16px 0;">${d.items}</div>` : ""}
      <div style="text-align:center;margin:24px 0;">
        ${button("View Order", `${APP_URL}/orders/${d.orderId}`)}
        ${button("Download Files", `${APP_URL}/downloads`)}
      </div>
    `),
    text: `Hi ${d.name || "there"},\n\nThank you for your purchase! Your order #${d.orderId} has been confirmed.\n\nOrder Total: ${d.currency || "USD"} ${d.total}\nDate: ${d.orderDate || new Date().toLocaleDateString()}\n\nView your order: ${APP_URL}/orders/${d.orderId}\nDownload files: ${APP_URL}/downloads\n\n${BRAND_NAME}`,
    from: FROM_EMAIL,
  }),

  REFUND_REQUESTED: (d) => ({
    subject: `Refund Requested for Order #${d.orderId}`,
    html: wrapHtml(`
      ${header("Refund Request Received")}
      ${paragraph(`Hi ${d.name || "there"},`)}
      ${paragraph(`We received your refund request for order #${d.orderId}.`)}
      ${d.reason ? paragraph(`<strong>Reason:</strong> ${d.reason}`) : ""}
      ${paragraph("We'll review your request and process it shortly. You'll receive an email notification once the refund has been processed.")}
      <div style="text-align:center;margin:24px 0;">
        ${button("View Order", `${APP_URL}/orders/${d.orderId}`)}
      </div>
    `),
    text: `Hi ${d.name || "there"},\n\nWe received your refund request for order #${d.orderId}.\n${d.reason ? `Reason: ${d.reason}\n` : ""}We'll review your request and process it shortly.\nYou'll receive an email notification once the refund has been processed.\n\nView order: ${APP_URL}/orders/${d.orderId}\n\n${BRAND_NAME}`,
    from: FROM_EMAIL,
  }),

  REFUND_APPROVED: (d) => ({
    subject: `Refund Approved for Order #${d.orderId}`,
    html: wrapHtml(`
      ${header("Refund Approved")}
      ${paragraph(`Hi ${d.name || "there"},`)}
      ${successBox(`<strong>Your refund request has been approved!</strong>`)}
      <div style="background-color:#f3f4f6;border-radius:6px;padding:20px;margin:16px 0;">
        <p style="margin:0 0 8px;"><strong>Order ID:</strong> #${d.orderId}</p>
        <p style="margin:0 0 8px;"><strong>Refund Amount:</strong> ${d.currency || "USD"} ${d.amount}</p>
        <p style="margin:0;"><strong>Status:</strong> Approved</p>
      </div>
      ${paragraph(`The refund should appear in your account within 5-10 business days.`)}
      <div style="text-align:center;margin:24px 0;">
        ${button("View Order", `${APP_URL}/orders/${d.orderId}`)}
      </div>
    `),
    text: `Hi ${d.name || "there"},\n\nYour refund request for order #${d.orderId} has been approved!\n\nRefund Amount: ${d.currency || "USD"} ${d.amount}\n\nThe refund should appear in your account within 5-10 business days.\n\nView order: ${APP_URL}/orders/${d.orderId}\n\n${BRAND_NAME}`,
    from: FROM_EMAIL,
  }),

  REFUND_REJECTED: (d) => ({
    subject: `Refund Decision for Order #${d.orderId}`,
    html: wrapHtml(`
      ${header("Refund Request Update")}
      ${paragraph(`Hi ${d.name || "there"},`)}
      ${paragraph(`We reviewed your refund request for order #${d.orderId}:`)}
      ${d.reason ? errorBox(`<strong>Decision:</strong> ${d.reason}`) : errorBox(`<strong>Decision:</strong> Refund request was not approved.`)}
      ${paragraph("If you have questions, please contact support.")}
      <div style="text-align:center;margin:24px 0;">
        ${button("Contact Support", `${APP_URL}/support`)}
      </div>
    `),
    text: `Hi ${d.name || "there"},\n\nWe reviewed your refund request for order #${d.orderId}.\n${d.reason ? `Decision: ${d.reason}\n` : "Decision: Refund request was not approved.\n"}If you have questions, please contact support: ${APP_URL}/support\n\n${BRAND_NAME}`,
    from: FROM_EMAIL,
  }),

  REFUND_COMPLETED: (d) => ({
    subject: `Refund Completed for Order #${d.orderId}`,
    html: wrapHtml(`
      ${header("Refund Completed")}
      ${paragraph(`Hi ${d.name || "there"},`)}
      ${successBox(`<strong>Your refund of ${d.currency || "USD"} ${d.amount} has been processed!</strong>`)}
      <div style="background-color:#f3f4f6;border-radius:6px;padding:20px;margin:16px 0;">
        <p style="margin:0 0 8px;"><strong>Order ID:</strong> #${d.orderId}</p>
        <p style="margin:0;"><strong>Refund Amount:</strong> ${d.currency || "USD"} ${d.amount}</p>
      </div>
      ${paragraph("The refund should appear in your account within 5-10 business days depending on your payment provider.")}
    `),
    text: `Hi ${d.name || "there"},\n\nYour refund of ${d.currency || "USD"} ${d.amount} for order #${d.orderId} has been processed!\n\nThe refund should appear in your account within 5-10 business days.\n\n${BRAND_NAME}`,
    from: FROM_EMAIL,
  }),

  PAYOUT_INITIATED: (d) => ({
    subject: `Payout Initiated - ${d.currency || "USD"} ${d.amount}`,
    html: wrapHtml(`
      ${header("Payout Initiated")}
      ${paragraph(`Hi ${d.name || "there"},`)}
      ${successBox(`<strong>Your payout has been initiated!</strong>`)}
      <div style="background-color:#f3f4f6;border-radius:6px;padding:20px;margin:16px 0;">
        <p style="margin:0 0 8px;"><strong>Amount:</strong> ${d.currency || "USD"} ${d.amount}</p>
        <p style="margin:0 0 8px;"><strong>Method:</strong> ${d.method || "Bank Transfer"}</p>
        <p style="margin:0;"><strong>Period:</strong> ${d.period || "Current period"}</p>
      </div>
      ${paragraph("The funds should appear in your account within 3-5 business days.")}
      <div style="text-align:center;margin:24px 0;">
        ${button("View Payouts", `${APP_URL}/creator/payouts`)}
      </div>
    `),
    text: `Hi ${d.name || "there"},\n\nYour payout of ${d.currency || "USD"} ${d.amount} has been initiated!\n\nMethod: ${d.method || "Bank Transfer"}\nPeriod: ${d.period || "Current period"}\n\nThe funds should appear in your account within 3-5 business days.\n\nView payouts: ${APP_URL}/creator/payouts\n\n${BRAND_NAME}`,
    from: FROM_EMAIL,
  }),

  PAYOUT_COMPLETED: (d) => ({
    subject: `Payout Completed - ${d.currency || "USD"} ${d.amount}`,
    html: wrapHtml(`
      ${header("Payout Completed")}
      ${paragraph(`Hi ${d.name || "there"},`)}
      ${successBox(`<strong>Your payout of ${d.currency || "USD"} ${d.amount} has been completed!</strong>`)}
      <div style="background-color:#f3f4f6;border-radius:6px;padding:20px;margin:16px 0;">
        <p style="margin:0 0 8px;"><strong>Amount:</strong> ${d.currency || "USD"} ${d.amount}</p>
        <p style="margin:0;"><strong>Method:</strong> ${d.method || "Bank Transfer"}</p>
      </div>
      <div style="text-align:center;margin:24px 0;">
        ${button("View Payout History", `${APP_URL}/creator/payouts`)}
      </div>
    `),
    text: `Hi ${d.name || "there"},\n\nYour payout of ${d.currency || "USD"} ${d.amount} has been completed!\n\nMethod: ${d.method || "Bank Transfer"}\n\nView payout history: ${APP_URL}/creator/payouts\n\n${BRAND_NAME}`,
    from: FROM_EMAIL,
  }),

  PAYOUT_FAILED: (d) => ({
    subject: "Payout Failed - Action Required",
    html: wrapHtml(`
      ${header("Payout Failed")}
      ${paragraph(`Hi ${d.name || "there"},`)}
      ${errorBox(`<strong>Your payout could not be processed.</strong>`)}
      ${d.reason ? paragraph(`<strong>Reason:</strong> ${d.reason}`) : ""}
      ${paragraph("Please update your payment information or contact support.")}
      <div style="text-align:center;margin:24px 0;">
        ${button("Update Payment Info", `${APP_URL}/creator/settings`)}
      </div>
    `),
    text: `Hi ${d.name || "there"},\n\nYour payout could not be processed.\n${d.reason ? `Reason: ${d.reason}\n` : ""}Please update your payment information or contact support:\n${APP_URL}/creator/settings\n\n${BRAND_NAME}`,
    from: FROM_EMAIL,
  }),

  CREATOR_APPLICATION_APPROVED: (d) => ({
    subject: "Your Creator Application Has Been Approved!",
    html: wrapHtml(`
      ${header("Welcome to the Creator Program!")}
      ${paragraph(`Hi ${d.name || "there"},`)}
      ${successBox(`<strong>Great news! Your creator application has been approved.</strong>`)}
      ${paragraph("You can now:")}
      <ul style="color:#374151;line-height:1.8;">
        <li>Create your storefront</li>
        <li>Upload and sell digital products</li>
        <li>Connect with buyers worldwide</li>
      </ul>
      <div style="text-align:center;margin:24px 0;">
        ${button("Go to Creator Dashboard", `${APP_URL}/creator/dashboard`)}
      </div>
    `),
    text: `Hi ${d.name || "there"},\n\nGreat news! Your creator application has been approved.\n\nYou can now:\n- Create your storefront\n- Upload and sell digital products\n- Connect with buyers worldwide\n\nGo to Creator Dashboard: ${APP_URL}/creator/dashboard\n\n${BRAND_NAME}`,
    from: FROM_EMAIL,
  }),

  CREATOR_APPLICATION_REJECTED: (d) => ({
    subject: "Update on Your Creator Application",
    html: wrapHtml(`
      ${header("Creator Application Update")}
      ${paragraph(`Hi ${d.name || "there"},`)}
      ${paragraph("Thank you for applying to become a PawVault creator. After careful review, we're unable to approve your application at this time.")}
      ${d.reason ? errorBox(`<strong>Reason:</strong> ${d.reason}`) : ""}
      ${paragraph("You're welcome to reapply in the future. If you have questions, please contact support.")}
      <div style="text-align:center;margin:24px 0;">
        ${button("Contact Support", `${APP_URL}/support`)}
      </div>
    `),
    text: `Hi ${d.name || "there"},\n\nThank you for applying to become a PawVault creator.\nAfter careful review, we're unable to approve your application at this time.\n${d.reason ? `\nReason: ${d.reason}\n` : ""}You're welcome to reapply in the future.\nIf you have questions, please contact support: ${APP_URL}/support\n\n${BRAND_NAME}`,
    from: FROM_EMAIL,
  }),

  CREATOR_APPLICATION_CHANGES_REQUESTED: (d) => ({
    subject: "Changes Requested for Your Creator Application",
    html: wrapHtml(`
      ${header("Creator Application Update")}
      ${paragraph(`Hi ${d.name || "there"},`)}
      ${paragraph("We've reviewed your creator application and would like to request some changes before we can proceed.")}
      ${d.reason ? warning(`<strong>Notes:</strong> ${d.reason}`) : ""}
      ${paragraph("Please update your application and resubmit it for review.")}
      <div style="text-align:center;margin:24px 0;">
        ${button("Update Application", `${APP_URL}/become-creator`)}
      </div>
    `),
    text: `Hi ${d.name || "there"},\n\nWe've reviewed your creator application and would like to request some changes.\n${d.reason ? `\nNotes: ${d.reason}\n` : ""}Please update your application and resubmit it for review.\n\nUpdate Application: ${APP_URL}/become-creator\n\n${BRAND_NAME}`,
    from: FROM_EMAIL,
  }),

  PRODUCT_UPDATE: (d) => ({
    subject: `Update: ${d.productName}`,
    html: wrapHtml(`
      ${header("Product Update Available")}
      ${paragraph(`Hi ${d.name || "there"},`)}
      ${paragraph(`A product you purchased has been updated:`)}
      <div style="background-color:#f3f4f6;border-radius:6px;padding:20px;margin:16px 0;">
        <p style="margin:0 0 8px;"><strong>Product:</strong> ${d.productName}</p>
        <p style="margin:0 0 8px;"><strong>Version:</strong> ${d.version || "New version"}</p>
        ${d.changes ? `<p style="margin:0;"><strong>Changes:</strong> ${d.changes}</p>` : ""}
      </div>
      <div style="text-align:center;margin:24px 0;">
        ${button("View Product", d.productUrl as string || `${APP_URL}/product/${d.productSlug}`)}
      </div>
      ${paragraph("You can download the updated version from your library.")}
    `),
    text: `Hi ${d.name || "there"},\n\nA product you purchased has been updated:\n\nProduct: ${d.productName}\nVersion: ${d.version || "New version"}\n${d.changes ? `Changes: ${d.changes}\n` : ""}\n\nDownload the updated version from your library.\n\n${BRAND_NAME}`,
    from: FROM_EMAIL,
  }),

  SUPPORT_TICKET_CREATED: (d) => ({
    subject: `Support Ticket #${d.ticketId} Created`,
    html: wrapHtml(`
      ${header("Support Ticket Created")}
      ${paragraph(`Hi ${d.name || "there"},`)}
      ${successBox(`<strong>Your support ticket has been created.</strong>`)}
      <div style="background-color:#f3f4f6;border-radius:6px;padding:20px;margin:16px 0;">
        <p style="margin:0 0 8px;"><strong>Ticket ID:</strong> #${d.ticketId}</p>
        <p style="margin:0 0 8px;"><strong>Subject:</strong> ${d.subject}</p>
        <p style="margin:0;"><strong>Status:</strong> Open</p>
      </div>
      ${paragraph("Our support team will respond as soon as possible.")}
      <div style="text-align:center;margin:24px 0;">
        ${button("View Ticket", `${APP_URL}/support/${d.ticketId}`)}
      </div>
    `),
    text: `Hi ${d.name || "there"},\n\nYour support ticket #${d.ticketId} has been created.\n\nSubject: ${d.subject}\nStatus: Open\n\nOur support team will respond as soon as possible.\n\nView ticket: ${APP_URL}/support/${d.ticketId}\n\n${BRAND_NAME}`,
    from: FROM_EMAIL,
  }),

  SUPPORT_TICKET_REPLY: (d) => ({
    subject: `Re: Support Ticket #${d.ticketId}`,
    html: wrapHtml(`
      ${header("Support Ticket Reply")}
      ${paragraph(`Hi ${d.name || "there"},`)}
      ${paragraph(`There's a new reply on your support ticket.`)}
      <div style="background-color:#f3f4f6;border-radius:6px;padding:20px;margin:16px 0;">
        <p style="margin:0 0 8px;"><strong>Ticket ID:</strong> #${d.ticketId}</p>
        <p style="margin:0 0 8px;"><strong>Subject:</strong> ${d.subject}</p>
        <p style="margin:0;"><strong>Reply Preview:</strong> ${d.preview || "Click to view the full reply."}</p>
      </div>
      <div style="text-align:center;margin:24px 0;">
        ${button("View Reply", `${APP_URL}/support/${d.ticketId}`)}
      </div>
    `),
    text: `Hi ${d.name || "there"},\n\nThere's a new reply on your support ticket #${d.ticketId}.\n\nSubject: ${d.subject}\n${d.preview ? `Preview: ${d.preview}\n` : ""}\n\nView reply: ${APP_URL}/support/${d.ticketId}\n\n${BRAND_NAME}`,
    from: FROM_EMAIL,
  }),

  SUPPORT_TICKET_RESOLVED: (d) => ({
    subject: `Support Ticket #${d.ticketId} Resolved`,
    html: wrapHtml(`
      ${header("Support Ticket Resolved")}
      ${paragraph(`Hi ${d.name || "there"},`)}
      ${successBox(`<strong>Your support ticket #${d.ticketId} has been resolved.</strong>`)}
      ${paragraph("If you need further assistance, you can reopen the ticket.")}
      <div style="text-align:center;margin:24px 0;">
        ${button("View Ticket", `${APP_URL}/support/${d.ticketId}`)}
      </div>
    `),
    text: `Hi ${d.name || "there"},\n\nYour support ticket #${d.ticketId} has been resolved.\n\nIf you need further assistance, you can reopen the ticket:\n${APP_URL}/support/${d.ticketId}\n\n${BRAND_NAME}`,
    from: FROM_EMAIL,
  }),

  MODERATION_ACTION: (d) => ({
    subject: `Moderation Action on Your ${d.entityType || "Content"}`,
    html: wrapHtml(`
      ${header("Moderation Action")}
      ${paragraph(`Hi ${d.name || "there"},`)}
      <div style="background-color:#f3f4f6;border-radius:6px;padding:20px;margin:16px 0;">
        <p style="margin:0 0 8px;"><strong>Action:</strong> ${d.action || "Content review"}</p>
        ${d.reason ? `<p style="margin:0 0 8px;"><strong>Reason:</strong> ${d.reason}</p>` : ""}
        ${d.entityType ? `<p style="margin:0;"><strong>Content Type:</strong> ${d.entityType}</p>` : ""}
      </div>
      ${d.appealable ? warning(`If you believe this action was taken in error, you may submit an appeal within 30 days.`) : ""}
      <div style="text-align:center;margin:24px 0;">
        ${d.appealable ? button("Submit Appeal", `${APP_URL}/moderation/appeal`) : button("View Details", `${APP_URL}/dashboard`)}
      </div>
    `),
    text: `Hi ${d.name || "there"},\n\nA moderation action has been taken on your ${d.entityType || "content"}.\n\nAction: ${d.action || "Content review"}\n${d.reason ? `Reason: ${d.reason}\n` : ""}${d.appealable ? "\nIf you believe this was taken in error, you may submit an appeal within 30 days:\n" + APP_URL + "/moderation/appeal\n" : ""}${BRAND_NAME}`,
    from: FROM_EMAIL,
  }),

  APPEAL_RECEIVED: (d) => ({
    subject: `Appeal #${d.appealId} Received`,
    html: wrapHtml(`
      ${header("Appeal Received")}
      ${paragraph(`Hi ${d.name || "there"},`)}
      ${successBox(`<strong>We've received your appeal and will review it shortly.</strong>`)}
      <div style="background-color:#f3f4f6;border-radius:6px;padding:20px;margin:16px 0;">
        <p style="margin:0 0 8px;"><strong>Appeal ID:</strong> #${d.appealId}</p>
        <p style="margin:0;"><strong>Type:</strong> ${d.appealType || "Content appeal"}</p>
      </div>
      ${paragraph("You'll receive an email notification once a decision has been made.")}
    `),
    text: `Hi ${d.name || "there"},\n\nWe've received your appeal #${d.appealId} and will review it shortly.\n\nType: ${d.appealType || "Content appeal"}\n\nYou'll receive an email notification once a decision has been made.\n\n${BRAND_NAME}`,
    from: FROM_EMAIL,
  }),

  APPEAL_UPDATE: (d) => ({
    subject: `Appeal #${d.appealId} Update`,
    html: wrapHtml(`
      ${header("Appeal Status Update")}
      ${paragraph(`Hi ${d.name || "there"},`)}
      <div style="background-color:#f3f4f6;border-radius:6px;padding:20px;margin:16px 0;">
        <p style="margin:0 0 8px;"><strong>Appeal ID:</strong> #${d.appealId}</p>
        <p style="margin:0 0 8px;"><strong>Status:</strong> ${d.status || "Under review"}</p>
        ${d.notes ? `<p style="margin:0;"><strong>Notes:</strong> ${d.notes}</p>` : ""}
      </div>
      ${paragraph("You'll receive another notification once a final decision has been made.")}
    `),
    text: `Hi ${d.name || "there"},\n\nAppeal #${d.appealId} Status: ${d.status || "Under review"}\n${d.notes ? `Notes: ${d.notes}\n` : ""}You'll receive another notification once a final decision has been made.\n\n${BRAND_NAME}`,
    from: FROM_EMAIL,
  }),

  APPEAL_DECISION: (d) => ({
    subject: `Appeal #${d.appealId} Decision`,
    html: wrapHtml(`
      ${header("Appeal Decision")}
      ${paragraph(`Hi ${d.name || "there"},`)}
      ${d.decision === "APPROVED" ? successBox(`<strong>Your appeal has been approved!</strong>`) : d.decision === "REJECTED" ? errorBox(`<strong>Your appeal has been rejected.</strong>`) : `<div style="background-color:#f3f4f6;border-radius:6px;padding:20px;margin:16px 0;"><strong>Decision:</strong> ${d.decision || "Reviewed"}</div>`}
      <div style="background-color:#f3f4f6;border-radius:6px;padding:20px;margin:16px 0;">
        <p style="margin:0 0 8px;"><strong>Appeal ID:</strong> #${d.appealId}</p>
        ${d.resolution ? `<p style="margin:0;"><strong>Resolution:</strong> ${d.resolution}</p>` : ""}
      </div>
      <div style="text-align:center;margin:24px 0;">
        ${button("View Appeal", `${APP_URL}/moderation/appeal/${d.appealId}`)}
      </div>
    `),
    text: `Hi ${d.name || "there"},\n\nAppeal #${d.appealId} Decision: ${d.decision || "Reviewed"}\n${d.resolution ? `Resolution: ${d.resolution}\n` : ""}\n\nView appeal: ${APP_URL}/moderation/appeal/${d.appealId}\n\n${BRAND_NAME}`,
    from: FROM_EMAIL,
  }),

  TEAM_INVITATION: (d) => ({
    subject: `You've been invited to join a team on PawVault`,
    html: wrapHtml(`
      ${header("Team Invitation")}
      ${paragraph(`Hi ${d.name || "there"},`)}
      <div style="background-color:#f3f4f6;border-radius:6px;padding:20px;margin:16px 0;">
        <p style="margin:0 0 8px;"><strong>Team:</strong> ${d.teamName || "A PawVault team"}</p>
        <p style="margin:0 0 8px;"><strong>Role:</strong> ${d.role || "Member"}</p>
        <p style="margin:0;"><strong>Invited by:</strong> ${d.invitedBy || "A team admin"}</p>
      </div>
      <div style="text-align:center;margin:24px 0;">
        ${button("Accept Invitation", d.inviteUrl as string)}
      </div>
    `),
    text: `Hi ${d.name || "there"},\n\nYou've been invited to join ${d.teamName || "a PawVault team"} as ${d.role || "Member"}.\n\nInvited by: ${d.invitedBy || "A team admin"}\n\nAccept invitation: ${d.inviteUrl}\n\n${BRAND_NAME}`,
    from: FROM_EMAIL,
  }),

  PLATFORM_ANNOUNCEMENT: (d) => ({
    subject: d.subject as string || "PawVault Announcement",
    html: wrapHtml(`
      ${header(d.subject as string || "PawVault Announcement")}
      ${paragraph(d.body as string || "We have an important announcement.")}
      <div style="text-align:center;margin:24px 0;">
        ${button("Read More", d.link as string || APP_URL)}
      </div>
    `),
    text: `${d.subject || "PawVault Announcement"}\n\n${d.body || "We have an important announcement."}\n\nRead more: ${d.link || APP_URL}\n\n${BRAND_NAME}`,
    from: FROM_EMAIL,
  }),
}

export function renderTemplate(
  templateKey: EmailTemplateKey,
  data: EmailTemplateData
): RenderedEmail {
  const renderer = templates[templateKey]
  if (!renderer) {
    console.error(`Email template not found: ${templateKey}`)
    return {
      subject: "PawVault",
      html: wrapHtml(`
        ${header("Message from PawVault")}
        ${paragraph(data.message as string || "You have a new message.")}
      `),
      text: data.message as string || "You have a new message.\n\nPawVault",
      from: FROM_EMAIL,
    }
  }
  return renderer(data)
}

export function getTemplateCategory(key: EmailTemplateKey): string {
  const categoryMap: Partial<Record<EmailTemplateKey, string>> = {
    EMAIL_VERIFICATION: "security",
    PASSWORD_RESET: "security",
    PASSWORD_CHANGED: "security",
    EMAIL_CHANGED: "security",
    ACCOUNT_WARNING: "security",
    ACCOUNT_BANNED: "security",
    ACCOUNT_SUSPENDED: "security",
    WELCOME: "account",
    ORDER_CONFIRMATION: "orders",
    REFUND_REQUESTED: "refunds",
    REFUND_APPROVED: "refunds",
    REFUND_REJECTED: "refunds",
    REFUND_COMPLETED: "refunds",
    PAYOUT_INITIATED: "creator",
    PAYOUT_COMPLETED: "creator",
    PAYOUT_FAILED: "creator",
    CREATOR_APPLICATION_APPROVED: "creator",
    CREATOR_APPLICATION_REJECTED: "creator",
    CREATOR_APPLICATION_CHANGES_REQUESTED: "creator",
    PRODUCT_UPDATE: "creator",
    SUPPORT_TICKET_CREATED: "support",
    SUPPORT_TICKET_REPLY: "support",
    SUPPORT_TICKET_RESOLVED: "support",
    MODERATION_ACTION: "moderation",
    APPEAL_RECEIVED: "moderation",
    APPEAL_UPDATE: "moderation",
    APPEAL_DECISION: "moderation",
    TEAM_INVITATION: "creator",
    PLATFORM_ANNOUNCEMENT: "platform",
  }
  return categoryMap[key] || "platform"
}

export function getTemplatePriority(key: EmailTemplateKey): string {
  const priorityMap: Partial<Record<EmailTemplateKey, string>> = {
    EMAIL_VERIFICATION: "HIGH",
    PASSWORD_RESET: "HIGH",
    PASSWORD_CHANGED: "HIGH",
    EMAIL_CHANGED: "HIGH",
    ACCOUNT_WARNING: "CRITICAL",
    ACCOUNT_BANNED: "CRITICAL",
    ACCOUNT_SUSPENDED: "CRITICAL",
    ORDER_CONFIRMATION: "HIGH",
    REFUND_COMPLETED: "HIGH",
    PAYOUT_COMPLETED: "HIGH",
    CREATOR_APPLICATION_APPROVED: "HIGH",
    CREATOR_APPLICATION_REJECTED: "HIGH",
    MODERATION_ACTION: "HIGH",
    APPEAL_DECISION: "HIGH",
  }
  return priorityMap[key] || "NORMAL"
}
