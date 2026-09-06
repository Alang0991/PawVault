# PAWVAULT — COMPLETE UX + FOUNDER + MODERATION OVERHAUL

I need you to treat this as a **major UX and platform functionality overhaul**, not a cosmetic update.

The current PawVault experience still feels like a generic SaaS template, and the Founder account currently behaves like a normal user account.

I want PawVault to feel like a **real, polished creator marketplace that is new but genuinely functional**, with a proper Founder Control Center behind it.

DO NOT just make the existing UI prettier.

Rework the user journey, navigation, marketplace UX, Founder experience, moderation tools, and authentication flow while preserving the existing backend functionality wherever it already works.

---

# PART 1 — THE CORE PAWVAULT UX PROBLEM

PawVault is a CREATOR MARKETPLACE.

It should feel like a place where people:

**DISCOVER → BROWSE → SAVE → FOLLOW → BUY → DOWNLOAD → DISCOVER MORE**

It should NOT feel like:

Hero
→ generic marketing cards
→ "Why choose us"
→ generic statistics
→ giant CTA
→ footer

The current experience feels too much like a SaaS landing page.

I want users to immediately think:

> "What's cool here?"

Not:

> "What features does this company offer?"

---

# PART 2 — HOMEPAGE REDESIGN

Completely rethink the homepage.

Do NOT make the hero enormous.

The hero should be compact and visually confident.

Possible direction:

**Made by creators.
Found on PawVault.**

Short supporting text.

[ Browse Marketplace ] [ Start Selling ]

Then immediately show marketplace content.

---

## HOMEPAGE STRUCTURE

### 1. Compact Hero

Keep it around 30–40% of the first viewport.

No huge empty space.

No giant generic SaaS gradient.

No excessive marketing copy.

---

### 2. CATEGORY NAVIGATION

Immediately below the hero.

Use REAL categories from the database.

For example, only if they actually exist:

3D Models
Textures
Materials
Shaders
Plugins
Avatars
Tools
Assets

Do not fabricate categories.

Make the category navigation visually interesting without turning every category into a giant rounded card.

---

### 3. TRENDING

If real data exists:

**Trending**

Show actual products.

Product cards should include:

* Large product image
* Product name
* Creator avatar
* Creator username
* Price
* Rating
* Review count
* Wishlist button
* Sale badge when applicable

If there is not enough real data, do not fake it.

---

### 4. NEW DROPS

If real products exist:

**New Drops**

Show newest actual products.

Again:

NO fake products.

NO fake reviews.

NO fake downloads.

NO fake sales.

---

### 5. CREATOR SPOTLIGHT

If real creators exist:

Show a creator spotlight.

Include:

* Large avatar
* Creator name
* @username
* Verification status
* Bio
* Followers
* Product count
* A few real products
* View creator button

Creators should feel like actual people with storefronts.

---

### 6. DISCOVER MORE

Give users a mixed marketplace grid so they can continue browsing.

The homepage should not end after one section.

---

# PART 3 — PRODUCT CARDS

Product cards are extremely important.

They should visually communicate:

IMAGE

Product Name

Creator avatar + creator name

Rating / reviews

Price

Wishlist

If on sale:

Old price
Sale price
Discount

The product image should be the dominant visual element.

Do NOT use generic gradients instead of actual product images.

If an actual image doesn't exist, use a tasteful real-data empty state.

Do not make every card look like the exact same oversized rounded SaaS component.

---

# PART 4 — CREATOR PROFILES

Creator profiles should feel like mini storefronts.

Show:

Avatar

Creator name

@username

Verified status

Bio

Followers

Products

Other legitimate statistics

[ Follow ]

Social links if actually configured.

Then:

Featured Products

All Products

About

Reviews

etc.

A creator should feel like a first-class entity on PawVault, not just tiny metadata under a product.

---

# PART 5 — PRODUCT PAGE

