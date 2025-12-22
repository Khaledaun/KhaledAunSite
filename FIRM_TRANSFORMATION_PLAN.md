# NAS & Co. Law Firm Website Transformation Plan

## Executive Summary

Transform the existing KhaledAun personal website into a comprehensive **multi-entity law firm platform** for NAS & Co. (Nashef, Aun, Shaban & Co.), leveraging the existing powerful infrastructure including:

- Next.js 14 monorepo architecture
- Supabase PostgreSQL with Prisma ORM
- AI-powered content generation (OpenAI, Claude)
- Bilingual support (EN/AR) with RTL
- LinkedIn integration
- Full CMS capabilities

---

## Part 1: Architecture Overview

### Current State
```
KhaledAun Site
├── apps/site (Public website - port 3001)
├── apps/admin (Admin dashboard - port 3000)
├── packages/db (Database schema)
├── packages/auth (RBAC system)
├── packages/utils (AI, SEO, validation)
└── Vercel deployment
```

### Proposed State
```
NAS & Co. Platform
├── apps/site (Firm website + Partner microsites)
│   ├── / (Firm homepage)
│   ├── /about
│   ├── /practice-areas
│   ├── /team
│   ├── /team/abdelrahim-nashef
│   ├── /team/khaled-aun
│   ├── /team/hisham-shaban
│   ├── /news
│   ├── /community
│   └── /contact
├── apps/admin (Unified admin dashboard)
│   ├── Marketing Management Engine
│   ├── Multi-account LinkedIn Manager
│   ├── Content Calendar
│   └── Analytics Dashboard
├── packages/db (Extended for multi-entity)
├── packages/auth (Extended roles)
└── packages/utils (Existing + new features)
```

---

## Part 2: Core Features Breakdown

### 2.1 Firm Homepage
**Content to Migrate:**
- Firm description: "NASHEF, AUN, SHABAN & CO. (NAS) is a boutique law firm..."
- Rotating taglines: "A consultation that delivers." / "Building relationships. Focusing on results."
- Practice Areas (12 areas from screenshots)
- Hero images with office/building backgrounds

**New Features:**
- Animated hero section with rotating taglines
- Practice areas grid with hover effects
- Team preview cards
- Latest news/articles section
- Client testimonials (if available)
- Contact CTA

### 2.2 Practice Areas Pages
**12 Practice Areas Identified:**
1. Commercial & Corporate Law
2. Startups, Hi-Tech & Venture Capital
3. Tax Law
4. Construction & Zoning Law
5. Employment & Labor Law
6. Private & Commercial Real Estate
7. Commercial Litigation
8. Infrastructures & Municipal Corporations
9. Intellectual Property
10. Dissolution of Real Estate Partnerships
11. Municipal Property Tax
12. Non-Profit Organizations

**Each Practice Area Page:**
- Detailed description
- Related case studies (using existing CaseStudy model)
- Team members who specialize in this area
- Related articles
- Contact CTA

### 2.3 Team/Partner Pages

**Main Team Page:**
- Grid of all partners with photos
- Click to expand bio or navigate to individual page
- Filter by practice area specialty

**Individual Partner Pages:**
Structure for each partner (Abdelrahim Nashef, Khaled Aun, Hisham Shaban):
```
/team/[partner-slug]/
├── Hero with professional photo
├── Bio & background
├── Education & credentials
├── Practice areas specialization
├── Published articles (filtered by author)
├── Case studies (filtered by attorney)
├── LinkedIn feed (individual account)
├── Contact form (routes to specific partner)
└── Related team members
```

### 2.4 Marketing Management Engine

**Central Dashboard Features:**
1. **Content Calendar**
   - Visual calendar view
   - Drag-and-drop scheduling
   - Multi-account posting schedule
   - Content status tracking (Draft, Scheduled, Published)

2. **Multi-LinkedIn Account Manager**
   - Connect 4 LinkedIn accounts:
     - NAS & Co. (Firm page)
     - Abdelrahim Nashef
     - Khaled Aun
     - Hisham Shaban
   - OAuth management per account
   - Cross-posting capabilities
   - Individual account analytics

