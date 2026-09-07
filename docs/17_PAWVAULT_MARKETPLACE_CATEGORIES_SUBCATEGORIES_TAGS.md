# PawVault — Marketplace Categories, Subcategories & Tags System

## Purpose

Build a real, database-backed marketplace category system for PawVault, inspired by the usefulness and depth of large creator marketplaces such as Jinxxy, while keeping PawVault's own identity, terminology, design, permissions, and creator-first rules.

This is an implementation specification for Kilo.

**This is NOT a mockup, static list, fake-data generator, or separate demo marketplace.**

Kilo must audit the existing PawVault codebase first and integrate this into the current marketplace, database, product system, search, creator system, homepage, and existing UI.

---

# 1. Core Rules

1. Use the existing PawVault project.
2. Do not create a second marketplace system.
3. Do not create duplicate product/category/tag models if equivalent infrastructure already exists.
4. Audit the current database schema, API routes, product models, search, filters, pages, creator system, admin/moderation system, and frontend before changing anything.
5. Reuse existing authentication and sessions.
6. Do not force users to log out or log back in.
7. Use real database data everywhere.
8. Do not populate production with fake products, fake creators, fake sales, fake ratings, or fake category counts.
9. Empty categories must display a sensible empty state rather than fabricated content.
10. Categories must be actual database records, not hardcoded frontend-only strings.
11. Subcategories must be real database relationships.
12. Tags must be real database records and distinct from categories.
13. Products may belong to appropriate categories and multiple tags.
14. Category pages must automatically update as products are published, hidden, archived, deleted, or moved.
15. Category counts must be calculated from real eligible products.
16. Search and filters must use the same canonical category/tag data.
17. Creator ownership boundaries remain unchanged.
18. Moderators/admins can moderate marketplace visibility and category integrity according to their permissions, but moderation does not transfer ownership of creator products.
19. Do not silently change creator pricing, files, licenses, descriptions, or product ownership merely to implement categories.
20. Do not remove existing working functionality.
21. Do not redesign unrelated areas while implementing this system.
22. Keep PawVault's space/dark/purple/pink visual identity rather than copying Jinxxy's branding.
23. The final implementation must work on desktop and mobile.
24. Accessibility is required.
25. SEO must use real category data and stable URLs.
26. Category and tag APIs must enforce authorization server-side.
27. No generic `manage_everything` permission.
28. Category management, product moderation, and creator ownership are separate concerns.

---

# 2. Marketplace Information Architecture

Create the following top-level marketplace categories unless the existing PawVault database already contains equivalent categories. If equivalent records exist, migrate/merge into the canonical structure rather than duplicating them.

## 2.1 Avatars

Subcategories:
- VRChat Avatars
- Furry Avatars
- Kemonomimi
- Human / Humanoid
- Robot / Android
- Creature
- Cute / Chibi
- Mature / Adult
- Performance Optimized
- Quest Compatible

Possible future additions:
- Public / Community Avatars
- Customizable Avatars
- Modular Avatars
- Full-Body Tracking Ready

Existing PawVault content-safety rules remain authoritative.

## 2.2 Clothing & Accessories

Subcategories:
- Clothing
- Shoes
- Hats
- Accessories
- Avatar Clothing
- Modular Clothing
- Jewelry
- Props

Possible future additions:
- Hair
- Bags
- Masks
- Glasses
- Ears / Tails
- Outfit Packs

## 2.3 3D Assets

Subcategories:
- 3D Models
- Weapons
- Props
- Furniture
- Buildings
- Vehicles
- Nature
- Environment Assets

Possible future additions:
- Architecture
- Sci-Fi
- Fantasy
- Food
- Household
- Decorative Assets

## 2.4 Worlds

Subcategories:
- VRChat Worlds
- World Assets
- World Prefabs
- World Systems
- Udon / UdonSharp
- Environment Packs

Possible future additions:
- World Templates
- Optimization Systems
- Interactables
- World UI
- Lighting / Skyboxes

## 2.5 Materials & Textures

Subcategories:
- Materials
- Textures
- PBR
- Toon / Anime
- Fur
- Hair
- Decals
- Shaders