Redesign product pages into a proper marketplace product experience.

Desktop:

Large gallery on the left.

Product information on the right.

Show:

Creator avatar
Creator username
Product title
Rating
Review count
Price
Sale information

Actions:

[ BUY NOW ]

[ ADD TO WISHLIST ]

[ SHARE ]

Then:

Description

What's Included

Requirements

Supported Formats

Version

License

Updates

Reviews

More From This Creator

Related Products

The page should never become a dead end.

Always provide another discovery path.

---

# PART 6 — BROWSE MARKETPLACE

The Browse page should feel like the actual marketplace.

Header:

**Browse Marketplace**

Search products...

Filters:

Category
Price
Rating
Tags
Free
On Sale

Sort:

Recommended
Newest
Popular
Price Low → High
Price High → Low
Rating

Keep filters compact and usable.

Do not make a giant wall of form controls.

Let the product grid dominate the page.

---

# PART 7 — SEARCH

Search should be a real discovery system.

When typing:

Show REAL matching products.

Show REAL creators.

Show REAL categories.

Do not generate fake suggestions.

If nothing matches:

**Nothing matched that search.**

Then:

Browse all products
Explore categories
Explore creators

---

# PART 8 — NAVIGATION

The primary navigation should prioritize marketplace functionality.

Desktop:

PawVault logo

Browse
Categories
Creators

Search

Wishlist
Library

Sell / Creator Dashboard

Account

Do not bury actual marketplace functionality underneath generic marketing pages.

---

# PART 9 — MOBILE

Do not simply shrink desktop.

Design mobile intentionally.

Mobile should have:

Compact header
Search
Horizontal category navigation
Product browsing
Creator browsing
Easy wishlist
Easy purchasing

The marketplace should be comfortable to browse with one thumb.

---

# PART 10 — VISUAL DESIGN

I DO NOT WANT:

❌ Generic SaaS gradients
❌ Huge purple/blue hero
❌ Excessive glassmorphism
❌ Everything inside giant rounded cards
❌ Huge empty whitespace
❌ Corporate "Why Choose PawVault?" sections
❌ Stock illustrations
❌ Excessive glowing effects
❌ Random animations everywhere
❌ Fake 3D gimmicks
❌ Every section looking identical

I DO WANT:

Strong typography

Excellent spacing

Large product imagery

Creator avatars

Subtle borders

Editorial layouts

Dense marketplace sections where appropriate

Occasional large featured products

Horizontal product rails

Creator strips

Interesting visual rhythm

The PRODUCT ART should provide much of the visual interest.

---

# PART 11 — MARKETPLACE DISCOVERY LOOP

This is one of the most important requirements.

The website should naturally encourage:

Product
↓
Creator
↓
Creator's other products
↓
Category
↓
Related product
↓
Another creator
↓
Wishlist
↓
Purchase

I want someone to be able to spend 20 minutes browsing PawVault.

The experience should constantly give them another interesting thing to click.

---

# PART 12 — EMPTY STATES

PawVault currently has very little real marketplace data.

That is completely fine.

Do NOT fake activity.

Never fabricate:

Users
Creators
Products
Sales
Downloads
Followers
Reviews
Ratings
Orders

Instead create beautiful honest empty states.

For example:

**More creators are joining PawVault.**

**Be one of the first creators to drop something.**

[ Start Selling ]

Do NOT say:

"Join thousands of creators"

when the database does not contain thousands of creators.

Honest + beautiful is much better than fake activity.

---

# PART 13 — FIX THE FOUNDER EXPERIENCE

Now the other major problem.

I am the Founder, but my account menu currently looks like a normal user account:

Bluey Barks

Dashboard
Library
Orders
Settings
Sign Out

There is NO Founder control center.

That needs to change.

When the authenticated user has:

`FOUNDER`

their account menu must visibly include:

**Founder Control Center →**

This should lead to:

`/admin/founder`

