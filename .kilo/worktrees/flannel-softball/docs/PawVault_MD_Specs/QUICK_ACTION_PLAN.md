# PawVault — Quick Action Plan

Based on `03_CREATOR_PLATFORM.md`, `04_FOUNDER_MODERATION.md`, `06_TECH_SECURITY_INFRA.md`, `09_PLATFORM_CONTENT_SYSTEMS.md`, and `10_GLOBAL_SESSION_PERMISSION_SYNC.md`.

---

## ✅ Done
- Security headers added to `next.config.js`
- `ProductStatus`, `StoreVisibility`, `CreatorStatus` enums + `ProductVersion`, `CreatorTerms`, `Appeal` models added and migrated
- `/become-creator` page + `/api/creator/application` API
- `/api/creator/terms` API
- `/api/creator/products/[id]/versions` API
- `/api/appeals` API
- `/api/admin/creators/[id]/action` API (suspend/unsuspend/ban/unban/verify/unverify)
- Session invalidation on ban/suspension
- Creator status enforcement in creator layout + key API routes
- Product/store visibility enforcement in public catalog + product pages
- Admin product actions expanded (hide/suspend/archive)
- Lint, typecheck, build all pass

---

## 🔴 High Priority — Do Next

### 1. Global Session/Permission Sync (Spec 10)
**Problem:** Role/permission changes currently require logout/login to take effect.
**Fix:** Build a single global account-capability sync system:
- Add `/api/account/state` endpoint returning current roles, permissions, creator status, feature flags
- Client-side `refreshCurrentAccount()` utility called on auth completion, tab focus, and after mutations
- Navigation and protected routes consume current server state, not cached login-time state
- Multi-tab sync via `BroadcastChannel` or `storage` events

### 2. Creator Application Backend Completion (Spec 03 §5-7)
- Add admin list/queue page for creator applications (`/admin/founder/creators` already exists but needs filtering by status)
- Wire up `request_changes` and `under_review` actions in the admin UI
- Send notification emails on approve/reject (use existing nodemailer templates)
- Auto-assign `CREATOR` role only on approval (already done server-side)

### 3. Product Lifecycle Enforcement (Spec 03 §16)
- Products in `DRAFT`, `REJECTED`, `SUSPENDED`, `ARCHIVED`, `HIDDEN` must not appear in public catalog
- Creators must not bypass review by changing `isPublished` directly — enforce `status` field
- Add product review queue for staff (`/admin/founder/products` filter by `PENDING_REVIEW`)

### 4. Founder Protection Hardening (Spec 04 §5-9)
- Audit all role-management APIs to ensure `FOUNDER` cannot be granted/removed by any non-Founder
- Add explicit test cases for direct API attempts to modify Founder
- Ensure `requireFounder()` is used on every Founder-protected route

### 5. Permission System Activation (Spec 04 §33, Spec 10 §15)
- `requirePermission()` is defined but rarely called in API routes
- Replace inline role checks (`user.role === "ADMIN"`) with `requirePermission()` calls
- Parse and enforce `customPermissions` field on User model
- Add permission checks to all admin/moderation endpoints

---

## 🟡 Medium Priority

### 6. Store Visibility Enforcement (Spec 03 §34)
- Hidden/suspended stores must not appear in public store listings
- `/api/stores/[slug]` must check `store.visibility` before showing products
- Creator dashboard should show store visibility status

### 7. Product Versioning UI (Spec 03 §20)
- Creator product edit page needs version management section
- Changelog/release notes per version
- Customers see version history on product page

### 8. Appeal System UI (Spec 04 §43)
- User-facing appeal submission page
- Admin review interface for appeals
- Link appeals to moderation actions

### 9. Creator Terms Acceptance Flow (Spec 03 §35)
- Show terms acceptance before first product publish
- Store acceptance timestamp + version
- Re-acceptance flow when terms are updated

### 10. Moderation Queue Workflow (Spec 04 §25)
- Add assignment/reassignment to reports
- Priority levels
- Internal moderation notes UI
- Staff action history per report

---

## 🟢 Lower Priority / Future

### 11. Rate Limiting (Spec 06 §18)
- Replace in-memory Map rate limiter with Redis/distributed store
- Apply to all abuse-prone endpoints

### 12. Security Headers (Spec 06 §44-47)
- Add CSP header (currently missing)
- Add HSTS header
- Review CSRF protection for authenticated mutations

### 13. File Upload Security (Spec 06 §14)
- Integrate malware scanning for uploads
- Add file type restriction enforcement

### 14. Background Jobs (Spec 06 §38)
- Set up queue system for exports, email batches, file processing

### 15. Monitoring & Health Checks (Spec 06 §53-54)
- Add health check endpoints
- Set up error tracking/alerts

---

## Quick Start Commands

```bash
npm run lint          # ESLint
npx tsc --noEmit      # TypeScript check
npm run build         # Production build
npm run dev           # Start dev server
npm run make-founder  # Bootstrap Founder account
```

---

## Key Files Changed

| File | Change |
|------|--------|
| `next.config.js` | Security headers |
| `prisma/schema.prisma` | New enums + models |
| `src/lib/creator-guards.ts` | Session invalidation + creator guards |
| `src/lib/creator-access.ts` | Creator status check helper |
| `src/lib/auth.ts` | Session invalidation on ban/suspension |
| `src/app/become-creator/page.tsx` | New creator application page |
| `src/app/store/create/page.tsx` | Creator status check |
| `src/app/creator/layout.tsx` | Enforces `creatorStatus: APPROVED` |
| `src/app/api/creator/application/route.ts` | New |
| `src/app/api/creator/terms/route.ts` | New |
| `src/app/api/creator/products/[id]/versions/route.ts` | New |
| `src/app/api/appeals/route.ts` | New |
| `src/app/api/admin/creators/[id]/action/route.ts` | New |
| `src/app/api/admin/creators/application/[id]/route.ts` | Updated |
| `src/app/api/admin/products/[id]/route.ts` | Expanded actions |
| `src/app/api/products/route.ts` | Store visibility filter |
| `src/app/api/checkout/route.ts` | Unavailable product check |
