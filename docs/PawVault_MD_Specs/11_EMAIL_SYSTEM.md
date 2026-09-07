# PawVault — Email System

> Implementation specification for building PawVault's real email infrastructure.
>
> This is not a mock email UI. The goal is a real, reliable, secure email system connected to PawVault's actual account, marketplace, creator, support, moderation, commerce, and platform data.

---

# 1. PURPOSE

PawVault should have a central email system that can send the right email to the right user at the right time.

```text
PawVault event
↓
Determine whether an email is required
↓
Build email from real data
↓
Queue email
↓
Send through configured provider
↓
Track delivery
↓
Record result
```

Do not build separate random email-sending implementations for every feature.

There should be one central email service used throughout PawVault.

---

# 2. CORE PRINCIPLE

Every email must be:

- Real
- Data-driven
- Secure
- Idempotent
- Traceable
- Template-based
- Mobile-friendly
- Accessible
- Consistent with PawVault branding
- Respectful of user preferences
- Safe against duplicate sends

Do not use fake/static recipient data in production.

Do not hard-code user-specific content into templates.

---

# 3. EMAIL PROVIDER

PawVault needs a real transactional email provider.

Possible providers include:

- Resend
- Postmark
- SendGrid
- Amazon SES
- Another suitable provider

Kilo should inspect the existing project configuration and use the provider that best fits the existing architecture.

Do not expose provider API keys to the client.

Provider credentials must be server-side secrets.

---

# 4. CENTRAL EMAIL ARCHITECTURE

Use one central service:

```text
Application
    ↓
Email Service
    ↓
Email Template
    ↓
Email Queue
    ↓
Email Provider
    ↓
Recipient
```

Avoid calling the provider directly from random route handlers.

Prefer domain events feeding the central email service.

---

# 5. EMAIL CATEGORIES

Separate emails into:

## Transactional

- Email verification
- Password reset
- MFA/security notifications
- Order confirmation
- Purchase receipt
- Product access
- Refund status
- Creator payout notifications
- Important account changes

## Operational

- Support ticket updates
- Commission updates
- Moderation case notifications
- Product update notifications
- Team notifications

## Platform

- Announcements
- Maintenance notices
- Major platform changes
- Changelog
- What's New

## Optional

- Wishlist activity
- Followed creator activity
- Product releases
- Optional creator updates
- Marketing/promotional email

Optional categories must respect user preferences.

---

# 6. AUTHENTICATION EMAILS

Implement real:

- Verification emails
- Verification resend
- Password reset
- Password changed notification
- Email address changed notification
- MFA/security notifications

Sensitive authentication emails must use secure, expiring, single-use tokens where required.

Never log password-reset or verification secrets.

---

# 7. PASSWORD RESET

Flow:

```text
Forgot password
↓
Request reset
↓
Generate secure token
↓
Store secure representation
↓
Send email
↓
User opens link
↓
Validate token
↓
Reset password
↓
Invalidate token
↓
Handle affected sessions securely
```

Do not expose whether an account exists through the request response.

---

# 8. EMAIL VERIFICATION

Flow:

```text
Register
↓
Verification email
↓
Secure verification link
↓
Validate token
↓
Mark email verified
↓
Invalidate token
```

Include:

- Expiration
- Single use
- Rate limiting
- Resend
- Safe failure handling

---

# 9. SECURITY EMAILS

Support notifications for:

- Password changed
- Email changed
- MFA enabled
- MFA disabled
- New security method
- Suspicious login
- Account recovery
- Important security restriction
- Account suspension where appropriate

Explain what happened and what the user can do.

Do not expose unnecessary sensitive data.

---

# 10. GLOBAL NO-LOGOUT RULE

This email system connects directly to `10_GLOBAL_SESSION_PERMISSION_SYNC.md`.

If a user's role, permission, feature access, entitlement, team membership, creator capability, staff status, or other normal account capability changes:

```text
Account changes
↓
Existing session synchronizes
↓
Access changes
```

If the user should be informed:

```text
Account changes
↓
Email notification
```

These are separate systems.

**Never tell users to sign out and sign back in to activate a normal newly granted capability.**