Do NOT make the Founder somehow know that URL manually.

---

# PART 14 — FOUNDER ACCOUNT MENU

Founder menu should look approximately like:

Bluey Barks
FOUNDER

━━━━━━━━━━━━━━━━

🛡 Founder Control Center

Dashboard
Reports
Users
Creators
Products
Orders
Reviews
Moderation
Staff & Mods
Permissions
Categories
Featured
Discounts
Announcements
Audit Logs

━━━━━━━━━━━━━━━━

Library
Orders
Settings
Sign Out

The exact visual design can differ, but the hierarchy needs to be obvious.

Normal USER accounts must NEVER see Founder controls.

ADMIN accounts should only see Admin functionality.

MODERATOR accounts should only see Moderation functionality.

---

# PART 15 — FOUNDER CONTROL CENTER

Build a proper:

`/admin/founder`

control center.

Use a dedicated admin layout.

Sidebar:

PAWVAULT

Founder Control Center

### Overview

Dashboard

### Marketplace

Products
Categories
Featured
Discounts

### Community

Users
Creators
Reviews
Reports

### Moderation

Moderation Queue
User Moderation
Product Moderation

### Staff

Moderators
Administrators
Permissions

### System

Announcements
Settings
Audit Logs

Bottom:

Founder profile

Bluey Barks
FOUNDER

Sign Out

---

# PART 16 — FOUNDER DASHBOARD

The overview should show REAL database information.

For example:

Users
Creators
Products
Orders

Then:

### Requires Attention

Open reports
Pending creator applications
Products requiring moderation
Suspended users

If there is nothing:

**Nothing needs your attention.**

Do not fabricate charts.

Do not fabricate numbers.

Do not create fake activity just to make the dashboard look busy.

---

# PART 17 — REPORT MANAGEMENT

Founder needs a complete Reports section.

Show:

All Reports

Filters:

Open
Investigating
Resolved
Dismissed

Also filter by:

Report type
Date
Reporter
Reported user
Reported product
Assigned moderator

Each report:

Reporter
Reported subject
Reason
Description
Created date
Status
Assigned moderator
Evidence if available

Opening a report provides:

Report Details

Assign moderator

Change status

Add moderation note

Inspect user

Inspect product

Resolve

Dismiss

Every meaningful moderation action must be audited.

---

# PART 18 — USER MANAGEMENT

Founder needs complete user management.

Users:

Search

Filters:

Active
Suspended
Banned
Creators
Staff

User rows:

Avatar
Name
Username
Role
Status
Joined date
Creator status

User details:

Profile
Account information
Role
Permissions
Moderation history
Reports
Products
Orders where appropriate
Audit history

Founder actions:

Suspend
Unsuspend
Ban
Unban
Change role
Manage permissions
Add moderation note

Dangerous actions need confirmation dialogs.

---

# PART 19 — STAFF & MODERATORS

Create:

**Staff & Mods**

Show:

Founder
Administrators
Moderators

Each:

Avatar
Name
Username
Role
Status
Permissions
Staff date
Recent activity

Founder gets:

**Add Staff Member**

Choose:

ADMIN

or

MODERATOR

Then configure permissions.

---

# PART 20 — CREATE MODERATOR

Founder should be able to select an existing PawVault user and promote them to Moderator.

Permission groups:

### Users

☐ View users
☐ Suspend users
☐ Ban users
☐ Manage user notes

### Products

☐ View products
☐ Moderate products
☐ Hide products
☐ Remove products

### Reports

☐ View reports
☐ Handle reports
☐ Resolve reports

### Reviews

☐ Moderate reviews

### Creators

☐ Review creator applications
☐ Moderate creators

### Orders

☐ View orders
☐ Handle order issues

### Other

☐ Manage announcements
☐ View audit logs

Founder can grant/revoke individual permissions.

Do NOT automatically give every moderator full admin access.

---

# PART 21 — PERMISSIONS