Possible future additions:
- Skin
- Metal
- Glass
- Fabric
- Nature
- Emission

## 2.6 Particles & VFX

Subcategories:
- Particles
- VFX
- Trails
- Aura / Energy
- Magic
- Fire
- Blood
- Special Effects

Content safety still applies.

## 2.7 Scripts & Tools

Subcategories:
- Unity Tools
- Blender Tools
- VRChat Tools
- Shaders & Tools
- Editor Tools
- Automation
- Utilities

Possible future additions:
- Udon Tools
- Creator Workflow
- Import / Export
- Optimization
- Build Tools
- Publishing Tools

## 2.8 Animation & Expressions

Subcategories:
- Animations
- Dance
- Emotes
- Gestures
- Facial Expressions
- Face Tracking
- PhysBones
- Audio / Voice

Possible future additions:
- Idle Animations
- Locomotion
- Combat
- Interaction
- Gesture Packs
- VRCFaceTracking

## 2.9 Creator Resources

Subcategories:
- Blender Files
- Unity Packages
- Templates
- PSD / Source Files
- Reference Packs
- Tutorials / Guides
- UI Assets

Possible future additions:
- Rigging Resources
- Substance Resources
- Photoshop Resources
- Creator Checklists
- Documentation

## 2.10 Services

Subcategories:
- Avatar Commissions
- 3D Modeling
- Texture Commissions
- Rigging
- Animation
- Unity Setup
- Optimization
- Other Services

Services are structurally different from downloadable products. If PawVault already has a commission/service model, integrate with it rather than creating a duplicate model.

## 2.11 Free

Free is a discovery/filter concept as well as a possible navigation grouping.

Subcategories:
- Free Avatars
- Free Assets
- Free Tools
- Free Textures
- Free Worlds
- Free Resources

IMPORTANT: Free must be based on the product's real current price/entitlement rules.

Do NOT change a creator's paid product to £0 merely to place it in Free. Do NOT create fake free copies.

---

# 3. Category vs Tag

A **category** answers: "What kind of thing is this?"

Examples:
- Avatars
- Clothing & Accessories
- 3D Assets
- Worlds
- Materials & Textures
- Scripts & Tools

A product should have one primary marketplace category and, where useful, one subcategory.

A **tag** answers: "What technology, compatibility, style, feature, or characteristic applies to this?"

Examples:
- Quest
- PC
- VRChat
- Unity
- Blender
- VRChat 2022
- Poiyomi
- VRCFT
- PhysBones
- SFW
- NSFW
- Modular Avatar
- Performance
- Optimized
- PCVR
- Full Body Tracking

Tags may be many-to-many.

Tags must be searchable/filterable.

Tags must not replace the category hierarchy.

---

# 4. Recommended Database Model

Kilo must first inspect the existing schema and adapt these concepts to the current ORM/database.

Conceptually the system needs:

## categories
Suggested fields:
- id
- slug
- name
- description
- parent_id nullable
- icon/visual identifier nullable
- display_order
- is_active
- created_at
- updated_at
- seo_title nullable
- seo_description nullable

Top-level categories use `parent_id = null`.

Subcategories reference their parent.

Use stable unique slugs.

## tags
Suggested fields:
- id
- slug
- name
- description nullable
- tag_type nullable
- is_active
- created_at
- updated_at

Tags need unique canonical slugs.

## product_categories
Suggested fields:
- product_id
- category_id
- relationship type if needed
- created_at

If the existing product schema already has a category foreign key and only one primary category is required, retain it rather than adding unnecessary complexity.

## product_tags
Suggested fields:
- product_id
- tag_id
- created_at

Unique composite key:
`product_id + tag_id`

---

# 5. Canonical Category Rules

Each published marketplace product should have:
- one valid primary top-level category
- optionally one valid subcategory belonging to that top-level category
- relevant tags

Do not allow a product to reference a subcategory whose parent is unrelated to its selected top-level category.

VALID:
`Avatars → VRChat Avatars`

INVALID:
`Avatars → Blender Tools`

The API must validate this server-side.

---

# 6. Category Administration

