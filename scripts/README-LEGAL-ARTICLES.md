# Legal Articles Generation Script

## Overview

This directory contains scripts to automatically generate and publish 6 comprehensive legal articles covering:

1. **Understanding Commercial Arbitration in Cross-Border Disputes** - A comprehensive guide to navigating commercial arbitration proceedings in international business transactions
2. **Investment Treaty Arbitration: A Guide for Foreign Investors** - Essential insights into investment treaty arbitration and bilateral investment treaties
3. **Resolving International Commercial Disputes: Litigation vs Arbitration** - Comparative analysis helping businesses choose the right dispute resolution mechanism
4. **The Role of Expert Witnesses in International Arbitration** - Best practices for engaging and managing expert testimony
5. **Enforcement of Arbitral Awards Under the New York Convention** - Practical guide to enforcing international arbitral awards
6. **Mediation in International Commercial Disputes: When and How to Use It** - Understanding mediation as an alternative dispute resolution mechanism

## Files

- **`generate-legal-articles.ts`** - TypeScript version (recommended for development)
- **`generate-legal-articles.js`** - JavaScript version (Node.js compatible)

## Prerequisites

### Required

- Node.js (v18+ recommended)
- Prisma Client generated
- Database access with `DATABASE_URL` configured
- At least one user in the `users` table (to assign as article author)

### Environment Variables

Ensure your environment has the following set:

```bash
DATABASE_URL="postgresql://user:password@host:port/database"
DIRECT_URL="postgresql://user:password@host:port/database"  # if using Supabase
```

## Usage

### Option 1: Run TypeScript Version (Recommended)

From the project root:

```bash
# Using pnpm
pnpm tsx scripts/generate-legal-articles.ts

# Or using npx
npx tsx scripts/generate-legal-articles.ts
```

### Option 2: Run JavaScript Version

From the project root:

```bash
node scripts/generate-legal-articles.js
```

### Option 3: Run from Admin App Directory

```bash
cd apps/admin
npx tsx ../../scripts/generate-legal-articles.ts
```

## What the Script Does

1. **Connects to Database** - Uses Prisma to connect to your PostgreSQL database
2. **Retrieves Author** - Gets the first user from the database to assign as article author
3. **Creates Articles** - Inserts 6 comprehensive legal articles with:
   - Title and SEO-friendly slug
   - Excerpt for previews
   - Full markdown content
   - `PUBLISHED` status
   - Current timestamp as `publishedAt`
4. **Creates Audit Trail** - Logs the creation action for each article
5. **Skips Duplicates** - Checks for existing articles by slug and skips if already present

## Output

The script provides detailed console output:

```
🚀 Starting legal articles generation...

📝 Using author: user@example.com (John Doe)

✅ Created and published: "Understanding Commercial Arbitration in Cross-Border Disputes"
✅ Created and published: "Investment Treaty Arbitration: A Guide for Foreign Investors"
... (continues for all 6 articles)

============================================================
📊 Article Generation Summary:
============================================================
✅ Successfully created: 6 articles
❌ Errors: 0 articles
============================================================

🎉 All articles created and published successfully!

📝 Articles created:
   1. Understanding Commercial Arbitration in Cross-Border Disputes
      Slug: understanding-commercial-arbitration-cross-border-disputes
   2. Investment Treaty Arbitration: A Guide for Foreign Investors
      Slug: investment-treaty-arbitration-guide-foreign-investors
   ... (continues for all 6)
```

## Article Details

### Article Content Features

Each article includes:

- **Comprehensive Coverage** - 1,500-3,000+ words of detailed legal content
- **Structured Format** - Clear headings, subheadings, and sections
- **Markdown Formatting** - Properly formatted for rendering in the blog
- **Professional Tone** - Suitable for legal/professional audience
- **Practical Guidance** - Best practices, procedures, and strategic considerations
- **Legal Disclaimer** - Appropriate disclaimers about legal advice
- **SEO-Optimized** - Keywords and structure optimized for search

### Topics Covered

#### 1. Commercial Arbitration
- Advantages of arbitration
- Common challenges
- Best practices
- Jurisdictional issues
- Evidence gathering

