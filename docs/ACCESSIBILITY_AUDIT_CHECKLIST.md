# Accessibility Audit Checklist — PawVault (§20)

**Spec Reference:** `docs/PawVault_UI_UX_Design_Direction.md` §20
**WCAG Target:** 2.1 AA
**Date:** 2026-09-27

---

## Automated Audit Status

| Tool | Status | Notes |
|------|--------|-------|
| axe-core | ⚠️ Pending | Requires running server or static export |
| eslint-plugin-jsx-a11y | ✅ | Built into Next.js lint (passing) |
| TypeScript strict | ✅ | Passing |

---

## Manual Checklist (Run in Browser)

### 1. Keyboard Navigation
- [ ] Tab through all interactive elements in order
- [ ] Focus visible on all links, buttons, inputs
- [ ] No keyboard traps (can tab out of modals/drawers)
- [ ] Skip link works (press Tab on load → "Skip to main content")
- [ ] Escape closes modals, drawers, dropdowns
- [ ] Arrow keys navigate menus, tabs, sliders
- [ ] Enter/Space activates buttons, links

### 2. Focus Management
- [ ] Focus moves to modal/drawer on open
- [ ] Focus returns to trigger on close
- [ ] Focus trapped in modal/drawer
- [ ] Focus outline visible (not just color change)
- [ ] No `outline: none` without replacement
- [ ] Focus order matches visual order

### 3. Screen Reader / Semantics
- [ ] `<main>` landmark present
- [ ] Heading hierarchy: h1 → h2 → h3 (no skipping)
- [ ] Unique `<h1>` per page
- [ ] ARIA labels on icon-only buttons
- [ ] ARIA labels on form inputs without visible labels
- [ ] `aria-expanded` on dropdown triggers
- [ ] `aria-controls` links trigger to panel
- [ ] Live regions for dynamic updates (toasts, cart count)
- [ ] Tables have `<caption>` or `aria-label`
- [ ] Images have meaningful `alt` (empty for decorative)

### 4. Forms
- [ ] Every input has associated `<label>` (for/id or wrapping)
- [ ] Required fields marked visually and `aria-required`
- [ ] Error messages linked via `aria-describedby`
- [ ] Error messages announced (live region)
- [ ] Input types correct (email, tel, password, number)
- [ ] Autocomplete attributes present
- [ ] Validation on blur + submit, not on keystroke

### 5. Color & Contrast
- [ ] Text contrast ≥ 4.5:1 (normal), ≥ 3:1 (large)
- [ ] UI component contrast ≥ 3:1 (borders, focus)
- [ ] No info conveyed by color alone
- [ ] Links distinguishable without color (underline)
- [ ] Focus indicators ≥ 3:1 against adjacent
- [ ] Works in Windows High Contrast mode

### 6. Responsive / Zoom
- [ ] Content reflows at 200% zoom (no horizontal scroll)
- [ ] Text resizes with browser zoom (not fixed px)
- [ ] Touch targets ≥ 44×44px
- [ ] No content clipped at 320px width

### 6. Reduced Motion
- [ ] `prefers-reduced-motion` disables all animations
- [ ] No auto-playing video/audio
- [ ] Carousels pause on hover/focus
- [ ] Transitions ≤ 250ms

---

## Page-Specific Checks

### Home (`/`)
- [ ] Hero h1: "Discover something worth keeping"
- [ ] Search input has label
- [ ] Category chips keyboard accessible
- [ ] Product cards: image alt, name, price, creator
- [ ] "View all" links have context

### Marketplace (`/browse`)
- [ ] Search input labeled
- [ ] Filter drawer: focus trap, escape closes
- [ ] Active filter chips removable via keyboard
- [ ] Sort dropdown keyboard accessible
- [ ] Product grid: semantic list or grid
- [ ] Pagination: `aria-label`, current page indicated

### Product Page (`/product/[slug]`)
- [ ] Gallery: arrow keys navigate, escape closes
- [ ] Price: currency symbol + amount in text
- [ ] Buy button: descriptive text
- [ ] Tabs: `role="tablist"`, `aria-selected`
- [ ] Reviews: star rating has text equivalent
- [ ] Related products: accessible carousel