Create or extend the existing Founder/admin marketplace management system.

Authorized staff should be able to:
- create/edit/deactivate/reorder categories
- create/edit/deactivate/reorder subcategories
- create/edit/deactivate tags
- merge duplicate tags/categories where safe
- inspect usage counts
- inspect products using a category/tag
- repair invalid relationships
- manage SEO metadata

Do not create a broad unrestricted permission.

Suggested scoped permissions:
- `category.read`
- `category.create`
- `category.update`
- `category.deactivate`
- `tag.read`
- `tag.create`
- `tag.update`
- `tag.deactivate`
- `marketplace.taxonomy.manage`

Use the existing PawVault permission system if one exists.

---

# 7. Creator Product Editing

Creators should be able to select categories/tags while creating or editing their own products.

Category selector:
1. Category
2. Subcategory, filtered to the selected category

Tags:
- searchable multi-select
- selected tags removable
- only canonical active tags selectable

Do not allow arbitrary public tag creation unless the existing permission model explicitly supports it.

If tag suggestions are supported, send them through an admin/moderation workflow.

---

# 8. Publishing Validation

A product should not become publicly published if required marketplace taxonomy is missing.

Validate:
- category exists
- category is active
- category is marketplace-eligible
- subcategory belongs to category
- tags exist and are active
- product is owned by the creator
- creator is allowed to publish
- all existing product publishing requirements pass

Return clear validation errors.

Do NOT return only `Invalid input.` when the server can explain the issue.

Examples:
- `A marketplace category is required.`
- `The selected subcategory does not belong to this category.`
- `This category is no longer available.`
- `One or more selected tags are invalid.`

---

# 9. Browse Marketplace

Build real category navigation.

Suggested top level:
- All
- Avatars
- Clothing & Accessories
- 3D Assets
- Worlds
- Materials & Textures
- Particles & VFX
- Scripts & Tools
- Animation & Expressions
- Creator Resources
- Services
- Free

Each category page should contain:
- title
- description
- subcategories
- real product count
- product grid
- sorting
- filters
- search within category
- relevant tags
- pagination/infinite loading
- proper empty state

---

# 10. Category Routes

Preferred stable routes:
- `/marketplace`
- `/marketplace/avatars`
- `/marketplace/avatars/vrchat-avatars`
- `/marketplace/clothing-accessories`
- `/marketplace/3d-assets`
- `/marketplace/worlds`
- `/marketplace/materials-textures`
- `/marketplace/particles-vfx`
- `/marketplace/scripts-tools`
- `/marketplace/animation-expressions`
- `/marketplace/creator-resources`
- `/marketplace/services`
- `/marketplace/free`

Adapt to PawVault's existing route architecture if equivalent routes already exist.

Do not create duplicate routes for the same data.

---

# 11. Breadcrumbs

Category pages should expose dynamic breadcrumbs.

Example:
`Marketplace / Avatars / VRChat Avatars`

Breadcrumb data must come from the category hierarchy, not manually hardcoded page-by-page.

---

# 12. Product Cards

Depending on real available data, show:
- product image
- product title
- creator identity
- category/subcategory
- relevant compatibility tags
- price
- real discount
- real rating/review count
- real free status
- trust indicators where supported

Do not display fake ratings, sales, downloads, or popularity.

Creator identity must link to the real creator/store profile.

---

# 13. Filters

Core filters:
- Category
- Subcategory
- Tags
- Price
- Free
- On Sale

3D/VR filters where supported by real data:
- PC
- Quest
- VRChat
- Unity
- Blender
- Poiyomi
- VRCFT
- PhysBones
- Modular Avatar
- Performance

Use backend filtering for large datasets.

---

# 14. Sorting

Support real sorting such as:
- Relevance
- Newest
- Recently Updated
- Price Low → High
- Price High → Low
- Highest Rated
- Most Popular

Popularity must use a real metric. If a metric does not exist, do not expose that sort option.

---

# 15. Search Integration

Search should understand:
- product title
- description
- category
- subcategory
- tags
- creator name
- compatibility metadata where indexed

Examples:
- `quest avatar`
- `poiyomi`
- `blender`
- `dance`

