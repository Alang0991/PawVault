# PawVault — Browse, Discovery, Routing & Marketplace UI Repair

## Why this exists

The live `/browse` page currently renders a product card, but following that card currently produces a 404 on a `/product/...` URL. This is a direct, observable marketplace defect.

The browse page also has only a very small amount of visible marketplace content and needs to be treated as a real discovery system rather than a static list.

## Critical route bug

### Observed

Browse currently renders a product card with a route that resolves to:

```text
/product/amazing-3d-model
```

That route currently returns:

```text
404 Not Found
```

### Required fix

Find where the product card URL is generated.

Find the canonical product route.

Make every product card use the same resolver as direct product navigation.

Do NOT create a second product implementation just to make the card work.

## Route contract

Create one canonical helper/resolver conceptually equivalent to:

```text
getProductHref(product)
```

It must use the actual canonical slug.

Every product link must use it:

- browse
- search
- category
- creator page
- featured
- related products
- wishlist
- cart
- orders
- notifications
- homepage
- admin/creator previews where appropriate

## Route tests

For every published product:

```text
Browse card
→ click
→ 200 product page
```

Then:

```text
Direct canonical URL
→ same product
```

Then:

```text
Back
→ browse
```

Then:

```text
refresh
→ same product
```

## Missing product

If a slug does not exist:

```text
404 product not found
```

not:

```text
server exception
```

## Deleted product

If a historical order references a deleted product, the order must still render a historical snapshot.

Do not destroy order history because a product is no longer public.

## Browse filters

Audit all:

- search
- category
- price min
- price max
- rating
- free
- on sale
- tags
- creator
- sort
- pagination

Each filter must use the same backend query contract.

## Filter state

Changing one filter must not unexpectedly clear unrelated filters.

Example:

```text
Category = Avatars
Free = true
Sort = newest
```

Changing sort should preserve category/free.

## URL state

Prefer stable query parameters for shareable marketplace state.

Example:

```text
/browse?category=avatars&free=true&sort=newest
```

Only implement this if compatible with the existing architecture.

## Product visibility

Browse should show only products allowed by marketplace visibility rules.

Do not show:

- drafts
- rejected products
- removed products
- private products
- creator-unapproved products if approval is required
- suspended products when policy says hidden

## Product card

Every card should safely handle:

- missing image
- missing creator
- missing rating
- zero reviews
- free price
- sale price
- long title
- long creator name
- unavailable product

A missing optional field must not crash the entire page.

## Media

Never assume:

```text
product.media[0]
```

exists.

Use safe fallback handling.

## Creator

Never assume:

```text
product.creator.name
```

exists.

Resolve safely.

## Category

Never assume category is present.

A missing category should produce a safe fallback or omit the label.

## Empty state

A filter returning zero results should render:

```text
No products found
```

with a useful clear-filters action.

It must not throw an exception.

## Loading

Browse needs distinct:

- loading
- loaded
- empty
- error

states.

Do not show an empty marketplace while the request is still loading.

## Error recovery

If a filter request fails:

- keep the last valid result if safe
- show a retry action
- show a useful message
- log the server error
- do not crash the whole route

## Search

Search must resolve to real products and creators.

Product search result links must use the canonical product route.

## Categories

Category links must use canonical category slugs.

Category counts must use the same visibility rules as Browse.

## Creators

Creator links must use the canonical creator slug/username resolver.

Do not hardcode `/creator/...` in one place and `/creators/...` in another.

## Discovery sections

Future/active marketplace sections can include:

- newest
- trending
- free
- on sale
- featured
- popular
- rising
- creator discovery

But each section must use real data and an explicit query.

Do not fill sections with placeholder products.

## Performance

Avoid a request explosion such as:

```text
24 products
+
24 creator queries
+
24 media queries
+
24 rating queries
```

Prefer server joins/selects or batched queries.

## Regression tests

Test:

```text
Browse
→ search
→ filter
→ product
→ back
→ filter
→ category
→ product
→ creator
→ product
→ back
```

Also rapid switching:

```text
Browse → Category → Browse → Creator → Browse
```

## Definition of done

- [ ] Every browse card resolves
- [ ] No product card produces 404
- [ ] Canonical URL is consistent
- [ ] Filters work together
- [ ] Empty states work
- [ ] Missing media does not crash
- [ ] Missing creator does not crash
- [ ] Missing category does not crash
- [ ] Search links work
- [ ] Category links work
- [ ] Creator links work
- [ ] Pagination works
- [ ] Back navigation works
- [ ] Refresh works
- [ ] Rapid switching does not crash
