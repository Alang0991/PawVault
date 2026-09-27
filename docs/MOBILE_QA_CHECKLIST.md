# Mobile QA Checklist — PawVault (§19)

**Spec Reference:** `docs/PawVault_UI_UX_Design_Direction.md` §19
**Date:** 2026-09-27
**Test Widths:** 375px (iPhone SE), 414px (iPhone 8+), 768px (iPad portrait)

---

## Test Pages (9 total from §19)

| Page | Route | Status | Notes |
|------|-------|--------|-------|
| 1. Home | `/` | ⬜ | Hero, search, categories, trending, new, creators, commissions |
| 2. Marketplace | `/browse` | ⬜ | Search, filter drawer, product grid, active filters |
| 3. Product Page | `/product/[slug]` | ⬜ | Gallery, buy CTA, description, reviews, related |
| 4. Creator Page | `/creators/[username]` | ⬜ | Banner, tabs, product grid |
| 5. Commissions | `/services` | ⬜ | Category chips, budget slider, delivery filters |
| 6. Cart | `/cart` | ⬜ | Items, quantities, coupon, totals |
| 7. Checkout | `/checkout` | ⬜ | Billing, payment, order summary |
| 8. Dashboard | `/dashboard` / `/creator/dashboard` | ⬜ | Stats, quick actions, navigation |
| 9. Help Center | `/help` | ⬜ | Search, sections, articles |

---

## General Mobile Requirements (§19)

- [ ] No horizontal scrolling at any breakpoint
- [ ] No desktop navigation squeezed into mobile
- [ ] Clean mobile navigation drawer (☰ menu)
- [ ] Touch targets ≥ 44×44px
- [ ] Text readable without zoom (min 16px body)
- [ ] Forms work with virtual keyboard
- [ ] Modals/drawers don't overflow viewport
- [ ] Sticky headers/footers behave correctly
- [ ] Images scale properly (no overflow)
- [ ] Tables have horizontal scroll or card fallback

---

## Breakpoint Verification (tailwind.config.ts)

```js
screens: {
  xs: '40rem',    // 640px
  sm: '48rem',    // 768px ← tablet
  md: '64rem',    // 1024px
  lg: '76rem',    // 1216px
  xl: '80rem',    // 1280px
  '2xl': '96rem', // 1536px
}
```

**Test widths map to:**
- 375px → below `xs` (default mobile)
- 414px → below `xs`
- 768px → `sm` breakpoint

---

## Component-Level Checks

### Navigation (Header)
- [ ] Logo visible, not truncated
- [ ] Nav links hidden, accessible via drawer
- [ ] Search icon opens mobile search
- [ ] Cart/wishlist icons accessible
- [ ] Account menu in drawer
- [ ] Drawer slides from right, backdrop click closes
- [ ] Drawer focus trap works
- [ ] `prefers-reduced-motion` disables drawer animation

### Home Page (`/`)
- [ ] Hero: heading scales (clamp), subtext readable
- [ ] Search input full-width, usable
- [ ] Category chips: horizontal scroll or wrap
- [ ] Trending/New/Creator sections: grid → single column
- [ ] Product cards: 1 column at 375px, 2 at 414px+
- [ ] Commissions CTA: full-width button
- [ ] No content overflow

### Marketplace (`/browse`)
- [ ] Search bar: full-width, sticky or accessible
- [ ] Filter button opens drawer (not sidebar)
- [ ] Active filter chips: wrap, removable
- [ ] Product grid: 1 col (375px), 2 col (414px+), 3+ (768px+)
- [ ] Sort dropdown: touch-friendly
- [ ] Pagination: touch targets adequate
- [ ] Infinite scroll or pagination works

### Product Page (`/product/[slug]`)
- [ ] Gallery: swipeable, dots/arrows touch-friendly
- [ ] Title, creator, price: stacked, readable
- [ ] Buy CTA: full-width, sticky bottom on scroll?
- [ ] Description: readable line length
- [ ] Tabs (Description/Features/Files/Reviews): scrollable if many
- [ ] Reviews: card layout, no overflow
- [ ] Related products: horizontal scroll