Do not create fake matches.

---

# 16. Homepage Integration

Evolve the homepage toward marketplace discovery while keeping PawVault's space theme.

Suggested sections:
- Hero
- Browse Categories
- New Releases
- Recently Updated
- Free
- Popular, only if backed by real metrics
- Featured, only if a real feature mechanism exists
- Creators
- Services

Every section must handle zero results gracefully.

---

# 17. Reusable Category Navigation

Create one reusable taxonomy navigation component rather than separate hardcoded menus.

Use it across:
- header
- marketplace
- homepage
- product editor
- search filters
- category pages
- admin taxonomy management

Support:
- desktop
- mobile
- dropdown/mega-menu
- active category
- subcategories
- keyboard navigation
- accessibility

---

# 18. Mobile Navigation

All categories must remain reachable on mobile.

Use:
- expandable categories
- subcategory accordions
- searchable categories if needed
- large tap targets
- clear back navigation

---

# 19. Category Counts

Counts must be real.

Examples:
`Avatars · 124`
`Worlds · 38`
`Free · 19`

Counts must respect visibility.

Exclude:
- deleted products
- permanently hidden products
- private drafts
- quarantined products/files
- products the viewer cannot see

Do not fabricate counts.

---

# 20. Dynamic Updates

When a creator:
- publishes
- changes category
- changes tags
- unpublishes
- archives
- deletes
- changes price
- updates compatibility

the marketplace must reflect the change through the existing cache/revalidation strategy.

Avoid stale category pages.

---

# 21. Creator Directory Integration

Integrate with the existing creator system.

`/creators` must use real creator records.

Creator cards should link to the real public profile/store.

Products should link back to the creator.

Where supported by real data, profiles may show:
- products
- categories represented
- services
- followers
- ratings
- sales

Do not fabricate statistics.

---

# 22. Product → Creator Identity

Every public product should expose its creator.

Clicking the creator name/avatar should lead to the real public creator profile/store.

Do not route users to `/store/create` simply because a lookup failed. Fix creator/store resolution if needed.

---

# 23. Free Products

Free products are determined from real pricing and entitlement data.

Do not:
- duplicate products
- create fake free listings
- alter creator prices
- bypass licenses
- bypass entitlement
- bypass download permissions

A creator may intentionally publish at zero price, and that product may then appear in Free.

---

# 24. Recommended Initial Tags

### Platform
- VRChat
- PCVR
- Quest

### Software
- Unity
- Blender
- Photoshop

### VRChat ecosystem
- VRCFT
- PhysBones
- Modular Avatar
- Poiyomi
- Udon
- UdonSharp

### File/asset type
- FBX
- VRM
- PSD
- PNG
- Unity Package
- Blender
- ZIP

### Style
- Anime
- Toon
- Realistic
- Cute
- Fantasy
- Sci-Fi

Use the existing PawVault safety/classification system for content classification.

---

# 25. Tag Types

Optional controlled types:
- platform
- software
- compatibility
- feature
- format
- style
- content
- workflow

Examples:
- Quest → platform/compatibility
- Blender → software
- Poiyomi → compatibility/software
- Cute → style
- FBX → format

---

# 26. Duplicate Protection

Prevent duplicate tags such as:
- Quest
- quest
- QUEST

Canonicalize case, whitespace, slug, and appropriate punctuation.

Use database unique constraints.

Do not automatically merge existing creator metadata without review.

Prevent duplicate category slugs and flag likely duplicate category names.

---

# 27. Category Deactivation

Do not hard-delete referenced categories unless a safe migration is guaranteed.

Preferred:
- mark inactive
- prevent new assignments
- preserve historical relationships
- migrate affected products through an explicit workflow

Apply the same principle to tags.

---

# 28. Category Reordering

Use a real `display_order` or existing ordering mechanism.

Do not encode production order only in frontend arrays.

---

# 29. SEO

Public category pages should have:
- unique title
- meta description
- canonical URL
- Open Graph metadata where supported
- breadcrumb structured data where supported
- sensible indexability

Do not generate thousands of thin indexable tag pages automatically.

