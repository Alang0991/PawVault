# PawVault 2.0 — Redesign Progress

This pass is a UI/UX and preference-system upgrade on top of the existing PawVault application.

## Preserved
- Existing Prisma schema and records
- Existing user accounts and roles
- Existing products, media and files
- Existing Supabase/storage references
- Existing API routes and purchase/download systems
- Existing authentication and permissions

## Changed in this pass
- New marketplace visual language and responsive header
- New homepage hero treatment
- Refined product-card presentation
- Theme preference now persists through the existing display-settings API
- Fixed accent-color bootstrap so hex values are converted to real HSL instead of being treated as HSL
- Currency selector consumes enabled currencies from the existing settings API
- Language switching loads the actual bundled translation modules directly and persists through the existing settings API
- Modern TypeScript path configuration

## Database safety
No Prisma reset, schema replacement, destructive migration, seed, or data deletion is part of this redesign pass.