This applies globally to:

- Moderation
- Admin
- Support
- Creator tools
- Creator teams
- Feature flags
- Beta access
- Entitlements
- Analytics
- Commission tools
- Developer access
- Staff tools
- Any future permission-controlled feature

Only genuine security/session events may require session invalidation.

---

# 11. ROLE/PERMISSION EMAILS

When important access changes:

```text
Moderator assigned
Admin permission changed
Support access granted
Creator capability enabled
Team role changed
```

PawVault may send an informational email.

Example:

```text
You've been granted moderation access.

Your moderation tools are now available in PawVault.
```

The email is informational.

It must NOT be the mechanism that activates the permission.

The existing session synchronization system must activate the access.

---

# 12. MODERATION EMAILS

Potential events:

- Report received where notification is appropriate
- Product hidden
- Product restored
- Store suspended
- Store restored
- Account restriction
- Appeal received
- Appeal update
- Appeal decision
- Urgent moderation escalation

Do not reveal private reporter information unless policy allows it.

Do not send internal moderation notes or evidence to creators/customers.

---

# 13. MODERATOR STAFF EMAILS

Authorized moderators may receive:

- High-priority moderation case
- Escalated case
- Appeal requiring review
- Urgent safety issue
- Case assignment

Staff-only email must only go to currently authorized recipients.

A Moderator should not automatically receive global email administration access.

---

# 14. CREATOR OWNERSHIP BOUNDARY

Email communications must respect creator ownership.

PawVault may notify creators about platform actions involving their content, but must not falsely claim ownership.

For example:

```text
Your product has been temporarily hidden while a report is reviewed.
```

not:

```text
PawVault now owns your product.
```

Moderation email does not transfer ownership.

---

# 15. ORDER EMAILS

When an order succeeds:

```text
Order committed
↓
Order event
↓
Email queued
↓
Email sent
```

Use real:

- Order number
- Products
- Creators
- Prices
- Discounts
- Taxes where applicable
- Total
- Currency
- Purchase date
- Access information

Email failure must not roll back a successful order.

---

# 16. DIGITAL PRODUCT DELIVERY

Prefer secure PawVault links rather than sensitive files in email attachments.

```text
Email
↓
Secure PawVault link
↓
Authenticated/access-controlled page
↓
Customer downloads content
```

The link must verify the customer's actual entitlement.

---

# 17. LICENSE EMAILS

Where applicable, include:

- Product
- License
- Order
- License reference
- Relevant license information
- Secure link

Do not expose unnecessary internal identifiers.

---

# 18. REFUND EMAILS

Reflect actual refund state.

Possible states:

```text
Refund requested
Refund under review
Refund approved
Refund denied
Refund processing
Refund completed
```

Never tell the customer a refund succeeded until the authoritative refund state says it succeeded.

---

# 19. CREATOR PAYOUT EMAILS

Potential emails:

- Payout initiated
- Payout completed
- Payout failed
- Payout requires attention
- Payment information changed
- Tax/payment setup requires action

Use real financial data and do not expose unnecessary financial/security information.

---

# 20. SUPPORT EMAILS

Support events:

```text
Ticket created
Ticket reply
Ticket assigned
Ticket status changed
Ticket resolved
Ticket reopened
```

Include:

- Ticket reference
- Subject
- Short relevant preview
- Current status
- Secure PawVault link

Do not put an entire sensitive support history into email by default.

---

# 21. COMMISSION EMAILS

For the future commission system:

- Commission request
- Accepted
- Declined
- Brief received
- Milestone update
- Revision request
- Delivery
- Payment event
- Refund/dispute
- Completion
- Cancellation

Recipients must come from actual commission relationships.

---

# 22. TEAM/COLLABORATION EMAILS

For creator teams:

- Team invitation
- Member added
- Member removed
- Role changed
- Collaboration invitation
- Accepted/declined

Do not send private team information to users who no longer have access.

---

# 23. PRODUCT UPDATE EMAILS

Customers may optionally receive meaningful updates for products they own.

Possible content:

- Product name
- Update title
- Short summary
- Version/release
- Compatibility information
- Secure product/update link

Creator-controlled update content must remain creator-owned.

---

# 24. WISHLIST / FOLLOW EMAILS

Future optional notifications can include:

- Wishlisted product update
- Product availability
- New creator release
- Followed creator announcement
- Meaningful creator update

Do not send an email for every tiny change.

Respect preferences and sensible frequency limits.

---

# 25. EMAIL PREFERENCES

Create a centralized email preference system.

Example:

```text
Security                    Required
Account                     On
Orders & Purchases          On
Refunds                     On
Support                     On
Moderation/Account Actions  Required where applicable
Product Updates             On
Followed Creators           Off
Marketing                   Off
```

Required transactional/security categories must not be treated as ordinary marketing.

---

# 26. UNSUBSCRIBE

Optional marketing/promotional email must have a working unsubscribe mechanism.

It must:

- Be easy to use
- Update preferences
- Suppress future optional marketing
- Preserve required transactional/security communication

---

# 27. EMAIL TEMPLATES

Use reusable templates rather than random HTML strings inside routes.

Each template should support:

- Template key
- Version
- Subject
- Preview text
- HTML
- Plain text
- Variables
- Future localization

Example:

```text
ORDER_CONFIRMATION
PASSWORD_RESET
SUPPORT_TICKET_REPLY
MODERATION_ACTION
PRODUCT_UPDATE
```

---

# 28. BRANDING

Emails should feel like PawVault.

Keep consistent:

- PawVault branding
- Logo
- Typography
- Buttons
- Footer
- Support link
- Legal links
- Preference links

Avoid generic provider-looking templates.

---

# 29. MOBILE + ACCESSIBILITY

Emails should work on:

- Desktop
- Mobile
- Common email clients
- Dark mode where practical

Include:

- Semantic structure
- Readable text
- Accessible buttons
- Descriptive links
- Meaningful headings
- Plain-text alternative

Do not rely on color alone.

---

# 30. EMAIL QUEUE

Email delivery should normally be asynchronous.

```text
Business action
↓
Business transaction succeeds
↓
Email job created
↓
Response returned
↓
Worker sends email
```

An email provider outage should not normally break unrelated business operations.

---

# 31. IDEMPOTENCY

Duplicate events must not create duplicate emails.

Example:

```text
ORDER_COMPLETED event #abc
ORDER_COMPLETED event #abc
```

Expected:

```text
One intended email
```

Use event/job/idempotency identifiers and database uniqueness where appropriate.

---

# 32. RETRIES

Transient failures should retry with bounded backoff.

```text
Attempt 1 → fail
↓
Retry
↓
Attempt 2 → fail
↓
Retry
↓
Attempt 3 → success
```

Never retry forever.

---

# 33. FAILED EMAILS

After retry exhaustion:

```text
FAILED
```

must be recorded.

Authorized staff should be able to investigate.

Do not silently discard failed emails.

---

# 34. DELIVERY STATUS

Track useful states such as:

```text
QUEUED
PROCESSING
SENT
DELIVERED
BOUNCED
FAILED
COMPLAINED
CANCELLED
```

Use provider-supported delivery information.

---

# 35. PROVIDER WEBHOOKS

If supported, process provider delivery webhooks.

Possible events:

- Delivered
- Bounced
- Complained
- Failed
- Opened
- Clicked

Do not treat opens/clicks as guaranteed truth.

---

# 36. BOUNCE HANDLING

For hard bounces:

```text
Bounce received
↓
Record result
↓
Apply suppression policy
↓
Avoid repeated sends
```

Do not endlessly retry invalid addresses.

---

# 37. COMPLAINT HANDLING

If a user reports optional email as spam:

- Record the complaint
- Respect suppression
- Prevent prohibited future sends
- Keep required communication categories separate

---

# 38. EMAIL AUDIT HISTORY

Store safe metadata such as:

```text
Email ID
User ID
Template
Category
Event ID
Created
Queued
Sent
Provider ID
Status
Failure reason
```

Never store plaintext security tokens.

---

# 39. STAFF EMAIL DIAGNOSTICS