### Creator Page (`/creators/[username]`)
- [ ] Banner: scales, no crop issues
- [ ] Avatar, name, stats: stacked
- [ ] Tabs (Products/Commissions/Reviews/About): scrollable
- [ ] Product grid: responsive columns
- [ ] Follow button: accessible

### Commissions (`/services`)
- [ ] Category chips: horizontal scroll
- [ ] Budget slider: touch-draggable, labels visible
- [ ] Delivery time chips: wrap
- [ ] Creator cards: 1 column, all info visible
- [ ] Filter "Find Creators" button: full-width

### Cart (`/cart`)
- [ ] Items: stacked, thumbnail, title, qty, price
- [ ] Quantity controls: touch-friendly (± buttons)
- [ ] Coupon input: full-width
- [ ] Totals: clear, sticky or at bottom
- [ ] Checkout CTA: full-width

### Checkout (`/checkout`)
- [ ] Steps: progress indicator visible
- [ ] Form fields: 16px font (prevents iOS zoom)
- [ ] Card input: works with autofill
- [ ] Order summary: collapsible or stacked
- [ ] Pay button: full-width, sticky bottom?

### Dashboard (`/dashboard`, `/creator/dashboard`)
- [ ] Stats cards: 1 column, tap to navigate
- [ ] Quick actions: full-width buttons
- [ ] Navigation: drawer or bottom tabs
- [ ] Tables: horizontal scroll with shadow indicator

### Help Center (`/help`)
- [ ] Search: full-width
- [ ] Sections: accordion or stacked
- [ ] Article list: 1 column, readable
- [ ] Article page: content width, no overflow
- [ ] Breadcrumbs: wrap or truncate

---

## Specific CSS/Implementation Checks

### Tailwind Classes to Verify
```css
/* Grid responsiveness */
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4

/* Flex wrapping */
flex-wrap gap-4

/* Touch targets */
min-h-[44px] min-w-[44px]

/* Text scaling */
text-base sm:text-lg (min 16px base)

/* Container padding */
px-4 sm:px-6 lg:px-8

/* Drawer not sidebar */
lg:hidden (mobile drawer)
hidden lg:block (desktop sidebar)

/* Safe areas */
pb-safe / pt-safe (for notched devices)
```

### Known Problem Areas to Check
- [ ] Product card hover states don't stick on touch
- [ ] Dropdown menus close on outside tap
- [ ] Tooltips don't appear on touch (or use tap-to-show)
- [ ] Sticky headers don't cover content on short viewports
- [ ] Modal max-height respects viewport
- [ ] Form inputs don't zoom on iOS (font-size ≥ 16px)
- [ ] Date pickers / selects use native mobile UI

---

## Automated Checks (Can Run in CI)

```bash
# 1. Check for horizontal overflow potential
grep -r "overflow-x:auto" src/app --include="*.tsx" | grep -v "table\|scroll"

# 2. Verify responsive grid classes used
grep -r "grid-cols-" src/app --include="*.tsx" | head -20

# 3. Check for fixed widths that could overflow
grep -r "w-\[" src/app --include="*.tsx" | grep -v "max-w\|min-w"

# 4. Verify touch target sizes
grep -r "min-h-\[44px\]" src/components --include="*.tsx"
```

---

## Results Template

| Page | 375px | 414px | 768px | Issues Found |
|------|-------|-------|-------|--------------|
| Home | ⬜ | ⬜ | ⬜ | |
| Marketplace | ⬜ | ⬜ | ⬜ | |
| Product | ⬜ | ⬜ | ⬜ | |
| Creator | ⬜ | ⬜ | ⬜ | |
| Commissions | ⬜ | ⬜ | ⬜ | |
| Cart | ⬜ | ⬜ | ⬜ | |
| Checkout | ⬜ | ⬜ | ⬜ | |
| Dashboard | ⬜ | ⬜ | ⬜ | |
| Help Center | ⬜ | ⬜ | ⬜ | |

---

## Sign-off

- [ ] All 9 pages tested at 3 widths
- [ ] No horizontal scrolling
- [ ] All touch targets ≥ 44px
- [ ] Forms work with virtual keyboard
- [ ] Navigation drawer functional
- [ ] No content clipping/overflow
- [ ] Reduced motion respected

**Tested by:** _______________ **Date:** _______________