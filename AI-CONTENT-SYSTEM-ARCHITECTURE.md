# AI Content System - Complete Architecture

**Date:** October 23, 2025  
**Status:** 🚧 **IN DEVELOPMENT**

---

## 🎯 **System Overview**

A comprehensive AI-powered content research, generation, and publishing system for Blog and LinkedIn.

### **Key Features:**
1. ✅ Daily topic research (4-5 new topics daily)
2. ✅ Topic queue management (20-30 topics, lock/unlock)
3. ✅ Multi-platform content generation (Blog & LinkedIn)
4. ✅ Article-to-LinkedIn summary converter
5. ✅ Content library with SEO metadata
6. ✅ Media asset management
7. ✅ Cross-platform publishing
8. ✅ Automatic daily refresh at 08:00 Jerusalem time

---

## 🏗️ **System Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin Dashboard UI                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Topic Queue  │  │   Content    │  │    Media     │      │
│  │  Manager     │  │   Studio     │  │   Library    │      │
│  │              │  │              │  │              │      │
│  │ • 20-30      │  │ • Generate   │  │ • Upload     │      │
│  │   topics     │  │ • Preview    │  │ • Organize   │      │
│  │ • Lock/      │  │ • Edit       │  │ • Tag        │      │
│  │   Unlock     │  │ • Publish    │  │ • Search     │      │
│  │ • Approve    │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Content    │  │  Topic       │  │  Publishing  │      │
│  │   Library    │  │  Preferences │  │   Control    │      │
│  │              │  │              │  │              │      │
│  │ • List view  │  │ • Prompts    │  │ • Schedule   │      │
│  │ • Filters    │  │ • Keywords   │  │ • Cross-post │      │
│  │ • SEO data   │  │ • Sources    │  │ • Track      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Topic        │  │   Content    │  │   Media      │      │
│  │ Research     │  │  Generation  │  │  Processing  │      │
│  │  Engine      │  │   Engine     │  │   Service    │      │
│  │              │  │              │  │              │      │
│  │ • Web crawl  │  │ • AI prompt  │  │ • Upload     │      │
│  │ • RSS parse  │  │ • Templates  │  │ • Optimize   │      │
│  │ • AI search  │  │ • Multi-     │  │ • Thumbnail  │      │
│  │ • Rank       │  │   format     │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Publishing  │  │  Scheduled   │  │  LinkedIn    │      │
│  │   Service    │  │    Jobs      │  │  Integration │      │
│  │              │  │              │  │              │      │
│  │ • Blog post  │  │ • Daily      │  │ • OAuth      │      │
│  │ • LinkedIn   │  │   08:00 JT   │  │ • Post API   │      │
│  │ • Rollback   │  │ • Cleanup    │  │ • Scrape     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
├─────────────────────────────────────────────────────────────┤
│  • topics                  • content_library                 │
│  • topic_sources           • media_library                   │
│  • topic_preferences       • topic_generation_jobs           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 **Data Models**

### **1. Topics** (Daily Research Queue)
```typescript
{
  id: string;
  title: string;
  description: string;
  sourceUrl: string;
  sourceType: 'ai_search' | 'web_crawl' | 'manual' | 'rss';
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  locked: boolean;
  lockedAt: Date | null;
  priority: number;
  keywords: string[];
  relevanceScore: number;
  userNotes: string;
  scheduledFor: Date | null;
}
```

### **2. Content Library** (Unified Storage)
```typescript
{
  id: string;
  topicId: string;
  type: 'blog' | 'linkedin_post' | 'linkedin_article' | 'linkedin_carousel';
  format: 'how-to' | 'case-study' | 'opinion' | 'news' | 'tutorial';
  title: string;
  content: string;
  summary: string; // LinkedIn description or meta
  keywords: string[];
  seoScore: number;
  status: 'draft' | 'review' | 'scheduled' | 'published' | 'archived';
  publishedTo: ('blog' | 'linkedin')[];
  linkedinPostId: string | null;
  blogPostId: string | null;
  mediaIds: string[];
  tags: string[];
}
```

### **3. Media Library** (Asset Management)
```typescript
{
  id: string;
  filename: string;
  url: string;
  thumbnailUrl: string;
  type: 'image' | 'video' | 'document' | 'audio';
  sizeBytes: number;
  mimeType: string;
  altText: string;
  tags: string[];
  folder: string;
  usedInContent: string[]; // content IDs
}
```

