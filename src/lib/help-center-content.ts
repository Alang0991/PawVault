export type HelpSection =
  | "getting-started"
  | "buying"
  | "selling"
  | "security"
  | "moderation"
  | "technical"

export type HelpBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "callout"; title: string; text: string }

export type HelpSectionContent = {
  heading: string
  blocks: HelpBlock[]
}

export type HelpArticle = {
  id: string
  slug: string
  section: HelpSection
  title: string
  summary: string
  updated: string
  readTime: number
  keywords: string[]
  related: string[]
  status: "Published"
  sections: HelpSectionContent[]
}

const paragraph = (text: string): HelpBlock => ({ type: "paragraph", text })

const list = (items: string[], ordered = false): HelpBlock => ({
  type: "list",
  items,
  ordered,
})

const callout = (title: string, text: string): HelpBlock => ({
  type: "callout",
  title,
  text,
})

const makeArticle = (
  id: string,
  section: HelpSection,
  title: string,
  summary: string,
  readTime: number,
  keywords: string[],
  related: string[],
  sections: HelpSectionContent[]
): HelpArticle => ({
  id,
  slug: id,
  section,
  title,
  summary,
  updated: "2026-09-15",
  readTime,
  keywords,
  related,
  status: "Published",
  sections,
})

export const helpSectionOrder: HelpSection[] = [
  "getting-started",
  "buying",
  "selling",
  "security",
  "moderation",
  "technical",
]

export const helpSectionLabels: Record<HelpSection, string> = {
  "getting-started": "Getting Started",
  buying: "Buying & Downloads",
  selling: "Selling & Creators",
  security: "Security",
  moderation: "Moderation & Safety",
  technical: "Technical",
}