3. **AI Content Generation**
   - Blog post drafts (existing)
   - LinkedIn post generation
   - Practice area content
   - Case study narratives
   - SEO optimization

4. **Analytics Dashboard**
   - Website traffic per page
   - LinkedIn engagement per account
   - Lead tracking
   - Content performance

### 2.5 Database Schema Extensions

**New/Modified Models:**

```prisma
// Entity model for firm + partners
model Entity {
  id          String   @id @default(cuid())
  type        EntityType // FIRM, PARTNER
  name        String
  slug        String   @unique
  bio         String?  @db.Text
  bioAr       String?  @db.Text
  title       String?
  titleAr     String?
  email       String?
  phone       String?
  photo       String?
  linkedinUrl String?
  linkedinAccountId String?
  order       Int      @default(0)
  isActive    Boolean  @default(true)

  // Relations
  linkedinAccount LinkedInAccount?
  posts           Post[]
  caseStudies     CaseStudy[]
  practiceAreas   EntityPracticeArea[]
  experiences     Experience[]
  education       Education[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum EntityType {
  FIRM
  PARTNER
}

// Practice areas
model PracticeArea {
  id          String   @id @default(cuid())
  name        String
  nameAr      String?
  slug        String   @unique
  description String?  @db.Text
  descriptionAr String? @db.Text
  icon        String?
  order       Int      @default(0)
  isActive    Boolean  @default(true)

  // Relations
  entities    EntityPracticeArea[]
  caseStudies CaseStudy[]
  posts       Post[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// Many-to-many for Entity-PracticeArea
model EntityPracticeArea {
  id            String      @id @default(cuid())
  entityId      String
  practiceAreaId String
  isPrimary     Boolean     @default(false)

  entity        Entity      @relation(fields: [entityId])
  practiceArea  PracticeArea @relation(fields: [practiceAreaId])

  @@unique([entityId, practiceAreaId])
}

// LinkedIn accounts (multi-account support)
model LinkedInAccount {
  id              String   @id @default(cuid())
  entityId        String   @unique
  accessToken     String   @db.Text // Encrypted
  refreshToken    String?  @db.Text // Encrypted
  tokenExpiresAt  DateTime
  linkedinUserId  String
  profileUrl      String?
  pageId          String?  // For company pages
  isActive        Boolean  @default(true)

  entity          Entity   @relation(fields: [entityId])
  posts           LinkedInPost[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Enhanced LinkedIn posts
model LinkedInPost {
  id              String   @id @default(cuid())
  accountId       String
  content         String   @db.Text
  mediaUrls       String[] // Multiple images/documents
  scheduledAt     DateTime?
  publishedAt     DateTime?
  linkedinPostId  String?
  status          PostStatus // DRAFT, SCHEDULED, PUBLISHED, FAILED
  engagement      Json?    // likes, comments, shares

  account         LinkedInAccount @relation(fields: [accountId])

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Education for partners
model Education {
  id          String   @id @default(cuid())
  entityId    String
  institution String
  degree      String
  field       String?
  year        Int?
  order       Int      @default(0)

  entity      Entity   @relation(fields: [entityId])
}

// Content calendar
model ContentCalendarEvent {
  id          String   @id @default(cuid())
  title       String
  description String?
  date        DateTime
  entityIds   String[] // Which accounts to post to
  contentType ContentType // BLOG, LINKEDIN, BOTH
  status      CalendarStatus
  postId      String?  // Related blog post
  linkedInPostId String? // Related LinkedIn post

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum ContentType {
  BLOG
  LINKEDIN
  BOTH
}

enum CalendarStatus {
  PLANNED
  DRAFTED
  SCHEDULED
  PUBLISHED
}
```

---

## Part 3: Content Migration Strategy

### 3.1 WordPress Content Extraction

**Option A: Manual Export (Recommended for small site)**
- Export WordPress posts as XML
- Export media library
- Extract page content manually

