# Pawvault (local development)

## OAuth provider setup

1. Register applications in Google and Discord developer consoles.
2. Set the callback/redirect URIs to (use the dev port your app runs on, default 3000 or fallback 3001):

- `https://pawvault.co.uk/api/auth/callback/google`
- `https://pawvault.co.uk/api/auth/callback/discord`

If you are using local development, use `http://localhost:3000` or your local port in the provider dashboard and in your `.env`.

## .env entries

Add these to your `.env` (or `.env.local`) for production or hosted deployments:

```
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""
NEXTAUTH_URL="https://pawvault.co.uk"
NEXTAUTH_SECRET="<generate-a-secret>"
```

Also see `.env.example` for other optional settings used by the project.

## Moderation access

- The `/moderation` page is server-protected. Only users with `role` equal to `ADMIN` or `MODERATOR` may access it.
- Roles are stored on the user record in the database and propagated to the session JWT.

To assign a moderator, update the `role` field for the user in the database (via Prisma or your admin UI).
