# PawVault 2.0 – Language & Homepage Fixes

This build preserves the existing database/API/storage architecture and fixes the current UI issues without resetting or migrating production data.

## Fixed
- Duplicate CMS sections no longer render twice; the first configured instance of each section type wins.
- Language changes now persist through the existing `/api/account/display-settings` endpoint and refresh server-rendered marketplace content after a successful save.
- Guest language selection remains available through the existing locale cookie.
- Homepage hero, section headings, CTAs and supporting labels now use the existing translation system in all bundled languages.
- Main navigation and service menu labels now respond to the selected language.
- Currency provider no longer refetches settings in a dependency loop.
- Category cards have more visual variety and a more polished hover treatment.

## Data safety
No Prisma reset, database reset, destructive migration, seed, or storage replacement is included in this build.

Copy the original `.env` / `.env.local` files into the project root locally before running the app.