**Option B: WordPress REST API**
- If enabled, programmatically fetch content
- Requires WordPress API credentials

**Option C: Web Scraping**
- Use Puppeteer/Playwright to extract content
- Requires handling of dynamic content

### 3.2 Content Mapping

| WordPress Content | New Location | Notes |
|------------------|--------------|-------|
| About page | /about | Static page |
| Team bios | Entity model | Each partner |
| Practice areas | PracticeArea model | 12 areas |
| News/Articles | Post model | Already exists |
| Contact info | Configuration | Environment vars |
| Images | MediaAsset model | Migrate to Supabase |
| Hero images | HeroMedia model | Already exists |

### 3.3 Media Migration

1. Download all images from WordPress
2. Optimize and compress
3. Upload to Supabase Storage
4. Update references in database

---

## Part 4: URL Structure & Routing

### 4.1 Public Routes (Bilingual)

```
/[locale]/                              # Firm homepage
/[locale]/about                         # About the firm
/[locale]/practice-areas               # All practice areas
/[locale]/practice-areas/[slug]        # Individual practice area
/[locale]/team                         # Team overview
/[locale]/team/[partner-slug]          # Individual partner page
/[locale]/news                         # News & articles (blog)
/[locale]/news/[slug]                  # Individual article
/[locale]/community                    # Community/pro-bono work
/[locale]/contact                      # Contact page
/[locale]/case-studies                 # Case studies
/[locale]/case-studies/[slug]          # Individual case study
```

### 4.2 Admin Routes

```
/admin/                                 # Dashboard overview
/admin/entities                         # Manage firm & partners
/admin/entities/[id]                    # Edit entity
/admin/practice-areas                   # Manage practice areas
/admin/linkedin                         # Multi-account LinkedIn manager
/admin/linkedin/accounts                # Manage connected accounts
/admin/linkedin/posts                   # All LinkedIn posts
/admin/linkedin/calendar                # Content calendar
/admin/marketing                        # Marketing dashboard
/admin/marketing/analytics              # Analytics overview
/admin/content                          # Content management
/admin/posts                            # Blog posts (existing)
/admin/case-studies                     # Case studies (existing)
/admin/media                            # Media library (existing)
/admin/leads                            # Lead management (existing)
```

---

## Part 5: Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Extend database schema for multi-entity support
- [ ] Create Entity, PracticeArea models
- [ ] Migrate existing content to new structure
- [ ] Set up new URL routing

### Phase 2: Firm Website (Week 2-3)
- [ ] Build firm homepage with NAS branding
- [ ] Create practice areas pages
- [ ] Build team page with partner grid
- [ ] Implement individual partner pages
- [ ] Migrate WordPress content

### Phase 3: Multi-LinkedIn Integration (Week 3-4)
- [ ] Extend LinkedIn OAuth for multiple accounts
- [ ] Build account management UI
- [ ] Implement cross-posting functionality
- [ ] Create content calendar view

### Phase 4: Marketing Engine (Week 4-5)
- [ ] Build marketing dashboard
- [ ] Implement content calendar
- [ ] Add analytics integration
- [ ] AI-powered content suggestions

### Phase 5: Polish & Launch (Week 5-6)
- [ ] SEO optimization
- [ ] Performance tuning
- [ ] Testing (E2E, accessibility)
- [ ] Content review and QA
- [ ] DNS/domain setup
- [ ] Launch

---

## Part 6: Technical Requirements

### 6.1 Environment Variables (New)

```env
# Firm Configuration
FIRM_NAME="NAS & Co."
FIRM_LEGAL_NAME="Nashef, Aun, Shaban & Co."
FIRM_DOMAIN="nas-law.com"  # or new domain

# LinkedIn Multi-Account
LINKEDIN_FIRM_CLIENT_ID=
LINKEDIN_FIRM_CLIENT_SECRET=
LINKEDIN_FIRM_PAGE_ID=

# Partner LinkedIn (can use same app or separate)
LINKEDIN_APP_CLIENT_ID=
LINKEDIN_APP_CLIENT_SECRET=

# WordPress (for migration)
WP_SITE_URL="https://nas-law.com"
WP_API_BASE="/wp-json/wp/v2"
WP_USERNAME=
WP_APP_PASSWORD=

# New domain
NEW_SITE_URL=
```

