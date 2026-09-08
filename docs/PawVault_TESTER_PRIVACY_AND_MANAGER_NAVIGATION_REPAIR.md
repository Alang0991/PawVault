# PawVault — Tester Privacy + Admin/Moderation Navigation Repair

## Critical Requirements

This repair covers TWO separate but important problems:

1. **The Tester account and all tester-owned content must be hidden from everyone except the Founder.**
2. **Manager buttons on Admin/Moderation pages must open their actual management destination instead of incorrectly sending users back to the dashboard.**

Both must be fixed at the source. Do not patch individual screens with hardcoded redirects.

---

# PART A — TESTER ACCOUNT PRIVACY

## 1. Required Visibility Rule

The internal Tester account is Founder-only.

### Founder

The Founder may see the Tester account and its internal/test data where the Founder has normal platform authority.

This can include:

- Tester account/profile.
- Tester creator profile.
- Tester store.
- Tester products.
- Tester drafts.
- Tester test orders.
- Tester test licenses.
- Tester moderation records.
- Tester internal media/files where platform access permits.
- Tester analytics/test records.
- Tester content in internal Founder/admin tooling.

### Everyone Else

Everyone except the Founder must NOT be able to discover or publicly access the Tester account or tester-owned content.

This includes:

- Creator directory.
- Public creator profile.
- Public store.
- Browse.
- Search.
- Categories.
- Product pages.
- Wishlist.
- Recommendations.
- Featured products.
- Staff Picks.
- Collections.
- Posts.
- Reviews where tester identity/content would be exposed.
- Public APIs.
- Sitemap.
- Search/indexing data.
- Related/recommended creator results.
- Public product counts.
- Public creator counts.

Do not merely hide the Tester card from `/creators`.

The privacy rule must apply to the underlying discovery/query layer.

---

## 2. Never Rely on Frontend Hiding

Do NOT implement:

```ts
if (creator.email === "...") return null
```

only in React.

Do NOT rely on:

- CSS `display:none`.
- Client-side filtering.
- Hidden buttons.
- Local storage.
- URL obscurity.
- An unlisted slug.
- A secret query parameter.

If the data is returned by a public API, it is not hidden.

The server must exclude Tester data for non-Founder users.

---

## 3. Use a Canonical Internal/Test Account Flag

Kilo must first inspect the existing account/user model.

If PawVault already has an internal/test/system-account field, use it.

If there is no suitable existing field, introduce one through the canonical user/account system, for example:

```text
isInternal
accountType
isTestAccount
visibilityScope
```

Use the project's actual naming conventions.

Do NOT create a duplicate user system.

The important semantic rule is:

```text
Tester/Internal Account
+
Founder-only visibility
```

---

## 4. Founder Exception Must Be Server-Side

Conceptually:

```text
if account.isInternalTester:
    allow only Founder
else:
    normal visibility rules
```

The server must determine Founder status from the authenticated session and canonical role/permission system.

Never trust a client-supplied:

```text
isFounder=true
```

or:

```text
role=Founder
```

---

## 5. Public Query Filtering

Audit all public queries.

Any query that can expose creators/products must exclude tester data unless the authenticated user is Founder.

Examples:

```text
Creator directory
Product browse
Search
Category pages
Featured products
Staff Picks
Recommendations
Collections
Posts
Reviews
Sitemaps
Public creator APIs
Public product APIs
```

The filter must happen server-side.

For unauthenticated users:

```text
Tester content = excluded
```

For normal authenticated users:

```text
Tester content = excluded
```

For moderators:

```text
Tester content = excluded
```

For administrators:

```text
Tester content = excluded
```

Unless the project's explicit security policy says a higher role should have access. The requirement here is specifically **Founder-only**, so do not broaden visibility merely because someone is an admin/moderator.

For Founder:

```text
Tester content = visible
```

---

# 6. Direct URL Protection

A hidden tester profile must not still be accessible by guessing its URL.

Test:

```text
/creators/test-creator
/store/test-creator
/products/test-product
```

and every actual canonical tester URL discovered in the code/database.

For non-Founder users, return the appropriate controlled result:

```text
404 Not Found
```

or another deliberate privacy-preserving response.

Do not reveal:

- Tester exists.
- Tester ID.
- Tester email.
- Tester slug.
- Tester product names.
- Tester store name.

A privacy-protected account should not be enumerable through errors.

Founder should retain access.

---

# 7. API Protection

Audit all APIs returning creator/product data.

Especially:

```text
/api/products
/api/products/[slug]
/api/creators
/api/creators/[slug]
/api/search
/api/categories
```

