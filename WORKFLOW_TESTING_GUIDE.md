# AI Content Workflow Testing Guide

## Overview
This guide covers testing the complete AI-powered content production workflow from topic generation through LinkedIn publishing.

## Prerequisites
- Admin panel running and accessible
- Valid OpenAI API key configured (`OPENAI_API_KEY`)
- LinkedIn OAuth configured (for LinkedIn publishing step)
- Supabase authentication working
- User with `manageCMS` permission

## Complete Workflow Steps

### Phase 1: Topic Generation
**Three methods available:**

1. **Manual Topic Creation**
   - Navigate to `/topics/new`
   - Create a topic manually

2. **AI Topic Suggestions**
   - Navigate to `/topics/suggestions`
   - Select practice area
   - Click "Generate Topic Ideas"
   - Select generated topics to create

3. **Automated Cron Job**
   - Configured to run daily at 9 AM UTC
   - Endpoint: `/api/topics/auto-generate`
   - Combines AI suggestions + RSS news scraping
   - Can test manually: `POST /api/topics/auto-generate`

### Phase 2: Content Production Workflow
**Navigate to `/topics/[id]/workflow` for any topic**

#### Step 1: Generate Content Prompts
- **Status Required**: `topic_created`
- **Action**: Click "Generate Prompts"
- **API**: `POST /api/workflow/generate-prompt`
- **What it does**:
  - Generates keyword research for topic
  - Creates SEO/GEO/AIO optimized English prompt
  - Creates SEO/GEO/AIO optimized Arabic prompt
  - Updates topic metadata with prompts
  - Changes status to `prompt_ready`

**Validation Points**:
- Check topic metadata contains `promptEn` and `promptAr`
- Prompts should be comprehensive (1000+ characters)
- Keywords object should contain primary, secondary, LSI, questions
- Should reference author profile (Khaled Aun)
- Should include SEO requirements (headers, meta, schema)
- Should include GEO requirements (UAE, Saudi Arabia, regional focus)
- Should include AIO requirements (featured snippets, E-E-A-T)

**View Prompts**: Click "View Prompts" button to review generated content

#### Step 2: Approve Prompts
- **Status Required**: `prompt_ready`
- **Action**: Click "Approve Prompts"
- **What it does**:
  - Updates status to `prompt_approved`
  - Unlocks article generation step

**Validation Points**:
- Review prompts carefully before approval
- Ensure they match desired content strategy
- Check complexity level matches topic

#### Step 3: Select Article Images (Optional)
- **Status Required**: `prompt_approved`
- **Action**: Select images from media library
- **What it does**:
  - Images will be embedded in generated articles
  - Images distributed evenly throughout content

**Validation Points**:
- Images are optional
- Can select 0-10 images
- Images should be relevant to topic

#### Step 4: Generate Bilingual Articles
- **Status Required**: `prompt_approved`
- **Action**: Click "Generate Articles"
- **API**: `POST /api/workflow/generate-article`
- **What it does**:
  - Uses comprehensive prompts to generate English article
  - Uses comprehensive prompts to generate Arabic article
  - Embeds selected images with `<figure>` tags
  - Creates 2 ContentLibrary entries (EN + AR)
  - Updates topic with article IDs
  - Changes status to `article_ready`

**Validation Points**:
- Check ContentLibrary for 2 new entries:
  - Type: `article`
  - Format: `blog`
  - Language: `en` / `ar` in metadata
  - Content should be HTML formatted
  - PublishStatus: `draft`
- Articles should be 2000-4000 words
- Should follow prompt structure
- Should include images if selected
- Check topic metadata contains `articleEnId` and `articleArId`

**View Articles**: Click "View Articles" to review generated content

#### Step 5: Approve Articles
- **Status Required**: `article_ready`
- **Action**: Click "Approve Articles"
- **What it does**:
  - Updates status to `article_approved`
  - Unlocks publishing step

**Validation Points**:
- Review both EN and AR articles
- Check quality, accuracy, tone
- Verify SEO elements (headers, keywords)
- Ensure images are properly placed
- Check for any errors or issues