---

# 30. Empty and Loading States

Examples:
- `No products in this category yet.`
- `Try another category or check back later.`
- `No products match these filters.`

Never show fake products.

Handle loading, success, empty, validation, authorization, and server errors separately.

---

# 31. API Requirements

Create or extend APIs for:
- list categories
- get category
- list subcategories
- list tags
- search tags
- assign product category
- assign product tags
- remove product tags
- admin category CRUD
- admin tag CRUD

Use existing PawVault API conventions.

All writes require server-side authentication/authorization.

Never trust client role information.

---

# 32. API Error Semantics

Use structured errors, for example:

```json
{
  "error": {
    "code": "CATEGORY_REQUIRED",
    "message": "A marketplace category is required."
  }
}
```

Recommended:
- 200/201 success
- 400 malformed request
- 401 unauthenticated
- 403 unauthorized
- 404 missing/not visible
- 409 conflict
- 422 invalid business data
- 500 unexpected failure

Do not collapse everything to `Invalid input.`

---

# 33. Creator Ownership Safety

Category implementation must not give PawVault ownership of creator content.

Creators retain control of:
- product files
- artwork
- descriptions
- pricing
- licenses
- ownership
- store content

PawVault controls marketplace taxonomy and presentation.

Moderation can restrict visibility according to Terms and permissions.

Moderation does not equal ownership.

---

# 34. Founder/Admin Authority

Founder/admin taxonomy authority may include:
- categories
- subcategories
- tags
- marketplace navigation
- taxonomy metadata
- visibility moderation

It must NOT automatically include:
- changing creator prices
- replacing creator files
- transferring product ownership
- changing creator payouts
- changing creator licenses

unless a separate explicit workflow exists.

---

# 35. Audit Logging

Taxonomy mutations must be auditable.

Record:
- actor
- action
- entity
- entity ID
- old value
- new value
- timestamp
- reason when required
- request/context ID

Important events:
- category created/renamed/deactivated/reordered
- tag created/renamed/deactivated
- product category changed
- product tag changed

Never log secrets.

---

# 36. Moderation Interaction

A hidden/moderated product must disappear from public:
- category grids
- counts
- search
- free listings
- public creator product lists

according to the existing visibility model.

Do not delete creator content merely because it is hidden.

---

# 37. Draft Products

Draft products may have incomplete taxonomy.

Creators may save drafts without completing publishing requirements if the existing product system permits it.

Publishing requires mandatory taxonomy.

---

# 38. Product Editing Safety

Taxonomy changes must preserve:
- files
- price
- license
- orders
- reviews
- ownership
- creator
- existing product ID

Do not accidentally recreate products.

---

# 39. Existing Product Migration

Inspect every existing product.

For each:
1. determine whether valid taxonomy already exists
2. map existing categories to canonical categories
3. infer tags only when reliable
4. do not invent uncertain taxonomy
5. flag ambiguous products for review
6. preserve product IDs
7. preserve ownership, orders, and entitlements

Do not mass-assign arbitrary categories just to populate UI.

---

# 40. Test/Seed Data

Development/test seeds may be used outside production.

Production must not receive fake marketplace activity.

If current production contains `Test Creator` or test products, determine whether they are intentional, leaked fixtures, or real records before touching them. Do not blindly delete production records.

---

# 41. Future Discovery Collections

Keep taxonomy separate from future collections such as:
- New
- Recently Updated
- Trending
- Popular
- Staff Picks
- Following
- For You
- On Sale
- Free

Collections are discovery systems, not necessarily categories.

---

# 42. Category Navigation Example

```text
MARKETPLACE
├── Avatars
│   ├── VRChat Avatars
│   ├── Furry Avatars
│   ├── Kemonomimi
│   ├── Human / Humanoid
│   ├── Robot / Android
│   ├── Creature
│   ├── Cute / Chibi
│   ├── Mature / Adult
│   ├── Performance Optimized
│   └── Quest Compatible
├── Clothing & Accessories
├── 3D Assets
├── Worlds
├── Materials & Textures
├── Particles & VFX
├── Scripts & Tools
├── Animation & Expressions
├── Creator Resources
├── Services
└── Free
```

