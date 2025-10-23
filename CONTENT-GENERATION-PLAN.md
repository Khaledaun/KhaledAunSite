# Content Generation & Topic Planning System

## Overview
This document outlines the complete content generation workflow for both blog posts and LinkedIn posts, including topic generation, AI-assisted writing, review, and publication.

---

## 🎯 User Requirements

1. ✅ **LinkedIn Section**: 1 pinned post + 2 latest posts on homepage
2. ✅ **Blog Preview**: Latest 3 blog articles on homepage (after Experience section)
3. ✅ **AI Content Generation** (for review, not auto-posting)
4. 🔄 **Topic Generation** (for blogs and LinkedIn)

---

## 📍 Homepage Layout

```
1. Hero
2. About
3. Services
4. Experience Timeline
5. 📝 Blog Preview (Latest 3 articles) ← NEW
6. 💼 LinkedIn Section (1 pinned + 2 latest) ← NEW
7. Ventures Strip
8. Contact
```

---

## 🗄️ Database Schema

### LinkedIn Posts Table
```prisma
model LinkedInPost {
  id             String   @id @default(cuid())
  title          String
  content        String   @db.Text
  linkedinUrl    String?
  
  // Status
  published      Boolean  @default(false)
  isPinned       Boolean  @default(false)
  
  // Relations
  authorId       String
  author         User     @relation("UserLinkedInPosts")
  
  // AI Generation
  aiGenerated    Boolean  @default(false)
  aiGenerationId String?
  aiGeneration   AIGeneration? @relation("LinkedInPostGeneration")
  
  // Source (if from blog)
  sourcePostId   String?
  sourcePost     Post?    @relation("LinkedInFromBlogPost")
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  publishedAt    DateTime?
}
```

---

## 🤖 Content Generation Workflow

### Phase 1: Topic Generation (TO BE IMPLEMENTED)

**For Blog Posts:**
1. Admin goes to `/posts` → Click "Generate Topic Ideas"
2. System prompts:
   - Industry (Law, Arbitration, Conflict Prevention, Ventures)
   - Tone (Professional, Educational, Thought Leadership)
   - Target audience (Legal professionals, Business owners, etc.)
3. AI generates 5-10 topic ideas with:
   - Title
   - Angle/Hook
   - Key points to cover
   - SEO keywords
4. User selects topic → System creates draft post

**For LinkedIn Posts:**
1. Admin goes to `/linkedin` → Click "Generate Post Ideas"
2. System prompts:
   - Type (News commentary, Case study, Thought leadership, Personal story)
   - Industry focus
   - Length (Short update, Medium post, Long-form)
3. AI generates 5 post ideas with:
   - Hook/Opening line
   - Key message
   - Call to action
4. User selects idea → System generates full post

**Topic Sources:**
- Trending news in legal/arbitration space
- Recent case studies
- Upcoming events
- Blog post summaries (for LinkedIn)
- User's experience timeline milestones

---

### Phase 2: Content Generation (IMPLEMENTED)

**Current AI Features** (via `/ai` page):

1. **Blog Post Generation**
   - Input: Topic, keywords, tone
   - Output: Full article draft
   - Saves to database as DRAFT

2. **LinkedIn Post from Blog**
   - Input: Published blog post ID
   - Output: LinkedIn-optimized summary
   - Includes hook, key points, CTA, link

3. **Translation** (EN ↔ AR)
   - Translates blog posts
   - Translates LinkedIn posts

4. **Content Improvement**
   - Refines existing drafts
   - Improves clarity and engagement

5. **URL Content Extraction**
   - Extract content from articles/news
   - Use as research for posts

---

### Phase 3: Review & Edit (IMPLEMENTED)

**Blog Posts:**
- Admin reviews draft at `/posts/[id]`
- Rich text editor (TipTap)
- Add featured image from media library
- Preview before publishing
- SEO metadata (title, description, keywords)

