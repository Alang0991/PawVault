# PawVault — Language / Localization System Full Repair

## Problem

The Languages settings tab is not working reliably. Language must be a real persistent application preference.

## Requirements

The selector must open, show the current language, allow supported languages, save the preference, persist after refresh/navigation/sessions, and fail safely.

Use the canonical user/profile/settings system. Do not create a second preference system.

## One i18n System

Use one localization layer for navigation, buttons, settings, account pages, Creator Hub, moderation/admin UI, Help Center UI, empty states, errors, loading states, validation, notifications and supported emails.

Do not scatter translations through components.

## Supported Languages

Maintain an explicit supported-language registry with locale code, display name, translation availability, formatting locale and text direction where relevant. Reject arbitrary client locale values.

## Fallback

Missing translations must fall back safely and never render `undefined`, raw translation keys, or crash a page.

## User Content

Changing interface language must NOT silently translate creator-owned product titles, descriptions, store names, posts or reviews. Those are separate content-localization features.

## Dates / Numbers / Currency

Centralize locale-aware date, time and number formatting. Language and currency preferences should work together without changing actual financial records.

## Persistence Test

```text
Change language → Save → Refresh → Still selected
```

Then test Browse → Product → Help Center → Creator Hub → Settings.

## Session Safety

Language changes must not cause logout, session replacement, redirect loops, Dashboard redirects, or authentication failures.

## URL Strategy

If locale-prefixed URLs are used, use one canonical routing strategy. Do not accidentally create duplicate versions of routes. Otherwise persist the preference through the canonical account settings.

## Accessibility

Language selection must have a proper label, keyboard access, clear selected state, and screen-reader-friendly names.

## Definition of Done

Language tab works, preference persists, major UI uses the localization system, missing translations fall back safely, creator-owned content is not silently rewritten, sessions remain stable, and navigation does not crash.