and all other public discovery endpoints found in the repository.

The server must apply the same visibility rule.

A public API must not return tester records and expect the frontend to hide them.

---

# 8. Counts Must Also Exclude Tester Data

Do not expose:

```text
2 creators
```

if one of those creators is an internal Tester account and the viewer is not Founder.

Public counts must be based on visible records.

Examples:

```text
Creators count
Published products count
Category counts
Search result counts
Follower counts where applicable
```

For a non-Founder viewer, tester records must not affect visible public counts.

---

# 9. Search and Indexing

Tester data must not leak into:

- Search results.
- Search suggestions.
- SEO metadata.
- Sitemap.
- OpenGraph data.
- Structured data.
- Public feeds.
- Public APIs.
- Autocomplete.

If a search index exists, tester content should be excluded from public indexing.

If cached search data exists, invalidate affected entries after the privacy fix.

---

# 10. Existing Screenshot Issue

The current Creator page shows:

```text
2 creators
2 published products
Bluey Barks
Test Creator
```

The `Test Creator` card must disappear for everyone except Founder.

The public result for a non-Founder should show only legitimately public creators.

Do not fake the count.

---

# PART B — ADMIN / MODERATION MANAGER BUTTONS

## 11. Confirmed UX Bug

Admin/Moderation pages contain **Manager / Manage** buttons.

When users with the appropriate access click these buttons, they are incorrectly sent back to the dashboard.

That is broken navigation.

A management button must open the management interface it represents.

It must NOT act as:

```text
Manage → Dashboard
```

unless the button is explicitly labelled Dashboard.

---

# 12. Audit Every Manager Button

Search the entire repository for:

```text
Manage
Manager
Management
View Management
Manage Products
Manage Creators
Manage Reports
Manage Users
Manage Moderation
Manage Stores
Manage Categories
Manage Content
```

Find the actual route/action associated with every button.

Create an inventory:

```text
Button label
Current route
Expected destination
Required permission
Actual destination
Why it redirects
```

---

# 13. Find the Redirect Bug

Inspect:

- `router.push()`
- `router.replace()`
- `<Link>`
- navigation helpers
- middleware
- route guards
- permission guards
- layout redirects
- `redirect()`
- `notFound()`
- authentication/session checks

Look for logic equivalent to:

```ts
if (!isAdmin) redirect("/dashboard")
```

or:

```ts
if (!hasPermission(...)) router.push("/dashboard")
```

being triggered incorrectly for moderators/admins.

Do not assume the button itself is the problem.

The button may navigate correctly while the destination route incorrectly redirects back to Dashboard.

---

# 14. Correct Authorization Behavior

If the user has permission for the management destination:

```text
Click Manager
↓
Open requested management page
```

If authenticated but unauthorized:

```text
Click Manager
↓
403 / controlled Access Denied page
```

Do NOT do:

```text
Unauthorized
↓
Dashboard
```

unless that behavior is explicitly part of an intentional security design.

Redirecting to Dashboard makes debugging and navigation confusing.

---

# 15. Preserve the User's Session

Manager navigation must NOT:

- Log the user out.
- Force login again.
- Reset the session.
- Refresh the entire auth system.
- Change their role.
- Change their creator status.

If the user is authenticated and authorized, they should remain in the management area.

---

# 16. Moderator Navigation

A Moderator with the correct moderation permissions must be able to navigate:

```text
Moderation Dashboard
↓
Moderation Queue
↓
Reports
↓
Product Review
↓
Creator/Store Review
↓
Moderation History
```

using the actual routes available in PawVault.

A Moderator must not be treated as an Administrator simply to make navigation work.

---

# 17. Administrator Navigation

Administrators should be able to access management routes permitted by their role.

Do not redirect them to Dashboard because a destination has a separate permission check that incorrectly recognizes only Founder.

Audit the complete permission chain:

```text
button visibility
↓
route
↓
middleware
↓
server authorization
↓
API authorization
```

All layers must agree.

---

# 18. Founder Navigation

Founder should retain access to all Founder-authorized management routes.

The Founder exception must not be implemented as a random hardcoded redirect.

Use the canonical role/permission system.

---

# 19. Route Inventory

Kilo must identify the real routes for:

```text
Admin
Moderation
Users
Creators
Products
Reports
Categories
Stores
Content
Staff Picks
Platform settings
```

Do not invent route names.

Do not create duplicate management pages if an existing canonical route already exists.

---

# 20. No Dashboard Fallback for Valid Destinations

Bad:

```ts
try {
  router.push("/admin/products")
} catch {
  router.push("/dashboard")
}
```

Bad:

```ts
if (!data) redirect("/dashboard")
```

if `data` is temporarily missing.

A failed data load should show the correct error/loading/empty state.

Dashboard must not become the universal error destination.

---

# 21. Loading / Permission Race Conditions

Because PawVault has also experienced navigation crashes, audit whether manager buttons fire before:

```text
session
role
permissions
```

have finished loading.

Avoid:

```text
permission === undefined
→ deny
→ redirect dashboard
```

when the permission is simply still loading.

Correct flow:

```text
Session loading
↓
Permission loading
↓
Show loading state
↓
Resolve permission
↓
Allow or deny
```

---

# 22. Direct Route Testing

Do not only test clicking the button.

For every management route:

1. Click from Admin/Moderation.
2. Open the route directly.
3. Refresh the route.
4. Navigate away and back.
5. Use browser Back.
6. Use browser Forward.
7. Open in another tab.
8. Test with the correct role.
9. Test with an unauthorized role.
10. Test with an expired session.

A correct manager button is useless if the destination itself immediately redirects away.

---

# 23. Combined Permission Matrix

| Viewer | Tester Data | Moderation | Admin Management |
|---|---:|---:|---:|
| Founder | Visible | Allow | Allow |
| Administrator | Hidden | Allow where permitted | Allow where permitted |
| Moderator | Hidden | Allow within scope | Deny unless separately permitted |
| Creator | Hidden | Deny | Deny |
| User | Hidden | Deny | Deny |
| Unauthenticated | Hidden | Deny | Deny |

Tester visibility is **Founder-only**, regardless of normal moderator/admin access.

Management access remains permission-scoped.

---

# 24. Required Tests

### Tester privacy

- Founder sees Tester.
- Administrator cannot see Tester.
- Moderator cannot see Tester.
- Creator cannot see Tester.
- Normal user cannot see Tester.
- Logged-out visitor cannot see Tester.
- Public API excludes Tester.
- Search excludes Tester.
- Categories exclude Tester.
- Browse excludes Tester.
- Creator directory excludes Tester.
- Direct tester URL is protected.
- Sitemap excludes Tester.
- Public counts exclude Tester.
- Cached results exclude Tester after invalidation.

### Management navigation

- Founder manager buttons work.
- Admin manager buttons work where authorized.
- Moderator manager buttons work where authorized.
- Unauthorized users receive controlled `403`.
- No valid management button redirects to Dashboard.
- Direct management URLs work.
- Refresh works.
- Back/Forward works.
- Multiple tabs work.
- Session remains intact.

---

# 25. Kilo Instructions

Before changing code:

1. Audit the canonical user/role/permission system.
2. Identify how the Tester account is represented.
3. Identify every public query that can expose Tester data.
4. Identify every management button and its actual destination.
5. Identify every route guard/middleware involved.
6. Find why valid management users are being redirected to Dashboard.
7. Check for permission-loading race conditions.
8. Report findings.
9. Repair the shared authorization/visibility/navigation logic.
10. Run the complete regression matrix.

Do NOT:

- Hardcode the Tester email into dozens of queries.
- Hardcode a Founder user ID.
- Hide Tester content only with CSS/frontend filtering.
- Make administrators able to see Tester data.
- Make moderators able to see Tester data.
- Make moderators administrators.
- Disable authorization.
- Remove RLS.
- Create duplicate role systems.
- Create duplicate management pages.
- Redirect every error to Dashboard.
- Log users out.
- Insert fake data.
- Delete Tester records just to hide them.

---

# 26. Definition of Done

## Tester Privacy

For every non-Founder viewer:

```text
Tester account
= invisible
Tester creator
= invisible
Tester store
= invisible
Tester products
= invisible
Tester search results
= invisible
Tester public URLs
= protected
Tester public counts
= excluded
```

For Founder:

```text
Tester account
= visible
Tester internal content
= accessible according to Founder permissions
```

## Management Navigation

For an authorized manager:

```text
Manager button
↓
correct canonical management route
↓
management page loads
```

NOT:

```text
Manager button
↓
Dashboard
```

For an unauthorized user:

```text
Management route
↓
controlled 403/access-denied state
```

NOT:

```text
Management route
↓
random Dashboard redirect
```

## Final Rule

**Tester content is Founder-only. Management buttons must navigate to the management destination they represent. Permissions must be enforced server-side, and valid management users must never be bounced back to Dashboard simply because a role/permission check is wrong or still loading.**
