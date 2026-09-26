# PawVault — Founder, Roles & Moderation

> This document defines PawVault's role system, Founder protection, Administrator/Moderator permissions, creator verification, user moderation, bans, suspensions, reports, moderation queues, staff management, and audit logging.
>
> This is CURRENT PLATFORM functionality.
>
> Security-sensitive authorization must always be enforced server-side.

---

# 1. Core Principle

PawVault must use a secure, additive, permission-based role system.

Users must be able to hold multiple roles at the same time.

Do NOT implement the entire platform around one mutually-exclusive role field.

Example:

USER
+
CREATOR

or:

USER
+
CREATOR
+
MODERATOR

or:

USER
+
CREATOR
+
ADMIN

or:

USER
+
CREATOR
+
FOUNDER

A user should not lose one capability simply because another role is added.

---

# 2. Base Roles

Core roles:

- USER
- CREATOR
- MODERATOR
- ADMIN
- FOUNDER

The exact database representation should fit the existing architecture.

The important requirement is that roles are additive.

---

# 3. Role Examples

Normal user:

USER

Creator:

USER
CREATOR

Verified creator:

USER
CREATOR
+ verified creator status

Creator moderator:

USER
CREATOR
MODERATOR

Creator administrator:

USER
CREATOR
ADMIN

Founder creator:

USER
CREATOR
FOUNDER

The user remains a normal customer unless a separate restriction applies.

---

# 4. Role Hierarchy

Suggested authority hierarchy:

FOUNDER
↓
ADMIN
↓
MODERATOR
↓
CREATOR
↓
USER

However:

Hierarchy does NOT automatically grant every permission.

Use explicit granular permissions.

For example:

An ADMIN may have permission to manage users.

A MODERATOR may not.

A CREATOR should only manage their own creator resources.

A USER should have no staff permissions.

---

# 5. FOUNDER ROLE

FOUNDER is a protected system role.

Founder status must not be treated like an ordinary assignable role.

No normal staff interface should allow FOUNDER to be granted or removed.

---

# 6. Founder Protection

NO ONE may use normal platform role-management functionality to:

- Grant FOUNDER
- Remove FOUNDER
- Demote FOUNDER
- Suspend FOUNDER
- Ban FOUNDER
- Delete FOUNDER
- Remove protected Founder permissions
- Modify protected Founder security state

This must be enforced server-side.

Do not merely hide the Founder option from the frontend.

---

# 7. API Founder Protection

If an endpoint exists such as:

POST /api/admin/users/[id]/roles

or equivalent,

the server must explicitly reject:

- Granting FOUNDER
- Removing FOUNDER
- Modifying protected Founder roles

This must remain true even if someone manually sends the API request.

Frontend restrictions are not sufficient.

---

# 8. Founder Bootstrap

Founder creation must only happen through the protected Founder bootstrap/setup mechanism.

Never:

- Hard-code Founder passwords
- Store plaintext passwords
- Log Founder credentials
- Allow self-promotion
- Allow normal admin promotion

Founder credentials must use secure password hashing and secret handling.

---

# 9. Multiple Roles

The role management system must support multiple simultaneous roles.

The UI should use a multi-select/tag-style interface.

Example:

Roles:

[ USER ]
[ CREATOR ]
[ MODERATOR ]

+ Add Role

FOUNDER must not appear as a normal selectable role.

For Founder:

[ FOUNDER 🔒 Protected ]

---

# 10. Role Assignment

Role assignment must be permission-based.

Potential permissions:

users.view
users.manage

roles.view
roles.assign
roles.remove

creators.approve
creators.verify
creators.suspend
creators.unsuspend

users.suspend
users.unsuspend
users.ban
users.unban

staff.manage

Staff permissions must themselves be protected.

---

# 11. Administrator Role Management

ADMIN may be allowed to:

- Grant CREATOR
- Remove CREATOR
- Grant MODERATOR where permitted
- Remove MODERATOR where permitted
- Suspend users
- Unsuspend users
- Ban users
- Unban users
- Approve creators
- Reject creators
- Verify creators

ADMIN must NOT be allowed to:

- Grant FOUNDER
- Remove FOUNDER
- Demote FOUNDER
- Delete FOUNDER
- Modify protected Founder permissions

---

# 12. Moderator Role Management

MODERATOR should have more limited authority.

A moderator may have:

- Report handling
- Product moderation
- Review moderation
- Feedback moderation
- User moderation
- Content moderation

