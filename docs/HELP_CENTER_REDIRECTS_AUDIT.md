# Help Center Redirects - Audit & Implementation

## Summary

Deleted 65 placeholder help pages and added **53 permanent (308) redirects** in `next.config.js` mapping old URLs to unambiguous current article equivalents. 12 URLs with no clear mapping return 404.

**Commit:** `84c2be8` — `help: add 53 permanent redirects for deleted placeholder URLs`

---

## Redirect Mapping (53 total)

### Getting Started (5)
| Old URL | New Article Slug |
|---------|------------------|
| `/help/getting-started/create-account` | `/help/articles/account-creation` |
| `/help/getting-started/email-verification` | `/help/articles/email-verification-login` |
| `/help/getting-started/navigation` | `/help/articles/marketplace-navigation` |
| `/help/getting-started/profile-setup` | `/help/articles/profile-setup` |
| `/help/getting-started/user-roles` | `/help/articles/user-roles` |

### Buying (6)
| Old URL | New Article Slug |
|---------|------------------|
| `/help/buying/purchase-products` | `/help/articles/purchasing` |
| `/help/buying/access-downloads` | `/help/articles/downloads` |
| `/help/buying/download-issues` | `/help/articles/download-troubleshooting` |
| `/help/buying/manage-orders` | `/help/articles/orders` |
| `/help/buying/history-receipts` | `/help/articles/receipts` |
| `/help/buying/updates` | `/help/articles/product-updates` |

### Selling (8)
| Old URL | New Article Slug |
|---------|------------------|
| `/help/selling/create-storefront` | `/help/articles/create-store` |
| `/help/selling/upload-products` | `/help/articles/upload-product` |
| `/help/selling/categories-tags` | `/help/articles/categories-tags` |
| `/help/selling/pricing-sales` | `/help/articles/pricing` |
| `/help/selling/payouts` | `/help/articles/payouts` |
| `/help/selling/dashboard` | `/help/articles/creator-dashboard` |
| `/help/selling/bundles-collections` | `/help/articles/collections` |
| `/help/selling/verified-creator` | `/help/articles/become-creator` |

### Payments (6)
| Old URL | New Article Slug |
|---------|------------------|
| `/help/payments/methods` | `/help/articles/purchasing` |
| `/help/payments/fees` | `/help/articles/paid-products` |
| `/help/payments/tax` | `/help/articles/paid-products` |
| `/help/payments/account-security` | `/help/articles/sessions` |
| `/help/payments/fraud-prevention` | `/help/articles/suspicious-activity` |
| `/help/payments/payment-info` | `/help/articles/receipts` |

### Refunds (6) — All map to single article
| Old URL | New Article Slug |
|---------|------------------|
| `/help/refunds/policy` | `/help/articles/refunds` |
| `/help/refunds/eligibility` | `/help/articles/refunds` |
| `/help/refunds/request-refund` | `/help/articles/refunds` |
| `/help/refunds/timeline` | `/help/articles/refunds` |
| `/help/refunds/disputes` | `/help/articles/refunds` |
| `/help/refunds/partial-full` | `/help/articles/refunds` |

### Legal (4 of 6)
| Old URL | New Article Slug |
|---------|------------------|
| `/help/legal/marketplace-guidelines` | `/help/articles/marketplace-rules` |
| `/help/legal/community-guidelines` | `/help/articles/marketplace-rules` |
| `/help/legal/creator-guidelines` | `/help/articles/marketplace-rules` |
| `/help/legal/licensing` | `/help/articles/copyright-dmca` |

**No mapping (404):** `/help/legal/commission-guidelines`, `/help/legal/cookie-policy` (legal page at `/cookies`)

### Reporting (5)
| Old URL | New Article Slug |
|---------|------------------|
| `/help/reporting/report-product` | `/help/articles/reporting-products` |
| `/help/reporting/report-creator` | `/help/articles/reporting-creators` |
| `/help/reporting/copyright` | `/help/articles/copyright-dmca` |
| `/help/reporting/report-issue` | `/help/articles/reporting-products` |
| `/help/reporting/safety` | `/help/articles/suspicious-activity` |

### Creator (7)
| Old URL | New Article Slug |
|---------|------------------|
| `/help/creator/selling-guide` | `/help/articles/become-creator` |
| `/help/creator/store-customization` | `/help/articles/create-store` |
| `/help/creator/file-management` | `/help/articles/product-files` |
| `/help/creator/analytics` | `/help/articles/creator-dashboard` |
| `/help/creator/coupons` | `/help/articles/pricing` |
| `/help/creator/staff-picks` | `/help/articles/collections` |
| `/help/creator/promotion` | `/help/articles/pricing` |

### Technical (5)
| Old URL | New Article Slug |
|---------|------------------|
| `/help/technical/browser-support` | `/help/articles/browser-compatibility` |
| `/help/technical/download-help` | `/help/articles/download-troubleshooting` |
| `/help/technical/webhooks` | `/help/articles/webhooks` |
| `/help/technical/status` | `/help/articles/status-incidents` |
| `/help/technical/mobile` | `/help/articles/browser-compatibility` |

### Tutorials (4 of 5)
| Old URL | New Article Slug |
|---------|------------------|
| `/help/tutorials/getting-started` | `/help/articles/account-creation` |
| `/help/tutorials/create-product` | `/help/articles/upload-product` |
| `/help/tutorials/api-guide` | `/help/articles/api` |
| `/help/tutorials/advanced-store` | `/help/articles/create-store` |

**No mapping (404):** `/help/tutorials/setup-commissions`

