# Monitoring Setup Guide
**Date**: October 19, 2024  
**Purpose**: Set up production monitoring and observability

---

## 🎯 Overview

This guide covers setting up monitoring for:
1. Vercel Analytics (Web Analytics)
2. Health Check Monitoring (Uptime)
3. Sentry (Error Tracking) - Optional
4. Database Monitoring

---

## 1️⃣ Vercel Analytics

### Enable Web Analytics

**Steps**:
1. Go to https://vercel.com/dashboard
2. Select your project (KhaledAunSite)
3. Go to **Analytics** tab
4. Click **Enable Web Analytics**
5. Choose plan:
   - **Free**: Basic page views
   - **Pro**: Custom events, funnels, real-time

**Configuration** (Optional):
```typescript
// apps/site/src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Custom Events (Pro Only)

Track key user actions:
```typescript
import { track } from '@vercel/analytics';

// Track consultation bookings
track('consultation_booked', {
  source: 'hero_cta',
  locale: 'en',
});

// Track blog post views
track('post_view', {
  slug: post.slug,
  locale: locale,
  category: post.category,
});
```

**Expected Result**: Analytics dashboard shows traffic, page views, custom events

---

## 2️⃣ Health Check Monitoring

### Option A: UptimeRobot (Recommended - Free Tier)

**Setup**:
1. Sign up at https://uptimerobot.com/ (free tier: 50 monitors)
2. Click **Add New Monitor**

**Monitor #1 - Site Health**:
- **Monitor Type**: HTTP(s)
- **Friendly Name**: KhaledAun Site Health
- **URL**: `https://khaledaun.com/api/health`
- **Monitoring Interval**: 5 minutes
- **Alert Contacts**: Your email

**Monitor #2 - Admin Health**:
- **Monitor Type**: HTTP(s)
- **Friendly Name**: KhaledAun Admin Health
- **URL**: `https://admin.khaledaun.com/api/health`
- **Monitoring Interval**: 5 minutes
- **Alert Contacts**: Your email

**Alert Rules**:
- Send alert when: Monitor is down
- Send "up" notification: Yes
- Alert after: 2 failed checks

### Option B: Better Uptime (Alternative)

1. Sign up at https://betteruptime.com/
2. Similar setup to UptimeRobot
3. Free tier: 10 monitors

### Option C: Vercel Monitor (If available)

Check Vercel dashboard for built-in uptime monitoring

---

## 3️⃣ Sentry Error Tracking (Optional)

### Setup Sentry

**Already configured files**:
- `apps/admin/sentry.client.config.ts`
- `apps/admin/sentry.server.config.ts`
- `apps/admin/sentry.edge.config.ts`

**Steps to Complete**:

1. **Create Sentry Account**
   - Go to https://sentry.io/
   - Sign up (free tier: 5k events/month)

2. **Create Project**
   - Click **Create Project**
   - Platform: **Next.js**
   - Name: `khaledaun-admin`

3. **Get DSN**
   - Copy the DSN from project settings
   - Example: `https://abc123@o123456.ingest.sentry.io/7890123`

4. **Add to Vercel Environment Variables**
   ```bash
   # Admin app
   NEXT_PUBLIC_SENTRY_DSN=your_dsn_here
   SENTRY_ORG=your_org
   SENTRY_PROJECT=khaledaun-admin
   SENTRY_AUTH_TOKEN=your_auth_token
   ```

5. **Verify Configuration**
   ```typescript
   // Test error tracking
   throw new Error('Test Sentry integration');
   ```

6. **Enable Release Tracking**
   ```bash
   # In apps/admin/package.json
   "scripts": {
     "build": "next build && sentry-cli releases finalize $(sentry-cli releases propose-version)"
   }
   ```

### Sentry Features to Configure

**Performance Monitoring**:
```typescript
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // Sample 10% of transactions
  integrations: [
    new Sentry.BrowserTracing(),
  ],
});
```

**Session Replay** (Debug issues):
```typescript
Sentry.init({
  replaysOnErrorSampleRate: 1.0, // Replay 100% of errors
  replaysSessionSampleRate: 0.1, // Replay 10% of sessions
  integrations: [
    new Sentry.Replay(),
  ],
});
```

**User Context**:
```typescript
Sentry.setUser({
  id: user.id,
  email: user.email,
  role: user.role,
});
```

---

## 4️⃣ Database Monitoring

### Supabase Dashboard

**Built-in Metrics** (Free):
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Reports** section

**Available Metrics**:
- Database size
- Query performance
- Connection pool usage
- API requests
- Storage usage

**Set Alerts** (if available):
- Database size > 80% of quota
- Connection pool exhausted
- Slow queries > 5s

### Custom Database Monitoring

**Query Performance Logging**:
```typescript
// packages/db/index.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'warn' },
  ],
});

prisma.$on('query', (e) => {
  if (e.duration > 1000) {
    console.warn(`Slow query detected: ${e.duration}ms`, e.query);
  }
});
```

