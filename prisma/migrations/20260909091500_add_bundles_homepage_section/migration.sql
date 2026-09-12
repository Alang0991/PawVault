-- Add default Bundles homepage section

INSERT INTO "HomepageSection" ("id", "type", "enabled", "displayOrder", "config", "isSeasonal", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'bundles',
  true,
  9,
  '{"title": "Bundles", "subtitle": "Curated collections at a discount", "limit": 4, "showAction": true, "actionLabel": "All bundles", "actionHref": "/bundles"}',
  false,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING;