---

## 🔄 **Content Generation Workflow**

### **Daily Topic Research (08:00 Jerusalem Time)**
```
1. Scheduled Job Triggers
   ↓
2. Crawl Topic Sources
   • RSS feeds
   • Monitored websites
   • AI search queries
   ↓
3. AI Analyzes & Ranks Topics
   • Relevance to user preferences
   • Trending potential
   • SEO opportunity
   ↓
4. Generate 4-5 New Topics
   ↓
5. Add to Topic Queue
   • Maintain 20-30 total
   • Remove oldest unlocked topics
   ↓
6. Notify User (optional)
```

### **Content Creation Workflow**
```
1. User Selects Topic from Queue
   ↓
2. Choose Content Type
   • Blog Post
   • LinkedIn Post
   • LinkedIn Article
   • LinkedIn Carousel
   ↓
3. Choose Format
   • How-To Guide
   • Case Study
   • Opinion Piece
   • News Analysis
   • Tutorial
   ↓
4. AI Generates Draft
   • Uses topic context
   • Applies user notes
   • Incorporates keywords
   • Suggests media
   ↓
5. User Reviews & Edits
   • Preview
   • Add media from library
   • Adjust SEO
   • Add personal touches
   ↓
6. Publish or Schedule
   • Single platform
   • Cross-post
   • Schedule for later
   ↓
7. Track in Content Library
```

---

## 🎨 **Content Types & Formats**

### **Blog Post Types:**
1. **Long-Form Article** (1,500-3,000 words)
   - Deep dive analysis
   - Comprehensive guides
   - Legal insights

2. **How-To Guide** (800-1,500 words)
   - Step-by-step instructions
   - Practical advice
   - Actionable tips

3. **Case Study** (1,000-2,000 words)
   - Real-world examples
   - Problem-solution format
   - Results-focused

4. **Opinion Piece** (600-1,200 words)
   - Thought leadership
   - Industry commentary
   - Expert perspective

### **LinkedIn Post Types:**
1. **Text Post** (up to 3,000 characters)
   - Quick insights
   - Commentary
   - Question to engage

2. **Article** (125,000 character limit)
   - Long-form content
   - Similar to blog
   - Native LinkedIn format

3. **Carousel** (up to 15 slides)
   - Visual storytelling
   - List-based content
   - Step-by-step guides

4. **Video Post** (native or external link)
   - Short videos
   - Expert tips
   - Case study summaries

---

## 🤖 **AI Content Generation**

### **AI Prompts by Content Type:**

#### **Blog Post Generation:**
```
You are an expert legal strategist and business advisor with 15+ years of experience in international law and business growth.

Write a professional blog post about: {topic}

Guidelines:
- Audience: Business executives, legal professionals, entrepreneurs
- Tone: Professional, authoritative, yet approachable
- Length: {wordCount} words
- Include: Real-world examples, actionable advice, legal insights
- SEO: Incorporate keywords naturally: {keywords}
- Structure: Introduction, 3-5 main points, conclusion with CTA

Additional context:
{userNotes}

Source material (if any):
{sourceContent}
```

#### **LinkedIn Post Generation:**
```
You are Khaled N. Aun, a legal counsel specializing in international law and business strategy.

Create a LinkedIn post about: {topic}

Guidelines:
- Character limit: {maxChars}
- Tone: Professional yet conversational
- Hook: Start with an engaging question or statement
- Value: Provide actionable insight or unique perspective
- Engagement: End with a question or CTA
- Hashtags: 3-5 relevant hashtags

Format: {format} // e.g., "list", "story", "insight", "question"

Additional notes:
{userNotes}
```

#### **Article-to-LinkedIn Summary:**
```
Convert the following blog post into an engaging LinkedIn summary:

Original article:
{blogContent}

Create:
1. Attention-grabbing hook (1-2 sentences)
2. Key takeaways (3-5 bullet points)
3. Call-to-action with link to full article
4. Relevant hashtags

Target length: 200-300 words
Maintain professional tone while being more conversational than the original.
```

---

## 🔗 **LinkedIn Integration**

### **LinkedIn API Capabilities:**

**What We CAN Do:**
1. ✅ **Post Content** (with API access)
   - Text posts
   - Articles
   - Images
   - Videos

