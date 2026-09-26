# PawVault --- Separated Development MDs

These files split the PawVault material into smaller documents so Kilo
can work through them more easily.

## Recommended order

1.  `00_CURRENT_REPAIR_FOUNDATION.md` --- Fix the existing production
    foundation first.
2.  `01_vision_and_website.md` --- Core vision, website, homepage and
    navigation.
3.  `02_marketplace_and_products.md` --- Marketplace, product pages,
    uploads and downloads.
4.  `03_creator_system.md` --- Creator profiles, dashboard, analytics,
    sales, payouts and storefronts.
5.  `04_users_commerce_and_orders.md` --- Wishlist, cart, checkout,
    orders, licences, reviews and notifications.
6.  `05_localization_and_themes.md` --- User customization, currencies,
    languages, seasonal themes and theme system.
7.  `06_founder_hub.md` --- Founder control centre and platform
    management.
8.  `07_permissions_security_and_moderation.md` --- Roles, permissions,
    staff, audit logs, moderation and security.
9.  `08_publishing_staging_monitoring_and_operations.md` --- Publishing,
    staging, performance, mobile, accessibility, payments, support, API,
    backups and monitoring.
10. `09_advanced_features_and_platform_goals.md` --- Feature flags,
    recommendations, search, verification, moderation, dangerous Founder
    controls and overall goals.
11. `10_future_pages_and_navigation.md` --- Future commission/service
    directories, Credits, Support, Feedback and future navigation.
12. `11_future_marketplace_social_and_ecosystem.md` --- Discovery,
    gifting, bundles, social, badges, storefronts, announcements,
    discussions, reviews, notifications, search, collections, events,
    seasonal system, news, roadmap, beta, mobile, accessibility, trust,
    versioning, downloads, payments, analytics, API, partnerships,
    affiliate/referral, support/help/legal.
13. `12_future_platform_architecture.md` --- Personalization, extra
    Founder controls, modular website, internationalization, performance
    goals and the bigger future platform idea.

## Important

These files are split for easier implementation, but together they
contain the complete material from the two source MDs.

Do not skip the repair/foundation document just because the later
documents contain future features. Build safely in dependency order.

Never: - Reset or destroy production data. - Create fake production data
to hide errors. - Create duplicate
account/role/permission/creator/store/moderation systems. - Rely on
frontend-only security. - Treat every staff role as Administrator. -
Redirect every failure to Dashboard. - Load large unused systems for
normal users.
