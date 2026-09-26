# PawVault — Technical Security & Infrastructure

> This document defines the technical security requirements supporting PawVault's marketplace, creator platform, roles, moderation, payments, files, authentication, APIs, and future infrastructure.
>
> Security requirements must be implemented server-side.
>
> Never rely solely on frontend restrictions.

---

# 1. Security Principle

The frontend is an untrusted client.

Never assume that because:

- A button is hidden
- A route is hidden
- A dropdown option is hidden
- A role is hidden
- A page is inaccessible through navigation

the operation is secure.

Every protected action must be validated by the server.

---

# 2. Authentication

Audit the complete authentication flow:

Registration
→ Email verification
→ Login
→ Session
→ Password reset
→ Logout
→ Account security

Passwords must:

- Never be stored plaintext
- Never be logged
- Use secure password hashing
- Be validated server-side
- Use appropriate password reset flows

---

# 3. Session Security

Sessions must:

- Be securely generated
- Be validated server-side
- Expire appropriately
- Be invalidatable
- Respect account bans
- Respect account suspensions
- Respect permission changes where necessary

When serious account moderation occurs, existing sessions should be invalidated or restricted where appropriate.

---

# 4. Multi-Role Authorization

The authorization system must support multiple roles simultaneously.

Example:

USER
CREATOR
MODERATOR

Authorization checks should evaluate the complete set of roles and permissions.

Do not assume:

user.role === "CREATOR"

if the platform supports multiple roles.

Use an appropriate role/permission abstraction.

---

# 5. Permission Checks

Every protected action should use server-side permission checks.

Examples:

requirePermission("users.ban")

requirePermission("creators.verify")

requirePermission("products.moderate")

requirePermission("reports.resolve")

Do not implement authorization by checking only whether a button is visible.

---

# 6. Founder Protection

FOUNDER is a protected system role.

The server must reject attempts to:

- Grant Founder
- Remove Founder
- Demote Founder
- Suspend Founder
- Ban Founder
- Delete Founder
- Modify protected Founder permissions

This must work even if the request is manually constructed.

---

# 7. Founder API Security

Any role-management API must contain explicit Founder protection.

Example:

POST /api/admin/users/[id]/roles

must reject:

- target role = FOUNDER
- removing FOUNDER
- changing protected Founder permissions

Do not rely on frontend restrictions.

---

# 8. Role Escalation Protection

Prevent privilege escalation such as:

USER
→ ADMIN

CREATOR
→ MODERATOR

MODERATOR
→ ADMIN

ADMIN
→ FOUNDER

unless the actor has explicit authority.

FOUNDER remains protected from ordinary role management.

---

# 9. Self-Promotion Protection

Users must never be able to modify their own authority to gain additional privileges.

Reject attempts to:

- Grant self ADMIN
- Grant self MODERATOR
- Grant self FOUNDER
- Grant self protected permissions
- Grant self verification

---

# 10. Creator Authorization

Creator operations must verify:

- Authenticated user
- Creator capability
- Creator status
- Ownership of resource
- Account status
- Product/store ownership

Example:

A creator may modify:

their own store

but not:

another creator's store.

---

# 11. Store Ownership

Store APIs must verify the authenticated creator owns or is explicitly authorized to manage the store.

Never trust:

storeId
userId
creatorId

from the frontend.

Resolve ownership server-side.

---

# 12. Product Ownership

Product management must verify:

- Creator ownership
- Product ownership
- Product status
- Account status

A creator must not be able to modify another creator's product by changing an ID in a request.

---

# 13. File Security

Uploaded product files must be protected.

Do not expose permanent unrestricted download URLs where secure access is required.

Downloads should verify:

- Authentication
- Ownership
- Purchase
- License
- Product state
- Account state

---

# 14. File Upload Security

Uploaded files should be checked for:

- Allowed file types
- File size
- Malicious content
- Unexpected extensions
- Path traversal
- Dangerous filenames
- Duplicate abuse where appropriate

Future malware scanning should be integrated when available.

---

# 15. File Storage

Store files outside publicly writable web directories where appropriate.

Use secure object/file storage.

Do not trust filenames.

Generate safe internal identifiers.

---

# 16. API Security

All APIs must:

- Authenticate
- Authorize
- Validate input
- Rate-limit where appropriate
- Return safe errors
- Avoid exposing secrets
- Avoid leaking internal implementation details

---

# 17. Input Validation

Validate:

- Strings
- IDs
- URLs
- Prices
- Currency codes
- Roles
- Permissions
- File metadata
- Product data
- Store slugs
- Feedback
- Reports

Never trust frontend validation.

---

# 18. Rate Limiting

Rate-limit abuse-prone operations:

- Login
- Password reset
- Registration
- Feedback posting
- Comments
- Reviews
- Reports
- Role changes
- File uploads
- Product creation
- API calls
- Commission requests when commissions eventually exist

---

# 19. Audit Logging

Security-sensitive actions must generate audit events.

Examples:

- Role changes
- Permission changes
- Bans
- Suspensions
- Unbans
- Unsuspensions
- Creator approval
- Creator rejection
- Verification
- Product moderation
- Report resolution
- Founder actions
- Staff changes

---

# 20. Audit Log Security

Audit logs must be:

- Append-oriented
- Permission-protected
- Tamper-resistant where possible
- Searchable
- Timestamped

Never log:

- Passwords
- Access tokens
- Session tokens
- API secrets
- Payment secrets
- Private authentication credentials

---

# 21. Account Status Enforcement

Every important authenticated request should consider account status.

Potential statuses:

- Active
- Suspended
- Banned
- Disabled

Do not assume that a valid session means the user is currently authorized.

---

# 22. Ban Enforcement

A banned account must not continue restricted actions through:

- Existing session
- Direct API requests
- Creator routes
- Product routes
- Store routes

Server-side account-status checks must enforce the restriction.

---

# 23. Suspension Enforcement

Temporary suspensions should support:

- Start time
- End time
- Reason
- Actor
- Audit record

Expired suspensions should be handled automatically where appropriate.

---

# 24. Payments

Payment operations must be server-authoritative.

Never trust:

- Frontend price
- Frontend discount
- Frontend ownership
- Frontend payment success
- Frontend currency conversion

The server must calculate and verify the actual transaction.

---

# 25. Stripe / Payment Webhooks

Payment webhooks must verify:

- Signature
- Event authenticity
- Event type
- Event state

Use idempotency to prevent duplicate processing.

Handle retries safely.

---

# 26. Payment Reconciliation

Orders should be reconciled against verified payment state.

Do not mark an order paid solely because the frontend returned success.

---

# 27. Refund Security

Refunds must update the appropriate:

- Order state
- Payment state
- Ownership
- License
- Accounting state
- Audit history

Do not leave customers with valid ownership after a refund unless the platform policy explicitly allows it.

---

# 28. Currency

Currency selection must distinguish between:

DISPLAY CURRENCY

and:

TRANSACTION CURRENCY

The selected display currency must not automatically change the actual transaction currency.

If PawVault supports conversion:

- Use a real exchange-rate source
- Never hardcode fake exchange rates
- Show approximate conversions where appropriate
- Keep original price authoritative

If conversion data is unavailable:

Show the original price.

Do not invent a rate.

---

# 29. Language / Localization

Localization must not be implemented by trusting arbitrary client values.

Supported languages should come from a known configuration.

Do not allow a user to select a language that does not actually exist.

Language preferences should be safely stored and validated.

---

# 30. Creator Applications

Creator applications must use server-side authorization.

Only authorized staff should be able to:

- Approve
- Reject
- Request changes
- Add internal notes

A user cannot approve their own application.

---

# 31. Creator Verification

Verified creator status must be server-authorized.

A user cannot:

- Modify their own verification
- Send a frontend request claiming verification
- Change verification through profile data

The server must determine verification state.

---

# 32. Role Management

Role assignment APIs must:

- Authenticate actor
- Verify actor permission
- Verify target user
- Validate requested role
- Validate role hierarchy
- Enforce Founder protection
- Prevent self-escalation
- Audit the action

---

# 33. Permission Management

Permissions must be stored and evaluated safely.

Do not allow users to submit:

permissions: ["everything"]

and have the backend accept it.

Every permission must be recognized and explicitly handled.

---

# 34. Direct API Security Testing

Test unauthorized requests manually.

Examples:

USER attempts:
grant ADMIN

USER attempts:
grant FOUNDER

CREATOR attempts:
grant FOUNDER

MODERATOR attempts:
grant ADMIN

ADMIN attempts:
grant FOUNDER

ADMIN attempts:
remove FOUNDER

USER attempts:
verify themselves

USER attempts:
approve their own creator application

All unauthorized operations must fail.

---

# 35. Direct Route Security Testing

Test direct access to:

/admin
/admin/founder
/admin/users
/admin/staff
/admin/permissions
/admin/reports
/admin/moderation
/creator
/creator/store
/creator/products

Users without authorization must not gain access simply by typing the URL.

---

# 36. Database Integrity

Use appropriate database constraints for:

- Unique store slugs
- Unique emails
- Product ownership
- Role relationships
- Permission relationships
- Creator applications
- Audit records
- Orders
- Purchases
- Licenses

Do not rely solely on application-level checks for uniqueness/integrity.

---

# 37. Race Conditions

Protect operations such as:

- Product purchase
- Inventory
- Commission slots
- Role changes
- Store creation
- Discounts
- Refunds

against race conditions.

For example:

If only one commission slot is available:

Two customers should not both successfully purchase it because they clicked at the same time.

---

# 38. Background Jobs

Use background jobs for operations that may be long-running:

- Large exports
- File processing
- Malware scanning
- Email batches
- Analytics processing
- Notifications
- Exchange-rate updates
- Data cleanup

Do not block normal web requests unnecessarily.

---

# 39. Notifications