Build a real permission management page.

For every staff member show:

Role

Effective Permissions

Role Permissions

Custom Permissions

Make it obvious where each permission comes from.

All permissions must be enforced SERVER-SIDE.

Hiding a button is NOT security.

---

# PART 22 — MODERATION QUEUE

Create a unified:

**Moderation Queue**

Tabs:

All
Reports
Products
Users
Reviews
Creators

Each item:

Type
Subject
Reason
Priority
Created
Assigned to
Status

Example:

Product Report
Texture Pack
Copyright concern
Unassigned

[ Review ]

Moderators only see actions allowed by their permissions.

Founder sees everything.

---

# PART 23 — PRODUCT MODERATION

Founder/moderators with permission can:

Inspect product

Inspect creator

View reports

Hide product

Restore product

Remove product where appropriate

Add moderation note

Prefer moderation states / soft deletion where appropriate instead of immediately destroying records.

---

# PART 24 — CREATOR APPLICATIONS

Create a proper Creator Applications section.

Founder can:

View applications
Approve
Reject
Request changes
Add internal notes

Show:

Applicant
Username
Application date
Status
Application information

---

# PART 25 — REVIEWS

Moderators with the correct permission can inspect problematic/reported reviews.

Actions are permission-controlled.

Do not expose unrelated private account information.

---

# PART 26 — CATEGORIES

Founder can:

Create
Edit
Disable
Reorder

Only active categories should appear publicly.

Do not create fake categories simply to make the site appear populated.

---

# PART 27 — FEATURED

Founder can:

Search real products

Feature

Unfeature

Reorder featured products

No fake engagement statistics.

---

# PART 28 — DISCOUNTS

Founder can create actual discount codes.

Support:

Code
Discount
Expiration
Usage limit
Products/categories
Active/disabled state

Show actual usage data.

---

# PART 29 — ANNOUNCEMENTS

Founder can create:

Title
Message
Status
Start date
End date

Preview before publishing.

---

# PART 30 — AUDIT LOGS

Create a serious audit log.

Show:

Timestamp
Staff member
Action
Target
Result

Filters:

Staff member
Action
Target
Date

Examples:

Moderator suspended user

Founder approved creator

Moderator removed product

Founder changed permissions

NEVER store/display:

Passwords
Tokens
Secrets
Cookies
Credentials

---

# PART 31 — FOUNDER SECURITY

Founder is the highest role.

Founder cannot be:

Demoted

Banned by moderators

Suspended by moderators

Modified by moderators

Stripped of Founder permissions

All permission checks must happen server-side.

Do not rely on UI visibility for security.

---

# PART 32 — ROLE HIERARCHY

FOUNDER

Full platform control.

ADMIN

Administrative functionality according to assigned permissions.

MODERATOR

Moderation functionality according to assigned permissions.

CREATOR

Creator functionality.

USER

Normal marketplace functionality.

The dashboard and navigation should adapt based on role.

---

# PART 33 — PASSWORD / AUTHENTICATION BUG

There is also a serious issue with the Founder authentication flow.

The password input currently isn't behaving correctly / does not allow the password to be properly added.

FIX THIS FIRST.

Inspect the actual:

Password input
→ form
→ validation
→ API/server action
→ hashing
→ database
→ login
→ session
→ role
→ Founder authorization

Do not just change the visual input.

Check for:

* disabled
* readOnly
* incorrect `name`
* broken form registration
* React state resetting
* validation schema rejecting passwords
* password omitted from FormData
* server receiving undefined
* incorrect property name
* bcrypt/bcryptjs mismatch
* hash saved incorrectly
* login checking wrong field
* email normalization issues
* account status
* role loading
* session callback
* middleware
* redirects
* Prisma schema issues

The password must:

* Accept normal keyboard input
* Accept symbols
* Not randomly clear
* Not silently fail
* Submit correctly
* Hash correctly
* Authenticate correctly