A moderator should not automatically be able to:

- Create administrators
- Create moderators
- Grant Founder
- Remove Founder
- Modify Founder
- Change protected permissions
- Access financial controls

Only explicit permissions should grant those capabilities.

---

# 13. Verified Creator

Verified Creator should be separate from ordinary CREATOR status.

A verified creator is still:

CREATOR

with:

VERIFIED status

Do not make verification replace creator capability.

---

# 14. Who Can Verify Creators

At minimum:

FOUNDER
ADMIN

may verify creators.

MODERATOR should only be able to verify creators if the Founder explicitly grants a dedicated permission.

USER and CREATOR cannot verify themselves.

A user must never be able to modify their own verification status.

---

# 15. Verification Audit

Every verification action must record:

- Actor
- Target creator
- Previous status
- New status
- Timestamp
- Reason where applicable

Do not expose internal moderation notes publicly.

---

# 16. Verification Criteria

Verification should eventually have clear criteria.

Potential criteria:

- Established creator
- Genuine creator presence
- Good platform standing
- Quality work
- No serious recent violations
- Proven creator activity
- Community trust

Do not grant verification merely because an account requests it.

---

# 17. User Management

Founder/Admin/authorized staff should be able to search users.

User management should show:

- Username/display name
- Email where authorized
- Account status
- Roles
- Creator status
- Verification
- Joined date
- Last active
- Moderation state

Sensitive information must be protected.

---

# 18. User Actions

Authorized staff may have:

- View
- Suspend
- Unsuspend
- Ban
- Unban
- Assign permitted roles
- Remove permitted roles
- View moderation history
- Add internal moderation notes

Every sensitive action must be audited.

---

# 19. Suspension

Suspensions should support:

- Temporary suspension
- Permanent suspension
- Reason
- Start date
- End date
- Actor
- Internal note
- Appeal status

Example:

Suspended until:
2026-09-14 18:00

Where appropriate, the system should automatically restore access after expiration.

---

# 20. Suspension Enforcement

Suspensions must be enforced server-side.

A suspended user must not bypass restrictions through:

- Direct URLs
- API calls
- Page refresh
- Existing session
- Creator routes
- Alternative frontend screens

---

# 21. Bans

Bans should support:

- Permanent ban
- Reason
- Actor
- Timestamp
- Internal notes
- Appeal state

A banned account must not continue restricted activity.

---

# 22. Session Handling

When a serious suspension or ban occurs, invalidate or restrict existing sessions where appropriate.

Do not allow:

User gets banned
↓
Old session continues unrestricted

---

# 23. Founder Exception

Founder protection must take precedence over ordinary staff moderation actions.

Normal:

ADMIN
→ may ban USER

But:

ADMIN
→ may NOT ban FOUNDER

MODERATOR
→ may NOT ban FOUNDER

CREATOR
→ may NOT ban FOUNDER

USER
→ may NOT ban FOUNDER

The server must enforce this.

---

# 24. Creator Applications

Founder/Admin/authorized staff should be able to manage creator applications.

Actions:

- Review
- Approve
- Reject
- Request changes
- Add internal notes

Approval should grant creator capability server-side.

---

# 25. Moderation Queue

Create a centralized moderation queue.

Potential queue types:

- User reports
- Product reports
- Review reports
- Feedback reports
- Creator applications
- Product moderation
- Copyright/DMCA reports
- Fraud alerts
- Suspicious activity

Staff should be able to filter and prioritize.

---

# 26. Reports

Reports should support:

- Reporter
- Target
- Category
- Description
- Evidence
- Status
- Assigned staff
- Internal notes
- Resolution
- Timestamp

Statuses:

- Open
- Investigating
- Waiting
- Resolved
- Dismissed
- Escalated

---

# 27. Report Actions

Authorized staff should be able to:

- Assign
- Reassign
- Add note
- Resolve
- Dismiss
- Escalate
- Apply moderation action where permitted

Do not allow unauthorized users to modify reports.

---

# 28. Product Moderation

Staff should be able to review products for:

- Policy violations
- Copyright concerns
- Malware
- Misleading information
- Prohibited content
- Incorrect categorization
- Broken files
- Fraud
- Abuse

Actions:

- Approve
- Reject
- Hide
- Suspend
- Request changes

All actions must be audited.

---

# 29. Review Moderation

Staff should be able to handle:

- Spam
- Harassment
- Fraudulent reviews
- Illegal content
- Personal information
- Abuse