#### Step 6: Publish to Website
- **Status Required**: `article_approved`
- **Action**: Click "Publish to Website"
- **API**: `POST /api/workflow/publish-article`
- **What it does**:
  - Generates URL slug from title
  - Updates ContentLibrary entries:
    - PublishStatus: `published`
    - Adds metadata: slug, url, publishedAt
  - Creates article URLs:
    - EN: `{SITE_URL}/en/blog/{slug}`
    - AR: `{SITE_URL}/ar/blog/{slug}`
  - Notifies Google Search Console (placeholder implementation)
  - Updates topic with URLs
  - Changes status to `published`

**Validation Points**:
- Check ContentLibrary entries updated:
  - `publishStatus` = `published`
  - `publishedAt` is set
  - Metadata contains `url` and `slug`
- Topic metadata contains:
  - `enUrl`, `arUrl`
  - `slug`
  - `publishedAt`
- URLs are properly formatted
- Google notification logged (check console)

**Expected URLs**:
- English: `https://khaledaun.com/en/blog/{slug}`
- Arabic: `https://khaledaun.com/ar/blog/{slug}`

#### Step 7: Generate LinkedIn Posts
- **Status Required**: `published`
- **Action**: Click "Generate LinkedIn Posts"
- **API**: `POST /api/workflow/generate-linkedin`
- **What it does**:
  - Fetches published articles
  - Generates engaging English LinkedIn post with article link
  - Generates engaging Arabic LinkedIn post with article link
  - Posts are 150-200 words with hashtags
  - Updates topic metadata
  - Changes status to `linkedin_ready`

**Validation Points**:
- Check topic metadata contains:
  - `linkedinEn` (150-200 words)
  - `linkedinAr` (150-200 words)
  - `linkedinGeneratedAt`
- Posts should include:
  - Engaging hook
  - Key insights (2-3 bullet points)
  - Article URL
  - Relevant hashtags (3-5)
  - Call to action
- Arabic post should be RTL formatted

**View LinkedIn Posts**: Click "View LinkedIn Posts" to review

#### Step 8: Approve LinkedIn Posts
- **Status Required**: `linkedin_ready`
- **Action**: Click "Approve LinkedIn"
- **What it does**:
  - Updates status to `linkedin_approved`
  - Unlocks LinkedIn publishing

**Validation Points**:
- Review both EN and AR posts
- Check tone matches author profile
- Verify article links are correct
- Ensure hashtags are relevant

#### Step 9: Publish to LinkedIn
- **Status Required**: `linkedin_approved`
- **Action**: Click "Publish to LinkedIn" (choose EN or AR)
- **API**: `POST /api/workflow/publish-linkedin`
- **What it does**:
  - Posts to LinkedIn via OAuth API
  - Saves to ContentLibrary as `social_post`
  - Updates topic metadata
  - Changes status to `linkedin_published`
  - **Graceful fallback**: If LinkedIn API fails, still saves to website

**Validation Points**:
- LinkedIn post appears on profile (if API succeeds)
- Check ContentLibrary for new entry:
  - Type: `social_post`
  - Format: `linkedin`
  - PublishStatus: `published`
  - Metadata contains:
    - `linkedinUrl` (if posted successfully)
    - `articleUrl`
    - `language`
- Topic metadata updated with:
  - `linkedinEnPosted` or `linkedinArPosted`
  - `linkedinUrl`
  - `linkedinPublishedAt`

**Expected Behavior**:
- If LinkedIn API works: Post appears on profile + saved to website
- If LinkedIn API fails: Warning shown, post saved to website only

#### Step 10: Mark as Complete
- **Status**: `linkedin_published`
- **Next**: Can mark topic as `completed`

## Error Scenarios to Test

### 1. Missing OpenAI API Key
- **Expected**: Prompt/article generation fails with clear error
- **Status**: Should revert to previous status

### 2. Invalid Topic Status
- **Expected**: API returns 400 error with message
- **Example**: Trying to generate articles before approving prompts