Do NOT hard-code the password into source code.

Do NOT print the password into logs.

Do NOT expose it in browser console output.

---

# PART 34 — FOUNDER AUTH TEST

Actually test the entire Founder flow.

1. Open sign-in.
2. Click password field.
3. Type password.
4. Confirm the field accepts it.
5. Submit.
6. Confirm authentication succeeds.
7. Confirm session exists.
8. Confirm role is FOUNDER.
9. Open `/admin/founder`.
10. Refresh.
11. Confirm access remains.
12. Sign out.
13. Sign in again.
14. Confirm Founder access remains.

Also test incorrect credentials.

Do not claim success if this has not actually been tested.

---

# PART 35 — ROLE TESTING

Create/use a real test user.

Promote them to Moderator.

Give them limited permissions.

Test:

Moderator can access permitted features.

Moderator cannot access Founder-only features.

Moderator cannot manually navigate to:

`/admin/founder`

and gain access.

Founder can still access everything.

---

# PART 36 — BROKEN LINKS

Audit EVERY navigation link.

No:

404 pages

dead buttons

fake dashboard actions

placeholder routes

buttons that look clickable but do nothing

The public marketplace and Founder control center both need working navigation.

---

# PART 37 — MOBILE ADMIN

Founder Control Center must work on mobile.

Use:

☰ sidebar

Responsive tables

Mobile-friendly actions

Readable moderation screens

Do not simply squish the desktop dashboard onto a phone.

---

# PART 38 — DO NOT BREAK THE EXISTING BACKEND

Before modifying anything, inspect the existing codebase.

Preserve working:

* Authentication
* Founder system
* Roles
* Permissions
* Prisma models
* Products
* Creators
* Orders
* Reviews
* Wishlist
* Creator applications
* Audit logging
* Moderation
* Admin functionality

This is an overhaul, not permission to randomly rewrite working backend systems.

---

# PART 39 — NO FAKE DATA

This rule applies EVERYWHERE.

Never create fake:

Users
Creators
Products
Orders
Sales
Downloads
Followers
Reviews
Ratings
Reports
Moderation actions
Staff activity

If there is no data:

make the empty state beautiful.

Do not fake a busy marketplace.

---

# PART 40 — FINAL VISUAL STANDARD

Before reporting completion, open the REAL rendered PawVault website.

Inspect:

Desktop homepage

Mobile homepage

Browse

Search

Categories

Creators

Creator profile

Product page

Wishlist

Library

Account menu

Founder dashboard

Reports

Users

Moderation

Staff & Mods

Permissions

Audit Logs

Fix anything that looks:

* Ugly
* Generic
* Empty
* Oversized
* Repetitive
* Awkward
* Unfinished
* Template-like
* Non-functional

Do not judge success by whether the code compiles.

Judge it by the actual rendered experience.

---

# THE FINAL GOAL

When someone visits PawVault:

They should immediately see things worth discovering.

They should be able to:

**Discover a product**
→ **see the creator**
→ **see their other products**
→ **browse the category**
→ **find related products**
→ **wishlist something**
→ **buy it**
→ **download it**
→ **come back for more**

And when I log in as Founder:

I should immediately know:

**This is MY platform.**

I should be able to open:

**Founder Control Center**

and manage the entire marketplace:

Users
Creators
Products
Reports
Moderation
Moderators
Admins
Permissions
Reviews
Orders
Categories
Featured
Discounts
Announcements
Audit Logs
Settings

Everything should use REAL PawVault data and REAL server-side permissions.

Do not tell me "done" simply because the build passes.

Actually use the website.

Actually test the authentication.

Actually test the Founder account.

Actually test the moderation tools.

Actually inspect the UX.

The final result should feel like:

**A real creator marketplace that happens to be new — with a serious platform management system behind it.**

NOT:

**A generic SaaS landing page with an admin dashboard bolted onto it.**