### 6.2 Third-Party Services

| Service | Purpose | Status |
|---------|---------|--------|
| Supabase | Database, Auth, Storage | Existing |
| Vercel | Hosting | Existing |
| LinkedIn API | Social posting | Needs 4 account access |
| OpenAI/Anthropic | AI content | Existing |
| Sentry | Error tracking | Existing |
| WordPress API | Content migration | New |

---

## Part 7: Questions Requiring Your Input

### Critical Questions

#### 1. Domain & Branding
- [ ] **Q1.1:** What domain will the new site use? (e.g., nas-law.com, naslawfirm.com, new domain?)
- [ ] **Q1.2:** Do you want to keep the existing NAS branding (colors, logo) or create new?
- [ ] **Q1.3:** Will this replace the current WordPress site or run alongside it?

#### 2. WordPress Access
- [ ] **Q2.1:** Do you have WordPress admin credentials for content export?
- [ ] **Q2.2:** Is the WordPress REST API enabled on nas-law.com?
- [ ] **Q2.3:** Can you provide FTP/SFTP access for media file download?

#### 3. LinkedIn Accounts
- [ ] **Q3.1:** Do all 4 LinkedIn accounts (firm + 3 partners) exist?
- [ ] **Q3.2:** Who has admin access to the NAS firm LinkedIn page?
- [ ] **Q3.3:** Will each partner authorize their LinkedIn for automated posting?
- [ ] **Q3.4:** Do you want shared posting (one post to multiple accounts) or separate content?