**Health Check Endpoint Enhancement**:
```typescript
// apps/admin/app/api/health/route.ts
export async function GET() {
  const startTime = Date.now();
  
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - startTime;
    
    return Response.json({
      ok: true,
      commit: process.env.VERCEL_GIT_COMMIT_SHA || 'dev',
      dbLatency: `${dbLatency}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: 'Database connection failed' },
      { status: 503 }
    );
  }
}
```

---

## 5️⃣ Custom Application Metrics

### Log Key Events

**Posts Published**:
```typescript
// apps/admin/app/api/admin/posts/[id]/publish/route.ts
export async function POST(req: Request, { params }) {
  // ... publish logic
  
  console.log({
    event: 'post_published',
    postId: params.id,
    locale: 'en',
    userId: user.id,
    timestamp: new Date().toISOString(),
  });
}
```

**Social Embeds Updated**:
```typescript
// apps/admin/app/api/admin/social/route.ts
export async function POST(req: Request) {
  // ... create embed logic
  
  console.log({
    event: 'social_embed_created',
    key: body.key,
    userId: user.id,
    timestamp: new Date().toISOString(),
  });
}
```

### Vercel Log Drains (Pro Only)

Forward logs to external services:
1. Go to Project Settings → Log Drains
2. Add drain to:
   - Datadog
   - Logflare
   - Custom HTTP endpoint

---

## 6️⃣ Performance Monitoring

### Vercel Speed Insights

**Enable** (if available):
1. Go to Project → Speed Insights
2. Enable for your project
3. View Core Web Vitals dashboard

**Add to Site**:
```typescript
// apps/site/src/app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Lighthouse CI (Optional)

**Setup**:
```bash
npm install -g @lhci/cli

# Run Lighthouse CI
lhci autorun --config=lighthouserc.json
```

**Config** (`lighthouserc.json`):
```json
{
  "ci": {
    "collect": {
      "url": ["https://khaledaun.com/en", "https://khaledaun.com/ar"],
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

---

## 7️⃣ Monitoring Dashboard

### Recommended Tools

**Free Tier Options**:
1. **Vercel Dashboard** - Built-in analytics
2. **UptimeRobot** - Uptime monitoring
3. **Supabase Dashboard** - Database metrics
4. **Sentry** - Error tracking (5k events/month)

**Paid Options** (if needed):
1. **Datadog** - Comprehensive monitoring ($15/host/month)
2. **New Relic** - APM + Infrastructure ($25/month)
3. **Grafana Cloud** - Custom dashboards ($49/month)

---

## 8️⃣ Alerting Rules

### Critical Alerts (Immediate Action)

**Setup alerts for**:
- Site down (response time > 30s or 5xx errors)
- Admin down
- Database connection failed
- Error rate > 5%

**Alert Channels**:
- Email (primary)
- SMS (critical only)
- Slack (if team collaboration)

### Warning Alerts (Review Soon)

**Setup alerts for**:
- Slow responses (> 3s for 10% of requests)
- High error rate (> 1%)
- Database slow queries
- High memory usage

---

## 9️⃣ Monitoring Checklist

### Initial Setup
- [ ] Vercel Analytics enabled
- [ ] UptimeRobot monitors created (site + admin)
- [ ] Alert emails configured
- [ ] Health check endpoints verified
- [ ] Test alerts (force downtime)

### Optional Advanced
- [ ] Sentry configured
- [ ] Performance monitoring enabled
- [ ] Database monitoring dashboard
- [ ] Custom metrics logging
- [ ] Slack notifications

### Regular Monitoring
- [ ] Check uptime dashboard weekly
- [ ] Review error logs daily
- [ ] Monitor performance metrics
- [ ] Review slow queries
- [ ] Check alert history

---

## 🔟 Testing Monitoring

### Test Health Checks

```bash
# Should return 200 OK
curl -I https://khaledaun.com/api/health
curl -I https://admin.khaledaun.com/api/health

# Should trigger alert (if monitoring enabled)
# Temporarily disable server or return 500
```

### Test Error Tracking (Sentry)

```typescript
// Throw test error
throw new Error('Test Sentry monitoring');

// Check Sentry dashboard for error
```

### Test Uptime Alerts

1. Pause monitor in UptimeRobot
2. Verify alert email received
3. Resume monitor
4. Verify "up" notification received

---

## 📊 Expected Results

### Successful Setup

**Vercel Analytics**:
- Dashboard shows page views
- Custom events tracked (if configured)
- Real-time visitors visible

**UptimeRobot**:
- Both monitors show "Up"
- 99.9%+ uptime
- Response time < 1s

**Sentry** (if enabled):
- Zero errors (or expected errors only)
- Performance metrics showing
- No unhandled exceptions

**Supabase**:
- Database metrics visible
- No slow queries
- Connection pool healthy

---

## 📝 Documentation

After setup, document:
- Monitor URLs and credentials
- Alert contact information
- Escalation procedures
- Incident response plan

**Store in**:
- Password manager (credentials)
- Team wiki (procedures)
- Runbook (incident response)

---

## 🚨 Troubleshooting

### Health Check Returns 500

**Check**:
- Database connection
- Environment variables
- Prisma client generated
- Vercel logs

### No Alerts Received

**Check**:
- Email notifications enabled
- Alert rules configured
- Monitor status (paused?)
- Email spam folder

### Sentry Not Capturing Errors

**Check**:
- DSN configured correctly
- Sentry SDK initialized
- Source maps uploaded
- Environment set correctly

---

## 🎯 Success Criteria

- [ ] Health checks monitored 24/7
- [ ] Alerts received for downtime
- [ ] Error tracking functional
- [ ] Performance metrics visible
- [ ] Dashboard accessible
- [ ] Team trained on monitoring

---

## 📚 Resources

**Monitoring Tools**:
- [Vercel Analytics](https://vercel.com/analytics)
- [UptimeRobot](https://uptimerobot.com/)
- [Sentry](https://sentry.io/)
- [Supabase Monitoring](https://supabase.com/docs/guides/platform/metrics)

**Guides**:
- [Vercel Observability](https://vercel.com/docs/concepts/observability)
- [Next.js Monitoring](https://nextjs.org/docs/advanced-features/monitoring)
- [Sentry Next.js Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

---

**Last Updated**: October 19, 2024  
**Status**: Ready to implement  
**Priority**: High (set up basic monitoring ASAP)