### Creator Page (`/creators/[username]`)
- [ ] Banner: background image decorative
- [ ] Stats: numbers + labels
- [ ] Tabs: keyboard navigation
- [ ] Follow button: `aria-pressed` toggles

### Cart (`/cart`)
- [ ] Item removal: button with label
- [ ] Quantity: input with label, min/max
- [ ] Coupon: input + apply button
- [ ] Totals: labeled, currency format

### Checkout (`/checkout`)
- [ ] Step indicator: current step announced
- [ ] Address fields: autocomplete attrs
- [ ] Card input: labeled, no auto-format issues
- [ ] Order summary: table or definition list
- [ ] Pay button: descriptive, loading state

### Dashboard (`/dashboard`, `/creator/dashboard`)
- [ ] Stats cards: heading + value
- [ ] Navigation: current page `aria-current`
- [ ] Tables: sortable columns announced
- [ ] Actions: buttons not links

### Help Center (`/help`)
- [ ] Search: labeled, results announced
- [ ] Sections: headings, expandable
- [ ] Articles: reading time, updated date
- [ ] Breadcrumbs: `aria-label="Breadcrumb"`

---

## Component Library (src/components/ui/)

| Component | A11y Status | Notes |
|-----------|-------------|-------|
| Button | ✅ | Focus ring, disabled state, keyboard |
| Input | ✅ | Label association, error handling |
| Textarea | ✅ | Label association |
| Select | ✅ | Keyboard nav, `aria-expanded` |
| Checkbox | ✅ | Label wrapping, focus |
| Switch | ✅ | `role="switch"`, `aria-checked` |
| Radio | N/A | Not implemented |
| Card | ✅ | Semantic structure |
| Dialog/Modal | ✅ | Focus trap, escape, restore |
| Drawer | ✅ | Focus trap, escape, backdrop |
| Dropdown | ✅ | Keyboard nav, escape |
| Tooltip | ✅ | `aria-describedby`, hover+focus |
| Toast | ✅ | Live region, auto-dismiss |
| Alert | ✅ | `role="alert"`, dismissible |
| Tabs | ✅ | `role="tablist"`, arrow keys |
| Pagination | ✅ | `aria-label`, current page |
| Avatar | ✅ | `alt` from name |
| Badge | ✅ | Text + color |
| Skeleton | ✅ | `aria-hidden="true"` |
| Progress | ⚠️ | Needs `role="progressbar"` |
| Slider | ⚠️ | Needs keyboard + ARIA |
| HoverCard | ⚠️ | Touch alternative needed |

---

## Known Issues to Fix

### High Priority
1. **Progress component** — Add `role="progressbar"`, `aria-valuemin/max/now`
2. **Slider component** — Add keyboard support, `aria-orientation`, `aria-valuetext`
3. **HoverCard** — Add touch/click fallback for mobile
4. **IconButton** — Ensure `aria-label` required prop

### Medium Priority
5. **Tables** — Add responsive card fallback for mobile
6. **Toast** — Ensure `role="status"`, polite live region
7. **Pagination** — Add `aria-label="Pagination"`
8. **Breadcrumbs** — Add `nav aria-label="Breadcrumb"`

### Low Priority
9. **Color contrast** — Verify all `text-muted` on `bg-surface` meet 4.5:1
10. **Focus rings** — Ensure all custom components have visible focus

---

## Automated Regression (Add to CI)

```json
// package.json scripts
"test:a11y": "node scripts/a11y-audit.js"
```

```yaml
# .github/workflows/a11y.yml
- name: Accessibility Audit
  run: |
    npm run build
    npx serve -s out -l 3000 &
    sleep 5
    npm run test:a11y
```

---

## Sign-off Checklist

- [ ] All manual checks pass
- [ ] No critical/serious axe violations
- [ ] Keyboard navigation complete
- [ ] Screen reader test (NVDA/VoiceOver) on 3 key pages
- [ ] 200% zoom test on all 9 pages
- [ ] Reduced motion verified
- [ ] High contrast mode verified

**Audited by:** _______________ **Date:** _______________
**Next review:** _______________