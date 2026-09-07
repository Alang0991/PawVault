# PawVault — Feedback & Community

> This adds functionality only. The visual system remains `UI_UX_Update.md`.

## Feedback

Create a real `/feedback` system where users can:
- browse
- search
- filter
- vote
- comment
- create posts
- report posts
- see status
- see official responses

Categories:
- Feature Request
- Bug Report
- Improvement
- Creator Request
- Marketplace Request
- API / Developer
- Other

## Status

Suggested:
- Open
- Under Review
- Planned
- In Progress
- Completed
- Declined
- Duplicate

Use real database state.

## Voting

One active vote per user per post. Support toggling, server validation, duplicate protection, rate limiting and real counts.

## Duplicate detection

Before publishing a post:
1. Search similar posts.
2. Show likely matches.
3. Let the user open/vote on an existing post.
4. Allow staff to mark duplicates.
5. Preserve the duplicate relationship.

## Comments

Comments need authentication, pagination, reporting, moderation, rate limiting and sensible edit/delete rules.

## Moderation

Staff can hide, restore, delete where permitted, mark duplicate, change category/status, pin posts, lock comments and add official responses.

All staff actions must be audited.

## Roadmap

Create `/roadmap` using real database items.

Suggested stages:
- Planned
- In Progress
- Coming Soon
- Completed

Feedback can link to roadmap items.

Never create fake roadmap entries.

## Changelog

Create `/changelog`.

Each entry:
- title
- summary
- description
- release date
- category
- author
- related feedback where appropriate

Categories:
- New
- Improved
- Fixed
- Creator
- Marketplace
- Platform
- API

Only publish real changes.

## Announcements

Founder can manage draft, published and archived announcements.

## Community safety

Every community feature needs:
- reporting
- moderation
- rate limiting
- abuse prevention
- privacy controls
- blocking/muting where appropriate

## Feedback lifecycle

Feedback → Under Review → Planned → In Progress → Completed → Changelog

Keep this native to PawVault rather than copying another platform.