2. ✅ **Retrieve Posts** (with API access)
   - Your own posts
   - Post analytics
   - Engagement metrics

3. ✅ **Profile Information**
   - Basic profile data
   - Connection count
   - Follower count

**What We CANNOT Do:**
- ❌ Directly scrape data without API (against TOS)
- ❌ Auto-post without user approval (requires OAuth)
- ❌ Access private messages
- ❌ Access other users' detailed analytics

### **Implementation Strategy:**

**Phase 1: Manual Cross-Posting**
- Generate LinkedIn-optimized content in admin
- Copy/paste to LinkedIn manually
- Track publication manually

**Phase 2: LinkedIn OAuth Integration**
- User authorizes app via LinkedIn OAuth
- Store access token securely
- Enable one-click posting

**Phase 3: Analytics Integration**
- Fetch post performance
- Display metrics in admin
- Suggest improvements

---

## 📅 **Daily Schedule System**

### **08:00 Jerusalem Time Topic Generation**

**Implementation:**
```typescript
// Using node-cron or Vercel Cron Jobs
import cron from 'node-cron';

// Schedule for 08:00 Jerusalem time (UTC+2/+3 depending on DST)
cron.schedule('0 8 * * *', async () => {
  await generateDailyTopics();
}, {
  timezone: "Asia/Jerusalem"
});

async function generateDailyTopics() {
  // 1. Get active topic preferences
  const preferences = await getActivePreferences();
  
  // 2. Crawl configured sources
  const sources = await getActiveSources();
  const scrapedContent = await crawlSources(sources);
  
  // 3. Use AI to analyze and rank topics
  const rankedTopics = await aiRankTopics(scrapedContent, preferences);
  
  // 4. Select top 4-5 topics
  const selectedTopics = rankedTopics.slice(0, 5);
  
  // 5. Add to queue
  await addTopicsToQueue(selectedTopics);
  
  // 6. Clean up old unlocked topics (keep only 20-30 total)
  await cleanupTopicQueue({ maxTopics: 30, preserveLocked: true });
  
  // 7. Log job
  await logTopicGenerationJob({
    topicsGenerated: selectedTopics.length,
    sourcesCrawled: sources.length
  });
}
```

---

## 🎨 **User Interface Components**

### **1. Topic Queue Manager** (`/admin/topics`)
```
┌─────────────────────────────────────────────────────────┐
│ Topic Queue (24 topics)          [+] Add Manual Topic   │
├─────────────────────────────────────────────────────────┤
│ Filters: [All] [Pending] [Approved] [Locked]           │
│ Sort: [Newest] [Priority] [Relevance]                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ 🔒 The Future of AI in Legal Practice                  │
│    Source: Legal Tech Today (AI Search)                │
│    Added: 2h ago  •  Score: 9.2  •  Keywords: AI, Law │
│    [Unlock] [Approve] [Delete] [Generate Content]      │
│                                                          │
│ ⭐ Cross-Border M&A Compliance Trends                  │
│    Source: Financial Times (RSS)                       │
│    Added: 3h ago  •  Score: 8.8  •  Keywords: M&A     │
│    [Lock] [Approve] [Delete] [Generate Content]        │
│                                                          │
│ 📌 ESG Regulations: What Companies Need to Know        │
│    Source: Bloomberg Law (Web Crawl)                   │
│    Added: 1d ago  •  Score: 8.5  •  Keywords: ESG     │
│    [Lock] [Reject] [Delete] [Generate Content]         │
│                                                          │
│ ... (20 more topics)                                    │
└─────────────────────────────────────────────────────────┘
```