Notifications should be generated from real events.

Do not create fake notification counts.

Notification state should be stored appropriately.

---

# 40. Email Security

Emails should never expose:

- Passwords
- Authentication secrets
- Internal moderation notes
- Sensitive payment information

Password reset links should be secure and time-limited.

---

# 41. Secret Management

Never hard-code:

- Passwords
- API keys
- Stripe secrets
- Database passwords
- OAuth secrets
- Encryption keys

Use environment variables or an appropriate secret-management system.

---

# 42. Error Handling

Do not expose stack traces or sensitive backend information to normal users.

Errors should provide useful information without leaking:

- Database details
- Secrets
- Internal file paths
- Authentication internals
- Private IDs where inappropriate

---

# 43. Logging

Application logs should be useful for debugging without containing sensitive information.

Redact:

- Passwords
- Tokens
- Cookies
- API secrets
- Payment secrets
- Authentication credentials

---

# 44. Security Headers

Review appropriate:

- Content Security Policy
- Secure cookies
- SameSite
- HSTS
- X-Content-Type-Options
- Referrer Policy
- Frame protection

Use settings appropriate to the actual application architecture.

---

# 45. CSRF

Review CSRF protections for authenticated state-changing requests where applicable.

---

# 46. XSS

Sanitize/escape user-generated content including:

- Product descriptions
- Creator bios
- Feedback
- Comments
- Reviews
- Reports
- Store descriptions
- Announcements

Do not render raw HTML from users without explicit sanitization.

---

# 47. SQL / ORM Security

Use parameterized queries/ORM mechanisms.

Never concatenate untrusted user input into raw SQL.

---

# 48. SSR / Server Actions

Any server action or server-side route that mutates data must:

- Authenticate
- Authorize
- Validate input
- Check ownership
- Check account state

---

# 49. API Keys

Future creator/developer API keys must:

- Be hashed where appropriate
- Be shown only when created
- Be revocable
- Be scoped
- Be rate-limited
- Be audited

Never store or expose plaintext API secrets unnecessarily.

---

# 50. Webhooks

Webhook handlers must:

- Verify signatures
- Validate payloads
- Handle retries
- Be idempotent
- Log safely
- Avoid duplicate actions

---

# 51. Backups

Maintain reliable backups for:

- Database
- Important configuration
- Product metadata
- Files where appropriate

Backups should be tested through actual restoration procedures.

A backup that has never been restored is not proven reliable.

---

# 52. Disaster Recovery

Future disaster recovery should define:

- Recovery time objectives
- Recovery point objectives
- Database restoration
- File restoration
- Service restoration
- Communication
- Incident ownership

---

# 53. Monitoring

Monitor:

- API errors
- Database errors
- Payment failures
- Failed webhooks
- Upload failures
- Authentication failures
- Background jobs
- Server health
- Storage health

---

# 54. Health Checks

Create health checks for critical dependencies.

Do not expose sensitive infrastructure information publicly.

---

# 55. Security Alerts

Potential alerts:

- Repeated failed logins
- Suspicious role changes
- Repeated payment failures
- Unusual download behaviour
- API abuse
- Mass account actions
- Unexpected staff activity

Automation should assist investigation.

---

# 56. Testing

Maintain automated tests for:

- Authentication
- Authorization
- Multi-role users
- Founder protection
- Creator onboarding
- Store creation
- Product ownership
- Product downloads
- Payment webhooks
- Refunds
- Moderation
- Role assignment
- Permission checks

---

# 57. Required Role Test Matrix

At minimum test:

USER

CREATOR

VERIFIED CREATOR

MODERATOR

ADMIN

FOUNDER

USER + CREATOR

USER + MODERATOR

CREATOR + MODERATOR

CREATOR + ADMIN

CREATOR + FOUNDER

---

# 58. Required Security Tests

Test that:

USER cannot:
- Grant self CREATOR through unauthorized APIs
- Grant self ADMIN
- Grant self MODERATOR
- Grant self FOUNDER
- Grant self VERIFIED
- Access Founder routes
- Access another creator's store
- Download another user's purchased files

CREATOR cannot:
- Modify another creator's store
- Modify another creator's products
- Grant staff roles
- Grant Founder
- Modify Founder

MODERATOR cannot:
- Grant Founder
- Modify Founder
- Escalate themselves
- Access unauthorized financial controls

ADMIN cannot:
- Grant Founder
- Remove Founder
- Modify protected Founder permissions

FOUNDER:
- Has protected platform authority

---

# 59. Definition of Done

Security is not complete because:

- Authentication works
- A role dropdown exists
- Admin pages are hidden
- The Founder page is hidden from normal users

It is complete when the backend rejects unauthorized actions even when the frontend is bypassed.

The security model must survive:

- Direct API calls
- Modified requests
- Direct URLs
- Stale sessions
- Multiple-role combinations
- Self-escalation attempts
- Role escalation attempts
- Account suspension
- Account bans
- Ownership manipulation

All critical authorization must be tested end-to-end.