# PawVault --- Authentication & Session Full Repair

## Problem

Sessions are unreliable or not working.

Use one canonical source of truth for session, current user, role,
permissions and account state.

## States

Handle session loading, authenticated, unauthenticated, expired, missing
user, disabled account, role loading and permission loading separately.

Do not log users out because an unrelated API failed, a profile field is
missing, or a permission is denied.

## Audit

Check `/api/auth/session`, `/api/account/state`, cookies,
refresh/renewal, server session resolution, client hydration, logout and
middleware. Verify httpOnly, Secure, SameSite, domain, path and expiry
settings in production.

Avoid false redirects while session/permissions are still loading.

Role changes should refresh canonical permission state without requiring
unnecessary logout/login.

Protected APIs must resolve identity server-side; never trust client
user IDs or roles.
