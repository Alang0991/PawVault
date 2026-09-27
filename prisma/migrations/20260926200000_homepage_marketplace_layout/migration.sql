-- PawVault homepage: shorten the page and remove the manual Staff Picks shelf.
--
-- Follows docs/PawVault_UI_UX_Design_Direction.md:
--   §4  the homepage is hero -> Trending -> New Releases -> Popular Creators -> Commissions
--   §5  discovery is calculated, not curated, so Staff Picks is dropped and
--       Popular Creators is added as a data-driven section
--
-- Featured, category grid, free, bundles and creator spotlight are kept in the
-- database but disabled, so a founder can re-enable them from the homepage
-- editor without re-creating them.

DELETE FROM "HomepageSection" WHERE "type" = 'staffPicks';

-- Popular Creators replaces creator spotlight on the default layout.
INSERT INTO "HomepageSection" ("id", "type", "enabled", "displayOrder", "config", "isSeasonal", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, 'popularCreators', true, 3,
       '{"title": "Popular Creators", "subtitle": "Creators buyers come back to", "limit": 4, "showAction": true, "actionLabel": "All creators", "actionHref": "/creators"}',
       false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "HomepageSection" WHERE "type" = 'popularCreators');

-- Commissions get their own band; they are a primary differentiator (§10).
INSERT INTO "HomepageSection" ("id", "type", "enabled", "displayOrder", "config", "isSeasonal", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, 'commissions', true, 4,
       '{"title": "Commissions", "subtitle": "Find a creator for your next project.", "actionLabel": "Explore Commissions", "actionHref": "/services"}',
       false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "HomepageSection" WHERE "type" = 'commissions');

-- Bring the default order in line with §4 and switch off the sections that
-- made the page long. The hero already carries the category chips.
UPDATE "HomepageSection" SET "displayOrder" = 0, "updatedAt" = CURRENT_TIMESTAMP WHERE "type" = 'hero';
UPDATE "HomepageSection" SET "displayOrder" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "type" = 'trendingProducts';
UPDATE "HomepageSection" SET "displayOrder" = 2, "updatedAt" = CURRENT_TIMESTAMP WHERE "type" = 'newDrops';
UPDATE "HomepageSection" SET "displayOrder" = 3, "updatedAt" = CURRENT_TIMESTAMP WHERE "type" = 'popularCreators';
UPDATE "HomepageSection" SET "displayOrder" = 4, "updatedAt" = CURRENT_TIMESTAMP WHERE "type" = 'commissions';
UPDATE "HomepageSection" SET "displayOrder" = 5, "enabled" = false, "updatedAt" = CURRENT_TIMESTAMP WHERE "type" = 'followingFeed';
UPDATE "HomepageSection" SET "displayOrder" = 6, "enabled" = false, "updatedAt" = CURRENT_TIMESTAMP WHERE "type" = 'featuredProducts';
UPDATE "HomepageSection" SET "displayOrder" = 7, "enabled" = false, "updatedAt" = CURRENT_TIMESTAMP WHERE "type" = 'categories';
UPDATE "HomepageSection" SET "displayOrder" = 8, "enabled" = false, "updatedAt" = CURRENT_TIMESTAMP WHERE "type" = 'freeProducts';
UPDATE "HomepageSection" SET "displayOrder" = 9, "enabled" = false, "updatedAt" = CURRENT_TIMESTAMP WHERE "type" = 'bundles';
UPDATE "HomepageSection" SET "displayOrder" = 10, "enabled" = false, "updatedAt" = CURRENT_TIMESTAMP WHERE "type" = 'creatorSpotlight';