Authorized staff should be able to determine:

```text
Was email generated?
Was it queued?
Was it sent?
Which template?
Which event?
Provider response?
Delivery state?
Failure reason?
```

Do not expose full private email content to every staff role.

---

# 40. TEST EMAILS

Provide a safe development/testing system for:

- Template preview
- Test variables
- Test delivery

Production test sending must be restricted.

Never accidentally send production-sensitive information to arbitrary addresses.

---

# 41. EVENT-DRIVEN EMAILS

Prefer existing PawVault domain events.

Examples:

```text
USER_REGISTERED
EMAIL_VERIFICATION_REQUIRED
PASSWORD_RESET_REQUESTED
PASSWORD_CHANGED
EMAIL_CHANGED
ORDER_COMPLETED
REFUND_STATUS_CHANGED
PAYOUT_STATUS_CHANGED
SUPPORT_TICKET_CREATED
SUPPORT_TICKET_REPLIED
MODERATION_ACTION_CREATED
APPEAL_UPDATED
PRODUCT_UPDATED
TEAM_INVITATION_CREATED
PLATFORM_ANNOUNCEMENT
```

Use existing event names if the project already defines them.

---

# 42. OUTBOX PATTERN

Where PawVault has transactional event/outbox infrastructure:

```text
Database transaction
├── Update business state
└── Create event
↓
Commit
↓
Worker
↓
Email job
↓
Provider
```

This prevents successful business actions from losing their email event due to an application crash.

---

# 43. EMAIL CONTENT SECURITY

Never put unnecessary sensitive data into email.

Avoid:

- Passwords
- MFA secrets
- Reset tokens in logs
- Private moderation evidence
- Internal moderation notes
- Payment credentials
- Full financial details
- Private messages
- Sensitive support history

Use secure authenticated links for additional information.

---

# 44. RATE LIMITING

Rate-limit email-generating actions:

- Verification resend
- Password reset
- Email changes
- Invitations
- Optional notifications
- Campaigns

Prevent abuse and accidental email floods.

---

# 45. EMAIL FLOOD PROTECTION

Protect against loops:

```text
event
↓
email
↓
event
↓
email
```

Use:

- Idempotency
- Event controls
- Per-user limits
- Per-template limits
- Monitoring

---

# 46. DIGESTS

Future optional notifications can support batching:

```text
10 product updates
↓
One daily digest
```

Do not digest urgent security/account messages.

---

# 47. EMAIL PRIORITY

Suggested priority:

```text
CRITICAL
Security/account

HIGH
Orders/refunds/support

NORMAL
Product updates

LOW
Optional activity/marketing
```

Critical emails should not wait behind bulk campaigns.

---

# 48. RECIPIENT RULES

Recipients must be determined from authoritative relationships.

Examples:

```text
Order confirmation
→ Customer

Creator sale notification
→ Creator, where applicable

Support reply
→ Ticket requester

Moderation action
→ Affected account where policy requires

Staff escalation
→ Authorized staff
```

Never blindly email everyone connected to an object.

---

# 49. STAFF EMAIL SECURITY

Staff-only notifications must verify authorization.

If someone loses staff permission:

```text
Permission removed
↓
Future staff-only email eligibility removed
```

Do not treat historical staff status as permanent authorization.

---

# 50. EMAIL CONTENT REGISTRY

Maintain a central registry.

Example:

```text
EMAIL_VERIFICATION
PASSWORD_RESET
PASSWORD_CHANGED
EMAIL_CHANGED
ORDER_CONFIRMATION
REFUND_UPDATE
PAYOUT_UPDATE
SUPPORT_TICKET_CREATED
SUPPORT_TICKET_REPLY
MODERATION_ACTION
APPEAL_UPDATE
PRODUCT_UPDATE
TEAM_INVITATION
PLATFORM_ANNOUNCEMENT
```

Each entry should define:

- Category
- Required/optional
- Template
- Event
- Recipient rule
- Preference key
- Priority
- Security classification

---

# 51. TEMPLATE DATA CONTRACTS

Templates should receive explicit data.

Example:

```text
ORDER_CONFIRMATION

Required:
- recipient
- order
- order_number
- currency
- items
- total
- order_url
```

Do not let templates query arbitrary database state.

Prepare their required data before rendering.

---

# 52. USER-GENERATED CONTENT

Any user-generated content included in email must be safely rendered.

Potential sources:

- Product descriptions
- Creator names
- Support messages
- Commission briefs
- Creator posts
- Product updates

Prevent HTML/script injection.

---

# 53. EMAIL LINKS

Use configured canonical PawVault URLs.

Examples:

```text
Verification
→ verification page

Password reset
→ reset page

Order
→ order page

Product update
→ product/update page

Support
→ support ticket

Appeal
→ authenticated appeal page
```

Do not build production links from untrusted hostnames.

---

# 54. LINK SECURITY

Sensitive email links should:

- Use HTTPS
- Use secure tokens
- Expire where appropriate
- Be single-use where appropriate
- Avoid unnecessary PII
- Validate server-side

---

# 55. SENDING DOMAIN

Production email should eventually have proper domain authentication such as:

- SPF
- DKIM
- DMARC

Kilo should document the exact DNS records required by the chosen provider.

Do not claim DNS configuration is complete unless it is actually configured.

---

# 56. ENVIRONMENT SEPARATION

Separate:

```text
development
staging
production
```

Email configuration.

Development must not accidentally email real customers.

Use controlled test recipients/provider sandboxing where possible.

---

# 57. EMAIL OBSERVABILITY

Track:

- Queued
- Sent
- Delivered
- Failed
- Bounced
- Complained
- Retry count
- Queue latency
- Provider errors
- Template errors

Avoid logging email bodies unnecessarily.

---

# 58. EMAIL HEALTH

Future staff tooling should show:

```text
Email Health
├── Queue
├── Sending
├── Delivery
├── Failures
├── Bounces
├── Complaints
├── Provider status
└── Template errors
```

Access must be permission-scoped.

---

# 59. SUPPORT INTEGRATION

Support should be able to investigate:

```text
Customer:
"I never received my order email."

Support:
Order completed
↓
Email queued
↓
Provider accepted
↓
Delivered / bounced / failed
```

Do not expose provider credentials.

---

# 60. NOTIFICATION CENTER

Where PawVault has in-app notifications:

```text
Platform event
├── In-app notification
└── Email notification where appropriate
```

Do not build separate conflicting event systems.

---

# 61. LEGAL/POLICY EMAILS

Integrate with PawVault's platform content/legal system for:

- Terms updates
- Privacy updates
- Important policy changes
- Required account notices

Do not classify required legal/account communication as marketing.

---

# 62. ANNOUNCEMENT EMAILS

Future platform announcements should support:

```text
Announcement
↓
Audience selection
↓
Eligibility/preferences
↓
Email campaign/job
↓
Delivery tracking
```

Include preview, recipient count, permissions, and auditability before bulk sending.

---

# 63. MARKETING SEPARATION

Keep promotional email separate from transactional email.

Do not use one global:

```text
email_enabled
```

setting.

Use category-level preferences.

---

# 64. CREATOR PRIVACY

Creators must not gain access to:

- Other creators' mailing lists
- Customer private email addresses outside permitted functionality
- Staff email lists
- Platform-wide lists
- Other creators' delivery analytics

Where customer communication is needed, use PawVault-mediated communication where appropriate.

---

# 65. DATA RETENTION

Define retention for:

- Delivery metadata
- Provider IDs
- Audit data
- Failure information
- Template versions

Do not retain unnecessary email contents indefinitely.

Align retention with PawVault's Privacy Policy and legal requirements.

---

# 66. EMAIL SERVICE API

Create a server-side abstraction such as:

```text
sendTransactionalEmail()
queueEmail()
renderTemplate()
getEmailStatus()
```

Exact names should match the existing codebase.

The browser must never call the email provider directly.

---

# 67. EMAIL JOB MODEL

Conceptual fields:

```text
id
event_id
template_key
template_version
recipient_user_id
recipient_email
category
priority
status
provider_message_id
attempt_count
scheduled_at
sent_at
delivered_at
failed_at
failure_reason
created_at
updated_at
```

