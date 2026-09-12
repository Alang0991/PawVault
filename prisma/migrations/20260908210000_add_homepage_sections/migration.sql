-- Add HomepageSection model for dynamic homepage configuration

CREATE TABLE IF NOT EXISTS "HomepageSection" (
    "id"            TEXT NOT NULL,
    "type"          TEXT NOT NULL,
    "enabled"       BOOLEAN NOT NULL DEFAULT true,
    "displayOrder"  INTEGER NOT NULL DEFAULT 0,
    "config"        JSONB,
    "isSeasonal"    BOOLEAN NOT NULL DEFAULT false,
    "seasonStart"   TIMESTAMP(3),
    "seasonEnd"     TIMESTAMP(3),
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,
    CONSTRAINT "HomepageSection_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "HomepageSection_enabled_displayOrder_idx" ON "HomepageSection"("enabled", "displayOrder");
CREATE INDEX IF NOT EXISTS "HomepageSection_isSeasonal_seasonStart_seasonEnd_idx" ON "HomepageSection"("isSeasonal", "seasonStart", "seasonEnd");

-- Insert default homepage sections matching current hardcoded homepage
INSERT INTO "HomepageSection" ("id", "type", "enabled", "displayOrder", "config", "isSeasonal", "createdAt", "updatedAt") VALUES
  (gen_random_uuid()::text, 'hero', true, 0, '{"showCTA": true, "ctaText": "Browse Marketplace", "ctaHref": "/browse", "secondaryCtaText": "Start Selling", "secondaryCtaHref": "/auth/signin"}', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'featuredProducts', true, 1, '{"title": "Featured", "limit": 4, "showAction": true, "actionLabel": "All featured", "actionHref": "/browse?featured=true"}', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'staffPicks', true, 2, '{"title": "Staff Picks", "limit": 6}', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'followingFeed', true, 3, '{"title": "Following"}', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'trendingProducts', true, 4, '{"title": "Trending", "subtitle": "Popular right now", "limit": 8, "showAction": true, "actionLabel": "See more", "actionHref": "/browse?sort=popular"}', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'newDrops', true, 5, '{"title": "New Drops", "subtitle": "Recently published", "limit": 8, "showAction": true, "actionLabel": "See all new", "actionHref": "/browse?sort=newest"}', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'categories', true, 6, '{"title": "Shop by Category", "limit": 8, "showAction": true, "actionLabel": "All categories", "actionHref": "/categories"}', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'creatorSpotlight', true, 7, '{"title": "Creator Spotlight", "subtitle": "Meet the artists behind the assets", "showAction": true, "actionLabel": "View store"}', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'freeProducts', true, 8, '{"title": "Free Products", "subtitle": "Hand-picked free assets", "limit": 8, "showAction": true, "actionLabel": "Free in all", "actionHref": "/browse?free=true"}', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;