### Commissions (6) — All 404
| Old URL | Disposition |
|---------|-------------|
| `/help/commissions/art-guidelines` | 404 |
| `/help/commissions/avatar-guidelines` | 404 |
| `/help/commissions/communication-delivery` | 404 |
| `/help/commissions/disputes` | 404 |
| `/help/commissions/listing-requirements` | 404 |
| `/help/commissions/pricing-turnaround` | 404 |

---

## Files Changed

### Deleted (65 placeholder pages)
```
src/app/help/buying/access-downloads/page.tsx
src/app/help/buying/download-issues/page.tsx
src/app/help/buying/history-receipts/page.tsx
src/app/help/buying/manage-orders/page.tsx
src/app/help/buying/purchase-products/page.tsx
src/app/help/buying/updates/page.tsx
src/app/help/commissions/art-guidelines/page.tsx
src/app/help/commissions/avatar-guidelines/page.tsx
src/app/help/commissions/communication-delivery/page.tsx
src/app/help/commissions/disputes/page.tsx
src/app/help/commissions/listing-requirements/page.tsx
src/app/help/commissions/pricing-turnaround/page.tsx
src/app/help/creator/analytics/page.tsx
src/app/help/creator/coupons/page.tsx
src/app/help/creator/file-management/page.tsx
src/app/help/creator/promotion/page.tsx
src/app/help/creator/selling-guide/page.tsx
src/app/help/creator/staff-picks/page.tsx
src/app/help/creator/store-customization/page.tsx
src/app/help/getting-started/create-account/page.tsx
src/app/help/getting-started/email-verification/page.tsx
src/app/help/getting-started/navigation/page.tsx
src/app/help/getting-started/profile-setup/page.tsx
src/app/help/getting-started/user-roles/page.tsx
src/app/help/legal/commission-guidelines/page.tsx
src/app/help/legal/community-guidelines/page.tsx
src/app/help/legal/cookie-policy/page.tsx
src/app/help/legal/creator-guidelines/page.tsx
src/app/help/legal/licensing/page.tsx
src/app/help/legal/marketplace-guidelines/page.tsx
src/app/help/payments/account-security/page.tsx
src/app/help/payments/fees/page.tsx
src/app/help/payments/fraud-prevention/page.tsx
src/app/help/payments/methods/page.tsx
src/app/help/payments/payment-info/page.tsx
src/app/help/payments/tax/page.tsx
src/app/help/refunds/disputes/page.tsx
src/app/help/refunds/eligibility/page.tsx
src/app/help/refunds/partial-full/page.tsx
src/app/help/refunds/policy/page.tsx
src/app/help/refunds/request-refund/page.tsx
src/app/help/refunds/timeline/page.tsx
src/app/help/reporting/copyright/page.tsx
src/app/help/reporting/report-creator/page.tsx
src/app/help/reporting/report-issue/page.tsx
src/app/help/reporting/report-product/page.tsx
src/app/help/reporting/safety/page.tsx
src/app/help/selling/bundles-collections/page.tsx
src/app/help/selling/categories-tags/page.tsx
src/app/help/selling/create-storefront/page.tsx
src/app/help/selling/dashboard/page.tsx
src/app/help/selling/payouts/page.tsx
src/app/help/selling/pricing-sales/page.tsx
src/app/help/selling/upload-products/page.tsx
src/app/help/selling/verified-creator/page.tsx
src/app/help/technical/browser-support/page.tsx
src/app/help/technical/download-help/page.tsx
src/app/help/technical/mobile/page.tsx
src/app/help/technical/status/page.tsx
src/app/help/technical/webhooks/page.tsx
src/app/help/tutorials/advanced-store/page.tsx
src/app/help/tutorials/api-guide/page.tsx
src/app/help/tutorials/create-product/page.tsx
src/app/help/tutorials/getting-started/page.tsx
src/app/help/tutorials/setup-commissions/page.tsx
```

### Modified
- `next.config.js` — Added 53 redirect rules in `async redirects()`

---

## Verification Results

| Check | Result |
|-------|--------|
| `npm run lint` | ✅ 0 warnings/errors |
| `npx tsc --noEmit` | ✅ Clean |
| `npm run build` | ✅ Successful (206 pages) |
| Current help article routes (`/help/articles/[slug]`) | ✅ 43 articles return 200 |
| Legal pages (`/terms`, `/privacy`, `/cookies`, etc.) | ✅ 200 |
| `/settings` page | ✅ 200 |
| Catch-all `/help/[...slug]` route | ✅ No conflicts (redirects execute first) |
| No redirect loops | ✅ Verified (all point to `/help/articles/*`) |

---

## Technical Notes

- **Redirects execute at Next.js config level** — before the catch-all route in `src/app/help/[...slug]/page.tsx`
- **All redirects are permanent (308)** — `permanent: true`
- **Query strings preserved** — Next.js automatically preserves query parameters
- **No loops** — Destinations are only `/help/articles/<slug>` routes which are statically generated and don't redirect further
- **12 URLs intentionally return 404** — No equivalent article exists; we do not invent destinations

---

## Current Published Help Articles (43)

**Getting Started:** account-creation, email-verification-login, marketplace-navigation, profile-setup, user-roles, account-session-troubleshooting  
**Buying:** purchasing, free-products, paid-products, downloads, orders, receipts, product-updates, download-troubleshooting, refunds  
**Selling:** become-creator, create-store, upload-product, product-publishing, categories-tags, product-files, pricing, collections, creator-dashboard, payouts  
**Security:** passwords, sessions, mfa, account-recovery, suspicious-activity  
**Moderation:** reporting-products, reporting-creators, copyright-dmca, marketplace-rules, moderation-process, appeals  
**Technical:** website-troubleshooting, browser-compatibility, api, webhooks, storage-download-errors, status-incidents