This is information architecture, not a requirement to copy another marketplace's visual identity.

---

# 43. Visual Direction

Keep PawVault's:
- dark space theme
- navy/deep-space backgrounds
- purple/pink accents
- subtle space motifs
- creator-focused product cards
- strong product imagery
- readable typography
- good spacing

Avoid:
- copying Jinxxy's exact layout
- generic AI SaaS styling
- excessive glassmorphism
- huge empty areas
- admin-table-looking marketplace pages
- unreadable gradients

The marketplace should feel alive.

---

# 44. Category Cards

Category cards may contain:
- icon
- name
- short description
- real product count
- representative real imagery when available

Never generate fake product thumbnails simply to fill cards.

---

# 45. Homepage Category Section

Suggested heading:
`Explore PawVault`

Cards:
- Avatars
- Clothing & Accessories
- 3D Assets
- Worlds
- Materials & Textures
- Particles & VFX
- Scripts & Tools
- Animation & Expressions
- Creator Resources
- Services
- Free

Use canonical database data.

---

# 46. Searchable Category Selector

Creator editor:

```text
Choose category...

[ Search categories ]

Avatars
Clothing & Accessories
3D Assets
Worlds
Materials & Textures
...
```

After selecting:

```text
Avatars

Subcategory:
[ VRChat Avatars ▼ ]
```

---

# 47. Tag Selector

```text
Tags

[ Search tags... ]

Selected:
[ Quest × ] [ Poiyomi × ] [ VRCFT × ]

Suggestions:
Blender
Unity
PhysBones
Modular Avatar
```

Only canonical active tags are selectable.

---

# 48. Product Page Taxonomy

Near product information show useful taxonomy:

`Avatars / VRChat Avatars`

`Quest`
`Poiyomi`
`VRCFT`

Clickable tags should lead to real filtered results only if tag browsing exists.

---

# 49. Performance

Use:
- server-side pagination
- indexed queries
- efficient joins
- cached taxonomy
- lazy-loaded imagery
- existing optimized media system

Do not load the entire marketplace into the browser for filtering.

---

# 50. Caching

Cache stable taxonomy where appropriate.

Invalidate/revalidate after:
- category changes
- tag changes
- product taxonomy changes
- product visibility changes

Do not show stale taxonomy indefinitely.

---

# 51. RLS / Database Security

If PawVault uses Supabase/Postgres RLS, audit:
- public category/tag reads
- creator product taxonomy writes
- admin taxonomy writes
- product visibility
- cross-creator access

Creators can only modify taxonomy relationships for their own products.

Never rely solely on frontend controls.

---

# 52. Session Stability

This feature must not introduce authentication regressions.

Users must not be asked to sign in again when:
- opening Marketplace
- opening categories
- filtering
- editing own products
- changing tags
- changing categories
- viewing creators
- viewing products

Reuse the existing PawVault session.

---

# 53. Creator Hub Integration

`Create Product` and `Edit Product` must include taxonomy.

Existing Creator Hub routes must continue working.

Do not introduce route guards that send valid authenticated creators to sign-in.

---

# 54. Admin Taxonomy UI

Use the existing admin/Founder area if one exists.

Example:

```text
Marketplace Taxonomy

Categories
[ Avatars ]
[ Clothing & Accessories ]
[ 3D Assets ]
...

Tags
[ Quest ]
[ Unity ]
[ Blender ]
...
```

Category editor:
- Name
- Slug
- Parent
- Description
- SEO Title
- SEO Description
- Display Order
- Active

Tag editor:
- Name
- Slug
- Type
- Description
- Active

Show real usage counts.

---

# 55. Taxonomy Audit Tools

Identify:
- products with no category
- invalid categories
- inactive categories
- duplicate tags
- unused tags
- orphaned relationships
- invalid parent/subcategory relationships

Do not automatically perform destructive repairs.

---

# 56. Category Merge

If implemented:
1. select source
2. select destination
3. preview affected products
4. show count
5. require explicit confirmation
6. migrate relationships
7. preserve product IDs
8. audit operation
9. deactivate source
10. revalidate caches

