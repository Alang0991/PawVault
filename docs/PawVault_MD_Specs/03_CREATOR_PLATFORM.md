# PawVault — Creator Platform

> This document defines the production creator system for PawVault.
>
> This includes creator onboarding, creator applications, creator accounts, storefronts, products, files, versions, pricing, creator settings, creator moderation states, and creator-specific functionality.
>
> This document is for CURRENT PLATFORM IMPLEMENTATION.
>
> Do not implement future-only features from `07_FUTURE_ADD.md` unless explicitly approved.

---

# 1. Goal

PawVault must provide a complete creator experience.

A creator should be able to go from:

USER
→ Creator onboarding
→ Creator approval/activation
→ Store creation
→ Store setup
→ Product creation
→ Product review
→ Product publishing
→ Sales
→ Orders
→ Reviews
→ Updates
→ Creator management

The creator system must use the existing PawVault authentication, database, API, payment, file storage, notification, and authorization infrastructure wherever possible.

Do not create duplicate account systems.

Do not create fake creator accounts.

Do not create fake products, sales, orders, reviews, analytics, or creator statistics.

---

# 2. Creator Account Model

A PawVault user and a creator are not separate accounts.

A normal PawVault USER should be able to become a CREATOR.

The creator system should attach creator capabilities to the existing user account.

A creator should retain all normal user functionality.

For example:

USER
+
CREATOR

A creator should still be able to:

- Browse products
- Purchase products
- Maintain a library
- Leave reviews
- Use wishlist
- Submit feedback
- Manage their personal account

Becoming a creator must not remove customer functionality.

---

# 3. Creator Status

Do not rely solely on a role name to represent creator state.

Creator status should be represented separately where appropriate.

Possible creator states:

- Not a creator
- Application Draft
- Application Submitted
- Under Review
- Approved
- Rejected
- Suspended
- Banned
- Withdrawn

The exact database structure should follow the existing Prisma/database architecture.

A suspended creator must not be able to bypass restrictions by directly accessing creator routes.

A banned creator must not be able to continue creator activity.

---

# 4. Creator Onboarding

A normal USER must have an actual path to become a creator.

The current "Start Selling" and "Create a Store" flows must connect to this system.

Recommended flow:

USER
↓
Start Selling
↓
Creator onboarding
↓
Creator application or activation
↓
Approval if required
↓
CREATOR capability
↓
Creator profile
↓
Store setup
↓
Payout setup
↓
Creator terms
↓
First product
↓
Publish

Do not leave the user at a dead end.

---

# 5. Creator Application

If PawVault requires creator approval, implement a real creator application.

Potential fields:

- Display name
- Intended store name
- Store slug
- Creator category
- Store description
- Portfolio
- Website
- Social links
- Discord
- Intended products
- Creator experience
- Relevant information
- Agreement to creator terms

Do not collect unnecessary personal information.

Application states:

- Draft
- Submitted
- Under Review
- Approved
- Rejected
- Withdrawn

The user should be able to see the current application state.

---

# 6. Creator Application Review

Authorized staff should be able to review applications.

Staff should be able to see:

- Applicant
- Store name
- Store slug
- Description
- Portfolio
- Social links
- Application date
- Current status
- Previous decisions
- Moderation history where appropriate

Actions:

- Approve
- Reject
- Request changes
- Put under review
- Add internal note

All decisions must be audited.

---

# 7. Creator Approval

When approved:

The creator capability must be granted server-side.

Do not allow the frontend to simply change:

role = CREATOR

The server must perform the actual authorization and database update.

After approval:

- Creator dashboard becomes available
- Store creation becomes available
- Creator settings become available
- Product creation becomes available

The creator should receive an appropriate notification.

---

# 8. Open Your Store

The current "Open Your Store" page must never leave a user stuck with:

"Creator account required"

without an actionable next step.

If the user is already a creator:

Show the store creation form.

If the user is not a creator:

Show an appropriate path:

"Become a Creator"

or

"Apply to become a Creator"

depending on the platform's approval model.

Example:

"To open a PawVault store, you first need a creator account."

[ Become a Creator ]

or:

[ Apply to Become a Creator ]

The user should be taken directly into the appropriate onboarding flow.

---

# 9. Store Creation

Once the user has creator capability, they can create a store.

Store setup should support:

- Store name
- Store slug
- Description
- Store avatar/logo
- Banner
- Creator bio
- Social links
- Store categories
- Store policies
- Support/contact information
- Store visibility

Store creation must be server-authorized.

---

# 10. Store Slugs

Store slugs must be validated server-side.

Prevent:

- Duplicate slugs
- Invalid characters
- Empty slugs
- Excessively long slugs
- Reserved slugs
- Impersonation
- System route conflicts

Potential reserved routes include:

/admin
/founder
/creator
/dashboard
/api
/feedback
/roadmap
/changelog
/settings
/login
/register
/support
/help
/store

The exact list should come from the application's actual routing system.

---

# 11. Store Ownership

Every store must have an authoritative owner.

Store ownership must be enforced server-side.

A creator must not be able to:

- Edit another creator's store
- Upload to another creator's store
- Modify another creator's products
- View another creator's private analytics
- Change another creator's payout information

Staff access must also follow explicit permissions.

---

# 12. Creator Dashboard

Creator dashboard should provide access to:

- Overview
- Store
- Products
- Create Product
- Product drafts
- Orders
- Customers where legally/technically appropriate
- Reviews
- Sales
- Analytics where available
- Discounts
- Files
- Product versions
- Updates
- Notifications
- Creator settings
- Support

Only functionality that actually works should be displayed as active.

Do not create dashboard cards containing fake numbers.

---

# 13. Creator Profile

Creator profile should support:

- Creator name
- Avatar
- Banner
- Bio
- Store
- Products
- Reviews
- Categories
- Social links
- Website
- Creator status
- Verification badge if applicable

Only show verification if the account actually has verified status.

---

# 14. Verified Creator

Verified Creator must be separate from ordinary CREATOR capability.

A verified creator remains a creator.

Conceptually:

USER
+
CREATOR
+
VERIFIED

Do not replace CREATOR with VERIFIED_CREATOR.

Verification should be represented through the appropriate creator/account status architecture.

Only authorized staff can grant verification.

Creators cannot verify themselves.

Users cannot verify themselves.

---

# 15. Product Creation

Creators should be able to create products with:

- Title
- Description
- Thumbnail
- Gallery
- Product files
- Price
- Categories
- Tags
- Requirements
- Compatibility
- License
- Version
- Update notes
- Mature-content status where applicable
- AI-generated content disclosure where applicable
- Dependencies
- Optional product information

---

# 16. Product Lifecycle

Products should support clear states.

Potential states:

- Draft
- Pending Review
- Published
- Hidden
- Archived
- Rejected
- Suspended

A creator must not be able to bypass product moderation by directly manipulating the frontend.

---

# 17. Product Drafts

Creators should be able to save incomplete products.

Drafts should preserve:

- Product information
- Uploaded media
- Files
- Pricing
- Categories
- Requirements
- License
- Version

Creators should be able to leave and return later.

---

# 18. Product Files

Creator file management should support:

- Multiple files
- File metadata
- Upload progress
- Upload retry
- Upload failure recovery
- File replacement
- File deletion
- Protected storage
- Version association

Files must not become publicly downloadable merely because their URL is known.

---

# 19. File Security

Product files must use secure access.

Downloads should verify:

- User identity
- Product ownership
- Purchase state
- License state where applicable
- Product status
- Account status

Do not expose unrestricted permanent file URLs where secure delivery is required.

---

# 20. Product Versions

Creators should be able to publish product updates.

A version should support:

- Version number
- Release date
- Files
- Changelog
- Update notes
- Compatibility
- Requirements

Customers who own the product should be able to access eligible updates.

---

# 21. Requirements

Products should support structured requirements.

Potential requirements:

- Required product
- Optional product
- Unity version
- SDK version
- Software
- Shader
- Avatar/base
- Platform
- PC/Quest
- Dependency
- External software

Requirements should be clearly visible before purchase.

---

# 22. Pricing

Creators should be able to configure:

- Free
- Fixed price
- Sale price
- Discount
- Discount code where supported

Pricing must always be validated server-side.

Do not trust prices submitted by the frontend.

---

# 23. Free Products

Free products must still use the real ownership/library system.

A free product should result in a legitimate ownership record where appropriate.

Do not simply give the frontend a fake "owned" state.

---

# 24. Discounts

Creators should eventually be able to manage permitted discounts.