### **2. Content Studio** (`/admin/content/new`)
```
┌─────────────────────────────────────────────────────────┐
│ Create Content                                          │
├─────────────────────────────────────────────────────────┤
│ Topic: [The Future of AI in Legal Practice      ▼]     │
│                                                          │
│ Content Type: ● Blog  ○ LinkedIn Post  ○ Both          │
│ Format: [How-To Guide ▼]                               │
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Title: How AI is Transforming Legal Practice   │    │
│ │                                                  │    │
│ │ [Generate with AI] [Use Template]               │    │
│ │                                                  │    │
│ │ Content Editor:                                  │    │
│ │ ┌────────────────────────────────────────────┐  │    │
│ │ │ Rich text editor with AI assistance...     │  │    │
│ │ │                                             │  │    │
│ │ │ [+ Insert Media] [+ Add Heading] [AI Help] │  │    │
│ │ └────────────────────────────────────────────┘  │    │
│ │                                                  │    │
│ │ SEO Keywords: [AI, legal tech, automation]      │    │
│ │ Featured Image: [Choose from library]           │    │
│ │                                                  │    │
│ │ [Preview] [Save Draft] [Schedule] [Publish]     │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ LinkedIn Summary (auto-generated):                      │
│ ┌─────────────────────────────────────────────────┐    │
│ │ AI is revolutionizing legal practice...         │    │
│ │ [Edit] [Copy] [Post to LinkedIn]                │    │
│ └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### **3. Content Library** (`/admin/content/library`)
```
┌─────────────────────────────────────────────────────────┐
│ Content Library (47 items)             [+ New Content]  │
├─────────────────────────────────────────────────────────┤
│ Filters: [All] [Blog] [LinkedIn] [Draft] [Published]   │
│ Search: [____________________________] 🔍               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Title                    | Type     | Status | Actions  │
│──────────────────────────────────────────────────────── │
│ AI in Legal Practice     | Blog     | ✅ Pub | [Edit]   │
│ Keywords: AI, legal tech | 2,300 w  | Blog   | [View]   │
│ Oct 23, 2025             | SEO: 8.5 | ↗️ LI   | [Delete] │
│                                                          │
│ Cross-Border M&A Guide   | Both     | 📅 Sch | [Edit]   │
│ Keywords: M&A, compliance| 1,800 w  | Oct 25 | [View]   │
│ Oct 22, 2025             | SEO: 9.0 |        | [Delete] │
│                                                          │
│ ESG Regulations Brief    | LinkedIn | 📝 Dft | [Edit]   │
│ Keywords: ESG, compliance| 800 w    |        | [View]   │
│ Oct 21, 2025             | SEO: 7.2 |        | [Delete] │
│                                                          │
│ ... (44 more items)                                     │
└─────────────────────────────────────────────────────────┘
```

### **4. Media Library** (`/admin/media`)
```
┌─────────────────────────────────────────────────────────┐
│ Media Library (132 assets)             [⬆️ Upload]      │
├─────────────────────────────────────────────────────────┤
│ Folders: [All] [Images] [Videos] [Documents]           │
│ Tags: [legal] [infographic] [profile] [brand]          │
├─────────────────────────────────────────────────────────┤
│ Grid View | List View                                   │
│                                                          │
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐              │
│ │ 📸    │ │ 📸    │ │ 📸    │ │ 📸    │              │
│ │ AI-   │ │ Court │ │ Team  │ │ Logo  │              │
│ │ Legal │ │ house │ │ Photo │ │ 2024  │              │
│ └───────┘ └───────┘ └───────┘ └───────┘              │
│ 2.3 MB    1.8 MB    4.1 MB    256 KB                  │
│ Used: 3   Used: 1   Used: 0   Used: 12                │
│                                                          │
│ ... (more assets)                                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 **Implementation Phases**

### **Phase 1: Foundation (Week 1)**
- [x] Database schema
- [ ] Basic UI for topic queue
- [ ] Manual topic addition
- [ ] Content library list view
- [ ] Media upload

### **Phase 2: AI Generation (Week 2)**
- [ ] OpenAI integration
- [ ] Blog post generation
- [ ] LinkedIn post generation
- [ ] Article summarizer
- [ ] Preview system

### **Phase 3: Topic Research (Week 3)**
- [ ] Web crawler
- [ ] RSS feed parser
- [ ] AI topic analysis
- [ ] Relevance scoring
- [ ] Daily scheduler

### **Phase 4: Advanced Features (Week 4)**
- [ ] LinkedIn OAuth
- [ ] Cross-platform publishing
- [ ] SEO analysis
- [ ] Analytics dashboard
- [ ] Topic preferences UI

### **Phase 5: Polish & Optimization (Week 5)**
- [ ] Performance optimization
- [ ] User testing
- [ ] Documentation
- [ ] Training materials

---

## 🔐 **Security & Privacy**

- LinkedIn OAuth tokens: Encrypted in database
- OpenAI API key: Environment variable
- User data: GDPR compliant
- Rate limiting: Prevent abuse
- Audit logs: Track all actions

---

**Next Steps:** Start implementation with database migration!