Only use fields appropriate to the existing database design.

---

# 68. EMAIL EVENT MODEL

Conceptual fields:

```text
id
event_type
entity_type
entity_id
actor_user_id
payload_reference
created_at
processed_at
```

Avoid unnecessary sensitive payload storage.

---

# 69. DO NOT TRUST CLIENT RECIPIENTS

For account-linked transactional emails:

```text
Authenticated account
↓
Server determines current verified email
↓
Server sends
```

Do not let the client choose an arbitrary recipient.

---

# 70. EMAIL CHANGE + SESSION SYNC

If a user changes their email:

```text
Email verified/changed
↓
Account state updates
↓
Existing session remains valid where safe
↓
Preferences remain attached to account
↓
Security notifications sent
```

Do not require logout/login merely because the email address changed unless security policy genuinely requires it.

---

# 71. ROLE CHANGE + EMAIL + SESSION

Example:

```text
Founder assigns Moderator
        ↓
Role persisted
        ├── Account-state synchronization
        └── Email notification
                ↓
Existing session updates
                ↓
Moderation tab appears
                ↓
Moderation tools work
```

The email does not activate access.

The account/session system does.

---

# 72. ROLE REMOVAL

Example:

```text
Moderator removed
        ↓
Role persisted
        ├── Account-state synchronization
        └── Optional notification
                ↓
Existing session loses permission
                ↓
Moderation tools disappear
                ↓
Server rejects future moderation actions
```

No manual logout is required.

---

# 73. EMAIL AND SESSION SYSTEMS MUST NOT BE COUPLED INCORRECTLY

Do not implement:

```text
Role email sent
↓
User clicks email
↓
Permission activates
```

Instead:

```text
Role saved
├── Session sync
└── Optional email
```

The server remains authoritative.

---

# 74. TEST MATRIX

Test:

| Event | Already logged in | Logout required | Expected |
|---|---:|---:|---|
| Moderator assigned | Yes | No | Moderation appears |
| Admin permission added | Yes | No | Admin access appears |
| Support permission added | Yes | No | Support tools appear |
| Creator capability added | Yes | No | Creator tools appear |
| Team membership added | Yes | No | Team tools appear |
| Feature flag enabled | Yes | No | Feature appears |
| Entitlement granted | Yes | No | Access appears |
| Permission removed | Yes | No | Access disappears |

---

# 75. EMAIL TESTS

Authentication:

- Verification
- Resend verification
- Password reset
- Password changed
- Email changed
- MFA/security

Commerce:

- Order confirmation
- Product access
- Refund
- Payout

Support:

- Ticket created
- Reply
- Status change

Moderation:

- Action
- Appeal
- Escalation

Creator:

- Product update
- Team invitation

Platform:

- Announcement
- Changelog
- Policy notification

---

# 76. DUPLICATE TEST

Trigger the same event multiple times.

Expected:

```text
One business event
→ One intended email
```

Retries must not duplicate the email.

---

# 77. PROVIDER FAILURE TEST

Simulate provider failure.

Expected:

```text
Business action succeeds
↓
Email remains retryable
↓
Provider recovers
↓
Email sends
```

---

# 78. PREFERENCE TEST

Disable an optional category.

Trigger its event.

Expected:

```text
No optional email
```

Required/security emails continue according to their category.

---

# 79. SECURITY TESTS

Attempt to:

- Send another user's order email
- Send another user's reset email
- Read another user's email history
- Trigger staff-only email
- Modify another user's preferences
- Supply an arbitrary transactional recipient

All must fail.

---

# 80. IMPLEMENTATION PHASES

## Phase 1 — Infrastructure

- Provider
- Environment configuration
- Central email service
- Queue
- Delivery state
- Retry
- Idempotency
- Basic logging

## Phase 2 — Authentication

- Verification
- Password reset
- Security notifications
- Email change

## Phase 3 — Commerce

- Orders
- Product access
- Refunds
- Creator payouts

## Phase 4 — Support + Moderation