#### 2. Investment Treaty Arbitration
- Bilateral Investment Treaties (BITs)
- ICSID framework
- Key investor protections
- Arbitration process stages
- Recent trends and reforms

#### 3. Litigation vs Arbitration
- Comparative analysis
- Decision-making framework
- Enforceability considerations
- Cost comparisons
- Best practices for contract drafting

#### 4. Expert Witnesses
- Types of expert witnesses
- Expert report structure
- Testimony process
- Best practices for engagement
- Managing expert-counsel relationships

#### 5. New York Convention Enforcement
- Convention framework
- Enforcement requirements
- Grounds for refusal
- Step-by-step enforcement process
- Best practices for award creditors

#### 6. Commercial Mediation
- When to use mediation
- The mediation process
- Cultural considerations
- Singapore Convention
- Best practices

## Troubleshooting

### Error: No users found in database

**Solution**: Create at least one user in your database first:

```sql
INSERT INTO users (id, email, name, role, created_at, updated_at)
VALUES (
  'cm2x1y2z3', -- replace with a cuid
  'admin@example.com',
  'Admin User',
  'ADMIN',
  NOW(),
  NOW()
);
```

### Error: Slug already exists

**Solution**: The script automatically skips existing articles. If you want to regenerate, either:
1. Delete existing articles from the database, or
2. Modify the slugs in the script

### Error: Cannot find module '@prisma/client'

**Solution**: Generate the Prisma client first:

```bash
cd apps/admin
npx prisma generate --schema=./prisma/schema.prisma
```

### Error: Prisma binary download failed

**Solution**: If in an offline or restricted environment:

```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
```

Or copy Prisma binaries from another environment where they can be downloaded.

## Database Schema

The script creates records in the following tables:

### `posts` Table

```typescript
{
  id: string (cuid)
  title: string
  slug: string (unique)
  excerpt: string
  content: string (markdown)
  status: 'PUBLISHED'
  publishedAt: Date
  authorId: string (references users.id)
  createdAt: Date
  updatedAt: Date
}
```

### `audits` Table

```typescript
{
  id: string (cuid)
  entity: 'Post'
  entityId: string (post.id)
  action: 'CREATE'
  payload: {
    title: string
    slug: string
    status: 'PUBLISHED'
    automated: true
  }
  actorId: string (author.id)
  createdAt: Date
}
```

## Verification

After running the script, verify the articles were created:

### Using Prisma Studio

```bash
cd apps/admin
npx prisma studio
```

### Using SQL

```sql
SELECT id, title, slug, status, published_at
FROM posts
ORDER BY created_at DESC
LIMIT 10;
```

### Via Admin Dashboard

1. Navigate to your admin dashboard
2. Go to Posts section
3. Verify all 6 articles appear with PUBLISHED status

## Deployment Considerations

### Production Deployment

When deploying to production:

1. **Backup Database** - Always backup before running data modification scripts
2. **Test in Staging** - Run in staging environment first
3. **Review Content** - Review generated content for accuracy and appropriateness
4. **Check Permissions** - Ensure proper user permissions are set
5. **Monitor Performance** - Watch for any database performance issues

### CI/CD Integration

To integrate into CI/CD:

```yaml
# Example GitHub Actions workflow
- name: Generate Legal Articles
  run: |
    cd apps/admin
    npx prisma generate
    npx tsx ../../scripts/generate-legal-articles.ts
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Customization

### Modifying Articles

To customize the articles:

1. Edit the `articles` array in the script
2. Modify `title`, `slug`, `excerpt`, or `content` as needed
3. Re-run the script

### Adding More Articles

To add additional articles:

1. Add new objects to the `articles` array
2. Follow the same structure:
```javascript
{
  title: 'Article Title',
  slug: 'article-slug',
  excerpt: 'Brief description...',
  content: `# Full markdown content...`
}
```

### Changing Author

The script automatically selects the first user. To specify a different author:

```javascript
// Replace this line:
const author = users[0];

// With:
const author = await prisma.user.findUnique({
  where: { email: 'specific@email.com' }
});
```

## License

These articles are generated for the KhaledAunSite project. Ensure proper attribution if content is repurposed.

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review console error messages
3. Verify database connectivity
4. Ensure Prisma schema is up to date

---

**Last Updated**: 2025-11-11
**Version**: 1.0.0