Do not allow creators to simply delete negative reviews.

---

# 30. Feedback Moderation

Feedback moderation should support:

- Spam removal
- Duplicate handling
- Abuse reports
- Locking threads
- Status changes
- Staff responses

---

# 31. Staff Management

Founder should have access to staff management.

Staff categories:

- ADMIN
- MODERATOR

Founder should be able to:

- Create staff
- Remove staff
- Assign permitted roles
- Assign granular permissions
- Suspend staff permissions
- Review staff audit history

---

# 32. Admin Restrictions

Admins cannot:

- Create Founder
- Remove Founder
- Modify Founder
- Bypass Founder protection

Admins may only manage staff according to their explicit permissions.

---

# 33. Permission System

Use granular permissions.

Example groups:

Users:

users.view
users.suspend
users.unsuspend
users.ban
users.unban

Creators:

creators.view
creators.approve
creators.reject
creators.verify
creators.suspend
creators.unsuspend

Products:

products.view
products.moderate
products.hide
products.approve

Reports:

reports.view
reports.assign
reports.resolve
reports.dismiss

Feedback:

feedback.view
feedback.moderate
feedback.respond

Staff:

staff.view
staff.manage

Roles:

roles.view
roles.assign
roles.remove

Audit:

audit.view

Do not create a normal:

founder.manage

permission that can be assigned to staff.

Founder protection is fundamental.

---

# 34. Self-Escalation Protection

Users must not be able to:

- Assign themselves ADMIN
- Assign themselves MODERATOR
- Assign themselves FOUNDER
- Grant themselves verification
- Grant themselves permissions

The server must determine the actor's authority.

---

# 35. Role Escalation Protection

Prevent:

MODERATOR
→ ADMIN

ADMIN
→ FOUNDER

CREATOR
→ MODERATOR

unless the actor explicitly has the required permission and the target role is permitted.

FOUNDER remains protected regardless.

---

# 36. Role Audit Logs

Every role change must create an audit event.

Record:

- Actor
- Target
- Action
- Previous roles
- New roles
- Permission affected
- Timestamp
- Reason where applicable

Never log:

- Passwords
- Tokens
- Session secrets
- API secrets
- Private authentication credentials

---

# 37. Moderation Notes

Internal moderation notes should be:

- Staff-only
- Permission-protected
- Audited
- Associated with the relevant user/content/report

Do not expose internal notes to ordinary users.

---

# 38. Founder Control Center

Founder dashboard should include:

Overview
Users
Creators
Products
Orders
Reviews
Reports
Feedback
Moderation
Categories
Featured
Discounts
Creator Applications
Staff
Permissions
Announcements
Roadmap
Changelog
Help Center
Settings
Audit Logs

All dashboard data must come from real systems.

---

# 39. Founder Overview

Show real metrics such as:

- Users
- Creators
- Products
- Orders
- Reports
- Pending applications
- Moderation queue
- Feedback requiring attention

Do not fabricate statistics.

---

# 40. Founder Account Menu

When signed in as Founder, the account menu should clearly expose:

Founder Control Center

This should route to the protected Founder dashboard.

Do not expose Founder controls to ordinary users.

---

# 41. Direct Route Protection

Test direct navigation to:

/admin
/admin/founder
/admin/users
/admin/staff
/admin/permissions
/admin/reports
/admin/moderation

Every route must perform server-side authorization.

Hiding links is not sufficient.

---

# 42. API Protection

Every administrative API must validate:

1. Authentication
2. Account status
3. Role
4. Permission
5. Target resource
6. Protected-role rules

Do not trust:

- Request body role
- Client-side state
- Hidden form fields
- Frontend permissions

---

# 43. Moderation Appeals

Where appropriate, users should eventually be able to appeal:

- Suspensions
- Bans
- Creator rejection
- Product rejection
- Other moderation decisions

Appeals must have:

- Status
- Evidence
- Staff review
- Decision
- Audit history

---

# 44. Definition of Done

The role/moderation system is not complete because a dropdown exists.

It is complete when:

- Multiple roles work
- Permissions are server-side
- Founder is protected
- Admins can manage permitted roles
- Verified Creator works
- Creator applications work
- Bans work
- Suspensions work
- Reports work
- Moderation works
- Audit logs work
- Direct API attacks are rejected
- Direct route attacks are rejected
- Self-promotion is impossible
- Founder escalation is impossible

Test every role combination end-to-end.