### 3. Missing Topic Data
- **Expected**: API returns 400/404 with clear error
- **Example**: Trying to publish without articles

### 4. LinkedIn API Failure
- **Expected**: Graceful fallback
- **Behavior**: Saves to website, shows warning to user

### 5. Network Timeout
- **Expected**: Error message, status reverted
- **Check**: Articles not partially created

## Automated Cron Testing

### Daily Topic Generation
**Endpoint**: `/api/topics/auto-generate`
**Schedule**: Daily at 9 AM UTC (configured in `vercel.json`)

**Manual Test**:
```bash
curl -X POST http://localhost:3000/api/topics/auto-generate
```

**What it does**:
1. Generates 12 AI topic ideas (4 categories × 3 ideas)
2. Fetches 10 latest legal news articles from RSS feeds
3. Filters news for relevance using AI
4. Creates topics from both sources
5. Prevents duplicates

**Validation**:
- Check Topics table for new entries
- Topics should have:
  - Title, description, keywords
  - Source in metadata (`ai_suggestion` or `rss_scrape`)
  - Practice area or news URL
  - Status: `topic_created`

## Performance Benchmarks

Expected processing times:
- **Prompt Generation**: 20-40 seconds
- **Article Generation**: 60-90 seconds (both languages in parallel)
- **LinkedIn Generation**: 10-20 seconds
- **Publishing**: < 5 seconds
- **LinkedIn Posting**: 5-10 seconds

## Database Verification Queries

After each step, verify database state:

```sql
-- Check topic status
SELECT id, title, status, metadata FROM topics WHERE id = 'topic-id';

-- Check content library entries
SELECT id, type, format, publishStatus, publishedAt, metadata
FROM content_library WHERE topicId = 'topic-id';

-- Check workflow progression
SELECT status, metadata->>'promptEn' as has_prompt_en,
       metadata->>'articleEnId' as article_en_id,
       metadata->>'enUrl' as en_url,
       metadata->>'linkedinEn' as has_linkedin_en
FROM topics WHERE id = 'topic-id';
```

## Common Issues and Solutions

### Issue: "Prompts not generated yet"
- **Cause**: Step 1 not completed
- **Solution**: Run prompt generation first

### Issue: "Articles not found"
- **Cause**: Step 4 not completed or DB error
- **Solution**: Check ContentLibrary for article entries

### Issue: "LinkedIn posting failed"
- **Cause**: LinkedIn OAuth not configured or expired
- **Solution**: Check LinkedIn integration, token refresh

### Issue: Build fails with Prisma errors
- **Cause**: Network restrictions or missing Prisma binaries
- **Solution**: `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npm run build`

## Success Criteria

A complete workflow test is successful when:

1. ✅ Topic created (manual, AI, or RSS)
2. ✅ Prompts generated with SEO/GEO/AIO requirements
3. ✅ Prompts reviewed and approved
4. ✅ Bilingual articles generated with proper formatting
5. ✅ Articles reviewed and approved
6. ✅ Articles published to website with correct URLs
7. ✅ Google notified about new content
8. ✅ LinkedIn posts generated with article links
9. ✅ LinkedIn posts reviewed and approved
10. ✅ LinkedIn posts published (to LinkedIn + website)
11. ✅ All ContentLibrary entries created correctly
12. ✅ Topic status progresses correctly through all stages
13. ✅ No orphaned or incomplete data

## Next Steps After Testing

If all tests pass:
1. Monitor automated cron job for 24 hours
2. Verify topic quality and relevance
3. Test full workflow with 3-5 different topics
4. Create public blog pages to display published articles
5. Verify SEO elements render correctly on public site
6. Set up actual Google Search Console integration
7. Build analytics dashboard for content performance

## Notes

- The workflow is designed to be interruptible at any approval gate
- Each step validates previous steps before proceeding
- Status transitions are atomic with rollback on error
- Media selection is optional but recommended for engagement
- LinkedIn publishing can be done for EN, AR, or both separately
- Google indexing notification is currently a placeholder