**LinkedIn Posts:**
- Admin reviews at `/linkedin/[id]`
- Edit title, content, LinkedIn URL
- Mark as pinned (for homepage)
- Preview before publishing

---

### Phase 4: Publication (IMPLEMENTED)

**Blog Posts:**
- Click "Publish" → Sets `status: PUBLISHED`, `publishedAt: now()`
- Appears on:
  - `/en/blog` (blog index)
  - Homepage "Blog Preview" section (if latest 3)
- Triggers revalidation (Next.js ISR)

**LinkedIn Posts:**
- Click "Publish" → Sets `published: true`, `publishedAt: now()`
- Admin **manually copies** content to LinkedIn
- Pastes LinkedIn URL back into system
- Appears on homepage LinkedIn section (if pinned or latest 2)

---

## 🎨 UI Components

### Homepage

**Blog Preview Section:**
```
┌───────────────────────────────────────┐
│    Latest Insights                    │
│    Explore my latest articles...      │
├───────────────────────────────────────┤
│  ┌─────┐  ┌─────┐  ┌─────┐          │
│  │ Post│  │ Post│  │ Post│          │
│  │  1  │  │  2  │  │  3  │          │
│  └─────┘  └─────┘  └─────┘          │
│                                       │
│  [View All Articles →]                │
└───────────────────────────────────────┘
```

**LinkedIn Section:**
```
┌───────────────────────────────────────┐
│    Latest from LinkedIn               │
│    Connect with me professionally      │
├───────────────────────────────────────┤
│  ┌─────────┐  ┌─────┐  ┌─────┐       │
│  │ PINNED  │  │Post │  │Post │       │
│  │  Post   │  │  2  │  │  3  │       │
│  │  ⭐     │  │     │  │     │       │
│  └─────────┘  └─────┘  └─────┘       │
│                                       │
│  [Follow on LinkedIn →]  [Contact]    │
└───────────────────────────────────────┘
```

### Admin Dashboard

**New Page: `/linkedin`** (TO BE CREATED)
- List all LinkedIn posts
- Columns: Title, Status, Pinned, Created, Actions
- Filters: Published/Draft, Pinned
- Actions: Edit, Pin/Unpin, Publish, Delete
- "Generate from Blog" button
- "New Post" button

---

## 🚀 Implementation Plan

### ✅ Completed
1. LinkedIn posts database schema
2. Homepage Blog Preview section
3. Homepage LinkedIn section
4. Blog API (`/api/posts/latest`)
5. LinkedIn API (`/api/social-embed/LINKEDIN_POSTS`)
6. AI content generation system (`/ai`)
7. AI configuration (`/ai/config`)
8. AI templates (`/ai/templates`)

### 🔄 Next Steps (TO BE IMPLEMENTED)

#### Step 1: LinkedIn Management UI
- [ ] Create `/linkedin` page
- [ ] List all posts with filters
- [ ] Create/Edit post form
- [ ] Pin/unpin functionality
- [ ] Publish/unpublish
- [ ] Generate from blog post dropdown

#### Step 2: Topic Generation System
- [ ] Add "Generate Ideas" button to `/posts`
- [ ] Topic generation prompt templates
- [ ] Industry/tone selector
- [ ] Display 5-10 ideas in modal
- [ ] One-click create draft from idea

#### Step 3: LinkedIn-Specific AI Features
- [ ] "Generate LinkedIn Post from Blog" workflow
- [ ] LinkedIn-specific templates (hooks, CTAs)
- [ ] Character count warning (LinkedIn optimal: 1300 chars)
- [ ] Hashtag suggestions

#### Step 4: Content Calendar (Future)
- [ ] Calendar view of scheduled content
- [ ] Draft → Review → Scheduled → Published pipeline
- [ ] Reminders for posting

---

## 🎯 User Workflow Examples