export const publishedHelpArticles: HelpArticle[] = [
  makeArticle(
    "account-creation",
    "getting-started",
    "How to create a PawVault account",
    "Register with email, Google, or Discord and prepare your account for browsing and purchasing.",
    4,
    ["sign up", "register", "email", "social login", "new account"],
    ["email-verification-login", "profile-setup", "passwords"],
    [
      {
        heading: "Choose a sign-up method",
        blocks: [
          paragraph("Open the PawVault sign-in page and select Create account. You can register with an email address and password, or continue with an available Google or Discord account."),
          list([
            "Use an email address you can access throughout the verification process.",
            "Choose a unique password that you do not reuse on other services.",
            "Review the account and marketplace terms before finishing registration.",
          ]),
        ],
      },
      {
        heading: "Verify and finish setup",
        blocks: [
          paragraph("Verify your email when prompted, then open Account Settings to add a display name, avatar, and preferences. Enable multi-factor authentication from the security settings to add extra protection."),
          callout("Tip: keep one recovery method", "Save your backup codes and a recovery email. These reduce the chance of losing access to your account."),
        ],
      },
      {
        heading: "If registration does not complete",
        blocks: [
          paragraph("Confirm the email is not already in use by trying the password reset flow. Browser pop-ups can block social login, so allow pop-ups for the site. If the error persists, contact Support with the sign-up method and the exact message."),
        ],
      },
    ]
  ),
  makeArticle(
    "email-verification-login",
    "getting-started",
    "Email verification and login troubleshooting",
    "Resolve missing verification messages, wrong-password errors, and multi-factor authentication problems.",
    5,
    ["email verification", "login", "password", "MFA", "authentication"],
    ["account-creation", "passwords", "account-recovery"],
    [
      {
        heading: "Find or resend a verification message",
        blocks: [
          paragraph("Search your inbox for the address used during registration, including spam, junk, and promotional folders. Confirm the address is spelled correctly before requesting another message."),
          list([
            "Use the verification option on the sign-in page to request a new message.",
            "Open the newest message and complete the verification in the same browser session.",
            "If a link no longer works, request a fresh link instead of reusing an old one.",
          ]),
        ],
      },
      {
        heading: "Fix common sign-in errors",
        blocks: [
          paragraph("Check Caps Lock, trailing spaces, and the email address associated with the account. If you registered with Google or Discord, sign in with that provider instead of entering a password."),
          list([
            "Use Forgot password to request a reset when the password is uncertain.",
            "Clear PawVault cookies and reload the site in a private window.",
            "Disable browser extensions that block scripts or pop-ups for the site.",
          ]),
        ],
      },
      {
        heading: "MFA and recovery",
        blocks: [
          paragraph("If multi-factor authentication is enabled, enter the current code from your authenticator app or one of the backup codes saved during setup. Ensure your device time is set to update automatically. If you cannot access any method, start account recovery and contact Support."),
          callout("Never share codes", "Support will never ask for your password, MFA code, or backup codes. Share only your account email and a description of the access problem."),
        ],
      },
    ]
  ),
  makeArticle(
    "marketplace-navigation",
    "getting-started",
    "Navigating the marketplace",
    "Browse, search, filter, inspect products, and move between buyer and creator areas.",
    4,
    ["browse", "search", "filters", "marketplace", "navigation"],
    ["profile-setup", "purchasing", "downloads"],
    [
      {
        heading: "Browse and inspect products",
        blocks: [
          paragraph("From the marketplace home, use search and the available category or price filters to narrow results. Select a product to review its description, media, file formats, license terms, and creator details before deciding."),
          list([
            "Start with a broad search, then add filters one at a time.",
            "Verify file formats and version compatibility on the product page.",
            "Use the wishlist or save controls to keep products for later.",
          ]),
        ],
      },
      {
        heading: "Move through your account",
        blocks: [
          paragraph("Use the main navigation to open the Library for your purchases, Orders for purchase records, and Account Settings for profile, security, and preferences. Approved creators can open the creator dashboard to manage products and store settings."),
          callout("Page missing?", "Use the Help Center search or return to the Help Center home page. Contact Support with the page name and the action you were trying to complete."),
        ],
      },
    ]
  ),
  makeArticle(
    "profile-setup",
    "getting-started",
    "Setting up your profile",
    "Choose a display name, avatar, bio, preferences, language, currency, and privacy settings.",
    4,
    ["profile", "avatar", "display name", "bio", "privacy", "preferences"],
    ["account-creation", "user-roles", "passwords"],
    [
      {
        heading: "Complete your public profile",
        blocks: [
          paragraph("Open Account Settings and edit your profile information. A clear display name and concise bio help other marketplace members understand your profile. Upload an avatar only if you are comfortable displaying it publicly."),
          list([
            "Choose a display name that follows the marketplace rules.",
            "Keep personal contact details out of public profile fields.",
            "Preview your profile before saving changes.",
          ]),
        ],
      },
      {
        heading: "Preferences and privacy",
        blocks: [
          paragraph("Use the content, language, currency, theme, notification, and privacy controls to shape your experience. Preference changes apply to your account and may affect what other users see in search and on your profile."),
          callout("Review visibility", "Public profile information can be visible to other users. Keep payment and account data in the appropriate settings areas rather than in your bio or display name."),
        ],
      },
    ]
  ),
  makeArticle(
    "user-roles",
    "getting-started",
    "Understanding user roles",
    "Learn how buyer, creator, moderator, administrator, and founder roles affect permissions.",
    4,
    ["roles", "permissions", "buyer", "creator", "moderator", "admin"],
    ["account-creation", "become-creator", "marketplace-rules"],
    [
      {
        heading: "Buyer and creator roles",
        blocks: [
          paragraph("A standard account can browse, search, purchase, download licensed products, and manage account settings. A creator role adds access to the creator application, store tools, product management, and payout features after approval."),
          list([
            "You do not need a creator role to buy products.",
            "Creator access is controlled by the approved application status.",
            "One account can have buyer and creator responsibilities.",
          ]),
        ],
      },
      {
        heading: "Staff and elevated roles",
        blocks: [
          paragraph("Moderator, administrator, and founder roles provide staff controls for reports, users, products, and system configuration. Elevated permissions are assigned by the platform and are not requested through the normal creator application."),
          callout("Role changes", "If a page or action is unavailable, sign out and back in after a confirmed role change. Contact Support if the expected role is still missing."),
        ],
      },
    ]
  ),
  makeArticle(
    "account-session-troubleshooting",
    "getting-started",
    "Account and session troubleshooting",
    "Diagnose sign-in loops, expired sessions, cookie problems, and unexpected logouts.",
    5,
    ["session", "logout", "cookies", "sign in", "account access"],
    ["email-verification-login", "sessions", "account-recovery"],
    [
      {
        heading: "Refresh the account session",
        blocks: [
          paragraph("Sign out, close extra PawVault tabs, reopen the site, and sign in again. Confirm the browser allows cookies for the site and that its date and time are set to update automatically."),
          list([
            "Try a private browsing window to isolate extensions and cached data.",
            "Clear PawVault cookies rather than deleting unrelated browser data.",
            "Avoid opening more than one sign-in tab during the process.",
          ]),
        ],
      },
      {
        heading: "Review and revoke sessions",
        blocks: [
          paragraph("Open Account Settings and review the Active Sessions section. Revoke any session you do not recognize, then change your password and confirm MFA is enabled. A session can end when it expires, when credentials change, or when an administrator invalidates it."),
          callout("Still signed out?", "Send Support the browser, operating system, approximate time, and whether the sign-out happens immediately or after a specific action. Do not send passwords or session tokens."),
        ],
      },
    ]
  ),
  makeArticle(
    "purchasing",
    "buying",
    "How to purchase products",
    "Review a product, complete checkout, and locate the license and files after payment.",
    5,
    ["buy", "checkout", "payment", "purchase", "license"],
    ["paid-products", "orders", "downloads"],
    [
      {
        heading: "Before checkout",
        blocks: [
          paragraph("Open the product page and review the description, preview, file formats, version, license terms, and any sale pricing. Add the product to your cart or use the available purchase action."),
          list([
            "Confirm that the file format works with your software.",
            "Check whether the product is free or paid before proceeding.",
            "Review the final price and payment details before confirming.",
          ]),
        ],
      },
      {
        heading: "Complete payment",
        blocks: [
          paragraph("Follow the checkout flow and complete payment with an available method. Wait for the confirmation page or message before starting another purchase. A failed or interrupted payment can leave the order pending."),
          callout("Paid but no files?", "Open your Library and Orders. If the order appears but the download is unavailable, contact Support with the order ID and the payment reference shown at checkout."),
        ],
      },
    ]
  ),
  makeArticle(
    "free-products",
    "buying",
    "Buying and downloading free products",
    "Add free products to your account and access their licensed files from the Library.",
    3,
    ["free", "zero price", "download", "license", "library"],
    ["purchasing", "downloads", "orders"],
    [
      {
        heading: "Get a free product",
        blocks: [
          paragraph("Free products use the normal product and checkout flow without a payment charge. Sign in when prompted, confirm the free checkout, and wait for the order or license to appear in your account."),
          list([
            "Verify that the product price is shown as free before confirming.",
            "Keep the confirmation record for future reference.",
            "Free access still follows the product license and marketplace rules.",
          ]),
        ],
      },
      {
        heading: "Access the files",
        blocks: [
          paragraph("Open the Library, locate the product, and use its download action. If the product has multiple versions, choose the version that matches your project and software."),
        ],
      },
    ]
  ),
  makeArticle(
    "paid-products",
    "buying",
    "Buying paid products",
    "Understand price review, checkout, payment confirmation, and license delivery for paid products.",
    4,
    ["paid product", "price", "checkout", "payment", "license"],
    ["purchasing", "receipts", "refunds"],
    [
      {
        heading: "Review the offer",
        blocks: [
          paragraph("Paid product pages show the current price and may show a sale price. Review the files, version, license, and creator information before checkout. Taxes or other charges, when applicable, are shown during checkout."),
        ],
      },
      {
        heading: "Confirm and retrieve",
        blocks: [
          paragraph("Complete checkout and wait for confirmation. The purchased license and files are available from the Library, and the order record is available from Orders. Save the order ID if you need support."),
          callout("Do not share access", "A purchase grants the license shown with the product. Do not redistribute files, license keys, or download access outside those terms."),
        ],
      },
    ]
  ),
  makeArticle(
    "downloads",
    "buying",
    "Accessing your downloads",
    "Find purchased files, select versions, and download licensed products from your Library.",
    4,
    ["library", "download", "files", "versions", "license"],
    ["purchasing", "product-updates", "download-troubleshooting"],
    [
      {
        heading: "Open the Library",
        blocks: [
          paragraph("Sign in and open the Library from the main navigation. Your eligible purchased products appear there with their available files and version information."),
          list([
            "Use the product search or filters to find an older purchase.",
            "Open the product entry to review file names and versions.",
            "Download the file to a location you can back up.",
          ]),
        ],
      },
      {
        heading: "Choose a version",
        blocks: [
          paragraph("When a product has multiple versions, select the one intended for your software or project. Keep the original download and note the version so you can identify compatibility later."),
          callout("Missing a file?", "Confirm the order is completed and associated with the signed-in account. If it is still missing, contact Support with the product name and order ID."),
        ],
      },
    ]
  ),
  makeArticle(
    "orders",
    "buying",
    "Managing your orders",
    "Review order status, item details, payment information, and available order actions.",
    4,
    ["orders", "purchase history", "status", "payment", "order details"],
    ["receipts", "refunds", "downloads"],
    [
      {
        heading: "Find an order",
        blocks: [
          paragraph("Open Orders to see your purchase history. Select an order to review its items, totals, status, and available actions. The order page is the best place to start for a download, receipt, or refund question."),
        ],
      },
      {
        heading: "Understand the status",
        blocks: [
          paragraph("Order status reflects the current state of payment and fulfillment. If an order is still processing, wait for the confirmed state before requesting a duplicate download or starting another checkout."),
          list([
            "Use the order ID in support messages.",
            "Check the email associated with the account for payment confirmation.",
            "Do not submit duplicate payment attempts while an order is processing.",
          ]),
        ],
      },
    ]
  ),
  makeArticle(
    "receipts",
    "buying",
    "Purchase history and receipts",
    "Locate order records, payment details, and receipt information for your purchases.",
    3,
    ["receipt", "invoice", "purchase history", "payment record", "order"],
    ["orders", "refunds", "account-session-troubleshooting"],
    [
      {
        heading: "Open an order record",
        blocks: [
          paragraph("Use Orders to find a purchase and open its details. The record shows the products, total, order date, and available payment information. Use this record when contacting Support."),
        ],
      },
      {
        heading: "Receipt questions",
        blocks: [
          paragraph("If you cannot find a confirmation message, check the account email and spam folders, then compare the order date and total with your Orders history. Support can help locate an order when you provide the account email, approximate date, product name, and order ID if available."),
          callout("Keep records private", "Receipts and order details may contain personal information. Share them only through the official Support channel and only when necessary."),
        ],
      },
    ]
  ),
  makeArticle(
    "product-updates",
    "buying",
    "Product updates and version history",
    "Find updated files, compare versions, and keep projects compatible with creator releases.",
    4,
    ["updates", "versions", "changelog", "new version", "compatibility"],
    ["downloads", "download-troubleshooting", "product-files"],
    [
      {
        heading: "Check for updates",
        blocks: [
          paragraph("Open the product in your Library and review the available versions or update information. The Library is the source of truth for files available to your account."),
          list([
            "Read version or release notes before replacing a file.",
            "Back up your project before changing a dependency version.",
            "Confirm that the new version supports your software version.",
          ]),
        ],
      },
      {
        heading: "Keep a known-good version",
        blocks: [
          paragraph("Download and store the version used by an active project. If an update changes behavior, compare it with the previous version and contact the creator or Support with the exact version numbers."),
        ],
      },
    ]
  ),
  makeArticle(
    "download-troubleshooting",
    "buying",
    "Download troubleshooting",
    "Resolve missing files, failed downloads, browser blocks, and version selection problems.",
    5,
    ["download failed", "missing file", "browser", "library", "troubleshooting"],
    ["downloads", "storage-download-errors", "website-troubleshooting"],
    [
      {
        heading: "Check the account and order",
        blocks: [
          paragraph("Confirm you are signed in to the account used for the purchase and that the order appears in Orders. Then open the product from the Library rather than using an old bookmark or email link."),
          list([
            "Refresh the Library page and try the download again.",
            "Allow pop-ups and multiple tabs for the site if the browser blocks the file.",
            "Try a current browser and a direct network connection.",
          ]),
        ],
      },
      {
        heading: "When a file still fails",
        blocks: [
          paragraph("Note the product, version, browser, operating system, and exact error. If a download link expires or storage processing is incomplete, wait briefly and retry from the Library. Contact Support if the same file fails repeatedly."),
          callout("Provide details", "Include the product name, version, and order ID. Screenshots of the error message help the Support team diagnose the issue faster."),
        ],
      },
    ]
  ),
  makeArticle(
    "refunds",
    "buying",
    "Refunds and returns",
    "Understand refund eligibility, how to request a refund, and what to expect during review.",
    4,
    ["refund", "return", "eligibility", "money back", "purchase"],
    ["orders", "receipts", "purchasing"],
    [
      {
        heading: "Eligibility",
        blocks: [
          paragraph("Refund eligibility depends on the product license and the marketplace refund policy. Eligible purchases can be requested directly from the order details page, while other cases are reviewed by Support."),
        ],
      },
      {
        heading: "Request a refund",
        blocks: [
          paragraph("Open the order in Orders, select the request option, and describe the problem clearly. Include the order ID, the reason for the request, and any relevant observations about the product or files."),
          callout("Review timeline", "Refunds are reviewed case by case and outcomes depend on the product license and policy. The status is communicated through the order page and account notifications."),
        ],
      },
    ]
  ),
  makeArticle(
    "become-creator",
    "selling",
    "Become a creator",
    "Apply for a creator account and understand the approval process before opening a store.",
    4,
    ["creator", "application", "apply", "approval", "store"],
    ["user-roles", "create-store", "creator-dashboard"],
    [
      {
        heading: "Submit an application",
        blocks: [
          paragraph("Open the become-a-creator application page while signed in. Provide a display name, profile information, and details about the products you intend to sell. Applications are reviewed against the marketplace rules and seller requirements."),
          list([
            "Use your real profile information to avoid delays.",
            "Describe your products honestly and accurately.",
            "Keep contact methods in your application current.",
          ]),
        ],
      },
      {
        heading: "After submission",
        blocks: [
          paragraph("Applications move through submitted, under review, and approved or needs more information states. You are notified through account notifications and email when the status changes. Approval is required before opening a store or publishing products."),
          callout("No approvals guarantee", "The platform reviews applications to protect buyers and creators. Approval decisions are final and based on eligibility and policy compliance."),
        ],
      },
    ]
  ),
  makeArticle(
    "create-store",
    "selling",
    "Create a store",
    "Open your approved creator store, set a name, URL slug, description, and branding.",
    4,
    ["store", "branding", "storefront", "slug", "settings"],
    ["become-creator", "product-files", "pricing"],
    [
      {
        heading: "Open the store setup",
        blocks: [
          paragraph("After your creator application is approved, open the store creation page while signed in. Enter a store name, URL slug, and public description, then save your branding choices."),
          list([
            "Choose a slug that is easy for customers to recognize and read.",
            "Add a logo and banner in the store settings after creation.",
            "Review the final store URL shown after saving.",
          ]),
        ],
      },
      {
        heading: "Publish and confirm",
        blocks: [
          paragraph("Your store URL becomes available after the initial settings are saved. Use the store settings page to update appearance, social links, and announcements after creation."),
          callout("Visibility", "A store remains associated with your approved creator account. Unpublishing products or storefront visibility does not delete the underlying data."),
        ],
      },
    ]
  ),
  makeArticle(
    "upload-product",
    "selling",
    "Upload a product",
    "Create a new product, add required details, media, and files, and save a draft before publishing.",
    5,
    ["product", "upload", "media", "files", "draft"],
    ["product-publishing", "categories-tags", "product-files"],
    [
      {
        heading: "Start a new product",
        blocks: [
          paragraph("From the creator dashboard, open the create product page. Enter a title, description, and required category, then add media and file versions before saving."),
          list([
            "Complete all required fields to avoid publication delays.",
            "Upload clear media that represents the product accurately.",
            "Save drafts frequently; changes are not final until published.",
          ]),
        ],
      },
      {
        heading: "Review before publishing",
        blocks: [
          paragraph("Preview the product page to confirm descriptions, media, and file selections. Publishing submits the product for review, so check the license and pricing carefully before continuing."),
          callout("Draft safety", "Saving a draft does not make the product visible to buyers. Only the published status makes it available in the marketplace."),
        ],
      },
    ]
  ),
  makeArticle(
    "product-publishing",
    "selling",
    "Publishing and review",
    "Understand the draft, review, published, and changes-requested workflow for creators.",
    4,
    ["publish", "review", "published", "status", "moderation"],
    ["upload-product", "refunds", "moderation-process"],
    [
      {
        heading: "Product status",
        blocks: [
          paragraph("A product moves from draft to pending review before it is published. During review the moderation team checks the product against the marketplace rules and listing requirements."),
          list([
            "Draft: saved but not submitted.",
            "Pending review: submitted and awaiting moderation.",
            "Published: available to buyers.",
            "Changes requested: revision needed before publishing.",
          ]),
        ],
      },
      {
        heading: "After a decision",
        blocks: [
          paragraph("If changes are requested, update the product and resubmit. If a product is rejected, the reason is provided in the moderation notes. Publication timing depends on review load and is not guaranteed."),
          callout("Resubmit only when ready", "Submitting an incomplete revision can delay the review further. Confirm that all required information is correct before each submission."),
        ],
      },
    ]
  ),
  makeArticle(
    "categories-tags",
    "selling",
    "Categories and tags",
    "Assign accurate categories and tags so buyers can find your products.",
    3,
    ["category", "tags", "search", "discovery", "organization"],
    ["upload-product", "marketplace-navigation", "collections"],
    [
      {
        heading: "Choose a category",
        blocks: [
          paragraph("Select the most specific category that fits your product. A primary category is required, and accurate categorization improves discovery in search and filtering."),
          list([
            "Avoid assigning unrelated categories.",
            "Check that the product content matches the chosen category.",
            "Update categories if the product scope changes.",
          ]),
        ],
      },
      {
        heading: "Use tags responsibly",
        blocks: [
          paragraph("Add tags that describe the product content, format, and software compatibility. Tags should be specific and truthful; avoid irrelevant or repetitive words meant to attract attention."),
          callout("Tag quality", "Inaccurate tags can be edited or hidden during moderation and may affect product visibility in search results."),
        ],
      },
    ]
  ),
  makeArticle(
    "product-files",
    "selling",
    "Product files and versions",
    "Upload secure files, manage versions, and present accurate download information.",
    4,
    ["files", "versions", "upload", "download", "security"],
    ["upload-product", "product-updates", "pricing"],
    [
      {
        heading: "Upload through the product editor",
        blocks: [
          paragraph("Add files from the product edit page. Files are stored and served securely by the platform and are associated with the approved product and license."),
          list([
            "Upload one version per release.",
            "Use clear, descriptive file names.",
            "Confirm supported formats before uploading.",
          ]),
        ],
      },
      {
        heading: "Manage versions",
        blocks: [
          paragraph("Each upload creates a version record. Keep version information updated so buyers can identify the correct file. Do not expose direct storage paths or external file links in product descriptions."),
          callout("Security", "Files are checked against the product license. Remove any confidential or non-redistributable material before publishing."),
        ],
      },
    ]
  ),
  makeArticle(
    "pricing",
    "selling",
    "Pricing and sales",
    "Set a base price, run sales, and understand how fees and taxes apply to your products.",
    4,
    ["price", "discount", "sale", "fees", "taxes"],
    ["product-files", "create-store", "payouts"],
    [
      {
        heading: "Set a price",
        blocks: [
          paragraph("From the product editor, set a base price in your listed currency. The displayed price to buyers includes applicable taxes and fees calculated during checkout."),
          list([
            "Use a consistent currency across your store.",
            "Preview the product as a buyer before publishing.",
            "Update pricing from the product edit page after publication.",
          ]),
        ],
      },
      {
        heading: "Run a sale",
        blocks: [
          paragraph("Set a sale price or discount to run a time-limited promotion. Sale pricing is shown alongside the base price during checkout. The final payout reflects the discounted amount minus applicable fees and taxes."),
          callout("Review changes", "Price changes apply to future purchases. Existing buyers keep access through the license they purchased."),
        ],
      },
    ]
  ),
  makeArticle(
    "collections",
    "selling",
    "Collections and bundles",
    "Group products into public or private collections on your storefront.",
    3,
    ["collections", "bundles", "storefront", "organize", "public"],
    ["product-files", "categories-tags", "create-store"],
    [
      {
        heading: "Create a collection",
        blocks: [
          paragraph("Open the collections tool while signed in as an approved creator. Enter a name, slug, and description, then choose whether the collection is public or private."),
          list([
            "Public collections appear on your storefront.",
            "Private collections are visible only to you.",
            "Add a cover image to represent the collection.",
          ]),
        ],
      },
      {
        heading: "Add products",
        blocks: [
          paragraph("Add existing products to the collection and arrange their order. The collection link updates automatically and can be shared with buyers through your storefront."),
          callout("Organization", "Use collections to group products by theme, format, or compatibility. A product can belong to multiple collections."),
        ],
      },
    ]
  ),
  makeArticle(
    "creator-dashboard",
    "selling",
    "Creator dashboard overview",
    "Use the dashboard to view performance, manage products, and access creator tools.",
    4,
    ["dashboard", "analytics", "products", "performance", "creator"],
    ["purchasing", "payouts", "upload-product"],
    [
      {
        heading: "Open the dashboard",
        blocks: [
          paragraph("Sign in and open the creator dashboard. The overview shows performance summaries, recent activity, and available balances where applicable."),
          list([
            "Use the navigation tabs to move between products, orders, and analytics.",
            "Check notifications for moderation updates and payout status.",
            "Use quick actions to create products or open store settings.",
          ]),
        ],
      },
      {
        heading: "Review your data",
        blocks: [
          paragraph("Performance numbers reflect recorded sales and interactions and refresh on a regular schedule. For exact transaction and payout details, use the dedicated Orders and Payouts sections."),
          callout("Data questions", "If expected data is missing, confirm the product is published and the account role is correct. Contact Support with the time range and affected products."),
        ],
      },
    ]
  ),
  makeArticle(
    "payouts",
    "selling",
    "Payouts and earnings",
    "Connect a Stripe account, understand balances and statuses, and prepare tax information.",
    5,
    ["payouts", "earnings", "stripe", "balance", "tax"],
    ["create-store", "creator-dashboard", "paid-products"],
    [
      {
        heading: "Connect a payout account",
        blocks: [
          paragraph("Payouts are processed through Stripe Connect. Link a supported bank account using the payout setup flow in the creator dashboard before requesting payouts."),
          list([
            "Use the same Stripe account for all sales in the store.",
            "Keep banking information current.",
            "Review Stripe terms for the connected account.",
          ]),
        ],
      },
      {
        heading: "Statuses and timing",
        blocks: [
          paragraph("Balances move through pending, processing, and paid statuses. A payout becomes eligible after pending funds clear and the connected account is verified. Exact timing depends on the bank and Stripe schedules."),
          callout("Taxes", "Creators are responsible for their own tax reporting. Prepare tax information as required by the law in your location."),
        ],
      },
    ]
  ),
  makeArticle(
    "passwords",
    "security",
    "Choosing and managing passwords",
    "Create a strong unique password and recover access if you forget it.",
    4,
    ["password", "strong password", "reset", "password manager"],
    ["account-creation", "account-recovery", "email-verification-login"],
    [
      {
        heading: "Create a strong password",
        blocks: [
          paragraph("Use a long passphrase or a unique random string that you do not reuse on other services. A password manager can generate and store credentials securely."),
          list([
            "Use at least twelve characters without common words or patterns.",
            "Never reuse the same password across multiple sites.",
            "Store only the password manager master password, not the generated passwords.",
          ]),
        ],
      },
      {
        heading: "Reset when needed",
        blocks: [
          paragraph("If you cannot sign in, use the Forgot password link to request a reset email. Follow the link promptly and choose a new password, then sign in with the new password on every device."),
          callout("Compromise", "If you suspect the password was exposed, reset it immediately and enable MFA."),
        ],
      },
    ]
  ),
  makeArticle(
    "sessions",
    "security",
    "Managing account sessions",
    "Review where your account is signed in and sign out from sessions you do not recognize.",
    4,
    ["sessions", "sign out", "devices", "logout", "security"],
    ["account-session-troubleshooting", "suspicious-activity", "passwords"],
    [
      {
        heading: "Review active sessions",
        blocks: [
          paragraph("Open Account Settings and review the Active Sessions section. Each session shows the device, browser, IP address, and last active time."),
          list([
            "Sign out from any session that looks unfamiliar.",
            "Use Revoke all other sessions to end every session except the current one.",
            "Sessions also end when credentials change or expire.",
          ]),
        ],
      },
      {
        heading: "Keep sessions safe",
        blocks: [
          paragraph("Avoid signing in from shared computers without using private browsing, and always sign out when finished. PawVault does not store your password in session cookies."),
          callout("Shared device", "If you must use a shared computer, sign out completely and close the browser when done."),
        ],
      },
    ]
  ),
  makeArticle(
    "mfa",
    "security",
    "Two-factor authentication (MFA)",
    "Enable authenticator-based MFA and manage backup codes for account recovery.",
    4,
    ["MFA", "two-factor", "authenticator", "backup codes", "security"],
    ["passwords", "account-recovery", "sessions"],
    [
      {
        heading: "Enable MFA",
        blocks: [
          paragraph("Open Account Settings, go to the security section, and choose the two-factor authentication option. Scan the QR code with an authenticator app, then enter the code shown on the app to confirm."),
          callout("App compatibility", "Use any authenticator app that supports TOTP, such as Google Authenticator, Authy, or 1Password."),
        ],
      },
      {
        heading: "Backup and recovery",
        blocks: [
          paragraph("After enabling MFA, save the backup codes in a secure location. Each code can be used once if you lose access to your authenticator app. Keep your device time set to update automatically."),
          list([
            "Store backup codes separately from your device.",
            "Use a backup code before the authenticator app if both are unavailable.",
            "Contact Support for account recovery if all methods are lost.",
          ]),
        ],
      },
    ]
  ),
  makeArticle(
    "account-recovery",
    "security",
    "Account recovery",
    "Regain access to an account you cannot sign in to and protect it against further lockout.",
    4,
    ["account recovery", "recover", "support", "identity", "security"],
    ["passwords", "mfa", "email-verification-login"],
    [
      {
        heading: "Start with password reset",
        blocks: [
          paragraph("If you cannot sign in, use the Forgot password link with your account email to request a reset. Check spam and trash folders if the email does not arrive promptly."),
        ],
      },
      {
        heading: "If reset is not enough",
        blocks: [
          paragraph("If you cannot reset the password or lost MFA access, contact Support through the official channel. Support may ask for identity details to verify the account owner before restoring access."),
          callout("Protect recovery", "Support will not ask for passwords or MFA codes. Provide only the account email, a description of the access problem, and any identity information requested."),
        ],
      },
    ]
  ),
  makeArticle(
    "suspicious-activity",
    "security",
    "Suspicious activity",
    "Recognize account compromise, secure your account, and report unauthorized actions.",
    4,
    ["suspicious activity", "compromised", "security", "report", "audit"],
    ["sessions", "passwords", "account-session-troubleshooting"],
    [
      {
        heading: "Signs of compromise",
        blocks: [
          paragraph("Unexpected sign-ins, orders, or messages, or settings changes you did not make can indicate unauthorized access."),
        ],
      },
      {
        heading: "Secure the account",
        blocks: [
          paragraph("Change your password and confirm MFA is enabled. Review Active Sessions and revoke sessions that look unfamiliar. Check recent orders and product activity for anything unexpected."),
          list([
            "Reset the password first.",
            "Enable or re-enable MFA.",
            "Revoke unfamiliar sessions.",
            "Report the activity to Support with the time and affected area.",
          ]),
        ],
      },
      {
        heading: "Report safely",
        blocks: [
          callout("Evidence", "Do not confront the person directly. Preserve relevant details and report the incident through official Support channels so it can be audited."),
        ],
      },
    ]
  ),
  makeArticle(
    "reporting-products",
    "moderation",
    "Reporting products",
    "Report a product that violates the rules and understand how reports are reviewed.",
    4,
    ["report product", "inappropriate", "moderation", "safety"],
    ["marketplace-rules", "moderation-process", "download-troubleshooting"],
    [
      {
        heading: "Submit a report",
        blocks: [
          paragraph("Use the Report control on the product page. Describe what is wrong in at least ten characters and include any evidence such as links or screenshots. Reports are reviewed privately by the moderation team."),
        ],
      },
      {
        heading: "What happens next",
        blocks: [
          paragraph("The report moves into review. You are not notified of the outcome directly, but serious safety issues are escalated. Avoid submitting duplicate or retaliatory reports."),
          callout("Good reports", "Be specific, truthful, and avoid sharing other users personal data in the report text."),
        ],
      },
    ]
  ),
  makeArticle(
    "reporting-creators",
    "moderation",
    "Reporting creators",
    "Report a creator or user account that violates the marketplace rules.",
    4,
    ["report creator", "user", "violation", "moderation", "safety"],
    ["reporting-products", "marketplace-rules", "moderation-process"],
    [
      {
        heading: "How to report",
        blocks: [
          paragraph("Use the report controls on a user profile, product, or message where available. If a direct report control is not available, contact Support with the profile URL and a description of the violation."),
        ],
      },
      {
        heading: "Review and privacy",
        blocks: [
          paragraph("Reports are reviewed privately. Include specific behavior and evidence. False or retaliatory reports may affect the reporter. The target is notified only when required by the outcome."),
          callout("Urgent safety issues", "For immediate safety concerns, include the time and details so the moderation team can prioritize the review."),
        ],
      },
    ]
  ),
  makeArticle(
    "copyright-dmca",
    "moderation",
    "Copyright and DMCA reports",
    "Report copyright infringement and respond to takedown or counter-notifications.",
    4,
    ["copyright", "DMCA", "takedown", "infringement", "license"],
    ["marketplace-rules", "reporting-products", "moderation-process"],
    [
      {
        heading: "When to report",
        blocks: [
          paragraph("Report content only if it infringes your copyright or that of someone you represent. Do not submit reports for content you simply dislike or disagree with."),
        ],
      },
      {
        heading: "What to include",
        blocks: [
          paragraph("Contact Support with a description of the copyrighted work, the product or page where it appears, your contact information, and a statement of good faith. If you have a legal team, include the relevant reference."),
          callout("Counter-notifications", "If your content is removed mistakenly, follow the counter-notification process provided by Support. Do not re-upload removed content while the dispute is open."),
        ],
      },
    ]
  ),
  makeArticle(
    "marketplace-rules",
    "moderation",
    "Marketplace rules",
    "Understand the rules every product, listing, and seller must follow.",
    5,
    ["rules", "policy", "listings", "license", "conduct"],
    ["user-roles", "upload-product", "reporting-products"],
    [
      {
        heading: "Listing requirements",
        blocks: [
          paragraph("Listings must be accurate, show the real product, and use truthful categories and tags. Sellers must have the rights to distribute the files and licenses offered."),
          list([
            "Do not misrepresent file contents or compatibility.",
            "Do not include unauthorized or infringing material.",
            "Keep listings consistent with the stated license.",
          ]),
        ],
      },
      {
        heading: "Prohibited conduct",
        blocks: [
          paragraph("Spam, impersonation, harassment, and payment fraud are not allowed. Accounts that repeatedly violate the rules may be suspended or removed."),
          callout("Report violations", "Use the report controls on products and profiles, or contact Support for other violations."),
        ],
      },
    ]
  ),
  makeArticle(
    "moderation-process",
    "moderation",
    "Moderation process",
    "Track the lifecycle of a report from submission to resolution.",
    4,
    ["moderation", "report", "status", "review", "resolution"],
    ["reporting-products", "reporting-creators", "product-publishing"],
    [
      {
        heading: "Report statuses",
        blocks: [
          paragraph("A report moves through pending, investigating, and resolved or dismissed statuses. The status updates as the moderation team reviews the provided information."),
          list([
            "Pending: submitted and awaiting review.",
            "Investigating: under active review.",
            "Resolved: action taken or confirmed.",
            "Dismissed: not a policy violation.",
          ]),
        ],
      },
      {
        heading: "Evidence and outcomes",
        blocks: [
          paragraph("Reports are reviewed using the details and evidence you provide. Outcomes can include warnings, content removal, or account restrictions. Outcomes are applied according to the marketplace rules and repeat-offender policy."),
          callout("Privacy", "Reporter and target information is handled confidentially during the review."),
        ],
      },
    ]
  ),
  makeArticle(
    "appeals",
    "moderation",
    "Appealing moderation decisions",
    "Request a review of a moderation decision through the proper support channel.",
    4,
    ["appeal", "moderation", "review", "decision", "support"],
    ["moderation-process", "product-publishing", "account-recovery"],
    [
      {
        heading: "How to appeal",
        blocks: [
          paragraph("Appeals are handled through Support, not through the report control. Open a support ticket and clearly state the item, the decision reference, and why you believe the decision should change."),
        ],
      },
      {
        heading: "Submitting",
        blocks: [
          paragraph("Include the item identifier or URL, the moderation action details, and any new evidence. Keep the appeal focused on one issue, and avoid resubmitting while the review is in progress."),
          callout("Decision", "Appeals are reviewed in order and may uphold, change, or reverse the original decision. The result is communicated through the support thread."),
        ],
      },
    ]
  ),
  makeArticle(
    "website-troubleshooting",
    "technical",
    "Website troubleshooting",
    "Fix loading errors, blank pages, and broken features using common browser steps.",
    4,
    ["troubleshooting", "loading", "cache", "cookies", "browser"],
    ["browser-compatibility", "download-troubleshooting", "storage-download-errors"],
    [
      {
        heading: "Quick fixes",
        blocks: [
          paragraph("Reload the page, clear the browser cache and PawVault cookies, and try again. Disable browser extensions and ad blockers for the site, then retry in a clean browsing session."),
          list([
            "Hard reload the page.",
            "Clear cache and cookies for pawvault.com.",
            "Try a different browser or device.",
            "Disable extensions that block scripts or trackers.",
          ]),
        ],
      },
      {
        heading: "If problems persist",
        blocks: [
          paragraph("Contact Support with the page URL, your browser and operating system, the approximate time, and the exact message. Include a screenshot or a console error if possible."),
          callout("What not to share", "Do not send passwords, session tokens, full credit-card numbers, or private API keys."),
        ],
      },
    ]
  ),
  makeArticle(
    "browser-compatibility",
    "technical",
    "Browser compatibility",
    "Use a supported browser and configuration for the best PawVault experience.",
    3,
    ["browser", "compatibility", "javascript", "cookies", "mobile"],
    ["website-troubleshooting", "account-session-troubleshooting", "api"],
    [
      {
        heading: "Supported browsers",
        blocks: [
          paragraph("Use the latest version of a current evergreen browser such as Chrome, Firefox, Safari, or Edge. PawVault uses modern web standards and requires JavaScript and cookies."),
        ],
      },
      {
        heading: "Configuration",
        blocks: [
          paragraph("Enable JavaScript, allow first-party cookies, and keep private browsing restrictions in mind. Some features may not work in older or unsupported browsers."),
          list([
            "Enable JavaScript for the site.",
            "Allow cookies for pawvault.com.",
            "Update the browser to the latest version.",
            "Try a different app or browser on mobile.",
          ]),
        ],
      },
    ]
  ),
  makeArticle(
    "api",
    "technical",
    "API overview",
    "Access the API documentation, authenticate requests, and handle errors safely.",
    4,
    ["API", "documentation", "authentication", "tokens", "rate limit"],
    ["webhooks", "website-troubleshooting", "payouts"],
    [
      {
        heading: "Documentation",
        blocks: [
          paragraph("Reference the API documentation at the dedicated API docs page. The docs include endpoint details, request, and response formats for supported operations."),
        ],
      },
      {
        heading: "Authentication and safety",
        blocks: [
          paragraph("Authenticated requests require your API key or authorization token sent in the Authorization header. Tokens are issued from your account or creator settings and are scoped by role."),
          callout("Secrets management", "Treat API keys like passwords. Never commit them to source control, never expose them in client-side code, and rotate them regularly."),
        ],
      },
    ]
  ),
  makeArticle(
    "webhooks",
    "technical",
    "Webhooks",
    "Understand how PawVault handles webhook events and signatures for payment and creator workflows.",
    4,
    ["webhooks", "events", "signature", "idempotency", "integrations"],
    ["api", "payouts", "storage-download-errors"],
    [
      {
        heading: "Platform webhooks",
        blocks: [
          paragraph("PawVault receives inbound webhook events from Stripe for payment and Connect payout activity. These events are platform-managed and update order and payout statuses in your account."),
        ],
      },
      {
        heading: "Receiving events",
        blocks: [
          paragraph("Webhook endpoints are HTTPS and validated using a signing secret. Each event includes an idempotent identifier to prevent duplicate processing. Keep your signing secrets rotated and stored securely."),
          callout("No direct configuration", "Custom outbound webhook destinations are not currently user-configurable. For integration questions, contact Support with the use case and any event identifiers."),
        ],
      },
    ]
  ),
  makeArticle(
    "storage-download-errors",
    "technical",
    "Storage and download errors",
    "Resolve errors while files are being processed, stored, or downloaded.",
    4,
    ["storage", "download", "error", "processing", "retry"],
    ["download-troubleshooting", "downloads", "website-troubleshooting"],
    [
      {
        heading: "File states",
        blocks: [
          paragraph("When a file is uploaded, it may move through processing, stored, or available states. A download starts only when the file is available and your license is active."),
        ],
      },
      {
        heading: "Recover from errors",
        blocks: [
          paragraph("If a download fails, retry from the Library after a brief wait. If a file shows processing or is unavailable, confirm the order is complete and the license is assigned to your account."),
          callout("Support", "If an error repeats, contact Support with the product name, version, order ID, and the exact error message shown."),
        ],
      },
    ]
  ),
  makeArticle(
    "status-incidents",
    "technical",
    "Service status and incidents",
    "Learn how PawVault communicates service availability and report incidents.",
    4,
    ["status", "incident", "uptime", "availability", "service"],
    ["website-troubleshooting", "storage-download-errors", "api"],
    [
      {
        heading: "Where updates appear",
        blocks: [
          paragraph("PawVault does not maintain a separate public status dashboard. Widespread incidents are announced through account notifications and official support channels."),
        ],
      },
      {
        heading: "Report an incident",
        blocks: [
          paragraph("If you experience a service-wide issue, report it to Support with the affected feature, time range, and any error text. Localized issues are usually browser or network related and are covered in Website Troubleshooting."),
          callout("Scope", "Before reporting, confirm the issue is not limited to one browser or network by trying another device."),
        ],
      },
    ]
  ),
]

export const helpSectionArticles = (section: HelpSection) =>
  publishedHelpArticles.filter((article) => article.section === section)

export function getHelpSectionArticles(section: HelpSection): HelpArticle[] {
  return publishedHelpArticles.filter((article) => article.section === section)
}

export function getHelpArticle(slug: string): HelpArticle | undefined {
  return publishedHelpArticles.find((article) => article.slug === slug)
}

export function getRelatedHelpArticles(related: string[] | undefined): HelpArticle[] {
  if (!Array.isArray(related)) {
    return []
  }
  const resolved = related
    .map((id) => getHelpArticle(id))
    .filter((article): article is HelpArticle => Boolean(article))
  return resolved.filter((article) => article.slug !== undefined && article.slug !== null)
}