#### 4. Content & Partners
- [ ] **Q4.1:** Should each partner have their own subdomain (e.g., khaled.nas-law.com) or subdirectory (/team/khaled-aun)?
- [ ] **Q4.2:** Will partners have different access levels in the admin? (e.g., can Partner A see Partner B's drafts?)
- [ ] **Q4.3:** Are there other team members (associates, staff) to include?
- [ ] **Q4.4:** Do you have professional photos for all team members?

#### 5. Features & Functionality
- [ ] **Q5.1:** Do you need a Hebrew version in addition to English/Arabic?
- [ ] **Q5.2:** Should the contact form route to different partners based on practice area?
- [ ] **Q5.3:** Do you want client testimonials on the site?
- [ ] **Q5.4:** Is there existing case study content to migrate?
- [ ] **Q5.5:** Do you want a news/blog section or just static pages?

#### 6. Marketing Engine
- [ ] **Q6.1:** What analytics do you want to track? (page views, lead sources, LinkedIn engagement?)
- [ ] **Q6.2:** Do you need email integration (newsletter, lead notifications)?
- [ ] **Q6.3:** Should AI generate content automatically or just assist with drafts?
- [ ] **Q6.4:** Do you want content approval workflow (draft → review → publish)?

#### 7. Technical & Deployment
- [ ] **Q7.1:** Should this be a separate Vercel project or new deployment of existing?
- [ ] **Q7.2:** Do you need staging/preview environments?
- [ ] **Q7.3:** Any specific hosting region requirements (for data residency)?
- [ ] **Q7.4:** Do you have Supabase project credentials ready?

### Information Needed

#### Credentials Required:
1. **WordPress Admin** - Username, password, and site URL
2. **LinkedIn Developer App** - Client ID, Client Secret (existing or new app)
3. **LinkedIn Account Access** - Authorization from all 4 account holders
4. **Supabase Project** - URL, anon key, service role key
5. **Vercel Account** - For deployment
6. **Domain Registrar** - For DNS configuration (if new domain)

#### Content to Provide:
1. High-resolution partner photos
2. Full partner bios (in English, Arabic, and Hebrew if needed)
3. Detailed practice area descriptions
4. Case studies (if any)
5. News articles (or export from WordPress)
6. Firm logo (SVG preferred)
7. Contact information (addresses, phones, emails)

---

## Part 8: Risk Assessment

### Technical Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| LinkedIn API rate limits | Medium | Implement queuing, respect limits |
| WordPress migration complexity | Medium | Manual fallback if API fails |
| Multi-account token management | High | Secure encryption, refresh handling |
| Data consistency across entities | Medium | Proper foreign keys, validation |

### Business Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Downtime during transition | High | Blue-green deployment |
| SEO impact from URL changes | Medium | 301 redirects, sitemap update |
| Content sync with WordPress | Low | One-time migration, then primary source |

---

## Part 9: Success Criteria

### Launch Checklist
- [ ] All partner pages live with correct content
- [ ] Practice areas pages complete
- [ ] LinkedIn integration working for all 4 accounts
- [ ] Content calendar functional
- [ ] AI content generation operational
- [ ] Mobile responsive design verified
- [ ] Arabic RTL layout working
- [ ] SEO metadata in place
- [ ] Analytics tracking active
- [ ] Contact forms routing correctly
- [ ] All images optimized and loading
- [ ] 301 redirects from old URLs (if applicable)

### Post-Launch Metrics
- Page load time < 2 seconds
- Lighthouse score > 90
- All forms submitting correctly
- LinkedIn posts publishing successfully
- Zero critical errors in Sentry

---

## Appendix A: Current Content from Screenshots

### Firm Description
> "NASHEF, AUN, SHABAN & CO. (NAS) is a boutique law firm and a legal partner for companies, corporations, investors and entrepreneurs, offering a highly specialized counseling with an in-depth understanding of the legal and regulatory environment and the changing reality of the business world. At NAS, we believe in a long-term strategic view and in the power of visionaries to realize their goals."

### Taglines (for rotating hero)
1. "A consultation that delivers."
2. "Building relationships. Focusing on results."

### Partners Identified
1. **Abdelrahim Nashef** - Managing Partner
2. **Khaled Aun** - Partner
3. **Hisham Shaban** - Partner

### Practice Areas (12)
1. Commercial & Corporate Law
2. Startups, Hi-Tech & Venture Capital
3. Tax Law
4. Construction & Zoning Law
5. Employment & Labor Law
6. Private & Commercial Real Estate
7. Commercial Litigation
8. Infrastructures & Municipal Corporations
9. Intellectual Property
10. Dissolution of Real Estate Partnerships
11. Municipal Property Tax
12. Non-Profit Organizations

### Navigation Structure
- About Us
- Practice Areas
- Our Team
- News & Articles
- Community
- Contact Us

### Footer Elements
- Social links (Facebook, LinkedIn)
- Language toggle (English)
- Contact information (to be extracted)

---

## Appendix B: Existing Codebase Assets to Leverage

### Ready-to-Use Features
- Bilingual support (EN/AR) with RTL
- Blog/Post system with translations
- CaseStudy model with Problem→Strategy→Outcome
- HeroTitle and HeroMedia management
- MediaAsset library with Supabase Storage
- AI content generation (OpenAI, Claude)
- LinkedIn OAuth integration (needs extension for multi-account)
- Lead management with CRM features
- RBAC authentication system
- SEO utilities (sitemap, meta tags, JSON-LD)
- Contact form with validation
- Audit logging

### Packages Available
- `@khaledaun/db` - Prisma client (extend for new models)
- `@khaledaun/auth` - RBAC utilities (extend roles)
- `@khaledaun/utils` - AI, SEO, encryption
- `@khaledaun/schemas` - Zod validation
- `@khaledaun/env` - Environment configuration

---

## Next Steps

1. **Review this plan** and provide feedback
2. **Answer the questions** in Part 7
3. **Gather credentials** listed above
4. **Approve scope** and any modifications
5. **Begin Phase 1** implementation

---

*Plan Version: 1.0*
*Created: December 2024*
*Author: Claude Code*