- Support
- Moderation
- Appeals
- Staff escalation

## Phase 5 — Creator + Community

- Product updates
- Creator activity
- Teams
- Commissions

## Phase 6 — Platform

- Changelog
- Announcements
- Policy notices
- Optional marketing

---

# 81. IMPLEMENTATION ORDER

Recommended:

```text
1. Provider
2. Central email service
3. Queue/outbox
4. Verification
5. Password reset
6. Security
7. Orders
8. Refunds
9. Support
10. Moderation
11. Creator notifications
12. Platform notifications
13. Optional marketing
```

Do not start with bulk marketing before critical transactional email is stable.

---

# 82. DEFINITION OF DONE

- [ ] Real provider configured
- [ ] Provider credentials server-side
- [ ] Central email service
- [ ] Queue/outbox
- [ ] Retry logic
- [ ] Idempotency
- [ ] Delivery tracking
- [ ] Bounce handling
- [ ] Complaint handling
- [ ] Reusable templates
- [ ] Plain-text versions
- [ ] Mobile-safe emails
- [ ] Accessibility
- [ ] Verification
- [ ] Password reset
- [ ] Security emails
- [ ] Order emails
- [ ] Refund emails
- [ ] Support emails
- [ ] Moderation emails
- [ ] Creator emails
- [ ] Role/permission notifications
- [ ] Email preferences
- [ ] Optional unsubscribe
- [ ] Audit history
- [ ] Staff diagnostics
- [ ] Rate limiting
- [ ] Privacy safeguards
- [ ] Environment separation
- [ ] Real-data integration
- [ ] No client-side provider access
- [ ] No sensitive-data leakage
- [ ] No forced logout/login for ordinary account-state changes

---

# 83. KILO IMPLEMENTATION RULE

Do not treat this as only a visual email-template task.

The implementation includes:

```text
DATABASE
+
EVENTS
+
OUTBOX
+
QUEUE
+
EMAIL SERVICE
+
PROVIDER
+
TEMPLATES
+
PREFERENCES
+
DELIVERY TRACKING
+
SECURITY
+
AUDIT
```

Inspect the existing PawVault architecture first.

Reuse existing:

- Auth/session system
- Event system
- Outbox infrastructure
- User/account model
- Orders
- Refunds
- Support
- Moderation
- Notifications
- Platform content system

Do not create duplicate systems where an existing system can be reused.

---

# 84. DO NOT BREAK EXISTING SYSTEMS

Adding email must not break:

- Authentication
- Checkout
- Orders
- Downloads
- Licenses
- Creator payouts
- Moderation
- Support
- Notifications
- Permissions
- Session synchronization
- Creator ownership

Email is an additional notification side effect, not the authority for the underlying business action.

---

# 85. FINAL ARCHITECTURE

```text
                    PAWVAULT EVENT
                         │
                         ▼
                 ┌───────────────┐
                 │ Event / Outbox │
                 └───────┬───────┘
                         │
                         ▼
                 ┌───────────────┐
                 │ Email Router  │
                 └───────┬───────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
     Preferences     Recipient       Template
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                 ┌───────────────┐
                 │ Email Queue   │
                 └───────┬───────┘
                         │
                         ▼
                 ┌───────────────┐
                 │ Email Provider│
                 └───────┬───────┘
                         │
                         ▼
                       USER
                         │
                         ▼
                Delivery Webhook
                         │
                         ▼
                Email Audit/Status
```

---

# 86. FINAL PRINCIPLE

> **PawVault emails should be a reliable notification layer connected to the platform's real event system, not a collection of disconnected email scripts.**

And:

> **Email notifications must never be used as a substitute for live account/session synchronization.**

If a user's permissions change:

```text
Account changes
↓
Session synchronizes
↓
Access changes
```

If the user should also be informed:

```text
Account changes
↓
Email notification
```

Both happen independently.

The user should not have to:

```text
Sign out
↓
Sign in
```

to make any ordinary newly granted PawVault capability work.

---

# 87. FINAL SECURITY RULE

> **The server decides what the user can access. The email system informs the user what happened.**

Never reverse those responsibilities.
