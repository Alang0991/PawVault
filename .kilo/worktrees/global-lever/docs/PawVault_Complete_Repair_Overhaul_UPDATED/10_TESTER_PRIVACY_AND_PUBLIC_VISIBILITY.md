# PawVault --- Tester Account Founder-Only Privacy

## Rule

The internal Tester account and everything belonging to it must be
hidden from everyone except Founder.

## Non-Founder

Admin, Moderator, Creator, User and logged-out visitors must not
discover Tester through creator directory, Browse, Search, Categories,
stores, products, recommendations, Staff Picks, collections, posts,
reviews, public APIs, sitemap, SEO or public counts.

## Founder

Founder can see Tester data according to normal Founder authority.

## Enforcement

Use a canonical internal/test account flag if one exists. Otherwise add
one through the canonical account system. Apply visibility server-side.
Do not use CSS or React-only filtering.

Direct Tester URLs must be privacy-preserving for non-Founder users,
preferably a controlled 404 that does not reveal Tester existence.

Public counts must exclude Tester records for non-Founder viewers.

Do not hardcode a Tester email into dozens of queries. Do not delete
Tester data to hide it.
