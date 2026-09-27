# PawVault --- UI/UX Direction

## Goal

Redesign PawVault into a polished, creator-first digital marketplace
that feels **human-designed, intentional, and premium**.

The goal is **not** to copy Jinxxy.

Use strong marketplace patterns as inspiration, but give PawVault its
own identity.

------------------------------------------------------------------------

## 1. The overall feeling

PawVault should feel:

-   Premium
-   Clean
-   Friendly
-   Creator-focused
-   Easy to browse
-   Modern without looking like an AI-generated template
-   Spacious and confident
-   Product-image focused

Avoid:

-   Excessive gradients
-   Excessive glassmorphism
-   Giant rounded containers everywhere
-   Huge glowing blobs
-   Random decorative shapes
-   Generic AI marketing phrases
-   Too many badges
-   Too many sections
-   Excessive animations
-   Every component looking like a floating card

### Design rule

> Every visual element needs a reason to exist.

------------------------------------------------------------------------

## 2. Inspiration

### Jinxxy

https://jinxxy.com/

Take inspiration from Jinxxy's **marketplace information architecture**,
especially:

-   Prominent marketplace search
-   Category discovery
-   Product grids
-   Creator discovery
-   New products
-   Free products
-   Sales
-   Product filtering
-   Creator storefronts

Do **not** copy Jinxxy's visual design, branding, text, or layout
one-for-one.

------------------------------------------------------------------------

## 3. Visual inspiration

### Clean digital marketplace

