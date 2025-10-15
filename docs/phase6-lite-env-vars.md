# Phase 6 Lite - Environment Variables

## Required Environment Variables

### Public Site (`apps/site`)

```bash
# Site URL - Used for ISR revalidation and preview links
NEXT_PUBLIC_SITE_URL=http://localhost:3001

# Calendly URL for consultation modal
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/yourusername

# LinkedIn Profile URL
NEXT_PUBLIC_LINKEDIN_PROFILE_URL=https://linkedin.com/in/khaledaun
```

### Admin Dashboard (`apps/admin`)

```bash
# Revalidation secret for ISR (use a strong random string)
REVALIDATE_SECRET=your-strong-random-secret-here
```

### Database

```bash
# PostgreSQL connection string for Prisma
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public

# Supabase Configuration (if using Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Optional Environment Variables

### LinkedIn Quick Win (Phase 8)

```bash
# Enable LinkedIn wall embed
NEXT_PUBLIC_FF_SOCIAL_WALL=true

# Walls.io or similar embed HTML
NEXT_PUBLIC_LINKEDIN_WALL_EMBED_HTML="<iframe src='https://walls.io/...'></iframe>"
```

### Social Media

```bash
NEXT_PUBLIC_TWITTER_URL=https://twitter.com/yourusername
NEXT_PUBLIC_GITHUB_URL=https://github.com/yourusername
```

### Security & Monitoring

```bash
# Rate limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000

# CORS origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Sentry error tracking
SENTRY_DSN=your-sentry-dsn
ENABLE_ERROR_REPORTING=true
```

## Setup Instructions

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Update the values in `.env.local` with your actual credentials

3. For local development, you can use these minimal settings:
   ```bash
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/khaledaun
   NEXT_PUBLIC_SITE_URL=http://localhost:3001
   REVALIDATE_SECRET=dev-secret
   ```

4. **Important**: Never commit `.env.local` to version control!

## Phase 6 Lite Specific Notes

- **Session-based auth**: For Phase 6 Lite, we use a simple cookie-based session (`session-user-id`). In production, integrate with Supabase Auth or NextAuth.
- **Preview tokens**: Currently using basic token validation. Enhance with signed tokens (HMAC) in production.
- **Revalidation secret**: Change this to a strong random string before deploying to production.