Potential functionality:

- Percentage discount
- Fixed discount where supported
- Start date
- End date
- Usage limit
- Product restrictions

All pricing calculations must be server-side.

---

# 25. Creator Sales

Creator sales information must come from real transactions.

Potential metrics:

- Revenue
- Orders
- Units sold
- Refunds
- Product performance
- Sales over time

Do not display fabricated analytics.

---

# 26. Orders

Creators should be able to view legitimate orders associated with their products.

Only expose information necessary for the creator's operation.

Do not expose sensitive customer information unnecessarily.

---

# 27. Customer Privacy

Creators must not automatically receive:

- Customer passwords
- Payment information
- Authentication tokens
- Private account information
- Unnecessary personal information

Use the minimum information required to operate the marketplace.

---

# 28. Reviews

Creators should be able to:

- View reviews for their products
- Respond where supported
- Report abusive reviews
- Understand review status

Creators must not be able to delete legitimate negative reviews.

Moderation should handle abusive, fraudulent, or policy-breaking reviews.

---

# 29. Product Updates

Creators should be able to communicate legitimate product updates.

Potential update information:

- Version
- Changes
- Fixes
- Compatibility
- Installation notes
- Important warnings

Customers who own the product should receive appropriate notifications.

---

# 30. Creator Notifications

Creator notifications may include:

- Product approved
- Product rejected
- Product reviewed
- New order
- Refund
- New review
- Store update
- Creator application status
- Moderation action
- Verification status
- Support response

Users must be able to manage notification preferences.

---

# 31. Creator Suspension

A creator may be suspended by authorized staff.

Suspension should support:

- Reason
- Start date
- End date
- Staff actor
- Internal notes
- Audit record
- Appeal state where applicable

A suspended creator should not be able to perform restricted creator actions.

---

# 32. Creator Ban

A banned creator must lose creator functionality server-side.

A ban must not be bypassable by:

- Direct URLs
- Frontend manipulation
- API manipulation
- Refreshing sessions
- Opening another creator route

Existing sessions should be handled appropriately.

---

# 33. Creator Reinstatement

Authorized staff should be able to reinstate a suspended creator where appropriate.

All reinstatement actions must be audited.

---

# 34. Creator Store Visibility

Stores may eventually support:

- Published
- Hidden
- Suspended
- Archived

A hidden or suspended store should not appear as normally available in public discovery.

---

# 35. Creator Terms

Before selling, creators should accept the applicable:

- Creator Terms
- Marketplace Rules
- Content Rules
- Refund Rules
- Licensing requirements
- Payout requirements

Record acceptance appropriately.

---

# 36. Payout Setup

Creator payouts must use the existing secure payment infrastructure.

Do not store payment secrets directly in PawVault.

Do not display sensitive payment provider information unnecessarily.

Creator payout state should be visible where appropriate.

---

# 37. Creator Support

Creators should have access to:

- Help Center
- Support
- Creator documentation
- Platform rules
- Product guidelines
- Payout guidance
- Moderation guidance

Support requests should use the real support system.

---

# 38. Creator API

If creator API functionality exists or is later implemented, use:

- Scoped API keys
- Permission scopes
- Rate limits
- Key revocation
- Audit logs
- Usage visibility

Never expose API secrets in frontend code.

---

# 39. Creator Data Export

Creators should eventually be able to export their own permitted:

- Product metadata
- Store information
- Sales information
- Order reports
- Analytics
- Product data

Exports must use secure background processing for large datasets.

---

# 40. Creator Security Rules

Creator permissions must always be checked server-side.

Never rely on:

- Hidden buttons
- Hidden routes
- Frontend role state
- Client-side checks

A creator's authority must be determined from the authenticated server-side session and permission system.

---

# 41. Definition of Done

The creator platform is not complete merely because:

- The creator page exists
- The store form exists
- The dashboard exists
- A CREATOR option appears
- The user can click "Create Store"

It is complete when:

USER
→ can start creator onboarding
→ can apply/become a creator
→ can be approved where required
→ receives creator capability
→ can create a store
→ can configure the store
→ can create products
→ can upload files
→ can submit products
→ can publish approved products
→ can receive legitimate orders
→ can manage legitimate products
→ can receive reviews
→ can manage creator settings

All important operations must work end-to-end with real data.