Never silently delete relationships.

---

# 57. Tag Merge

Same safe workflow:
- source
- destination
- preview
- migrate
- preserve product data
- deactivate source
- audit
- prevent duplicate relationships

---

# 58. Category Change History

Future-ready history should support:
- previous category
- new category
- actor
- timestamp

This helps creators/staff understand taxonomy changes.

---

# 59. Creator Notifications

If staff changes a creator's product taxonomy for an administrative/moderation reason, notify the creator where appropriate.

Explain:
- product
- change
- reason where permitted
- appeal/contact path where applicable

---

# 60. Internationalization

Store category IDs independently of display labels.

Do not use translated names as database identifiers.

URLs and relationships must remain stable if labels are translated later.

---

# 61. Developer/API Documentation

Document:
- category endpoints
- tag endpoints
- product taxonomy fields
- validation
- permissions
- error semantics
- visibility rules

Update existing API documentation rather than creating contradictory docs.

---

# 62. No Duplicate Systems

Before implementing, search the repository for:
- category/categories
- taxonomy
- tag/tags
- product category
- product tags
- marketplace filters
- search filters
- browse routes

If equivalent infrastructure exists:

**extend it.**

Do not create `CategorySystemV2`, `MarketplaceTaxonomy`, or another duplicate model just because the existing system is inconvenient.

---

# 63. Audit-First Kilo Workflow

Kilo must begin by inspecting:

### Database
- product tables
- creator/store tables
- existing category/tag structures
- orders
- visibility/status
- RLS

### Backend
- product APIs
- search
- marketplace routes
- authentication
- authorization
- admin/moderation

### Frontend
- homepage
- marketplace
- product editor
- product page
- creator profile
- Creator Hub
- existing filters
- navigation

### Data
- current real products
- current real creators
- test records
- orphaned records

Then provide a short implementation plan before modifying production code.

---

# 64. Required Test Matrix

## Public
- marketplace loads
- category navigation works
- subcategory navigation works
- counts are real
- product grids are real
- empty states work
- filters work
- search works
- creator links work
- product links work
- mobile navigation works

## Creator
- creator can edit own product
- category selector works
- subcategory depends on category
- tags work
- invalid taxonomy rejected
- drafts behave correctly
- publish requires taxonomy
- creator cannot edit another creator's product

## Admin
- authorized Founder/admin can manage taxonomy
- unauthorized users get 403
- category CRUD works
- tag CRUD works
- audit logs are written
- merges are safe

## Security
- unauthenticated writes rejected
- role spoofing rejected
- RLS verified
- cross-creator modification rejected
- private/hidden/draft products excluded publicly

## Session
- no unexpected sign-in redirects
- no second auth system
- no logout/login requirement

---

# 65. End-to-End Scenarios

### Scenario A — New Avatar

Creator creates `Cute Wolf Avatar`.

Category:
`Avatars`

Subcategory:
`Furry Avatars`

Tags:
`VRChat`, `Quest`, `Poiyomi`

After publishing it should:
- appear under Avatars
- appear under Furry Avatars
- be searchable by tags
- link to the creator profile/store
- update counts
- show taxonomy on its product page

### Scenario B — Free Asset

Creator publishes `Free Tail Accessory` at £0.

Category:
`Clothing & Accessories`

Subcategory:
`Accessories`

It should appear in Accessories and Free without modifying any other product.

### Scenario C — Paid Product

Creator sells `Magic VFX Pack` for £10.

Category:
`Particles & VFX`

Subcategory:
`Magic`

It appears in the category and does not appear in Free.

### Scenario D — Hidden Product

A product is hidden for moderation.

It disappears from public category/search/counts while creator ownership remains intact.

### Scenario E — Category Change

Creator changes a product from `3D Assets → Props` to `Clothing & Accessories → Accessories`.

Only taxonomy relationships change. Files, price, orders, reviews, ownership, and creator remain intact.

---

# 66. Product Compatibility Metadata

Where existing structured product metadata supports it, do not force every fact into tags.

For example:

```text
platform:
  pc: true
  quest: true

software:
  unity: true
  blender: false

vrchat:
  physbones: true
  vrcft: true
```

Use structured fields for facts requiring reliable filtering/validation, and tags for discovery.

Do not duplicate facts unnecessarily.

---

# 67. Future Expansion

Design for future categories such as:
- Audio
- Music
- UI
- Shaders
- World Systems
- Avatar Systems
- Creator Tools
- Commissions
- Digital Art
- Photography
- Tutorials
- Templates
- Bundles

Do not rebuild the marketplace to add them later.

---

# 68. Bundles

If bundles are added later, they may have their own taxonomy.

Do not automatically inherit every category from every included product without defined business rules.

---

# 69. Services

Future service listings may support:
- service type
- turnaround
- pricing model
- portfolio
- availability
- commission status

Do not force service listings through download-only product logic.

---

# 70. Creator Discovery

Categories should help users discover creators.

Example:
`Avatars → Furry Avatars`

may show real creators with products in that category.

---

# 71. Category Landing Pages

Future category landing pages may contain:
- category explanation
- popular subcategories
- compatibility filters
- newest products
- featured creators
- guides

Only render sections when real data exists.

---

# 72. No Fake Marketplace Activity

This is absolute.

Never fabricate:
- product counts
- creator counts
- sales
- followers
- ratings
- reviews
- popularity
- downloads
- trending status
- category activity

If there is no data, say so.

---

# 73. Definition of Done

- [ ] canonical categories exist in the real database
- [ ] canonical subcategories exist
- [ ] canonical tags exist
- [ ] duplicate protection exists
- [ ] product/category relationships are real
- [ ] product/tag relationships are real
- [ ] creator editor supports taxonomy
- [ ] publishing validates taxonomy
- [ ] marketplace navigation uses database data
- [ ] category pages use database data
- [ ] filters use database data
- [ ] search integrates taxonomy
- [ ] homepage can surface categories
- [ ] category counts are real
- [ ] creator links work
- [ ] public products link to creator stores/profiles
- [ ] moderation visibility is respected
- [ ] admin taxonomy management is scoped
- [ ] audit logging works
- [ ] RLS/authorization is verified
- [ ] mobile works
- [ ] accessibility works
- [ ] SEO metadata works
- [ ] no duplicate marketplace systems exist
- [ ] no fake production data was introduced
- [ ] no logout/login regression exists
- [ ] tests pass

---

# 74. Implementation Order

### Phase 1 — Audit
Inspect existing PawVault infrastructure.

### Phase 2 — Data Model
Implement/extend canonical categories, subcategories, tags, and relationships.

### Phase 3 — Migration
Safely map existing products without inventing uncertain data.

### Phase 4 — APIs
Implement secure taxonomy endpoints.

### Phase 5 — Creator Editing
Add category/subcategory/tag selection.

### Phase 6 — Publishing Validation
Require valid taxonomy for published products.

### Phase 7 — Marketplace Navigation
Build real category navigation.

### Phase 8 — Category Pages
Build dynamic category/subcategory pages.

### Phase 9 — Filters/Search
Integrate taxonomy into discovery.

### Phase 10 — Homepage
Add real category discovery and real product sections.

### Phase 11 — Admin
Add scoped taxonomy management.

### Phase 12 — SEO/Accessibility/Mobile
Finish the public experience.

### Phase 13 — Testing
Run full regression and security testing.

---

# 75. Kilo Final Instruction

Do not just create the category names in the UI.

Build the actual system behind them.

I want PawVault to feel like a real marketplace where users can:
- browse categories
- drill into subcategories
- search
- filter
- discover creators
- discover products
- find free products
- find compatible VRChat/Unity/Blender assets
- understand what a product is before opening it
- move naturally between product → creator → store → category

Use the existing PawVault systems wherever possible.

Do not replace working infrastructure.

Do not create fake data.

Do not create a separate demo.

Do not copy Jinxxy's branding.

Make the marketplace taxonomy **real, database-backed, dynamic, searchable, filterable, secure, mobile-friendly, accessible, and maintainable.**

The goal is not "more category buttons."

The goal is a **real marketplace discovery system**.
