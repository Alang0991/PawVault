# PawVault --- Help Center Content & Routing Repair

## Confirmed problem

The live Help Center exposes many categories/articles, but several
visible article links currently return 404s. This is a content
registry/route mismatch, not simply a lack of text.

## Canonical content model

Each article should have ID, slug, category, title, summary, body,
status, published/updated dates, related articles and search keywords.

States: Draft, Scheduled, Published, Archived. Only Published content is
public.

## Routing

Every visible article must resolve to a real article. Crawl every Help
Center link and produce a broken-link report. Remove or repair links to
missing articles.

## Search/UX

Search real published content only. Article pages need breadcrumb,
title, summary, content, update date, related articles and Support
action. Empty search needs a useful state rather than a blank screen.

## Important

Do not populate the Help Center with fake placeholder articles just to
fill space. Build real useful documentation for accounts, buying,
downloads, creators, products, payouts, licenses, security, reports,
moderation, API and troubleshooting.