![Clean digital marketplace
inspiration](https://cdn.dribbble.com/userupload/46438476/file/97c840780726755390d5f9a77155af15.jpg?resize=%7Bwidth%7Dx%7Bheight%7D&vertical=center)

Reference: Modular Digital Asset Marketplace UI, Dribbble.

What to take from it:

-   Clear hierarchy
-   Search immediately visible
-   Product discovery close to the top
-   Categories presented simply
-   Product imagery doing most of the visual work

------------------------------------------------------------------------

### Clean digital product marketplace

![Digital product marketplace
inspiration](https://cdn.blink.new/screenshots/digital-products-store-zfuafdvj.sites.blink.new-1774595017593.webp)

What to take from it:

-   Very clear headline
-   Simple search
-   Category chips
-   Large product imagery
-   Minimal decoration

Do NOT copy the exact design.

------------------------------------------------------------------------

### Marketplace product-card inspiration

![Marketplace UI
inspiration](https://cdn.dribbble.com/userupload/47442014/file/90077bd93739ef3b5111f79a9f8f52cb.png?resize=%7Bwidth%7Dx%7Bheight%7D&vertical=center)

What to take from it:

-   Strong product cards
-   Creator identity
-   Clear price
-   Clear rating
-   Simple actions

------------------------------------------------------------------------

# 4. PawVault homepage

The homepage should immediately communicate:

> **This is a marketplace for digital creators.**

Suggested structure:

``` text
PAWVAULT

Explore   Creators   Commissions   Free

                              Search   ♡   Cart   Account


                 Discover something
                    worth keeping.

        Digital products made by independent creators.

        [ Search avatars, assets, creators... ]


        Avatars   Assets   Clothing   Textures
        Worlds    Tools    Other


------------------------------------------------------------

                         Trending

        [ Product ] [ Product ] [ Product ] [ Product ]


------------------------------------------------------------

                       New Releases

        [ Product ] [ Product ] [ Product ] [ Product ]


------------------------------------------------------------

                    Popular Creators

        [ Creator ] [ Creator ] [ Creator ] [ Creator ]


------------------------------------------------------------

                       Commissions

        Find a creator for your next project.

                 [ Explore Commissions ]


------------------------------------------------------------

                        PAWVAULT
```

Keep the homepage relatively short.

Do NOT add sections simply because other marketplaces have them.

------------------------------------------------------------------------

# 5. No Staff Picks required

PawVault does **not** need a Staff Picks system.

This would create unnecessary manual work.

Instead, make discovery data-driven.

### Trending

Can be calculated from:

-   Recent sales
-   Product views
-   Favourites
-   Recent activity
-   Sales velocity

### New Releases

Automatically show recently published products.

### Popular Creators

Automatically calculate using relevant marketplace signals.

This means the homepage remains alive without staff manually maintaining
every section.

A manual editorial system can be added later if PawVault actually needs
it.

------------------------------------------------------------------------

# 6. Product cards

Product cards should be simple.

Preferred structure:

``` text
┌────────────────────────────┐
│                            │
│       PRODUCT IMAGE        │
│                            │
│                         ♡  │
└────────────────────────────┘

Product Name
by Creator

★ 4.9 · 128 sales

£25.00
```

Do not fill cards with:

-   6+ badges
-   huge gradient backgrounds
-   unnecessary metadata
-   giant CTA buttons
-   decorative icons everywhere

The product image should be the star.

### Hover

Keep interaction subtle:

-   Image scale: approximately 1.02--1.04
-   Small elevation change
-   Slight shadow
-   Favourite button remains accessible
-   Optional Quick View appears

Animation should feel responsive, not theatrical.

------------------------------------------------------------------------

# 7. Marketplace page

Suggested layout:

``` text
Explore

[ Search products... ]

[ Category ] [ Platform ] [ Price ] [ Features ] [ Rating ]

Active filters:
VRChat ×    Under £30 ×

------------------------------------------------

124 products                         Sort: Trending ↓

[ Product ] [ Product ] [ Product ] [ Product ]
[ Product ] [ Product ] [ Product ] [ Product ]
[ Product ] [ Product ] [ Product ] [ Product ]
```

### Mobile

Use:

``` text
124 products

[ Filters ]     [ Sort ]

[ Product ] [ Product ]
[ Product ] [ Product ]
```

Avoid a huge desktop filter sidebar on mobile.

------------------------------------------------------------------------

# 8. Product page

The product page should prioritize trust and clarity.

``` text
┌─────────────────────────────┬──────────────────────────┐
│                             │ Product Name              │
│                             │ by Creator                │
│                             │                           │
│       PRODUCT PREVIEW       │ ★ 4.9 · 128 sales        │
│                             │                           │
│                             │ £25.00                    │
│                             │                           │
│                             │ [ Buy Now ]               │
│                             │                           │
│                             │ ✓ Instant download        │
│                             │ ✓ License information     │
│                             │ ✓ Support                 │
└─────────────────────────────┴──────────────────────────┘

Description

Features

Compatibility

Files included

License

Reviews

More from this creator
```

The purchase decision should be obvious without making the page feel
aggressive.

------------------------------------------------------------------------

# 9. Creator storefront

Creators should feel like they own a proper storefront.

``` text
┌──────────────────────────────────────────────────────┐
│                    CREATOR BANNER                     │
│                                                      │
│  ◉  Creator Name                                     │
│     @username                                        │
│                                                      │
│     Short creator bio...                             │
│                                                      │
│     [ Follow ]                                       │
│                                                      │
│     42 Products   1.2K Followers   ★ 4.9            │
└──────────────────────────────────────────────────────┘

Featured

[ Product ] [ Product ] [ Product ]

Products    Commissions    Reviews    About
```

Creator pages should feel personal without becoming social media clones.

------------------------------------------------------------------------

# 10. Commissions

Commissions should be one of PawVault's major differentiators.

Navigation:

``` text
Explore
Creators
Commissions
Free
```

Commission discovery:

``` text
What do you need?

[ Avatar ] [ Artwork ] [ Clothing ]
[ Texture ] [ VRChat Setup ] [ Other ]

Budget
£──────────────£

Delivery time

[ Any ] [ < 1 week ] [ 1–2 weeks ] [ 2+ weeks ]

                 [ Find Creators ]
```

Then show creators with:

-   What they make
-   Starting price
-   Turnaround
-   Portfolio preview
-   Reviews
-   Availability

------------------------------------------------------------------------

# 11. Navigation

Desktop:

``` text
PAWVAULT

Explore     Creators     Commissions     Free

                              Search   ♡   Cart   Account
```

Do not make the navbar enormous.

Mobile:

``` text
☰     PAWVAULT                Search   Cart
```

Use a clean mobile navigation drawer.

------------------------------------------------------------------------

# 12. Typography

Use a strong typographic hierarchy rather than decorative UI.

Recommended hierarchy:

``` text
Hero heading
48–64px desktop

Page heading
32–40px

Section heading
22–28px

Product title
15–18px

Body
14–16px

Metadata
12–14px
```

Do not use too many font families.

Prefer one primary typeface plus an optional display face if it
genuinely improves the brand.

------------------------------------------------------------------------

# 13. Colour direction

PawVault should have a restrained brand palette.

Do not make every surface purple.

Use:

-   Neutral background
-   Neutral cards
-   Dark readable text
-   One primary brand accent
-   One secondary accent
-   Success/error/warning colours only when meaningful

The accent should guide attention, not decorate every component.

------------------------------------------------------------------------

# 14. Cards and borders

Use a small number of card styles.

### Product card

Minimal.

### Creator card

Image + identity + useful stats.

### Category card

Simple icon/image + category name.

### Feature card

Only when a larger explanation is necessary.

Avoid nesting cards inside cards inside cards.

------------------------------------------------------------------------

# 15. Empty states

Make these feel intentional.

Bad:

> No products found.

Better:

> Nothing here yet.

> Try removing a filter or searching for something else.

\[ Clear filters \]

------------------------------------------------------------------------

# 16. Loading states

Use skeletons that match the final layout.

Do not show random spinners everywhere.

Product grid:

``` text
[ ░░░░░░░░░░ ] [ ░░░░░░░░░░ ] [ ░░░░░░░░░░ ]

[ ░░░░░░░░░░ ] [ ░░░░░░░░░░ ] [ ░░░░░░░░░░ ]
```

The page should not jump when content loads.

------------------------------------------------------------------------

# 17. Animation philosophy

Animations should communicate interaction.

Good:

-   150--250ms transitions
-   subtle hover
-   menu slide/fade
-   modal transition
-   image zoom 1.02--1.04

Avoid:

-   floating blobs
-   excessive parallax
-   constant motion
-   glowing animations everywhere
-   slow page transitions
-   animations that delay usability

------------------------------------------------------------------------

# 18. Dark mode

Dark mode should be a real theme, not simply:

``` text
background = black
text = white
```

Use layered surfaces:

``` text
Background
Surface
Raised surface
Border
Primary text
Secondary text
Muted text
Accent
```

Light mode should receive the same design attention.

------------------------------------------------------------------------

# 19. Mobile

Mobile is not an afterthought.

Test:

-   Home
-   Marketplace
-   Product page
-   Creator page
-   Commissions
-   Cart
-   Checkout
-   Dashboard
-   Help Center

at narrow widths.

No horizontal scrolling.

No desktop navigation squeezed into mobile.

------------------------------------------------------------------------

# 20. Accessibility

Every redesign should preserve:

-   Keyboard navigation
-   Visible focus states
-   Sufficient contrast
-   Semantic headings
-   Accessible buttons
-   Accessible form labels
-   Alt text for meaningful images
-   Reduced-motion support

------------------------------------------------------------------------

# 21. The "not AI-generated" rule

This is extremely important.

The final UI should NOT feel like a generic AI-generated SaaS template.

Avoid:

> Unlock your creative potential.

> Where creators come to life.

> Your journey starts here.

> The future of digital creation.

Use simple human copy instead:

> Find something worth keeping.

> Made by creators.

> Browse products.

> Start selling.

> Find a creator.

Short, natural, confident.

------------------------------------------------------------------------

# 22. Shared design system

Before redesigning every page, establish reusable components.

``` text
/design-system

Navbar
Footer
Button
Input
Select
Search
ProductCard
CreatorCard
CategoryCard
Badge
Tabs
FilterBar
Modal
Dropdown
Toast
Skeleton
EmptyState
ErrorState
Pagination
```

Every page should use the same system.

Do not create five slightly different buttons or product cards.

------------------------------------------------------------------------

# 23. Redesign order

Do this in stages.

### Phase 1 --- Foundation

-   Authentication/session
-   i18n
-   Routing
-   Production environment
-   API stability
-   Shared layout

### Phase 2 --- Design system

-   Typography
-   Colours
-   Spacing
-   Components
-   Responsive rules

### Phase 3 --- Core marketplace

1.  Homepage
2.  Explore
3.  Product page
4.  Creator page
5.  Search
6.  Filters

### Phase 4 --- Creator tools

1.  Creator dashboard
2.  Products
3.  Storefront
4.  Analytics
5.  Commissions

### Phase 5 --- Buyer experience

1.  Cart
2.  Checkout
3.  Purchases
4.  Library
5.  Reviews

### Phase 6 --- Support

1.  Help Center
2.  Help articles
3.  Legal
4.  Account/settings

### Phase 7 --- Final polish

-   Mobile
-   Accessibility
-   Loading states
-   Empty states
-   Error states
-   Animations
-   i18n audit
-   Production testing

------------------------------------------------------------------------

# 24. Final design principle

PawVault should feel like:

**A real marketplace that happens to be beautifully designed.**

Not:

**A beautiful landing page that happens to contain a marketplace.**

Products, creators, search, commissions and purchasing should always be
the centre of the experience.