### Example 1: Weekly Blog Post
```
1. Monday: Click "Generate Topic Ideas" → Select "AI in Arbitration"
2. Tuesday: AI generates 3000-word draft
3. Wednesday: Review, edit, add images
4. Thursday: Preview, check SEO
5. Friday: Publish → Auto-appears on homepage

Optional:
6. Friday: Click "Generate LinkedIn Post" from published blog
7. Review, edit, publish LinkedIn version
8. Copy to LinkedIn, paste URL back
9. LinkedIn post appears on homepage
```

### Example 2: Pinned LinkedIn Post
```
1. Admin publishes important LinkedIn post
2. Sets `isPinned: true`
3. Post appears FIRST in LinkedIn section (with gold ring + "PINNED" badge)
4. Stays pinned until admin unpins or pins another
```

---

## 🔧 Technical Details

### API Endpoints

**Existing:**
- `GET /api/posts/latest?locale=en&limit=3` - Latest blog posts
- `GET /api/social-embed/LINKEDIN_POSTS` - 1 pinned + 2 latest LinkedIn posts
- `POST /api/admin/ai/generate` - Generate blog content
- `POST /api/admin/ai/translate` - Translate content

**To Be Created:**
- `GET /api/admin/linkedin` - List all LinkedIn posts
- `POST /api/admin/linkedin` - Create LinkedIn post
- `PUT /api/admin/linkedin/[id]` - Update LinkedIn post
- `POST /api/admin/linkedin/[id]/pin` - Pin/unpin post
- `POST /api/admin/linkedin/generate-from-blog` - Generate LinkedIn post from blog
- `POST /api/admin/topics/generate` - Generate topic ideas

### Database Migration

Run after deployment:
```bash
cd packages/db
npx prisma db push
```

Or via Vercel CLI:
```bash
vercel env pull
cd packages/db
npx prisma db push
```

---

## 📊 Analytics & Insights (Future)

Track in `/analytics`:
- Most viewed blog posts
- LinkedIn posts with highest engagement
- AI-generated vs manual content performance
- Topic trends
- Publishing frequency

---

## 🎨 Design Notes

**LinkedIn Section:**
- Dark background (brand-ink) to stand out
- Pinned post has gold ring and "PINNED" badge
- Smooth hover effects
- "Follow on LinkedIn" CTA button

**Blog Preview:**
- Light background (brand-sand) for contrast
- Card-based layout
- Featured images
- Author and date metadata
- "View All Articles" CTA

---

## 🔐 Permissions

All content generation features require:
- Role: AUTHOR, EDITOR, ADMIN, or OWNER
- Managed via existing RBAC system

---

## 📝 Translation Keys (TO BE ADDED)

`apps/site/src/messages/en.json`:
```json
{
  "blog": {
    "latestInsights": "Latest Insights",
    "latestInsightsDesc": "Explore my latest articles on law, business, and conflict prevention",
    "readMore": "Read More",
    "viewAllArticles": "View All Articles"
  },
  "LinkedIn": {
    "title": "Latest from LinkedIn",
    "subtitle": "Connect with me for professional insights and updates",
    "followLinkedIn": "Follow on LinkedIn",
    "connectDirectly": "Get in Touch",
    "readMore": "Read on LinkedIn"
  }
}
```

---

## ✅ Summary

**What's Live:**
- ✅ Homepage shows latest 3 blog posts
- ✅ Homepage shows 1 pinned + 2 latest LinkedIn posts
- ✅ AI content generation for blogs
- ✅ AI translation system
- ✅ Admin can configure AI providers and models
- ✅ Admin can save prompt templates

**What's Next:**
- 🔄 LinkedIn posts admin UI (`/linkedin`)
- 🔄 Topic generation system
- 🔄 Generate LinkedIn posts from blog articles
- 🔄 Content calendar view

**No Auto-Posting:**
- User ALWAYS reviews before publishing
- User manually copies LinkedIn content to LinkedIn.com
- System stores the URL for reference
- Perfect for maintaining brand voice and control

