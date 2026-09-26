# PawVault --- Duplicate / Double Rendering Repair

## Problem

User reports duplicate/double content appearing in the UI.

## Audit

Search for duplicate Header, Navigation, Footer, ProductCard,
CreatorCard, Modal, Toast, Filter, Search, Breadcrumb, Sidebar and
page-title rendering.

Check nested layouts, shared layouts plus pages, Server+Client duplicate
rendering, React hydration, Strict Mode effects, duplicate API calls,
duplicated pagination, cache concatenation, realtime subscriptions and
event listeners.

## Data duplication

Find why records repeat. Do not blindly hide them. Use canonical IDs for
legitimate deduplication only after the source of duplication is
understood.

## Effects

Audit fetch/subscription effects. Clean up listeners and prevent
repeated requests. Ensure pagination cannot append the same page twice.

## Definition of done

Header/footer/sidebar appear once, product and creator records appear
once, notifications do not duplicate, and the underlying data/rendering
source is fixed.
