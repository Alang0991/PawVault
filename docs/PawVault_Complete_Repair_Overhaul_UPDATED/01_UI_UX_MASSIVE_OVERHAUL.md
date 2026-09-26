# PawVault --- Massive UI/UX Overhaul

## Goal

Make PawVault feel like a polished creator marketplace, not a generic
SaaS/admin template.

## Audit

Find duplicated headers/footers/nav, repeated cards, weak hierarchy,
inconsistent spacing, inconsistent buttons, empty-looking pages, stuck
loading states, mobile overflow, poor error states, and
admin/creator/public screens that look unrelated.

## Shared design system

Create one reusable system for typography, spacing, buttons, inputs,
selects, tabs, cards, badges, alerts, dialogs, drawers, dropdowns,
tooltips, tables, breadcrumbs, skeletons, empty states, error states and
pagination.

## Marketplace hierarchy

Prioritize product image, title, creator, price/free state, rating,
category/tags, and the primary action. Do not fill public marketplace
screens with admin controls.

## Navigation

Public: Browse, Categories, Creators, Search, Help/Support.
Authenticated: Account, Wishlist, Cart, Orders/Downloads. Creator:
Creator Hub, Products, Store, Orders, Customers, Payouts. Staff:
moderation/admin according to permission.

Do not render navigation twice through nested layouts.

## Responsive/accessibility

Audit desktop, tablet and mobile. No horizontal overflow or clipped
controls. Add keyboard navigation, focus states, labels, contrast,
reduced-motion support and correct semantics.

## States

Every data-heavy screen needs Loading, Success, Empty, Error,
Unauthorized, Forbidden and Not Found states. Never leave `Loading...`
forever.

## Rule

Do not hide structural bugs with visual patches. Fix the component/data
source causing duplicated or broken UI.
